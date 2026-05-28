# powershell_server.ps1
# A pure PowerShell TCP-based static file web server that doesn't require Admin privileges.
# Binds to 0.0.0.0 on port 8080 to enable sharing across the network.

$port = 8080
$basePath = Resolve-Path $PSScriptRoot

# 1. Get local IP addresses for display
$localIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.InterfaceAlias -notmatch "Loopback" } | Select-Object -ExpandProperty IPAddress

# 2. Start TcpListener on all interfaces (0.0.0.0)
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
try {
    $listener.Start()
} catch {
    Write-Error "Failed to start server on port $port. Is another server running?"
    exit 1
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  [Benchmarking to Strategy] Intranet Server      " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  - Local Access:   http://localhost:$port" -ForegroundColor Yellow

$sharingIPs = @()
foreach ($ip in $localIPs) {
    Write-Host "  - Share URL:    http://$($ip):$port/ (Share this with colleagues!)" -ForegroundColor Yellow
    $sharingIPs += $ip
}
if ($sharingIPs.Count -eq 0) {
    Write-Host "  - Share URL:    No active network interface found for sharing." -ForegroundColor DarkGray
}
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  To terminate the server, close this task or press Ctrl+C."

# MIME type helper
function Get-MimeType($extension) {
    switch ($extension) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif"  { return "image/gif" }
        ".svg"  { return "image/svg+xml" }
        ".ico"  { return "image/x-icon" }
        default { return "application/octet-stream" }
    }
}

$buffer = New-Object Byte[] 8192

while ($true) {
    try {
        if (-not $listener.Pending()) {
            Start-Sleep -Milliseconds 50
            continue
        }
        
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        # Read the HTTP request header
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -eq 0) {
            $client.Close()
            continue
        }
        
        $requestStr = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
        $firstLine = $requestStr.Split("`n")[0].Trim()
        
        # Parse "GET /path HTTP/1.1"
        if ($firstLine -match "^GET\s+(/[^\s\?]*)\s+HTTP") {
            $urlPath = $Matches[1]
            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }
            
            # URL Decode the path
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)
            
            # Safe path resolution
            $safePath = [System.IO.Path]::Combine($basePath, $urlPath.TrimStart('/'))
            $fullPath = [System.IO.Path]::GetFullPath($safePath)
            
            # Prevent directory traversal
            if (-not $fullPath.StartsWith($basePath)) {
                $header = "HTTP/1.1 403 Forbidden`r`nContent-Type: text/plain`r`nContent-Length: 13`r`nConnection: close`r`n`r`n403 Forbidden"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $client.Close()
                continue
            }
            
            if (Test-Path $fullPath -PathType Leaf) {
                $extension = [System.IO.Path]::GetExtension($fullPath).ToLower()
                $contentType = Get-MimeType $extension
                
                # Read file content
                $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
                $contentLength = $fileBytes.Length
                
                # Write HTTP Header
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $contentLength`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                
                # Write file content
                $stream.Write($fileBytes, 0, $fileBytes.Length)
            } else {
                $body = "404 Not Found: The requested file could not be found."
                $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($bodyBytes.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                $stream.Write($bodyBytes, 0, $bodyBytes.Length)
            }
        } else {
            # Invalid request type
            $header = "HTTP/1.1 400 Bad Request`r`nContent-Type: text/plain`r`nContent-Length: 15`r`nConnection: close`r`n`r`n400 Bad Request"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
        }
        
        $stream.Flush()
        $client.Close()
    } catch {
        # Handle client errors gracefully
        if ($null -ne $client) {
            $client.Close()
        }
    }
}
