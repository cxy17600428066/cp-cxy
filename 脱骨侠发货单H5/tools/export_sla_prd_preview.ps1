param(
 [string]$InputDocx = 'E:\cxy\脱骨侠发货单H5\订单履约时效管理PRD_V1.0_20260910.docx',
 [string]$PreviewDir = 'E:\cxy\脱骨侠发货单H5\tools\prd-qa-20260910'
)
$ErrorActionPreference = 'Stop'
$resolvedDocx = (Resolve-Path -LiteralPath $InputDocx).Path
$resolvedPreview = [System.IO.Path]::GetFullPath($PreviewDir)
if (-not $resolvedPreview.StartsWith('E:\cxy\脱骨侠发货单H5\tools\prd-qa-20260910', [StringComparison]::OrdinalIgnoreCase)) { throw 'Preview directory outside task output' }
New-Item -ItemType Directory -Path $resolvedPreview -Force | Out-Null
$pdfPath = Join-Path $resolvedPreview 'prd-preview.pdf'
$wordApp = $null
$prdDocument = $null
$ownsWord = $false
try {
 $wordApp = New-Object -ComObject Word.Application
 if ($wordApp.Documents.Count -ne 0) { throw 'Word instance already contains user documents; export cancelled' }
 $ownsWord = $true
 $wordApp.Visible = $false
 $wordApp.DisplayAlerts = 0
 $wordApp.AutomationSecurity = 3
 $prdDocument = $wordApp.Documents.Open($resolvedDocx, $false, $true, $false)
 $prdDocument.Repaginate()
 $pageCount = $prdDocument.ComputeStatistics(2)
 $prdDocument.ExportAsFixedFormat($pdfPath, 17)
 [PSCustomObject]@{PDF=$pdfPath;Pages=$pageCount;Bytes=(Get-Item -LiteralPath $pdfPath).Length} | ConvertTo-Json -Compress
} finally {
 if ($null -ne $prdDocument) {
  $prdDocument.Close(0)
  [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($prdDocument)
 }
 if ($null -ne $wordApp) {
  if ($ownsWord -and $wordApp.Documents.Count -eq 0) { $wordApp.Quit() }
  [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApp)
 }
}
