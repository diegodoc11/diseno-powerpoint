# Exporta cada diapositiva a PNG con PowerPoint (para la revisión visual).
# Uso: .\render.ps1 -Pptx "C:\ruta\deck.pptx" -OutDir "C:\ruta\render"
param([string]$Pptx, [string]$OutDir, [int]$Width = 1920, [int]$Height = 1080)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutDir | Out-Null
Get-ChildItem $OutDir -Filter *.png -ErrorAction SilentlyContinue | Remove-Item -Force
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    $pres.Export($OutDir, "PNG", $Width, $Height)
    Write-Output ("slides: " + $pres.Slides.Count)
    $pres.Close()
}
finally { $ppt.Quit() }
