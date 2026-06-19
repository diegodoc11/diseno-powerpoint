<#
.SYNOPSIS
  Busca y descarga imágenes REALES vía Apify (actor hooli/google-images-scraper).

.DESCRIPTION
  Réplica del scraper usado en la skill `carruseles`. Útil cuando una diapositiva
  necesita una imagen real concreta que la IA no debe inventar: foto histórica,
  retrato de una persona real, logo, captura, gráfico o mapa real, producto, lugar.

  El token se resuelve en este orden:
    1. Variable de entorno APIFY_TOKEN (proceso o usuario)
    2. ~/.apify/auth.json (creado por `apify login -t <token>`)

  Descarga hasta -Max imágenes por query a la carpeta -OutDir y escribe un
  _manifest.json. NUNCA uses la primera automáticamente: muestra las opciones al
  usuario (ábrelas con la Read tool) y deja que elija.

.EXAMPLE
  .\Find-DeckImage.ps1 -Query "automated factory robots assembly line" -Label fabrica -Max 5 -OutDir ".\img\_scraping"

.EXAMPLE
  .\Find-DeckImage.ps1 -Query "data center servers|AI chip macro" -Label datacenter -Max 4 -OutDir ".\img\_scraping"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Query,                         # una o varias queries separadas por |

    [Parameter(Mandatory = $true)]
    [string]$Label,                         # prefijo para nombrar los archivos (ej. 'fabrica')

    [int]$Max = 5,                          # máximo de imágenes por query
    [ValidateSet('large', 'xlarge', 'huge')]
    [string]$Size = 'large',                # tamaño mínimo (large recomendado para slides)

    [string]$OutDir,                        # carpeta de salida (default ./deck-scraping)
    [switch]$NoDownload,                    # solo listar URLs, no descargar
    [int]$TimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# --- Resolver token (env -> ~/.apify/auth.json) ---
$token = $env:APIFY_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [Environment]::GetEnvironmentVariable('APIFY_TOKEN', 'User')
}
if ([string]::IsNullOrWhiteSpace($token)) {
    $authPath = Join-Path $HOME ".apify\auth.json"
    if (Test-Path $authPath) {
        try { $token = (Get-Content $authPath -Raw | ConvertFrom-Json).token } catch {}
    }
}
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "No se encontró token de Apify. Corre 'apify login -t <token>' o define APIFY_TOKEN. (Token en https://console.apify.com/account/integrations)"
}

$queries = @($Query -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
if (-not $OutDir) { $OutDir = Join-Path (Get-Location).Path "deck-scraping" }
$dst = Join-Path $OutDir $Label
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

$payload = [ordered]@{
    queries            = $queries
    maxResultsPerQuery = $Max
    imageSize          = $Size
} | ConvertTo-Json -Depth 5

$actor = "hooli~google-images-scraper"
$url = "https://api.apify.com/v2/acts/$actor/run-sync-get-dataset-items?token=$token"

Write-Host "-> scrapeando $($queries.Count) query(s) ($Max c/u, size=$Size)..." -ForegroundColor Cyan
$queries | ForEach-Object { Write-Host "    · $_" -ForegroundColor DarkGray }

try {
    $items = Invoke-RestMethod -Uri $url -Method Post -Body $payload -ContentType 'application/json' -TimeoutSec $TimeoutSeconds
}
catch {
    $detail = $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $rb = $reader.ReadToEnd(); if ($rb) { $detail = "$detail | $rb" }
        } catch {}
    }
    throw "Error en Apify: $detail"
}

Write-Host "OK recibidas $($items.Count) imágenes`n" -ForegroundColor Green

$rows = @()
$i = 0
foreach ($item in $items) {
    $i++
    $imgUrl = $item.imageUrl; if (-not $imgUrl) { $imgUrl = $item.url }; if (-not $imgUrl) { $imgUrl = $item.contentUrl }
    if (-not $imgUrl) { Write-Host "  $i. (sin URL)" -ForegroundColor DarkYellow; continue }
    $title = ("$($item.title)" -replace '/', '_')
    if ($title.Length -gt 70) { $title = $title.Substring(0, 70) }
    $w = $item.width; $h = $item.height
    $fname = "{0}_{1:D2}.jpg" -f $Label, $i
    $dest = Join-Path $dst $fname
    $downloaded = $false
    if (-not $NoDownload) {
        try {
            Invoke-WebRequest -Uri $imgUrl -OutFile $dest -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -TimeoutSec 30
            $downloaded = $true
        } catch { Write-Host "  no descargó $($imgUrl.Substring(0,[Math]::Min(60,$imgUrl.Length)))...: $($_.Exception.Message)" -ForegroundColor DarkYellow }
    }
    $rows += [ordered]@{ n = $i; fname = $(if ($downloaded) { $fname } else { $null }); url = $imgUrl; title = $title; source = $item.sourceUrl; size = $(if ($w) { "${w}x${h}" } else { "?" }) }
    $marker = $(if ($downloaded) { "OK" } else { " ·" })
    Write-Host ("  {0} {1:D2}. {2}  {3}" -f $marker, $i, $(if ($w) { "${w}x${h}" } else { "?" }), $title) -ForegroundColor Gray
}

$manifest = Join-Path $dst "_manifest.json"
($rows | ConvertTo-Json -Depth 5) | Out-File -FilePath $manifest -Encoding utf8
Write-Host "`nOK manifest: $manifest" -ForegroundColor Green
Write-Host "OK imágenes en: $dst" -ForegroundColor Green
