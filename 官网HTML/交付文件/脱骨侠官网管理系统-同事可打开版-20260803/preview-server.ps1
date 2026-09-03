param(
  [int]$Port = 41730,
  [switch]$NoBrowser,
  [switch]$SingleRequest
)

$ErrorActionPreference = "Stop"
$siteRoot = [IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$siteRootPrefix = $siteRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$listener = $null

for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
  try {
    $candidatePort = $Port + $attempt
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $candidatePort)
    $listener.Start()
    $Port = $candidatePort
    break
  } catch {
    if ($listener) {
      $listener.Stop()
      $listener = $null
    }
  }
}

if (-not $listener) {
  throw "No available local preview port was found."
}

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

function Write-HttpResponse {
  param(
    [Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$Body
  )

  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

$previewUrl = "http://127.0.0.1:$Port/index.html"
Write-Host ""
Write-Host "Local preview is running:" -ForegroundColor Green
Write-Host $previewUrl -ForegroundColor Cyan
Write-Host "Keep this window open while previewing. Close it to stop." -ForegroundColor DarkGray

if (-not $NoBrowser) {
  Start-Process $previewUrl
}

try {
  do {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
      }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      $requestParts = $requestLine.Split(" ")
      if ($requestParts.Length -lt 2 -or $requestParts[0] -ne "GET") {
        $body = [Text.Encoding]::UTF8.GetBytes("Only GET requests are supported.")
        Write-HttpResponse -Stream $stream -StatusCode 405 -StatusText "Method Not Allowed" -ContentType "text/plain; charset=utf-8" -Body $body
        continue
      }

      $requestUri = [Uri]("http://127.0.0.1" + $requestParts[1])
      $relativePath = [Uri]::UnescapeDataString($requestUri.AbsolutePath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
      }

      $relativePath = $relativePath.Replace("/", [IO.Path]::DirectorySeparatorChar)
      $filePath = [IO.Path]::GetFullPath((Join-Path $siteRoot $relativePath))

      if (-not $filePath.StartsWith($siteRootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        $body = [Text.Encoding]::UTF8.GetBytes("Forbidden")
        Write-HttpResponse -Stream $stream -StatusCode 403 -StatusText "Forbidden" -ContentType "text/plain; charset=utf-8" -Body $body
        continue
      }

      if (Test-Path -LiteralPath $filePath -PathType Container) {
        $filePath = Join-Path $filePath "index.html"
      }

      if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        $body = [Text.Encoding]::UTF8.GetBytes("File not found")
        Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText "Not Found" -ContentType "text/plain; charset=utf-8" -Body $body
        continue
      }

      $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = $contentTypes[$extension]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      $body = [IO.File]::ReadAllBytes($filePath)
      Write-HttpResponse -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType $contentType -Body $body
    } finally {
      $client.Close()
    }
  } while (-not $SingleRequest)
} finally {
  $listener.Stop()
}
