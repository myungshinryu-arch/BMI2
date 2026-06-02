Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$mediaDir = "C:\Users\HANTA\Desktop\vivecoding_exercise\Compd BM\plc_media_unzipped\xl\media"

if (-not (Test-Path $mediaDir)) {
    Write-Error "Media directory not found: $mediaDir"
    exit 1
}

$wdpFiles = Get-ChildItem -Path $mediaDir -Filter *.wdp
$total = $wdpFiles.Count
Write-Host "Found $total .wdp files to convert."

$converted = 0
$skipped = 0
$failed = 0

foreach ($file in $wdpFiles) {
    $pngPath = Join-Path $mediaDir ($file.BaseName + ".png")
    if (Test-Path $pngPath) {
        $skipped++
        continue
    }
    
    try {
        # Open source file stream
        $stream = New-Object System.IO.FileStream($file.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
        
        # Decode WDP (JPEG XR)
        $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create($stream, [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
        $frame = $decoder.Frames[0]
        
        # Encode as PNG
        $encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
        $encoder.Frames.Add($frame)
        
        # Save to PNG file
        $outStream = New-Object System.IO.FileStream($pngPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
        $encoder.Save($outStream)
        
        # Close streams
        $outStream.Close()
        $stream.Close()
        
        $converted++
        if ($converted % 20 -eq 0) {
            Write-Host "Converted $converted / $total files..."
        }
    } catch {
        Write-Error "Failed to convert $($file.Name): $_"
        $failed++
    }
}

Write-Host "Conversion completed!"
Write-Host "Converted: $converted"
Write-Host "Skipped (already exists): $skipped"
Write-Host "Failed: $failed"
