# Read the JS file
$lines = Get-Content -Path "Tire_BM_UI_FINAL\data\plc_data.js" -Encoding UTF8

$inReport = $false
$currentReport = @{
    id = $null
    title = ""
    docNo = ""
    completeDate = ""
    draftDate = ""
    linkAddress = ""
}

Write-Output "EV RELEVANT REPORTS:"

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -eq "{") {
        $inReport = $true
        $currentReport = @{
            id = $null
            title = ""
            docNo = ""
            completeDate = ""
            draftDate = ""
            linkAddress = ""
        }
    }
    elseif ($trimmed -match "^`"id`":\s*(\d+)") {
        if ($inReport) { $currentReport.id = [int]$Matches[1] }
    }
    elseif ($trimmed -match "^`"title`":\s*`"(.*)`",?") {
        if ($inReport) { $currentReport.title = $Matches[1] }
    }
    elseif ($trimmed -match "^`"docNo`":\s*`"(.*)`",?") {
        if ($inReport) { $currentReport.docNo = $Matches[1] }
    }
    elseif ($trimmed -match "^`"completeDate`":\s*`"(.*)`",?") {
        if ($inReport) { $currentReport.completeDate = $Matches[1] }
    }
    elseif ($trimmed -match "^`"draftDate`":\s*`"(.*)`",?") {
        if ($inReport) { $currentReport.draftDate = $Matches[1] }
    }
    elseif ($trimmed -match "^`"linkAddress`":\s*`"(.*)`",?") {
        if ($inReport) { $currentReport.linkAddress = $Matches[1] }
    }
    elseif ($trimmed -match "^\},?") {
        if ($inReport) {
            $inReport = $false
            $hasEV = ($currentReport.title -like "*EV*") -or ($currentReport.title -like "*전기차*")
            if ($hasEV) {
                $id = $currentReport.id
                $title = $currentReport.title
                $doc = $currentReport.docNo
                $date = if ($currentReport.completeDate) { $currentReport.completeDate } else { $currentReport.draftDate }
                $link = $currentReport.linkAddress
                Write-Output "EV_REPORT: ID=$id | Title=$title | DocNo=$doc | Date=$date | Link=$link"
            }
        }
    }
}
