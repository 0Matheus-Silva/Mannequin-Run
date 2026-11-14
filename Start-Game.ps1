param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
$mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.json'='application/json'; '.png'='image/png'; '.svg'='image/svg+xml'; '.wav'='audio/wav' }
try {
    $listener.Start()
    Write-Host "MANNEQUIN RUN: http://localhost:$Port (Ctrl+C para encerrar)"
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 3000
        try {
            $stream = $client.GetStream()
            $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
            $request = $reader.ReadLine()
            if (-not $request) { continue }
            do { $header = $reader.ReadLine() } while ($header)
            $parts = $request.Split(' ')
            $method = $parts[0]
            $urlPath = [Uri]::UnescapeDataString(($parts[1] -split '\?')[0])
            if ($urlPath -eq '/') { $urlPath = '/index.html' }
            $filePath = [IO.Path]::GetFullPath((Join-Path $projectRoot $urlPath.TrimStart('/')))
            $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $inside = $filePath.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
            if ($method -notin @('GET', 'HEAD')) {
                $code = '405 Method Not Allowed'; $body = [Text.Encoding]::UTF8.GetBytes('Method not allowed'); $type = 'text/plain'
            } elseif (-not $inside -or -not $mime.ContainsKey($extension) -or -not [IO.File]::Exists($filePath)) {
                $code = '404 Not Found'; $body = [Text.Encoding]::UTF8.GetBytes('Not found'); $type = 'text/plain'
            } else {
                $code = '200 OK'; $body = [IO.File]::ReadAllBytes($filePath); $type = $mime[$extension]
            }
            $response = "HTTP/1.1 $code`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n`r`n"
            $bytes = [Text.Encoding]::ASCII.GetBytes($response)
            $stream.Write($bytes, 0, $bytes.Length)
            if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
        } catch {
            Write-Verbose $_.Exception.Message
        } finally { $client.Dispose() }
    }
} finally { $listener.Stop() }
