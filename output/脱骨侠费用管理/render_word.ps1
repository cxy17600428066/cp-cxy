$ErrorActionPreference = 'Stop'
$qaPath = Join-Path $PSScriptRoot 'qa'
New-Item -ItemType Directory -Path $qaPath -Force | Out-Null
$documentPath = Join-Path $PSScriptRoot '脱骨侠全费用管理规则建议稿V1.docx'
$pdfPath = Join-Path $qaPath 'word-preview.pdf'
$word = $null
$document = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $document = $word.Documents.Open($documentPath, $false, $true)
    $document.Repaginate()
    $pageCount = $document.ComputeStatistics(2)
    $document.ExportAsFixedFormat($pdfPath, 17)
    Write-Output "Exported Word PDF; pages=$pageCount"
} finally {
    if ($null -ne $document) { $document.Close(0) }
    if ($null -ne $word) { try { $word.Quit() } catch { Write-Output 'Word export completed; application already closed.' } }
}
