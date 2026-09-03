$ErrorActionPreference = 'Stop'
$src = 'E:\cxy\.tmp_template_finance\template.pptx'
$out = 'E:\cxy\outputs\大客中心利润分析\2026年4月大客中心利润结构分析-财务部模板版.pptx'
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null

$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($src, $false, $false, $false)

$keep = @(2,4,5,6,7,15,26,27)
for ($i = $pres.Slides.Count; $i -ge 1; $i--) {
  if ($keep -notcontains $i) { $pres.Slides.Item($i).Delete() }
}

function Clear-Slide($slide) {
  for ($i = $slide.Shapes.Count; $i -ge 1; $i--) {
    try { $slide.Shapes.Item($i).Delete() } catch {
      try { $slide.Shapes.Item($i).Visible = 0 } catch {}
    }
  }
}
function Add-Text($slide,$text,$x,$y,$w,$h,$size=18,$color=0,$bold=$false,$align=1) {
  $sh = $slide.Shapes.AddTextbox(1,$x,$y,$w,$h)
  $sh.TextFrame.TextRange.Text = $text
  $sh.TextFrame.MarginLeft = 3; $sh.TextFrame.MarginRight = 3
  $sh.TextFrame.MarginTop = 2; $sh.TextFrame.MarginBottom = 2
  $sh.TextFrame.TextRange.Font.NameFarEast = '微软雅黑'
  $sh.TextFrame.TextRange.Font.Name = 'Microsoft YaHei'
  $sh.TextFrame.TextRange.Font.Size = $size
  $sh.TextFrame.TextRange.Font.Color.RGB = $color
  $sh.TextFrame.TextRange.Font.Bold = $(if($bold){-1}else{0})
  $sh.TextFrame.TextRange.ParagraphFormat.Alignment = $align
  $sh.TextFrame.AutoSize = 0
  $sh.TextFrame.WordWrap = -1
  return $sh
}
function Add-Box($slide,$x,$y,$w,$h,$fill=0xF3F5F7) {
  $sh=$slide.Shapes.AddShape(5,$x,$y,$w,$h)
  $sh.Fill.ForeColor.RGB=$fill; $sh.Line.Visible=0
  return $sh
}
function Add-Notes($slide,$text) {
  $full = $text + "`r`n`r`n[Sources]`r`n- 2026年度卓希线下经营管理报表Q1-大客中心7.20.xlsx，事业部利润表（4月及累计）"
  foreach($sh in $slide.NotesPage.Shapes) {
    try {
      if($sh.PlaceholderFormat.Type -eq 2) { $sh.TextFrame.TextRange.Text=$full; return }
    } catch {}
  }
}
$script:chartIndex = 0
$script:chartImages = @(
  'E:\cxy\.tmp_template_finance\chart-images\budget.png',
  'E:\cxy\.tmp_template_finance\chart-images\revenue.png',
  'E:\cxy\.tmp_template_finance\chart-images\margin.png',
  'E:\cxy\.tmp_template_finance\chart-images\expense.png'
)
function Add-Chart($slide,$cats,$seriesNames,$seriesValues,$colors,$x=35,$y=100,$w=490,$h=330) {
  $path = $script:chartImages[$script:chartIndex]
  $script:chartIndex++
  $slide.Shapes.AddPicture($path,0,-1,$x,$y,$w,$h) | Out-Null
}

$red=0x1F1FFF
$blue=0xC76728
$dark=0x27231F
$gray=0x766B5F

# 1 封面
$s=$pres.Slides.Item(1); Clear-Slide $s
Add-Text $s '2026财年Q2季度启动大会｜财务部' 110 85 740 35 18 $gray $true | Out-Null
Add-Text $s "大客中心`r利润结构分析" 110 165 740 125 36 $dark $true | Out-Null
Add-Text $s "2026年4月及累计`r预算 vs 实际｜收入 · 毛利 · 销售费用" 110 330 650 70 18 $gray $false | Out-Null
Add-Notes $s '各位好，今天汇报大客中心2026年4月及累计经营表现。核心结论是：收入增长明显，但4月利润被合同扣点、零食业务负毛利和市场费用集中投放共同侵蚀；累计仍保持盈利，但利润完成度明显落后于收入完成度。'

# 2 总览
$s=$pres.Slides.Item(2); Clear-Slide $s
Add-Text $s '核心结论：收入增长，利润转化不足' 35 18 780 38 23 0xFFFFFF $true | Out-Null
Add-Text $s '累计净收入8,820.7万元，完成预算134.9%；但累计毛利率只有12.0%，净利润仅完成预算41.3%。' 45 90 850 55 20 $dark $true | Out-Null
$items=@(@('134.9%','累计净收入达成','8,820.7万元',$blue),@('12.0%','累计实际毛利率','较预算低2.4pct',0x6B8518),@('41.3%','累计净利润达成','211.9万元',0x4B3DC4))
for($i=0;$i -lt 3;$i++){ $x=45+$i*300; Add-Box $s $x 190 260 190 | Out-Null; Add-Text $s $items[$i][0] ($x+18) 215 220 55 30 $items[$i][3] $true | Out-Null; Add-Text $s ($items[$i][1]+"`r"+$items[$i][2]) ($x+18) 285 220 60 15 $gray | Out-Null }
Add-Text $s '管理重点：从追求规模，切换到合同后净收入、毛利率和费用后利润联动管理。' 45 420 850 45 17 $red $true | Out-Null
Add-Notes $s '先看总体判断。累计净收入8,820.7万元，完成预算134.9%，但累计毛利率只有12.0%，较预算14.4%低2.4个百分点；累计净利润211.9万元，仅完成预算的41.3%。这说明新增收入没有按预算转化为利润。4月单月更严峻，毛利为负53.9万元，净亏损335.2万元。'

# 3 预算实际
$s=$pres.Slides.Item(3); Clear-Slide $s
Add-Text $s '预算与实际：4月利润转负，累计利润承压' 35 18 780 38 23 0xFFFFFF $true | Out-Null
Add-Chart $s @('4月净收入','4月毛利','4月销售费用','4月净利润','累计净收入','累计净利润') @('预算（万元）','实际（万元）') @(@(1629.5,248.2,114.9,113.4,6536.7,512.9),@(1791.4,-53.9,261.4,-335.2,8820.7,211.9)) @(0xF5D6A9,$blue)
Add-Text $s '4月收入超预算9.9%，但成本超预算33.6%、销售费用超预算127.6%，净利润预算差额-448.6万元。' 555 130 360 90 16 $dark $true | Out-Null
Add-Box $s 560 260 160 120 | Out-Null; Add-Text $s '-448.6万' 575 280 130 40 24 0x4B3DC4 $true | Out-Null; Add-Text $s '4月净利润差额' 575 330 130 25 13 $gray | Out-Null
Add-Box $s 745 260 160 120 | Out-Null; Add-Text $s '-300.9万' 760 280 130 40 24 0x4B3DC4 $true | Out-Null; Add-Text $s '累计净利润差额' 760 330 130 25 13 $gray | Out-Null
Add-Notes $s '4月净收入比预算多161.9万元，但毛利比预算少302.1万元；销售直接费用比预算多146.5万元，最终净利润比预算少448.6万元。累计收入多2,284.0万元，净利润却少300.9万元，利润弹性显著弱于收入弹性。'

# 4 收入结构
$s=$pres.Slides.Item(4); Clear-Slide $s
Add-Text $s '营业收入结构：会员增长最强，零食单月收缩' 35 18 780 38 23 0xFFFFFF $true | Out-Null
Add-Chart $s @('大客-KA','大客-餐饮','会员&创新','大客-零食') @('4月占比（%）','累计占比（%）') @(@(37.0,4.6,52.6,5.9),@(28.7,2.6,43.8,24.9)) @($blue,0xF5D6A9)
Add-Text $s '会员&创新占4月毛收入52.6%，成为第一大来源；零食占比由累计24.9%降至5.9%。' 555 125 350 85 16 $dark $true | Out-Null
Add-Box $s 560 245 345 135 | Out-Null; Add-Text $s '合同扣点 378.7万元' 580 265 305 35 21 $red $true | Out-Null; Add-Text $s '占4月毛收入17.4%，显著压缩净收入增长。' 580 315 305 42 14 $gray | Out-Null
Add-Notes $s '收入结构出现明显切换。4月会员与创新占毛收入52.6%，较累计结构高8.8个百分点；KA占37.0%，也高于累计。零食则从累计24.9%降到4月5.9%。4月合同扣点378.7万元，占毛收入17.4%，使毛收入33.2%的超预算增长最终只转化为净收入9.9%的增长。'

# 5 毛利率结构
$s=$pres.Slides.Item(5); Clear-Slide $s
Add-Text $s '毛利率结构：零食负毛利拖累，KA贡献主要利润' 35 18 780 38 23 0xFFFFFF $true | Out-Null
Add-Chart $s @('大客-KA','大客-餐饮','会员&创新','大客-零食') @('4月毛利率（%）','累计毛利率（%）') @(@(31.9,15.1,15.8,-39.0),@(27.2,14.5,14.0,8.3)) @($blue,0xF5D6A9)
Add-Text $s 'KA：毛利222.8万元，毛利率31.9%`r会员&创新：毛利136.8万元，毛利率15.8%`r零食：亏损49.8万元，毛利率-39.0%' 555 125 350 120 15 $dark $true | Out-Null
Add-Box $s 560 280 345 110 | Out-Null; Add-Text $s '整体毛利率：4月 -3.0%｜累计 12.0%' 580 310 305 42 19 $red $true | Out-Null
Add-Notes $s '毛利结构分化明显。KA是4月最主要的利润来源，毛利222.8万元、毛利率31.9%；会员与创新贡献136.8万元，毛利率15.8%。零食单月收入127.5万元，却产生负毛利49.8万元，毛利率负39.0%，是整体毛利率跌到负3.0%的直接拖累项。'

# 6 销售费用
$s=$pres.Slides.Item(6); Clear-Slide $s
Add-Text $s '销售费用结构：市场费用占八成，投入增速远超收入' 35 18 780 38 23 0xFFFFFF $true | Out-Null
Add-Chart $s @('职工薪酬','市场费用') @('4月（万元）','累计（万元）') @(@(45.1,216.3),@(144.8,639.8)) @($blue,0xF5D6A9)
Add-Text $s '4月销售直接费用261.4万元，其中市场费用216.3万元，占82.7%。' 555 125 350 80 16 $dark $true | Out-Null
Add-Box $s 560 245 160 130 | Out-Null; Add-Text $s '127.6%' 580 270 120 40 23 $red $true | Out-Null; Add-Text $s '4月费用超预算' 580 325 120 25 13 $gray | Out-Null
Add-Box $s 745 245 160 130 | Out-Null; Add-Text $s '114.4%' 765 270 120 40 23 $red $true | Out-Null; Add-Text $s '累计费用超预算' 765 325 120 25 13 $gray | Out-Null
Add-Text $s '费用率：4月14.6%（预算7.0%）｜累计8.9%（预算5.6%）' 555 410 350 40 14 $dark $true | Out-Null
Add-Notes $s '销售费用是第二个核心矛盾。4月销售直接费用261.4万元，较预算多146.5万元；其中市场费用216.3万元，占销售费用82.7%。费用率从预算7.0%升到14.6%。累计市场费用639.8万元，占销售费用81.6%；累计销售费用率8.9%，比预算高3.3个百分点。'

# 7 行动
$s=$pres.Slides.Item(7); Clear-Slide $s
Add-Text $s '整体分析总结｜三项动作恢复利润转化' 35 18 780 38 23 0xFFFFFF $true | Out-Null
$actions=@(@('立即｜7天','止损','逐单复盘零食负毛利；冻结低于底线毛利率的新增订单与促销。'),@('短期｜30天','控费','拆解市场费用到客户/活动；设置“增量毛利覆盖费用”准入标准。'),@('季度内','调结构','扩大KA高毛利收入；优化会员扣点条款；建立周度收入质量看板。'))
for($i=0;$i -lt 3;$i++){ $x=45+$i*300; Add-Text $s $actions[$i][0] $x 125 255 30 14 $gray $true | Out-Null; Add-Box $s $x 175 260 230 | Out-Null; Add-Text $s $actions[$i][1] ($x+18) 195 220 45 22 $red $true | Out-Null; Add-Text $s $actions[$i][2] ($x+18) 260 220 100 15 $dark | Out-Null }
Add-Notes $s '建议分三步推进。第一，七天内完成零食负毛利订单清单，低于底线毛利率的业务先止损。第二，三十天内把市场费用穿透到客户和活动，新增费用必须有可验证的增量毛利覆盖。第三，季度内优化收入结构，优先放大KA高毛利业务，同时重新审视会员与创新业务的合同扣点条款。'

# 8 收尾
$s=$pres.Slides.Item(8); Clear-Slide $s
Add-Text $s '谢谢' 65 45 180 35 20 0xFFFFFF $true | Out-Null
Add-Text $s '聚焦利润质量｜守住毛利底线｜提升费用效率' 65 465 600 28 14 0xFFFFFF $true | Out-Null
Add-Notes $s '大客中心的增长动能是清晰的，但4月已经出现规模与利润背离。下一阶段经营目标应从单纯追收入，切换到合同后净收入、毛利率和费用后利润三项指标联动管理。'

$pres.SaveAs($out,24)
$pres.Close()
$pp.Quit()
Write-Output $out
