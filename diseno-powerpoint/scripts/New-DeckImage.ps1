<#
.SYNOPSIS
  Genera una imagen para una diapositiva con la API de Kie AI (Nano Banana) y la descarga localmente.

.DESCRIPTION
  Mismo flujo de 2 pasos que la skill `miniaturas`:
    1. POST createTask  -> devuelve un taskId
    2. GET  recordInfo  -> polling hasta state=success; la URL viene en resultJson.resultUrls
  La API key se lee de la variable de entorno KIE_API_KEY (proceso, luego usuario).

  Pensado para imágenes EXPLICATIVAS de presentaciones (hero a sangre completa,
  imagen lateral, ilustración puntual). El TEXTO de la diapositiva lo dibuja PptxGenJS,
  así que los prompts deben pedir "no text, no words" para que el modelo no escriba.

.EXAMPLE
  .\New-DeckImage.ps1 -Prompt "cinematic editorial photo of an automated warehouse, dark premium tones, no text" -AspectRatio 16:9 -OutputPath ".\img\hero.png"

.EXAMPLE
  .\New-DeckImage.ps1 -Prompt "minimal 3D render of a glowing neural network, deep charcoal background, gold accents, no people, no text" -Resolution 2K -AspectRatio 4:3 -OutputPath ".\img\ia.png"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    # Por defecto el Nano Banana NORMAL (google/nano-banana, ~$0.02 — el más barato).
    # nano-banana-2 (~$0.04) queda disponible si se necesita más calidad. NO usar nano-banana-pro (caro).
    [ValidateSet('google/nano-banana', 'nano-banana-2')]
    [string]$Model = 'google/nano-banana',

    # 16:9 (hero a sangre / fondo), 4:3 / 3:2 (imagen lateral), 1:1 (spot), 9:16, 4:5, 21:9, auto
    [string]$AspectRatio = '16:9',

    [ValidateSet('1K', '2K', '4K')]
    [string]$Resolution = '1K',

    [ValidateSet('png', 'jpg')]
    [string]$OutputFormat = 'png',

    # URLs https de imágenes de referencia (producto, estilo, persona). Opcional.
    [string[]]$ImageInput,

    # Ruta de salida. Si se omite, guarda ./deck-img-<fecha>.<formato> en el directorio actual.
    [string]$OutputPath,

    [int]$TimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# --- Resolver API key (proceso -> usuario) ---
$apiKey = $env:KIE_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    $apiKey = [Environment]::GetEnvironmentVariable('KIE_API_KEY', 'User')
}
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    throw "No se encontró KIE_API_KEY. Define: [Environment]::SetEnvironmentVariable('KIE_API_KEY','tu_key','User')  (la key se obtiene en https://kie.ai/api-key)"
}

$headers = @{ 'Authorization' = "Bearer $apiKey"; 'Content-Type' = 'application/json' }

$inputObj = [ordered]@{
    prompt        = $Prompt
    aspect_ratio  = $AspectRatio
    resolution    = $Resolution
    output_format = $OutputFormat
}
if ($ImageInput -and $ImageInput.Count -gt 0) { $inputObj.image_input = $ImageInput }

$body = ([ordered]@{ model = $Model; input = $inputObj }) | ConvertTo-Json -Depth 10

Write-Host "-> Creando tarea ($Model | $AspectRatio | $Resolution)..." -ForegroundColor Cyan
try {
    $create = Invoke-RestMethod -Uri 'https://api.kie.ai/api/v1/jobs/createTask' -Method Post -Headers $headers -Body $body
}
catch {
    $detail = $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $respBody = $reader.ReadToEnd()
            if ($respBody) { $detail = "$detail | $respBody" }
        } catch {}
    }
    throw "Error al crear la tarea: $detail"
}

if ($create.code -ne 200 -or -not $create.data.taskId) {
    throw "createTask no devolvió taskId. Respuesta: $($create | ConvertTo-Json -Depth 5)"
}
$taskId = $create.data.taskId
Write-Host "   taskId: $taskId" -ForegroundColor DarkGray

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$state = ''
$record = $null
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    try {
        $record = Invoke-RestMethod -Uri "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=$taskId" -Method Get -Headers $headers
    }
    catch { Write-Host "   (reintentando consulta...)" -ForegroundColor DarkGray; continue }
    $state = $record.data.state
    Write-Host "   estado: $state" -ForegroundColor DarkGray
    if ($state -eq 'success' -or $state -eq 'fail') { break }
}

if ($state -ne 'success') {
    if ($state -eq 'fail') { throw "La generación falló: $($record.data.failMsg) (code: $($record.data.failCode))" }
    throw "Tiempo de espera agotado tras $TimeoutSeconds s. Último estado: '$state'."
}

$result = $record.data.resultJson | ConvertFrom-Json
$imageUrl = $result.resultUrls[0]
if ([string]::IsNullOrWhiteSpace($imageUrl)) {
    throw "No se encontró URL de resultado. resultJson: $($record.data.resultJson)"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $OutputPath = Join-Path (Get-Location).Path "deck-img-$stamp.$OutputFormat"
}
$dir = Split-Path -Parent $OutputPath
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

Write-Host "-> Descargando imagen..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $imageUrl -OutFile $OutputPath -UseBasicParsing

$credits = $record.data.creditsConsumed
Write-Host "OK Imagen guardada en: $OutputPath" -ForegroundColor Green
if ($credits) { Write-Host "   Créditos consumidos: $credits" -ForegroundColor DarkGray }

[PSCustomObject]@{ OutputPath = $OutputPath; ImageUrl = $imageUrl; Model = $Model; TaskId = $taskId; Credits = $credits }
