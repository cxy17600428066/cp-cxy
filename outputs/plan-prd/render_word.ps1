$ErrorActionPreference = 'Stop'
$docPath = 'E:\cxy\04-需求管理\PRD-生产管理计划管理-开发交付版-V1.0-20261027.docx'
$pdfPath = 'E:\cxy\outputs\plan-prd\render\prd.pdf'
New-Item -ItemType Directory -Path 'E:\cxy\outputs\plan-prd\render' -Force | Out-Null
$word = $null
$document = $null
try {
 $word = New-Object -ComObject Word.Application
 $word.Visible = $false
 $word.DisplayAlerts = 0
 $document = $word.Documents.Open($docPath, $false, $true)
 $document.Repaginate()
 Write-Output ('Pages: ' + $document.ComputeStatistics(2))
 $document.ExportAsFixedFormat($pdfPath, 17)
 Write-Output $pdfPath
} finally {
 if ($null -ne $document) { $document.Close(0) }
 if ($null -ne $word) { $word.Quit() }
}
