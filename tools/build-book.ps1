param([Parameter(Mandatory=$true)][string]$SourceDocx)
$ErrorActionPreference='Stop'
$Repo=Split-Path -Parent $PSScriptRoot
$Read=Join-Path $Repo 'read'
$Downloads=Join-Path $Repo 'downloads'
$Build=Join-Path $PSScriptRoot '.build'
if(-not(Test-Path -LiteralPath $SourceDocx -PathType Leaf)){throw "Source DOCX not found: $SourceDocx"}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Enc([string]$s){[Net.WebUtility]::HtmlEncode($s)}
function Utf8([string]$path,[string]$value){[IO.File]::WriteAllText($path,$value,(New-Object Text.UTF8Encoding($false)))}
function ParaText($p,$ns){
  (($p.SelectNodes('.//w:t | .//w:tab | .//w:br',$ns)|ForEach-Object{
    if($_.LocalName-eq't'){$_.InnerText}elseif($_.LocalName-eq'tab'){"`t"}else{"`n"}
  })-join'')
}
function Inline($p,$ns){
  $b=New-Object Text.StringBuilder
  foreach($r in $p.SelectNodes('.//w:r',$ns)){
    $s=New-Object Text.StringBuilder
    foreach($n in $r.SelectNodes('.//w:t | .//w:tab | .//w:br',$ns)){
      if($n.LocalName-eq't'){[void]$s.Append((Enc $n.InnerText))}
      elseif($n.LocalName-eq'tab'){[void]$s.Append('&#9;')}
      else{[void]$s.Append('<br>')}
    }
    $v=$s.ToString()
    if(!$v){continue}
    if($r.SelectSingleNode('./w:rPr/w:i',$ns)){$v="<em>$v</em>"}
    if($r.SelectSingleNode('./w:rPr/w:b',$ns)){$v="<strong>$v</strong>"}
    [void]$b.Append($v)
  }
  $b.ToString()
}
function Shell([string]$title,[string]$body,[string]$css,[string]$js=''){
  $script=if($js){"<script src=`"$js`" defer></script>"}else{''}
  "<!DOCTYPE html>`n<html lang=`"ru`"><head><meta charset=`"utf-8`"><meta name=`"viewport`" content=`"width=device-width,initial-scale=1`"><meta name=`"theme-color`" content=`"#f7f2e8`"><link rel=`"icon`" href=`"data:,`"><title>$(Enc $title)</title><link rel=`"stylesheet`" href=`"$css`">$script</head><body>$body</body></html>"
}

$zip=[IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $SourceDocx))
try{
  $entry=$zip.GetEntry('word/document.xml')
  $sr=New-Object IO.StreamReader($entry.Open())
  try{[xml]$doc=$sr.ReadToEnd()}finally{$sr.Dispose()}
}finally{$zip.Dispose()}
$ns=New-Object Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$chapters=[ordered]@{}
$chapter=$null
$part=$null
$pcount=0
$ccount=0
foreach($p in $doc.SelectNodes('//w:body/w:p',$ns)){
  $t=ParaText $p $ns
  $sn=$p.SelectSingleNode('./w:pPr/w:pStyle',$ns)
  $style=if($sn){$sn.GetAttribute('val',$ns.LookupNamespace('w'))}else{''}
  if($style-eq'Heading1'-and$t-match'^Часть\s+\d+$'){$part=$t;continue}
  if($style-eq'Heading2'-and$t-match'^Г(?:ЛАВА|лава)\s+(\d+)$'){
    $n=[int]$Matches[1]
    $chapter=[ordered]@{Number=$n;Heading=$t;Part=$part;Paragraphs=New-Object Collections.Generic.List[object]}
    $chapters["$n"]=$chapter
    continue
  }
  if(!$chapter-or[String]::IsNullOrWhiteSpace($t)){continue}
  $chapter.Paragraphs.Add([pscustomobject]@{Text=$t;Html=(Inline $p $ns);Style=$style})
  $pcount++
  $ccount+=$t.Length
}
if($chapters.Count-ne11-or($chapters.Keys-join',')-ne'1,2,3,4,5,6,7,8,9,10,11'){
  throw "Unexpected chapters: $($chapters.Keys-join',')"
}

[IO.Directory]::CreateDirectory($Read)|Out-Null
[IO.Directory]::CreateDirectory($Downloads)|Out-Null
$resolvedRead=(Resolve-Path $Read).Path
foreach($oldChapter in Get-ChildItem -LiteralPath $Read -Directory|Where-Object{$_.Name-match'^chapter-\d{1,2}$'}){
  if(!$oldChapter.FullName.StartsWith($resolvedRead,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe chapter path'}
  [IO.Directory]::Delete($oldChapter.FullName,$true)
}
if(Test-Path -LiteralPath $Build){
  $rb=(Resolve-Path $Build).Path
  $rt=(Resolve-Path $PSScriptRoot).Path
  if(!$rb.StartsWith($rt,[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe build path'}
  [IO.Directory]::Delete($rb,$true)
}
[IO.Directory]::CreateDirectory($Build)|Out-Null

$cards=foreach($n in $chapters.Keys){
  $c=$chapters[$n]
  "<a class=`"chapter-card`" href=`"chapter-{0:D2}/`"><span>$(Enc $c.Part)</span><strong>$(Enc $c.Heading)</strong></a>"-f([int]$n)
}
$body="<a class=`"skip-link`" href=`"#contents`">К содержанию</a><header class=`"reader-header`"><a href=`"../`">Ирэн Кипо</a><a href=`"../`">На главную</a></header><main class=`"reader-main`" id=`"contents`"><p class=`"eyebrow`">Серия «Всё хорошо» · Книга 1</p><h1>В зоне видимости</h1><nav class=`"chapter-grid`" aria-label=`"Оглавление`">$($cards-join'')</nav><p class=`"reader-external`" aria-hidden=`"true`">&nbsp;</p></main>"
Utf8 (Join-Path $Read 'index.html') (Shell 'Читать «В зоне видимости» — Ирэн Кипо' $body '../assets/reader.css')

$epub=New-Object Collections.Generic.List[object]
$print=New-Object Collections.Generic.List[string]
foreach($n in $chapters.Keys){
  $c=$chapters[$n]
  $dir=Join-Path $Read ("chapter-{0:D2}"-f([int]$n))
  [IO.Directory]::CreateDirectory($dir)|Out-Null
  $paras=foreach($p in $c.Paragraphs){
    if($p.Style-eq'SceneBreak'-or$p.Text-eq'***'){'<p class="scene-break">***</p>'}
    else{"<p>$($p.Html)</p>"}
  }
  $prev=if($n-gt1){"../chapter-{0:D2}/"-f([int]$n-1)}else{'../'}
  $next=if($n-lt11){"../chapter-{0:D2}/"-f([int]$n+1)}else{'../'}
  $cb="<a class=`"skip-link`" href=`"#chapter`">К тексту</a><header class=`"reader-header`"><a href=`"../../`">Ирэн Кипо</a><a href=`"../`">Оглавление</a></header><main class=`"book-page`" id=`"chapter`"><div class=`"chapter-tools`" role=`"group`" aria-label=`"Управление чтением вслух`"><button type=`"button`" data-speech=`"play`">Слушать</button><button type=`"button`" data-speech=`"pause`">Пауза</button><button type=`"button`" data-speech=`"stop`">Стоп</button><span data-speech-status aria-live=`"polite`"></span></div><article class=`"chapter-text`" data-chapter=`"$n`"><p class=`"part-label`">$(Enc $c.Part)</p><h1>$(Enc $c.Heading)</h1>$($paras-join'')</article><nav class=`"chapter-nav`" aria-label=`"Навигация по книге`"><a href=`"$prev`">← Назад</a><a href=`"../`">Оглавление</a><a href=`"$next`">Далее →</a></nav></main>"
  Utf8 (Join-Path $dir 'index.html') (Shell "$($c.Heading) — «В зоне видимости»" $cb '../../assets/reader.css' '../../assets/reader.js')
  $xp=foreach($p in $c.Paragraphs){
    if($p.Style-eq'SceneBreak'-or$p.Text-eq'***'){'<p class="scene-break">***</p>'}
    else{"<p>$($p.Html)</p>"}
  }
  $x="<?xml version=`"1.0`" encoding=`"utf-8`"?><!DOCTYPE html><html xmlns=`"http://www.w3.org/1999/xhtml`" xml:lang=`"ru`" lang=`"ru`"><head><title>$(Enc $c.Heading)</title><link rel=`"stylesheet`" type=`"text/css`" href=`"book.css`"/></head><body><section><p class=`"part-label`">$(Enc $c.Part)</p><h1>$(Enc $c.Heading)</h1>$($xp-join'')</section></body></html>"
  $epub.Add([pscustomobject]@{Number=$n;Heading=$c.Heading;Xhtml=$x})
  $print.Add("<section class=`"print-chapter`"><p class=`"part-label`">$(Enc $c.Part)</p><h1>$(Enc $c.Heading)</h1>$($paras-join'')</section>")
}
$pb="<main class=`"print-book`"><section class=`"print-title`"><p>Ирэн Кипо</p><h1>В зоне видимости</h1><p>Серия «Всё хорошо» · Книга 1</p></section>$($print-join'')</main>"
Utf8 (Join-Path $Build 'book1-print.html') (Shell 'В зоне видимости — Ирэн Кипо' $pb '../../assets/reader.css')

$er=Join-Path $Build 'epub'
$mi=Join-Path $er 'META-INF'
$oe=Join-Path $er 'OEBPS'
[IO.Directory]::CreateDirectory($mi)|Out-Null
[IO.Directory]::CreateDirectory($oe)|Out-Null
Utf8 (Join-Path $er 'mimetype') 'application/epub+zip'
Utf8 (Join-Path $mi 'container.xml') '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
Utf8 (Join-Path $oe 'book.css') 'body{font-family:serif;line-height:1.6;margin:5%}h1,.part-label,.scene-break{text-align:center}p{margin:.7em 0;text-indent:1.4em}.scene-break{letter-spacing:.4em;margin:2em 0}'
$items=New-Object Collections.Generic.List[string]
$spine=New-Object Collections.Generic.List[string]
$navs=New-Object Collections.Generic.List[string]
foreach($c in $epub){
  $name="chapter-{0:D2}.xhtml"-f([int]$c.Number)
  Utf8 (Join-Path $oe $name) $c.Xhtml
  $items.Add("<item id=`"c$($c.Number)`" href=`"$name`" media-type=`"application/xhtml+xml`"/>")
  $spine.Add("<itemref idref=`"c$($c.Number)`"/>")
  $navs.Add("<li><a href=`"$name`">$(Enc $c.Heading)</a></li>")
}
Utf8 (Join-Path $oe 'nav.xhtml') "<?xml version=`"1.0`" encoding=`"utf-8`"?><!DOCTYPE html><html xmlns=`"http://www.w3.org/1999/xhtml`" xmlns:epub=`"http://www.idpf.org/2007/ops`" xml:lang=`"ru`"><head><title>Оглавление</title></head><body><nav epub:type=`"toc`"><h1>Оглавление</h1><ol>$($navs-join'')</ol></nav></body></html>"
Utf8 (Join-Path $oe 'content.opf') "<?xml version=`"1.0`" encoding=`"utf-8`"?><package xmlns=`"http://www.idpf.org/2007/opf`" version=`"3.0`" unique-identifier=`"book-id`" xml:lang=`"ru`"><metadata xmlns:dc=`"http://purl.org/dc/elements/1.1/`"><dc:identifier id=`"book-id`">urn:uuid:irene-kipo-v-zone-vidimosti-published-b01</dc:identifier><dc:title>В зоне видимости</dc:title><dc:creator>Ирэн Кипо</dc:creator><dc:language>ru</dc:language><meta property=`"dcterms:modified`">2026-09-09T00:00:00Z</meta></metadata><manifest><item id=`"nav`" href=`"nav.xhtml`" media-type=`"application/xhtml+xml`" properties=`"nav`"/><item id=`"css`" href=`"book.css`" media-type=`"text/css`"/>$($items-join'')</manifest><spine>$($spine-join'')</spine></package>"

$ep=Join-Path $Downloads 'book1-v-zone-vidimosti.epub'
if(Test-Path $ep){[IO.File]::Delete($ep)}
$fs=[IO.File]::Open($ep,[IO.FileMode]::CreateNew)
try{
  $za=New-Object IO.Compression.ZipArchive($fs,[IO.Compression.ZipArchiveMode]::Create,$false)
  try{
    $me=$za.CreateEntry('mimetype',[IO.Compression.CompressionLevel]::NoCompression)
    $mw=New-Object IO.StreamWriter($me.Open(),(New-Object Text.UTF8Encoding($false)))
    try{$mw.Write('application/epub+zip')}finally{$mw.Dispose()}
    foreach($f in Get-ChildItem $er -Recurse -File|Where-Object{$_.Name-ne'mimetype'}){
      $rel=$f.FullName.Substring($er.Length+1).Replace('\','/')
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($za,$f.FullName,$rel,[IO.Compression.CompressionLevel]::Optimal)|Out-Null
    }
  }finally{$za.Dispose()}
}finally{$fs.Dispose()}
& python (Join-Path $PSScriptRoot 'package-epub.py') $er $ep
if($LASTEXITCODE-ne0){throw 'Strict EPUB packaging failed'}

$manifest=[ordered]@{
  source_file=[IO.Path]::GetFileName($SourceDocx)
  source_sha256=(Get-FileHash $SourceDocx -Algorithm SHA256).Hash
  chapters=$chapters.Count
  paragraphs=$pcount
  characters=$ccount
}
Utf8 (Join-Path $Downloads 'book1-build-manifest.json') ($manifest|ConvertTo-Json)
$manifest|ConvertTo-Json
