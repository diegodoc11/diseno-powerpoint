# Abre un .pptx con PowerPoint y dice si lo acepta (OK) o lo rechaza (FAIL).
# Para encontrar la slide que lo rompe: construye por rangos (SLIDES=1-10, 11-20…) y prueba cada archivo.
# Uso: .\test-open.ps1 -Pptx "C:\ruta\deck.pptx"   (rutas con barras invertidas)
param([string]$Pptx)
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    Write-Output ("OK " + $pres.Slides.Count)
    $pres.Close()
}
catch { Write-Output ("FAIL " + $_.Exception.Message) }
finally { $ppt.Quit() }
