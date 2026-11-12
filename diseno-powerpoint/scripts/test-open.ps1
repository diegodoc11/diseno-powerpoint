# Abre un .pptx con PowerPoint y dice si lo acepta (OK) o lo rechaza (FAIL).
# Para encontrar la slide que lo rompe: construye por rangos (SLIDES=1-10, 11-20…) y prueba cada archivo.
# Solo cierra lo que abre: si el usuario tiene PowerPoint abierto, no se lo cierra.
# Uso: .\test-open.ps1 -Pptx "C:\ruta\deck.pptx"   (rutas con barras invertidas)
param([string]$Pptx)
$wasRunning = [bool](Get-Process POWERPNT -ErrorAction SilentlyContinue)
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $null
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    Write-Output ("OK " + $pres.Slides.Count)
}
catch { Write-Output ("FAIL " + $_.Exception.Message) }
finally {
    if ($pres) { $pres.Close() }
    if (-not $wasRunning -and $ppt.Presentations.Count -eq 0) { $ppt.Quit() }
}
