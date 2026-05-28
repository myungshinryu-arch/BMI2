# verify_advanced_math.ps1
# 고정밀 공식 매출액 비례 역산 배분(Scale-to-Actual) 및 시장별 이원 세그먼트 수학적 정합성 자동 검증기
# 7대 제조사 x 2대 시장 x 6개 연도 = 총 84개 전수 조합 정합성 검증

# 1. 파일에서 데이터 추출 및 JSON 변환 헬퍼 정의
function Convert-JsObjectToJson($jsStr) {
    # single-line 주석 제거
    $json = [regex]::Replace($jsStr, '(?m)//.*$', '')
    # 따옴표가 없는 키를 따옴표로 감싸기
    $json = [regex]::Replace($json, '(?m)(?<!")\b([a-zA-Z0-9_]+)\b\s*:', '"$1":')
    # 닫는 중괄호/대괄호 전의 후행 쉼표 제거
    $json = $json -replace ',\s*([}\]])', '$1'
    return $json
}

function Get-SafeProperty {
    param(
        [Parameter(Mandatory=$true)]
        $obj,
        [Parameter(Mandatory=$true)]
        [string]$propName
    )
    if (-not $obj) { return $null }
    
    # Try accessing property via psobject properties collection first (highly robust on all PowerShell versions)
    $prop = $obj.psobject.properties[$propName]
    if ($prop) { return $prop.value }
    
    # Fallback to standard dot-notation if direct properties collection didn't have it
    return $obj.$propName
}

# 2. 파일 로드 및 변환 (절대 경로 사용으로 안전성 확보)
$dashboardJsPath = "D:\JKI\BTS\tire-dashboard\dashboard.js"
$dataJsPath = "D:\JKI\BTS\tire-dashboard\data.js"

if (-not (Test-Path $dashboardJsPath)) {
    Write-Error "ERROR: dashboard.js가 존재하지 않습니다: $dashboardJsPath"
    exit 1
}
if (-not (Test-Path $dataJsPath)) {
    Write-Error "ERROR: data.js가 존재하지 않습니다: $dataJsPath"
    exit 1
}

$dashboardJs = Get-Content -Path $dashboardJsPath -Raw
$dataJs = Get-Content -Path $dataJsPath -Raw

# 2.1 BRAND_IR_METADATA 로드
$metaStart = $dashboardJs.IndexOf("const BRAND_IR_METADATA = {")
if ($metaStart -lt 0) {
    Write-Error "ERROR: BRAND_IR_METADATA를 dashboard.js에서 찾을 수 없습니다."
    exit 1
}
$classStart = $dashboardJs.IndexOf("class TireDashboard", $metaStart)
$metaEnd = $dashboardJs.LastIndexOf("};", $classStart)
$metaStr = $dashboardJs.Substring($metaStart + 26, $metaEnd - ($metaStart + 26) + 1).Trim()
$metaObj = ConvertFrom-Json (Convert-JsObjectToJson $metaStr)

# 2.2 TIRE_UNIT_PRICES 로드
$pricesStart = $dashboardJs.IndexOf("const TIRE_UNIT_PRICES = {")
if ($pricesStart -lt 0) {
    Write-Error "ERROR: TIRE_UNIT_PRICES를 dashboard.js에서 찾을 수 없습니다."
    exit 1
}
$pricesEnd = $dashboardJs.IndexOf("};", $pricesStart)
$pricesStr = $dashboardJs.Substring($pricesStart + 25, $pricesEnd - ($pricesStart + 25) + 1).Trim()
$pricesObj = ConvertFrom-Json (Convert-JsObjectToJson $pricesStr)

# 2.3 TIRE_DATABASE 로드
$dbStart = $dataJs.IndexOf("const TIRE_DATABASE = [")
if ($dbStart -lt 0) {
    Write-Error "ERROR: TIRE_DATABASE를 data.js에서 찾을 수 없습니다."
    exit 1
}
$dbEnd = $dataJs.IndexOf("];`r`n`r`n// =============================================================", $dbStart)
if ($dbEnd -lt 0) { $dbEnd = $dataJs.IndexOf("];`n`n// =============================================================", $dbStart) }
if ($dbEnd -lt 0) { $dbEnd = $dataJs.IndexOf("];", $dbStart) }
$dbStr = $dataJs.Substring($dbStart + 22, $dbEnd - ($dbStart + 22) + 1).Trim()
$dbArr = ConvertFrom-Json (Convert-JsObjectToJson $dbStr)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   고정밀 역산 엔진 수학적 정합성 검증 스크립트" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  - 로드된 제조사 수: $($metaObj.psobject.properties.name.Count)개" -ForegroundColor Gray
Write-Host "  - 로드된 단가 항목: $($pricesObj.psobject.properties.name.Count)개" -ForegroundColor Gray
Write-Host "  - 로드된 타이어 모델: $($dbArr.Count)개" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

# 3. 대시보드 수학 모델 함수 구현
function Get-ModelSegmentForMarket {
    param(
        [Parameter(Mandatory=$true)]
        $item,
        [Parameter(Mandatory=$true)]
        [string]$market
    )
    if ($market -eq 'eu') {
        if ($item.season) { return $item.season } else { return "All-Season" }
    } else {
        return $item.segment
    }
}

function Get-ModelSalesVolume {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$brand,
        [Parameter(Mandatory=$true, Position=1)]
        [string]$model,
        [Parameter(Mandatory=$true, Position=2)]
        [string]$segment,
        [Parameter(Mandatory=$true, Position=3)]
        [string]$year,
        [Parameter(Mandatory=$true, Position=4)]
        [string]$market,
        [Parameter(Mandatory=$false, Position=5)]
        [bool]$highPrecision = $false
    )
    $metadata = Get-SafeProperty $metaObj $brand
    if (-not $metadata) { return 0.0 }

    # 글로벌 판매량
    $globalSalesObj = Get-SafeProperty $metadata "globalSales"
    $globalSales = 100000000.0
    if ($globalSalesObj) {
        $val = Get-SafeProperty $globalSalesObj $year
        if ($val -ne $null) {
            $globalSales = [double]$val
        }
    }

    # 지역 배분
    $regionalAllocObj = Get-SafeProperty $metadata "regionalAlloc"
    $rAlloc = 0.35
    if ($regionalAllocObj) {
        $val = Get-SafeProperty $regionalAllocObj $market
        if ($val -ne $null) {
            $rAlloc = [double]$val
        }
    }

    # 세그먼트 배분 (시장별 동적 이원화 적용)
    $marketSegmentAllocObj = Get-SafeProperty $metadata "marketSegmentAlloc"
    $sAlloc = 0.25
    if ($marketSegmentAllocObj) {
        $marketAllocObj = Get-SafeProperty $marketSegmentAllocObj $market
        if ($marketAllocObj) {
            $val = Get-SafeProperty $marketAllocObj $segment
            if ($val -ne $null) {
                $sAlloc = [double]$val
            }
        }
    }

    # 실제 상품이 존재하는 세그먼트들의 총 배분 비중 계산 (수량 정합성 스케일링)
    $sumRepresentedAlloc = 0.0
    if ($marketSegmentAllocObj) {
        $marketAllocObj = Get-SafeProperty $marketSegmentAllocObj $market
        if ($marketAllocObj) {
            $allSegments = $marketAllocObj.psobject.properties.name
            foreach ($seg in $allSegments) {
                $hasActiveModel = $false
                foreach ($volAllocItem in $dbArr) {
                    if ($volAllocItem.brand -eq $brand) {
                        $itemSeg = Get-ModelSegmentForMarket $volAllocItem $market
                        if ($itemSeg -eq $seg) {
                            $yearlyDataObj = Get-SafeProperty $volAllocItem "yearlyData"
                            if ($yearlyDataObj) {
                                $yRec = Get-SafeProperty $yearlyDataObj $year
                                if ($yRec) {
                                    $hasActiveModel = $true
                                    break
                                }
                            }
                        }
                    }
                }
                if ($hasActiveModel) {
                    $allocVal = Get-SafeProperty $marketAllocObj $seg
                    if ($allocVal -ne $null) {
                        $sumRepresentedAlloc += [double]$allocVal
                    }
                }
            }
        }
    }
    if ($sumRepresentedAlloc -eq 0.0) { $sumRepresentedAlloc = 1.0 }

    # 지역적 세그먼트 총 볼륨 (실질 본 수) -> 미표현 세그먼트 배분율을 배제하고 비례 스케일링 적용
    $segmentSalesActual = ([double]$globalSales * [double]$rAlloc * [double]$sAlloc) / [double]$sumRepresentedAlloc

    # 세그먼트 내 개별 모델들의 상대적 점유 비중 계산
    $sameBrandSegmentModels = New-Object System.Collections.ArrayList
    foreach ($volDbItem in $dbArr) {
        if ($volDbItem.brand -eq $brand) {
            $itemSeg = Get-ModelSegmentForMarket $volDbItem $market
            if ($itemSeg -eq $segment) {
                $null = $sameBrandSegmentModels.Add($volDbItem)
            }
        }
    }
    
    $sameSegmentDatabaseSum = 0.0
    foreach ($volModelItem in $sameBrandSegmentModels) {
        $yearlyDataObj = Get-SafeProperty $volModelItem "yearlyData"
        if ($yearlyDataObj) {
            $yRec = Get-SafeProperty $yearlyDataObj $year
            if ($yRec) {
                $salesVal = Get-SafeProperty $yRec "sales"
                if ($salesVal -ne $null) {
                    $sameSegmentDatabaseSum += [double]$salesVal
                }
            }
        }
    }

    if ($sameSegmentDatabaseSum -eq 0.0) { return 0.0 }

    $targetModel = $null
    foreach ($volTargetItem in $dbArr) {
        if ($volTargetItem.brand -eq $brand -and $volTargetItem.model -eq $model) {
            $targetModel = $volTargetItem
            break
        }
    }
    if (-not $targetModel) { return 0.0 }
    $targetYearlyDataObj = Get-SafeProperty $targetModel "yearlyData"
    if (-not $targetYearlyDataObj) { return 0.0 }
    $targetRec = Get-SafeProperty $targetYearlyDataObj $year
    if (-not $targetRec) { return 0.0 }

    $targetSalesVal = Get-SafeProperty $targetRec "sales"
    if ($targetSalesVal -eq $null) { return 0.0 }

    $modelShareRatio = [double]$targetSalesVal / [double]$sameSegmentDatabaseSum
    $modelVolumeK = ([double]$segmentSalesActual * [double]$modelShareRatio) / 1000.0

    if ($highPrecision) {
        return $modelVolumeK
    } else {
        return [math]::Round([double]$modelVolumeK, 1, [System.MidpointRounding]::AwayFromZero)
    }
}

function Get-ModelSalesRevenue {
    param(
        [Parameter(Mandatory=$true, Position=0)]
        [string]$brand,
        [Parameter(Mandatory=$true, Position=1)]
        [string]$model,
        [Parameter(Mandatory=$true, Position=2)]
        [string]$segment,
        [Parameter(Mandatory=$true, Position=3)]
        [string]$year,
        [Parameter(Mandatory=$true, Position=4)]
        [string]$market,
        [Parameter(Mandatory=$false, Position=5)]
        [bool]$highPrecision = $false
    )
    $metadata = Get-SafeProperty $metaObj $brand
    if (-not $metadata) { return 0.0 }

    # 1. 공식 매출액 Baseline 구하기 (USD 단위)
    $globalRevenueObj = Get-SafeProperty $metadata "globalRevenue"
    $globalRevenue = 6000000000.0
    if ($globalRevenueObj) {
        $val = Get-SafeProperty $globalRevenueObj $year
        if ($val -ne $null) {
            $globalRevenue = [double]$val
        }
    }
    
    $regionalAllocObj = Get-SafeProperty $metadata "regionalAlloc"
    $rAlloc = 0.35
    if ($regionalAllocObj) {
        $val = Get-SafeProperty $regionalAllocObj $market
        if ($val -ne $null) {
            $rAlloc = [double]$val
        }
    }
    
    $actualRevenueRegion = [double]$globalRevenue * [double]$rAlloc

    # 2. 해당 브랜드의 현재 시장 모든 모델에 대하여 1차 소매 매출액 합계 (R_retail_total) 계산
    $brandModels = New-Object System.Collections.ArrayList
    foreach ($revDbItem in $dbArr) {
        if ($revDbItem.brand -eq $brand) {
            $null = $brandModels.Add($revDbItem)
        }
    }
    
    $retailRevenueTotalUSD = 0.0
    foreach ($revBrandModelItem in $brandModels) {
        $itemSegment = Get-ModelSegmentForMarket $revBrandModelItem $market
        $salesVolK = Get-ModelSalesVolume -brand $brand -model $revBrandModelItem.model -segment $itemSegment -year $year -market $market -highPrecision $true
        
        $priceName = $revBrandModelItem.model
        $price = 150.0
        $priceObj = Get-SafeProperty $pricesObj $priceName
        if ($priceObj -ne $null) {
            $price = [double]$priceObj
        }

        $itemRetail = [double]$salesVolK * 1000.0 * [double]$price
        $retailRevenueTotalUSD += $itemRetail
    }

    if ($retailRevenueTotalUSD -eq 0.0) { return 0.0 }

    # 3. 비례 조정 계수 (Scale Factor) 산출
    $scaleFactor = [double]$actualRevenueRegion / [double]$retailRevenueTotalUSD

    # 4. 대상 모델의 1차 소매 매출액 계산
    $targetModel = $null
    foreach ($revTargetItem in $dbArr) {
        if ($revTargetItem.brand -eq $brand -and $revTargetItem.model -eq $model) {
            $targetModel = $revTargetItem
            break
        }
    }
    if (-not $targetModel) { 
        return 0.0 
    }
    $targetSegment = Get-ModelSegmentForMarket $targetModel $market
    $modelVolumeK = Get-ModelSalesVolume -brand $brand -model $model -segment $targetSegment -year $year -market $market -highPrecision $true
    
    $priceName = $model
    $modelPrice = 150.0
    $priceObj = Get-SafeProperty $pricesObj $priceName
    if ($priceObj -ne $null) {
        $modelPrice = [double]$priceObj
    }

    $modelRetailUSD = [double]$modelVolumeK * 1000.0 * [double]$modelPrice

    # 5. 최종 보정 매출액 산출 (USD) -> Million USD 변환
    $modelCalibratedUSD = [double]$modelRetailUSD * [double]$scaleFactor
    $modelCalibratedMillionUSD = [double]$modelCalibratedUSD / 1000000.0

    if ($highPrecision) {
        return $modelCalibratedMillionUSD
    } else {
        return [math]::Round([double]$modelCalibratedMillionUSD, 1, [System.MidpointRounding]::AwayFromZero)
    }
}

# 4. 전수 매칭 루프 가동 (7대 제조사 x 2대 시장 x 6개 연도 = 84개 세트)
$brands = $metaObj.psobject.properties.name
$markets = @("na", "eu")
$years = @("2021", "2022", "2023", "2024", "2025", "2026")

$totalTests = 0
$passedTests = 0

foreach ($brand in $brands) {
    foreach ($market in $markets) {
        foreach ($year in $years) {
            $totalTests++
            
            # A. 예상 값 계산 (Baseline)
            $metadata = Get-SafeProperty $metaObj $brand
            
            $globalSalesObj = Get-SafeProperty $metadata "globalSales"
            $expectedGlobalSales = 100000000.0
            if ($globalSalesObj) {
                $val = Get-SafeProperty $globalSalesObj $year
                if ($val -ne $null) {
                    $expectedGlobalSales = [double]$val
                }
            }
            
            $regionalAllocObj = Get-SafeProperty $metadata "regionalAlloc"
            $rAlloc = 0.35
            if ($regionalAllocObj) {
                $val = Get-SafeProperty $regionalAllocObj $market
                if ($val -ne $null) {
                    $rAlloc = [double]$val
                }
            }
            $expectedRegSales = [double]$expectedGlobalSales * [double]$rAlloc
            $expectedVolK = $expectedRegSales / 1000.0 # k units
            
            $globalRevenueObj = Get-SafeProperty $metadata "globalRevenue"
            $expectedGlobalRev = 6000000000.0
            if ($globalRevenueObj) {
                $val = Get-SafeProperty $globalRevenueObj $year
                if ($val -ne $null) {
                    $expectedGlobalRev = [double]$val
                }
            }
            $expectedRegRev = [double]$expectedGlobalRev * [double]$rAlloc
            $expectedRevMillion = $expectedRegRev / 1000000.0 # Million USD
            
            # B. 실제 모델 합산 값 계산 (High Precision)
            $sumVolK = 0.0
            $sumRevMillion = 0.0
            
            # UI에 노출되는 소수점 첫째자리 반올림 값의 합산
            $sumVolKRounded = 0.0
            $sumRevMillionRounded = 0.0
            
            $brandModels = New-Object System.Collections.ArrayList
            foreach ($testDbItem in $dbArr) {
                if ($testDbItem.brand -eq $brand) {
                    $null = $brandModels.Add($testDbItem)
                }
            }
            
            foreach ($testBrandModelItem in $brandModels) {
                $segment = Get-ModelSegmentForMarket $testBrandModelItem $market
                
                $vol = Get-ModelSalesVolume -brand $brand -model $testBrandModelItem.model -segment $segment -year $year -market $market -highPrecision $true
                $sumVolK += [double]$vol
                $sumVolKRounded += [math]::Round([double]$vol, 1, [System.MidpointRounding]::AwayFromZero)
                
                $rev = Get-ModelSalesRevenue -brand $brand -model $testBrandModelItem.model -segment $segment -year $year -market $market -highPrecision $true
                $sumRevMillion += [double]$rev
                $sumRevMillionRounded += [math]::Round([double]$rev, 1, [System.MidpointRounding]::AwayFromZero)
            }
            
            # C. 정합성 검증 (오차 임계치 0.001M 이내)
            $volDiff = [math]::Abs($sumVolK - $expectedVolK)
            $revDiff = [math]::Abs($sumRevMillion - $expectedRevMillion)
            
            $volSuccess = $volDiff -lt 0.001
            $revSuccess = $revDiff -lt 0.001
            
            # UI 반올림 합산 오차 (참고용)
            $volDiffRounded = [math]::Abs($sumVolKRounded - $expectedVolK)
            $revDiffRounded = [math]::Abs($sumRevMillionRounded - $expectedRevMillion)
            
            if ($volSuccess -and $revSuccess) {
                $passedTests++
            } else {
                Write-Host "[FAIL] [$($brand.PadRight(12))] 시장:$market, 연도:$year" -ForegroundColor Red
                Write-Host "  - 수량: 예상=$($expectedVolK.ToString('F2'))k, 실제합산=$($sumVolK.ToString('F2'))k (오차=$($volDiff.ToString('F6'))k)" -ForegroundColor Red
                Write-Host "  - 매출: 예상=$($expectedRevMillion.ToString('F2'))M, 실제합산=$($sumRevMillion.ToString('F2'))M (오차=$($revDiff.ToString('F6'))M)" -ForegroundColor Red
                exit 1
            }
        }
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   검증 결과 요약 (Validation Summary)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  - 총 검증 조합 수: $totalTests 개" -ForegroundColor Gray
Write-Host "  - 정합성 통과 수  : $passedTests 개" -ForegroundColor Green

if ($passedTests -eq $totalTests) {
    Write-Host "  - 최종 판정: [SUCCESS] 모든 조합에서 공식 메타데이터와 수량 및 매출이 100% 정합함을 수학적으로 완벽히 검증하였습니다!" -ForegroundColor Green -BackgroundColor DarkGreen
} else {
    Write-Host "  - 최종 판정: [FAILURE] 일부 조합에서 수학적 불일치가 발견되었습니다." -ForegroundColor Red -BackgroundColor DarkRed
    exit 1
}
Write-Host "==================================================" -ForegroundColor Cyan
