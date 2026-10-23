# Guarda el .pptx como PDF con PowerPoint (para verlo en el celular o compartirlo).
# Uso: .\export-pdf.ps1 -Pptx "C:\ruta\deck.pptx" -Pdf "C:\ruta\deck.pdf"
param([string]$Pptx, [string]$Pdf)
$ErrorActionPreference = 'Stop'
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    $pres.SaveAs($Pdf, 32)
    Write-Output ("PDF: " + $Pdf)
    $pres.Close()
}
finally { $ppt.Quit() }
