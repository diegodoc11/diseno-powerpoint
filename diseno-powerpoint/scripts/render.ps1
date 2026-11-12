# Exporta cada diapositiva a PNG con PowerPoint (para la revisión visual).
# PowerPoint es de una sola instancia: si el usuario lo tiene abierto, COM se engancha a SU ventana.
# Por eso solo se cierra la presentación que se abre aquí, y PowerPoint se cierra solo si no había nada más abierto.
# Uso: .\render.ps1 -Pptx "C:\ruta\deck.pptx" -OutDir "C:\ruta\render"
param([string]$Pptx, [string]$OutDir, [int]$Width = 1920, [int]$Height = 1080)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutDir | Out-Null
Get-ChildItem $OutDir -Filter *.png -ErrorAction SilentlyContinue | Remove-Item -Force
$wasRunning = [bool](Get-Process POWERPNT -ErrorAction SilentlyContinue)
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $null
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    $pres.Export($OutDir, "PNG", $Width, $Height)
    Write-Output ("slides: " + $pres.Slides.Count)
}
finally {
    if ($pres) { $pres.Close() }
    if (-not $wasRunning -and $ppt.Presentations.Count -eq 0) { $ppt.Quit() }
}
