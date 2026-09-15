$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$doc=(Get-ChildItem -LiteralPath $root -Filter '*PRD_V1.1_20260911.docx' | Select-Object -First 1 -ExpandProperty FullName)
$out=Join-Path $PSScriptRoot 'prd-qa-20260911-final'
$pdf=Join-Path $out 'prd-preview.pdf'
$status=Join-Path $out 'render-status.txt'
New-Item -ItemType Directory -Path $out -Force|Out-Null
$word=$null;$opened=$null
try{
 $word=New-Object -ComObject Word.Application
 $word.Visible=$false;$word.DisplayAlerts=0;$word.AutomationSecurity=3
 $opened=$word.Documents.Open($doc,$false,$true)
 $opened.Repaginate();$pages=$opened.ComputeStatistics(2)
 $opened.ExportAsFixedFormat($pdf,17)
 & 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -png -r 120 $pdf (Join-Path $out 'page')
 "PASS pages=$pages"|Set-Content -LiteralPath $status -Encoding UTF8
}catch{"FAIL $($_.Exception.Message)"|Set-Content -LiteralPath $status -Encoding UTF8;throw
}finally{if($opened){$opened.Close(0);[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($opened)};if($word){$word.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)}}
