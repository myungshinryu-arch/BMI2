function Check-Balance {
    param (
        [string]$filepath
    )
    $content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)
    $stack = New-Object System.Collections.Generic.Stack[PSCustomObject]
    $mapping = @{
        '}' = '{'
        ']' = '['
        ')' = '('
    }
    $lines = $content -split "`r?`n"
    
    $in_string = $false
    $string_char = $null
    $escaped = $false
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $clean_line = ""
        
        $j = 0
        while ($j -lt $line.Length) {
            $char = $line[$j]
            if ($escaped) {
                $escaped = $false
                $j++
                continue
            }
            if ($char -eq '\') {
                $escaped = $true
                $j++
                continue
            }
            
            if (-not $in_string) {
                if ($char -eq "'" -or $char -eq '"' -or $char -eq '`') {
                    $in_string = $true
                    $string_char = $char
                } elseif ($j -lt $line.Length - 1 -and $line[$j..($j+1)] -join "" -eq '//') {
                    break # ignore rest of line
                } else {
                    $clean_line += $char
                }
            } else {
                if ($char -eq $string_char) {
                    $in_string = $false
                    $string_char = $null
                }
            }
            $j++
        }
        
        for ($k = 0; $k -lt $clean_line.Length; $k++) {
            $char = $clean_line[$k]
            if ($mapping.ContainsValue($char)) {
                $stack.Push((New-Object PSCustomObject -Property @{ Char = $char; LineNum = $i + 1 }))
            } elseif ($mapping.ContainsKey($char)) {
                if ($stack.Count -eq 0) {
                    Write-Host "Unmatched closing '$char' at line $($i + 1)" -ForegroundColor Red
                    return $false
                }
                $top = $stack.Pop()
                if ($top.Char -ne $mapping[$char]) {
                    Write-Host "Mismatched '$char' at line $($i + 1) (expected closing for '$($top.Char)' from line $($top.LineNum))" -ForegroundColor Red
                    return $false
                }
            }
        }
    }
    
    if ($stack.Count -gt 0) {
        while ($stack.Count -gt 0) {
            $top = $stack.Pop()
            Write-Host "Unmatched opening '$($top.Char)' from line $($top.LineNum)" -ForegroundColor Red
        }
        return $false
    }
    
    Write-Host "All brackets, braces, and parentheses are perfectly balanced!" -ForegroundColor Green
    return $true
}

Check-Balance "D:\JKI\BTS\strategy-controller.js"
