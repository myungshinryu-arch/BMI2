try {
    $r = Invoke-WebRequest -Uri 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250912152436BF68627618820F4949258D03002331DF?opendocument%26popup=1' -UseBasicParsing -TimeoutSec 10
    Write-Output "Status: $($r.StatusCode)"
    Write-Output "Content Length: $($r.Content.Length)"
    if ($r.Content -match '<title>(.*?)</title>') {
        Write-Output "Title: $($Matches[1])"
    } else {
        Write-Output "No Title found"
    }
} catch {
    Write-Output "Error: $_"
}
