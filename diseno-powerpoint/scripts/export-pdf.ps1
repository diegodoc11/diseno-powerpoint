# Guarda el .pptx como PDF con PowerPoint (para verlo en el celular o compartirlo).
# Solo cierra lo que abre: si el usuario tiene PowerPoint abierto, no se lo cierra (ver render.ps1).
# Uso: .\export-pdf.ps1 -Pptx "C:\ruta\deck.pptx" -Pdf "C:\ruta\deck.pdf"
param([string]$Pptx, [string]$Pdf)
$ErrorActionPreference = 'Stop'
$wasRunning = [bool](Get-Process POWERPNT -ErrorAction SilentlyContinue)
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $null
try {
    $pres = $ppt.Presentations.Open($Pptx, -1, 0, 0)
    $pres.SaveAs($Pdf, 32)
    Write-Output ("PDF: " + $Pdf)
}
finally {
    if ($pres) { $pres.Close() }
    if (-not $wasRunning -and $ppt.Presentations.Count -eq 0) { $ppt.Quit() }
}
