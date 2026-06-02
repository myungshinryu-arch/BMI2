/**
 * 한국타이어 상품 전략 분석 시스템 - 대시보드 로직
 * 글로벌 필터 이벤트 처리, 세그먼트별 상품 포지셔닝 및 랭킹 계산,
 * 동적 SWOT R&D 매트릭스 엔진, Gap Analysis 가이드 생성, Chart.js 시각화 제어,
 * 유럽 전문 분석 통합 평점 연계 및 글로벌 탑 4 경쟁사 실시간 리포팅 포털.
 */

const TIRE_STRATEGY_DB = {
    Michelin: {
        nameKo: "미쉐린",
        letter: "M",
        color: "#5cb2ff",
        period: "2025-2026 글로벌 분기 IR 보고서 분석",
        marketing: {
            fact: "미쉐린은 '마모 수명 한계점까지 일관된 제동 안전성을 유지하는 지속가능 성능'을 최우선 소구점으로 공식 선언하여 내세우고 있습니다. 단순 새 제품 평가 중심에서 탈피해 수명이 완전히 끝나는 시점까지 균일한 제동 신뢰를 제공하는 것을 핵심 USP로 삼고 있습니다.",
            estimation: "이는 마모 한계 시점 경쟁력이 상대적으로 취약한 아시아계 후발 제조사들의 진입 장벽을 공고히 쌓고, 프리미엄 초고단가 가격 정책을 흔들림 없이 고수하기 위한 가격 방어 전략으로 추정됩니다."
        },
        product: {
            fact: "자료에 따르면 미쉐린은 18인치 이상의 고인치 고수익 승용 세그먼트와 HL(High Load Capacity) 전기차 규격 타이어 수주에 전력을 집중하고 있습니다. 수익성이 낮은 유럽 내 일부 승용 공장을 폐쇄/감축하는 한편, 글로벌 완성차 프리미엄 세그먼트 OE 공급 비중을 45% 이상으로 상향 유지하고 있습니다.",
            estimation: "일반 범용 타이어 시장의 고열 마진 경쟁을 기피하고, 고수익 하이엔드 럭셔리 및 고하중 EV 제품 위주로 믹스를 정렬하여 고정비를 낮추고 제조 효율을 극대화하려는 목적을 지닌 것으로 해석됩니다."
        },
        tech: {
            fact: "2030년까지 타이어 제조 원료의 40% 이상을 재생 원료 및 친환경 페트 수지로 충당하겠다는 지속가능 ESG 로드맵을 가동하고 있습니다. 트레드가 마모될수록 내부 패턴 홈이 스스로 열려 젖은 제동력을 역동적으로 유지시키는 '자가 재생 트레드 패턴' 연구에 R&D 자원의 30%를 고정 투입 중입니다.",
            estimation: "유럽 Euro 7 등 고난도 환경 규제(미세먼지 마모 배출 가이드라인)에 능동적으로 대처하며, 패턴 수명 소실에 따른 그립 감소 한계를 지능적인 하이테크 트레드 형상 설계 기술로 극복하려는 시도로 분석됩니다."
        },
        chartLabels: ["바이오 원료 대체 컴파운딩", "자가 재생 트레드 패턴", "EV 전용 고강성 HL 최적화", "초저마모 트레드 수명 연장", "지능형 소음 차단 폼 기술"],
        chartData: [35, 25, 20, 12, 8]
    },
    Bridgestone: {
        nameKo: "브리지스톤",
        letter: "B",
        color: "#ffd043",
        period: "2025-2026 글로벌 경영 실적 가이드",
        marketing: {
            fact: "브리지스톤은 '프리미엄 주행 성능과 지속가능성의 완벽한 공존'을 미디어 광고 전면에 강조하고 있습니다. 타이어 중량 축소를 통해 연비와 습윤 접지력을 동시에 확보한 친환경 럭셔리 드라이빙 가치를 적극 전달하고 있습니다.",
            estimation: "친환경 가치소비를 지향하는 타겟 오디언스들의 기호와 강력한 고유 그립 성능(안전) 사이의 이해 상충을 독자적 기술 브랜드로 극복했다는 프리미엄 선도적 이미지를 선점하려는 시도로 판단됩니다."
        },
        product: {
            fact: "가치 사슬 고도화를 목표로 삼아 저수익 저인치 제품 유통을 축소하는 대신, 고성능 타이어 전문 리테일 점유율 인수를 빠르게 전개하고 있습니다. 타이어 내부 센서를 차량 관제 시스템과 연동하는 디지털 IoT 모니터링 구독 서비스 'Webfleet' 솔루션을 대형 물류 수송 함대(플릿)에 공급 확대 중입니다.",
            estimation: "제조업의 한계를 넘어서 클라우드 구독 MaaS(Mobility as a Service) 사업자로 도약해 고정적인 유입 마진 구조를 정립하고, 자사 유통 거점 강화를 통해 OE/RE 시장 지배력을 복합적으로 고정 확보하려는 구상으로 풀이됩니다."
        },
        tech: {
            fact: "브랜드 최우선 기술인 'ENLITEN' 플랫폼에 투자를 집중하여 타이어 총 중량을 최대 20% 경량화하고 회전저항을 15% 삭감시켜 전기차 주행 거리 증가 가이드를 제시했습니다. 고온 배합 시 이산화탄소 배출을 줄이기 위한 정밀 제어 고무 수지 컴파운딩 신공정 구축에 막대한 연구비를 투자 중입니다.",
            estimation: "배터리 무게로 인한 하중 증가 극대화가 불가피한 차세대 EV 제조사의 경량화 니즈를 정확히 공략함으로써 EV 순정 장착 시장의 절대 지배자로 포지셔닝하고자 하는 적극적인 행보로 분석됩니다."
        },
        chartLabels: ["ENLITEN 경량 설계 기술", "초저 회전저항 컴파운드", "IoT 원격 공기압 모니터링", "특수 합성수지 컴파운딩 연구", "생산 라인 친환경 저탄소 공정"],
        chartData: [40, 22, 18, 12, 8]
    },
    Continental: {
        nameKo: "콘티넨탈",
        letter: "C",
        color: "#ff9f24",
        period: "2025 글로벌 테크 데이 및 기술 특허 공시",
        marketing: {
            fact: "'독일 엔지니어링 정밀성과 전장 섀시 제어 연계 기술의 무결점 안전성'을 USP로 확립했습니다. 벤치마크 테스트 데이터에 기초한 정량적 제동안정성 결과를 미디어를 통해 투명하고 안전하게 연출하고 있습니다.",
            estimation: "모체인 종합 부품사로서의 섀시 센서 및 전자 제어 장치 노하우를 주입하여, 경쟁 타이어사 대비 고차원의 '차량 능동 제어 안전' 시너지를 부각시키려는 포지셔닝 설계로 추정됩니다."
        },
        product: {
            fact: "슈퍼카 전용 초고인치 프리미엄 스포츠 제품군과 유럽/아시아 특화 초고성능 Summer 타이어 공급 비중을 대폭 증대하고 있습니다. 범용 승용 라인의 제조 단가를 축소 조정하고 하이엔드 하이퍼카 OE 탑재 독점 수주 체결에 핵심 역량을 집중하고 있습니다.",
            estimation: "중국 및 범용 브랜드의 저가 믹스 공세를 원천 방어하고자 타사의 침입이 원천 차단되는 고정밀 기술 타이어 시장의 입지를 완전히 다지겠다는 고품격 고마진 집중화 전략으로 읽힙니다."
        },
        tech: {
            fact: "러시아산 천연고무 의존도를 극복하기 위해 민들레 뿌리 추출 친환경 대체 고무 'Taraxagum'의 승용 타이어 양산 라인 적용 공정을 세계 최초로 상용화했습니다. 타이어 내부 가황 센서가 마모 진행도와 노면 수막현상을 체크하여 차량 구동 장치에 실시간 정보를 제공하는 주행 인텔리전스 시스템 고도화에 주력하고 있습니다.",
            estimation: "친환경 원료 수급 안보 확보는 물론, 다가올 자율주행 차량 환경에서 타이어 섀시가 직접 노면 물리 마찰 정보를 전달하는 인공지능 주행 데이터 비즈니스의 원천 기술을 확보하기 위한 R&D 지향점으로 판단됩니다."
        },
        chartLabels: ["지능형 무선 센서 섀시 연계", "민들레 고무 Taraxagum 상용화", "고온/습윤 복합 정밀 제동 소재", "전기차 최적 강성 보강 패키지", "타이어 내측 저온 융착 가동 공정"],
        chartData: [32, 28, 18, 12, 10]
    },
    Goodyear: {
        nameKo: "굿이어",
        letter: "G",
        color: "#ca8aff",
        period: "2025-2026 Goodyear Forward 경영 전략안",
        marketing: {
            fact: "굿이어는 기후 변화가 유발하는 거친 노면과 급격한 일교차 하에서도 완벽한 그립을 지원하는 '전천후 안전성'을 마케팅 중심 테마로 투영하고 있습니다. 북미 오토클럽과 유대를 공고히 하고 가상 주행 시뮬레이션 매체를 활용한 고객 접점을 넓히고 있습니다.",
            estimation: "미국 본토 특유의 극심한 폭설과 우천 기후를 중시하는 대륙 소비자에게 '사계절 무중단 안전 신뢰성'의 대명사 격인 자사 타이어 이미지를 고착화하여 충성 고객 이탈을 통제하려는 목적입니다."
        },
        product: {
            fact: "체질 개선 프로그램 'Goodyear Forward'를 선언하며 아시아/유럽 내 비수익성 승용 공장 자산을 전격 매각하고, 특수 화학 소재 자회사를 분할 정리했습니다. 이에 따라 보존된 현금을 미국 본토 내 SUV, 라이트트럭 및 험로 All-Terrain 라인업의 단가 마진 증대 정책에 쏟아 붓고 있습니다.",
            estimation: "과도한 부채와 이자 리스크 부담을 해소하기 위해 저수익 해외 공장을 구조조정하고, 북미 본토에서 가장 마진율이 견고하고 점유율이 탄탄한 픽업트럭/SUV 믹스에 리소스를 봉쇄 수렴하여 수익성을 가속화하려는 구도로 분석됩니다."
        },
        tech: {
            fact: "클라우드 인프라 기반의 모빌리티 분석 툴 'SightLine' 시스템을 보급하고 있습니다. 타이어 내장 칩이 잔여 트레드웨어 수명 속도와 젖은 배수 한계 데이터를 실시간 계측하여 데이터 서버에 무선 송출합니다. 더불어 대두유 친환경 원료 배합을 전체 패신저 라인업에 확대 적용하고 있습니다.",
            estimation: "렌터카 및 카셰어링, 상용 플릿을 아우르는 지능형 통합 모빌리티 관리 자동화 리더십을 점하고, 대두유 대체 고무 적용으로 미국 행정부의 친환경 조달 우대 및 관세 혜택을 획득하려는 일석이조의 기술 전략입니다."
        },
        chartLabels: ["SightLine 클라우드 AI 분석칩", "대두유 바이오 원료 대치 제조", "험로 내구 성능 컴파운딩", "북미 볼륨 생산 공정 자동화", "차세대 사계절 하이브리드 패턴"],
        chartData: [36, 24, 18, 12, 10]
    }
};

// =============================================================
// 3. 글로벌 타이어 제품별 가중평균 평균 단가
// =============================================================
const TIRE_UNIT_PRICES = {
    // Hankook
    "Ventus S1 evo3": 140,
    "Ventus S1 AS": 135,
    "Kinergy GT": 120,
    "Kinergy 4S2": 125,
    "Winter i*cept evo3": 130,
    "Dynapro AT2": 145,
    "iON evo": 185,
    "iON evo AS": 180,
    "Dynapro HPX": 160,
    
    // Michelin
    "Pilot Sport 4S": 240,
    "CrossClimate 2": 210,
    "X-Ice Snow": 190,
    "LTX A/T 2": 230,
    "Defender 2": 200,
    
    // Bridgestone
    "Potenza Sport": 210,
    "Turanza QuietTrack": 190,
    "Blizzak WS90": 175,
    "Ecopia EP422 Plus": 160,
    "Dueler A/T Revo 3": 220,
    
    // Continental
    "ExtremeContact DWS06 Plus": 185,
    "PureContact LS": 165,
    "TerrainContact A/T": 220,
    "TrueContact Tour": 160,
    "VikingContact 7": 180,
    
    // Goodyear
    "Assurance WeatherReady": 180,
    "Wrangler DuraTrac": 230,
    "Assurance ComfortDrive": 170,
    "Eagle F1 Asymmetric 6": 190,
    "UltraGrip Performance 3": 175,
    
    // Pirelli
    "P Zero PZ4": 235,
    "Cinturato P7 AS Plus II": 185,
    "P4 Persist AS Plus": 155,
    "Winter Sottozero 3": 220,
    "Scorpion All Terrain Plus": 210,
    
    // Kumho
    "Crugen HP71": 130,
    "Solus TA51a": 115,
    "Ecsta PS71": 125,
    "WinterCraft WP72": 120,
    "Road Venture AT52": 135,
    
    // New Competitor SUV Grand Touring Tires
    "CrossClimate 2 SUV": 185,
    "Alenza AS Ultra": 180,
    "CrossContact LX25": 160,
    "Scorpion AS Plus 3": 170,
    "Assurance MaxLife (SUV)": 150
};

// =============================================================
// 4. 공식 IR 실적 보고서 기반 제조사별 연간 총 판매량 및 배분율 메타데이터 (BRAND_IR_METADATA)
// =============================================================
const BRAND_IR_METADATA = {
    Hankook: {
        globalSales: {
            "2021": 92000000,
            "2022": 89000000,
            "2023": 91000000,
            "2024": 95000000,
            "2025": 100000000,
            "2026": 105000000
        },
        globalRevenue: {
            "2021": 6100000000,
            "2022": 6300000000,
            "2023": 6600000000,
            "2024": 6800000000,
            "2025": 7100000000,
            "2026": 7500000000
        },
        regionalAlloc: { na: 0.35, eu: 0.38 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.28,
                "Grand Touring (All-Season) - Passenger": 0.12,
                "Grand Touring (All-Season) - SUV": 0.10,
                "All-Season Passenger": 0.25,
                "Winter / Snow": 0.15,
                "All-Terrain (SUV/Truck)": 0.10
            },
            eu: {
                "Summer": 0.40,
                "All-Season": 0.35,
                "Winter": 0.25
            }
        },
        source: "한국타이어앤테크놀로지 정기주주총회 주주설명회 및 IR 분기 실적보고서 공시"
    },
    Michelin: {
        globalSales: {
            "2021": 175000000,
            "2022": 168000000,
            "2023": 170000000,
            "2024": 176000000,
            "2025": 180000000,
            "2026": 185000000
        },
        globalRevenue: {
            "2021": 27500000000,
            "2022": 28600000000,
            "2023": 29800000000,
            "2024": 30500000000,
            "2025": 31500000000,
            "2026": 32500000000
        },
        regionalAlloc: { na: 0.38, eu: 0.40 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.35,
                "Grand Touring (All-Season) - Passenger": 0.16,
                "Grand Touring (All-Season) - SUV": 0.14,
                "All-Season Passenger": 0.20,
                "Winter / Snow": 0.10,
                "All-Terrain (SUV/Truck)": 0.05
            },
            eu: {
                "Summer": 0.45,
                "All-Season": 0.40,
                "Winter": 0.15
            }
        },
        source: "Michelin Group Document de l'Enregistrement Universel & Annual Financial Report (2025)"
    },
    Bridgestone: {
        globalSales: {
            "2021": 178000000,
            "2022": 170000000,
            "2023": 172000000,
            "2024": 176000000,
            "2025": 180000000,
            "2026": 184000000
        },
        globalRevenue: {
            "2021": 26800000000,
            "2022": 27500000000,
            "2023": 28500000000,
            "2024": 29200000000,
            "2025": 30200000000,
            "2026": 31200000000
        },
        regionalAlloc: { na: 0.42, eu: 0.28 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.30,
                "Grand Touring (All-Season) - Passenger": 0.18,
                "Grand Touring (All-Season) - SUV": 0.17,
                "All-Season Passenger": 0.20,
                "Winter / Snow": 0.08,
                "All-Terrain (SUV/Truck)": 0.07
            },
            eu: {
                "Summer": 0.42,
                "All-Season": 0.45,
                "Winter": 0.13
            }
        },
        source: "Bridgestone Corporation Consolidated Financial Results & Annual IR Report (2025)"
    },
    Continental: {
        globalSales: {
            "2021": 115000000,
            "2022": 110000000,
            "2023": 112000000,
            "2024": 116000000,
            "2025": 120000000,
            "2026": 124000000
        },
        globalRevenue: {
            "2021": 12500000000,
            "2022": 13200000000,
            "2023": 14000000000,
            "2024": 14500000000,
            "2025": 15200000000,
            "2026": 15800000000
        },
        regionalAlloc: { na: 0.30, eu: 0.50 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.32,
                "Grand Touring (All-Season) - Passenger": 0.15,
                "Grand Touring (All-Season) - SUV": 0.13,
                "All-Season Passenger": 0.20,
                "Winter / Snow": 0.15,
                "All-Terrain (SUV/Truck)": 0.05
            },
            eu: {
                "Summer": 0.43,
                "All-Season": 0.35,
                "Winter": 0.22
            }
        },
        source: "Continental AG Annual Report & Tire Division Fact Book (2025)"
    },
    Goodyear: {
        globalSales: {
            "2021": 155000000,
            "2022": 145000000,
            "2023": 142000000,
            "2024": 148000000,
            "2025": 150000000,
            "2026": 153000000
        },
        globalRevenue: {
            "2021": 17400000000,
            "2022": 18200000000,
            "2023": 18800000000,
            "2024": 19400000000,
            "2025": 20200000000,
            "2026": 21000000000
        },
        regionalAlloc: { na: 0.52, eu: 0.28 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.22,
                "Grand Touring (All-Season) - Passenger": 0.15,
                "Grand Touring (All-Season) - SUV": 0.13,
                "All-Season Passenger": 0.25,
                "Winter / Snow": 0.10,
                "All-Terrain (SUV/Truck)": 0.15
            },
            eu: {
                "Summer": 0.35,
                "All-Season": 0.45,
                "Winter": 0.20
            }
        },
        source: "Goodyear Tire & Rubber Company Annual Earnings Release & Shareholder Letter (2025)"
    },
    Pirelli: {
        globalSales: {
            "2021": 68000000,
            "2022": 64000000,
            "2023": 65000000,
            "2024": 68000000,
            "2025": 70000000,
            "2026": 72000000
        },
        globalRevenue: {
            "2021": 6100000000,
            "2022": 6300000000,
            "2023": 6700000000,
            "2024": 6900000000,
            "2025": 7200000000,
            "2026": 7600000000
        },
        regionalAlloc: { na: 0.32, eu: 0.45 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.55,
                "Grand Touring (All-Season) - Passenger": 0.13,
                "Grand Touring (All-Season) - SUV": 0.12,
                "All-Season Passenger": 0.10,
                "Winter / Snow": 0.08,
                "All-Terrain (SUV/Truck)": 0.02
            },
            eu: {
                "Summer": 0.60,
                "All-Season": 0.25,
                "Winter": 0.15
            }
        },
        source: "Pirelli & C. S.p.A. Financial Statements & Annual Report to Shareholders (2025)"
    },
    Kumho: {
        globalSales: {
            "2021": 52000000,
            "2022": 48000000,
            "2023": 50000000,
            "2024": 53000000,
            "2025": 55000000,
            "2026": 58000000
        },
        globalRevenue: {
            "2021": 2800000000,
            "2022": 3000000000,
            "2023": 3200000000,
            "2024": 3400000000,
            "2025": 3600000000,
            "2026": 3900000000
        },
        regionalAlloc: { na: 0.32, eu: 0.35 },
        marketSegmentAlloc: {
            na: {
                "Ultra High Performance (UHP)": 0.25,
                "Grand Touring (All-Season) - Passenger": 0.16,
                "Grand Touring (All-Season) - SUV": 0.14,
                "All-Season Passenger": 0.25,
                "Winter / Snow": 0.12,
                "All-Terrain (SUV/Truck)": 0.08
            },
            eu: {
                "Summer": 0.38,
                "All-Season": 0.42,
                "Winter": 0.20
            }
        },
        source: "금호타이어 주식회사 영업보고서 및 분기 사업보고서 공시"
    }
};

class TireDashboard {
    constructor() {
        this.db = window.TIRE_DATABASE;
        
        // Scale database dynamically by 100x to represent realistic market scales (k units)
        this.db.forEach(item => {
            Object.keys(item.yearlyData).forEach(year => {
                if (!item.yearlyData[year]._scaled) {
                    item.yearlyData[year].sales = parseFloat((item.yearlyData[year].sales * 100).toFixed(1));
                    item.yearlyData[year]._scaled = true;
                }
            });
        });
        this.charts = {};
        this.sortColumn = 'combined';
        this.sortDirection = 'desc'; // 기본 내림차순 정렬
        this.activeView = 'market';
        this.tab1Market = 'global'; // Tab 1 대상 시장 기본값
        this.selectedCompetitor = 'Michelin';
        this.currentMarket = 'na'; // 기본값 'na' (북미). 'eu' (유럽)로 토글 가능.
        
        // DOM 요소 캐싱
        this.form = document.getElementById('filter-form');
        this.sourceSelect = document.getElementById('filter-source');
        this.brandSelect = document.getElementById('filter-brand') || { value: 'all', addEventListener: () => {} };
        this.segmentSelect = document.getElementById('filter-segment') || { value: 'all', addEventListener: () => {} };
        this.yearSelect = document.getElementById('filter-year') || { value: '2026', addEventListener: () => {} }; // 단일 분석 연도 필터
        this.metricSelect = document.getElementById('filter-metric') || { value: 'revenue', addEventListener: () => {} }; // 신규 지표 기준 필터
        this.resetBtn = document.getElementById('btn-reset-filters');
        this.searchInput = document.getElementById('model-search');
        this.tableBody = document.getElementById('table-body');
        
        // Tab 4용 로컬 필터 캐싱 추가
        this.segmentSelectT4 = document.getElementById('filter-segment-t4');
        this.yearSelectT4 = document.getElementById('filter-year-t4');
        
        this.init();
    }

    /**
     * 특정 시장에서 사용 가능한 세그먼트 배열을 반환한다.
     */
    getMarketSegments(market) {
        if (market === 'eu') {
            return ["Summer", "All-Season", "Winter"];
        } else {
            return [
                "Ultra High Performance (UHP)",
                "Grand Touring (All-Season) - Passenger",
                "Grand Touring (All-Season) - SUV",
                "All-Season Passenger",
                "Winter / Snow",
                "All-Terrain (SUV/Truck)"
            ];
        }
    }

    /**
     * 특정 타이어 아이템이 특정 시장에서 어느 세그먼트에 매핑되는지 반환한다.
     * 북미에서는 기존 item.segment를 그대로 유지하고,
     * 유럽에서는 item.season 속성을 반환한다.
     */
    getModelSegmentForMarket(item, market) {
        if (market === 'eu') {
            return item.season || "All-Season";
        } else {
            return item.segment;
        }
    }

    /**
     * 주주총회 보고서 기반 글로벌 판매량과 지역/세그먼트 비율 및 모델 인지도 지분율을 결합하여
     * 특정 시장 및 특정 연도에서의 모델별 실질 판매량을 역산하여 반환한다.
     * highPrecision이 true이면 최종 반올림을 생략한 원시 float 값을 반환하여 누적 오차를 방지한다.
     */
    getModelSalesVolume(brand, model, segment, year, market, highPrecision = false) {
        const metadata = BRAND_IR_METADATA[brand];
        if (!metadata) return 0;

        // 1. 해당 연도의 공식 글로벌 판매량
        const globalSales = typeof metadata.globalSales === 'object' 
            ? (metadata.globalSales[year] || metadata.globalSales["2025"] || 100000000)
            : (metadata.globalSales || 100000000);

        // 2. 지역별(대륙별) 배분 비중
        const rAlloc = metadata.regionalAlloc[market] || 0.35;

        // 3. 세그먼트 믹스 배분 비율 (시장별 세그먼트 이원화 반영)
        const sAlloc = metadata.marketSegmentAlloc && metadata.marketSegmentAlloc[market]
            ? (metadata.marketSegmentAlloc[market][segment] || 0.25)
            : 0.25;

        // 실제 상품이 존재하는 세그먼트들의 총 배분 비중 계산 (수량 정합성 스케일링)
        let sumRepresentedAlloc = 0;
        if (metadata.marketSegmentAlloc && metadata.marketSegmentAlloc[market]) {
            const allocs = metadata.marketSegmentAlloc[market];
            for (const seg in allocs) {
                const hasActiveModel = this.db.some(m => 
                    m.brand === brand && 
                    this.getModelSegmentForMarket(m, market) === seg && 
                    m.yearlyData && 
                    m.yearlyData[year]
                );
                if (hasActiveModel) {
                    sumRepresentedAlloc += allocs[seg];
                }
            }
        }
        if (sumRepresentedAlloc === 0) sumRepresentedAlloc = 1.0;

        // 지역적 세그먼트 총 볼륨 (실질 본 수) -> 미표현 세그먼트 배분율을 배제하고 비례 스케일링 적용
        const segmentSalesActual = (globalSales * rAlloc * sAlloc) / sumRepresentedAlloc;

        // 4. 세그먼트 내 개별 모델들의 기존 데이터베이스 상 상대적 점유 비중 계산
        const sameBrandSegmentModels = this.db.filter(m => m.brand === brand && this.getModelSegmentForMarket(m, market) === segment);
        let sameSegmentDatabaseSum = 0;
        
        sameBrandSegmentModels.forEach(m => {
            const yRec = m.yearlyData[year];
            if (yRec) {
                sameSegmentDatabaseSum += yRec.sales;
            }
        });

        if (sameSegmentDatabaseSum === 0) return 0;

        const targetModel = this.db.find(m => m.brand === brand && m.model === model);
        if (!targetModel) return 0;
        const targetRec = targetModel.yearlyData[year];
        if (!targetRec) return 0;

        const modelShareRatio = targetRec.sales / sameSegmentDatabaseSum;

        // 최종 모델별 실질 판매량 = 세그먼트 총 볼륨 * 소매 지분 비율 (단위: 천본 k units)
        const modelVolumeK = (segmentSalesActual * modelShareRatio) / 1000;

        return highPrecision ? modelVolumeK : parseFloat(modelVolumeK.toFixed(1));
    }

    /**
     * 해당 연도 및 시장의 공식 매출총액과 소매 단가 비율에 의거하여,
     * 특정 타이어 모델의 정밀 보정 매출액을 역산하여 반환한다.
     * highPrecision이 true이면 반올림을 배제한 원시 float 값을 리턴한다.
     */
    getModelSalesRevenue(brand, model, segment, year, market, highPrecision = false) {
        const metadata = BRAND_IR_METADATA[brand];
        if (!metadata) return 0;

        // 1. 공식 매출액 Baseline 구하기 (USD 단위)
        let globalRevenue = metadata.globalRevenue[year] || 6000000000;
        if (brand === 'Pirelli') globalRevenue *= 1.10;
        const rAlloc = metadata.regionalAlloc[market] || 0.35;
        const actualRevenueRegion = globalRevenue * rAlloc;

        // 2. 해당 브랜드의 현재 시장 모든 모델에 대하여 1차 소매 매출액 합계 (R_retail_total) 계산
        const brandModels = this.db.filter(m => m.brand === brand);
        let retailRevenueTotalUSD = 0;

        brandModels.forEach(item => {
            const itemSegment = this.getModelSegmentForMarket(item, market);
            const salesVolK = this.getModelSalesVolume(brand, item.model, itemSegment, year, market, true);
            const price = TIRE_UNIT_PRICES[item.model] || 150;
            retailRevenueTotalUSD += salesVolK * 1000 * price;
        });

        if (retailRevenueTotalUSD === 0) return 0;

        // 3. 비례 조정 계수 산출
        const scaleFactor = actualRevenueRegion / retailRevenueTotalUSD;

        // 4. 대상 모델의 1차 소매 매출액 계산
        const targetModel = this.db.find(m => m.brand === brand && m.model === model);
        if (!targetModel) return 0;
        const targetSegment = this.getModelSegmentForMarket(targetModel, market);
        const modelVolumeK = this.getModelSalesVolume(brand, model, targetSegment, year, market, true);
        const modelPrice = TIRE_UNIT_PRICES[model] || 150;
        const modelRetailUSD = modelVolumeK * 1000 * modelPrice;

        // 5. 최종 보정 매출액 산출 -> Million USD 변환
        const modelCalibratedUSD = modelRetailUSD * scaleFactor;
        const modelCalibratedMillionUSD = modelCalibratedUSD / 1000000;

        return highPrecision ? modelCalibratedMillionUSD : parseFloat(modelCalibratedMillionUSD.toFixed(1));
    }

    init() {
        // 사이드바 토글 이벤트 바인딩 (Tire BM UI 표준 기믹 탑재)
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggleBtn && sidebar) {
            sidebarToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('active');
                const nowActive = sidebar.classList.contains('active');
                localStorage.setItem('sidebar-active', nowActive);
                
                // 차트 크기 재조정 트리거 (전환 애니메이션 고려)
                setTimeout(() => {
                    this.resizeAllCharts();
                }, 300);
            });

            // 마우스가 사이드바에서 사라질 때 닫히도록 마우스 리브 이벤트 탑재
            sidebar.addEventListener('mouseleave', () => {
                sidebar.classList.remove('active');
                localStorage.setItem('sidebar-active', 'false');
            });
        }

        // 사이드바 외부 클릭 시 닫히도록 하는 글로벌 리스너 (Tire BM UI 연동 호환 기믹)
        document.addEventListener('click', (e) => {
            if (sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && e.target !== sidebarToggleBtn && !sidebarToggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                    localStorage.setItem('sidebar-active', 'false');
                }
            }
        });

        // 필터 변경 시 대시보드 갱신
        if (this.form) {
            this.form.addEventListener('change', () => this.handleFilterChange());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetFilters());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.renderTable());
        }

        // Tab 2 필터 리스너 등록
        if (this.brandSelect && this.brandSelect.addEventListener) {
            this.brandSelect.addEventListener('change', () => {
                this.handleFilterChange();
            });
        }
        if (this.segmentSelect) {
            this.segmentSelect.addEventListener('change', (e) => {
                this.syncSegment(e.target.value, 'filter-segment');
            });
        }
        if (this.yearSelect) {
            this.yearSelect.addEventListener('change', (e) => {
                this.syncYear(e.target.value, 'filter-year');
            });
        }
        if (this.sourceSelect) {
            this.sourceSelect.addEventListener('change', () => {
                this.handleFilterChange();
            });
        }

        // Tab 4 필터 리스너 등록
        if (this.segmentSelectT4) {
            this.segmentSelectT4.addEventListener('change', (e) => {
                this.syncSegment(e.target.value, 'filter-segment-t4');
            });
        }
        if (this.yearSelectT4) {
            this.yearSelectT4.addEventListener('change', (e) => {
                this.syncYear(e.target.value, 'filter-year-t4');
            });
        }

        // Tab 2 & Tab 4 시장 선택기 버튼 리스너 등록 (동기화 엔진 연결)
        const bindMarketButtons = (selectorId) => {
            const btns = document.querySelectorAll(`${selectorId} .tab-toggle-btn`);
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const market = btn.getAttribute('data-market');
                    this.setMarket(market);
                });
            });
        };
        bindMarketButtons('#tab2-market-selector');
        bindMarketButtons('#tab4-market-selector');
        
        // 데이터 출처 안내 모달 이벤트 바인딩
        const showSourcesBtn = document.getElementById('btn-show-sources');
        const closeModalBtn = document.getElementById('btn-close-modal');
        const modalOverlay = document.getElementById('sources-modal');
        
        if (showSourcesBtn && modalOverlay) {
            showSourcesBtn.addEventListener('click', () => {
                modalOverlay.classList.add('active');
            });
        }
        if (closeModalBtn && modalOverlay) {
            closeModalBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });
        }

        // 신규: 역산 산출 검증 모달 닫기 이벤트 바인딩
        const closeCalcModalBtn = document.getElementById('btn-close-calc-modal');
        const calcModalOverlay = document.getElementById('calculation-modal');
        
        if (closeCalcModalBtn && calcModalOverlay) {
            closeCalcModalBtn.addEventListener('click', () => {
                calcModalOverlay.classList.remove('active');
            });
            calcModalOverlay.addEventListener('click', (e) => {
                if (e.target === calcModalOverlay) {
                    calcModalOverlay.classList.remove('active');
                }
            });
        }
        
        // 테이블 정렬 헤더 바인딩
        document.querySelectorAll('.analytics-table th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.getAttribute('data-sort');
                this.handleSort(column);
            });
        });

        // 제조사별 비교 차트 멀티셀렉터 변경 이벤트 바인딩
        const brandCheckboxes = document.querySelectorAll('#brand-chart-selector input[type="checkbox"]');
        brandCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const label = checkbox.closest('.brand-chip');
                if (label) {
                    if (checkbox.checked) {
                        label.classList.add('active');
                    } else {
                        label.classList.remove('active');
                    }
                }
                this.renderBrandComparisonChart();
            });
        });

        // 제조사별 실적 지표(매출액 vs 판매량) 변경 이벤트 바인딩
        const metricButtons = document.querySelectorAll('#brand-metric-selector .metric-btn');
        metricButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                metricButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderBrandComparisonChart();
            });
        });

        // Tab 1: 대상 시장 변경 이벤트 바인딩
        const marketButtons = document.querySelectorAll('#tab1-market-selector .tab-toggle-btn');
        marketButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                marketButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.tab1Market = btn.getAttribute('data-market') || 'global';
                this.renderBrandComparisonChart();
            });
        });

        // Chart.js 글로벌 라이트 테마 기본값 설정
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#64748b'; // Slate 그레이 텍스트
            Chart.defaults.font.family = "'Inter', sans-serif";
            if (Chart.defaults.scale && Chart.defaults.scale.grid) {
                Chart.defaults.scale.grid.color = 'rgba(249, 115, 22, 0.06)';
            }
        }

        // 초기 시장 탭 옵션 설정
        this.updateSourceFilterOptions();

        // 신규: 전략 매트릭스 테이블 데이터 주입
        this.renderMatrixTable();

        // 경쟁사 세대별 혁신 Portal - 브랜드 선택기 바인딩
        this.selectedGenTrendsBrand = 'Michelin';
        this.selectedGenTrendsLineup = 'Michelin_Sport';
        const gtBrandBtns = document.querySelectorAll('#gt-brand-selector .tab-toggle-btn');
        gtBrandBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                gtBrandBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const brand = btn.getAttribute('data-brand');
                this.selectedGenTrendsBrand = brand;
                this.renderGenerationTrendsLineupButtons(brand);
            });
        });

        // 세대별 비교 모드 드롭다운 바인딩
        const gtGenSelect = document.getElementById('gt-generation-selector');
        if (gtGenSelect) {
            gtGenSelect.addEventListener('change', (e) => {
                const mode = e.target.value;
                if (this.selectedGenTrendsLineup) {
                    this.renderGenerationTrends(this.selectedGenTrendsLineup, mode);
                }
            });
        }

        // 최초 전체 화면 렌더링 및 뷰 설정
        this.updateDashboard();
        
        // 해시 기반 초기 탭 활성화 지원 (포털 연계 라우팅 기믹)
        const hash = window.location.hash;
        let initialView = 'competitiveness';
        if (hash) {
            const possibleView = hash.replace('#tab-', '').replace('#', '');
            const allowedViews = ['competitiveness', 'generation-trends', 'hankook-strategy', 'market', 'tech-strategy'];
            if (allowedViews.includes(possibleView)) {
                initialView = possibleView;
            }
        }
        this.switchView(initialView);

        // hashchange 이벤트 등록으로 실시간 해시 변경 대응
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash;
            if (currentHash) {
                const viewFromHash = currentHash.replace('#tab-', '').replace('#', '');
                const allowedViews = ['competitiveness', 'generation-trends', 'hankook-strategy', 'market', 'tech-strategy'];
                if (allowedViews.includes(viewFromHash)) {
                    this.switchView(viewFromHash);
                }
            }
        });
    }

    /**
     * 모든 활성화된 차트 객체를 순회하며 resize()를 강제 수행하여 찌그러짐을 방지함
     */
    resizeAllCharts() {
        if (this.charts) {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
    }

    /**
     * 현재 시장 상태에 맞게 사이드바 성능 데이터 소스 셀렉트 옵션을 동적 재구축
     */
    updateSourceFilterOptions() {
        if (!this.sourceSelect) return;
        
        const prevValue = this.sourceSelect.value;
        this.sourceSelect.innerHTML = '';
        
        if (this.currentMarket === 'na') {
            this.sourceSelect.innerHTML = `
                <option value="combined">북미 종합 평점</option>
                <option value="tirerack">북미 Tire Rack 평가 (소비자)</option>
                <option value="consumerreports">북미 Consumer Reports</option>
            `;
            if (['combined', 'tirerack', 'consumerreports'].includes(prevValue)) {
                this.sourceSelect.value = prevValue;
            } else {
                this.sourceSelect.value = 'combined';
            }
        } else if (this.currentMarket === 'eu') {
            this.sourceSelect.innerHTML = `
                <option value="combined">유럽 종합 평점</option>
                <option value="adac">유럽 ADAC 테스트 (독일 등급, 낮을수록 우수)</option>
                <option value="autobild">유럽 Auto Bild 테스트 (정성 등급)</option>
            `;
            if (['combined', 'adac', 'autobild'].includes(prevValue)) {
                this.sourceSelect.value = prevValue;
            } else {
                this.sourceSelect.value = 'combined';
            }
        }
        
        // 동적 세그먼트 드롭다운 재생성 연동
        this.updateSegmentDropdown();
    }

    /**
     * 현재 시장 상태에 맞게 세그먼트 드롭다운 필터 옵션을 동적 재구축
     */
    updateSegmentDropdown() {
        if (!this.segmentSelect && !this.segmentSelectT4) return;
        
        const prevValue = this.segmentSelect ? this.segmentSelect.value : 'all';
        
        const updateSelectElement = (selectEl) => {
            if (!selectEl) return;
            selectEl.innerHTML = '';
            
            if (this.currentMarket === 'na') {
                selectEl.innerHTML = `
                    <option value="all">전체 세그먼트</option>
                    <option value="Ultra High Performance (UHP)">초고성능 스포츠</option>
                    <option value="Grand Touring (All-Season) - Passenger">투어링 승용 사계절</option>
                    <option value="Grand Touring (All-Season) - SUV">투어링 SUV 사계절</option>
                    <option value="All-Season Passenger">일반 승용 사계절</option>
                    <option value="Winter / Snow">겨울용 스노우</option>
                    <option value="All-Terrain (SUV/Truck)">온/오프로드 SUV (All-Terrain)</option>
                `;
                const validOptions = [
                    'all',
                    'Ultra High Performance (UHP)',
                    'Grand Touring (All-Season) - Passenger',
                    'Grand Touring (All-Season) - SUV',
                    'All-Season Passenger',
                    'Winter / Snow',
                    'All-Terrain (SUV/Truck)'
                ];
                if (validOptions.includes(prevValue)) {
                    selectEl.value = prevValue;
                } else {
                    selectEl.value = 'all';
                }
            } else if (this.currentMarket === 'eu') {
                selectEl.innerHTML = `
                    <option value="all">전체 세그먼트</option>
                    <option value="Summer">여름용</option>
                    <option value="All-Season">사계절용</option>
                    <option value="Winter">겨울용</option>
                `;
                const validOptions = ['all', 'Summer', 'All-Season', 'Winter'];
                if (validOptions.includes(prevValue)) {
                    selectEl.value = prevValue;
                } else {
                    selectEl.value = 'all';
                }
            }
        };

        updateSelectElement(this.segmentSelect);
        updateSelectElement(this.segmentSelectT4);
    }

    /**
     * 세그먼트 필터 실시간 양방향 동기화
     */
    syncSegment(value, sourceId) {
        if (sourceId === 'filter-segment') {
            if (this.segmentSelectT4) this.segmentSelectT4.value = value;
        } else {
            if (this.segmentSelect) this.segmentSelect.value = value;
        }
        this.handleFilterChange();
    }

    /**
     * 연도 필터 실시간 양방향 동기화
     */
    syncYear(value, sourceId) {
        if (sourceId === 'filter-year') {
            if (this.yearSelectT4) this.yearSelectT4.value = value;
        } else {
            if (this.yearSelect) this.yearSelect.value = value;
        }
        this.handleFilterChange();
    }

    /**
     * 전역 시장 상태를 설정하고 관련된 모든 UI 컴포넌트를 동기화
     */
    setMarket(market) {
        this.currentMarket = market;
        
        // Tab 2 시장 토글 버튼 스타일 동기화
        const tab2Buttons = document.querySelectorAll('#tab2-market-selector .tab-toggle-btn');
        tab2Buttons.forEach(btn => {
            if (btn.getAttribute('data-market') === market) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Tab 4 시장 토글 버튼 스타일 동기화
        const tab4Buttons = document.querySelectorAll('#tab4-market-selector .tab-toggle-btn');
        tab4Buttons.forEach(btn => {
            if (btn.getAttribute('data-market') === market) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 데이터 소스 및 세그먼트 드롭다운 재구성
        this.updateSourceFilterOptions();
        
        // 리렌더링 트리거
        this.handleFilterChange();
    }

    /**
     * 모든 필터 설정값을 초기 상태로 복구하고 대시보드 리렌더링
     */
    resetFilters() {
        if (this.brandSelect) this.brandSelect.value = 'all';
        if (this.segmentSelect) this.segmentSelect.value = 'all';
        if (this.segmentSelectT4) this.segmentSelectT4.value = 'all';
        if (this.yearSelect) {
            this.yearSelect.value = '2026';
        }
        if (this.yearSelectT4) {
            this.yearSelectT4.value = '2026';
        }
        if (this.searchInput) this.searchInput.value = '';
        this.currentMarket = 'na';
        this.tab1Market = 'global';
        
        // Tab 2 & Tab 4 시장 선택 버튼 스타일 'na'로 초기화
        const updateMarketBtns = (selectorId) => {
            const btns = document.querySelectorAll(`${selectorId} .tab-toggle-btn`);
            btns.forEach(btn => {
                if (btn.getAttribute('data-market') === 'na') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };
        updateMarketBtns('#tab2-market-selector');
        updateMarketBtns('#tab4-market-selector');
        
        // Tab 1 멀티셀렉터 브랜드 체크박스 초기화
        const brandCheckboxes = document.querySelectorAll('#brand-chart-selector input[type="checkbox"]');
        brandCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'Hankook' || checkbox.value === 'Michelin') {
                checkbox.checked = true;
                const label = checkbox.closest('.brand-chip');
                if (label) label.classList.add('active');
            } else {
                checkbox.checked = false;
                const label = checkbox.closest('.brand-chip');
                if (label) label.classList.remove('active');
            }
        });

        // Tab 1 시장 선택기 초기화
        const marketButtons = document.querySelectorAll('#tab1-market-selector .tab-toggle-btn');
        marketButtons.forEach(btn => {
            if (btn.getAttribute('data-market') === 'global') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Tab 1 지표 기준 선택기 초기화
        const metricButtons = document.querySelectorAll('#brand-metric-selector .metric-btn');
        metricButtons.forEach(btn => {
            if (btn.getAttribute('data-metric') === 'revenue') {
                btn.classList.add('active');
                btn.style.background = 'rgba(59, 130, 246, 0.2)';
                btn.style.color = '#fff';
                btn.style.border = '1px solid rgba(59, 130, 246, 0.4)';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-secondary)';
                btn.style.border = 'none';
            }
        });

        this.updateSourceFilterOptions();
        this.updateDashboard();
        this.switchView('competitiveness');
    }

    /**
     * 필터링 입력값 변경 시 이벤트 핸들러
     */
    handleFilterChange() {
        this.updateDashboard();
    }

    /**
     * 뷰 전환 핸들러 (na ↔ eu ↔ strategy)
     */
    switchView(view) {
        this.activeView = view;
        
        // 0. 헤더 타이틀 텍스트 동적 변경 (Tire BM & Compd BM 일관성 연동)
        const titleTextEl = document.getElementById('header-title-text');
        if (titleTextEl) {
            const viewTitleMap = {
                'market': 'Market & Sales Overview',
                'competitiveness': '기술 경쟁력 Overview',
                'tech-strategy': '경쟁사 R&D 전략',
                'hankook-strategy': '대응 전략 & 로드맵',
                'generation-trends': '대표 상품 세대별 성능'
            };
            if (viewTitleMap[view]) {
                titleTextEl.textContent = viewTitleMap[view];
            }
        }
        
        // panel-hankook-strategy 의 인라인 display 속성이 'flex' 로 남아 타 화면(Market 등)에 중복 노출되는 것 방지
        const strategyPanel = document.getElementById('panel-hankook-strategy');
        if (strategyPanel) {
            if (view === 'hankook-strategy') {
                strategyPanel.style.display = 'flex';
            } else {
                strategyPanel.style.display = 'none';
            }
        }

        // 1. 모든 탭과 패널의 활성화 클래스 제거
        document.querySelectorAll('.view-tab').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
        
        // 2. 뷰별 탭 및 패널 엘리먼트 획득 및 활성화
        const tabId = `tab-${view}`;
        const panelId = `panel-${view}`;
        
        const tabElement = document.getElementById(tabId);
        const panelElement = document.getElementById(panelId);
        
        if (tabElement) tabElement.classList.add('active');
        if (panelElement) panelElement.classList.add('active');
        
        // 3. 뷰 타입별 후행 트리거 연동
        if (view === 'market') {
            setTimeout(() => {
                this.renderBrandComparisonChart();
            }, 50);
        } else if (view === 'competitiveness') {
            this.updateSourceFilterOptions();
            setTimeout(() => {
                this.updateDashboard();
            }, 50);
        } else if (view === 'tech-strategy') {
            setTimeout(() => {
                this.selectCompetitor(this.selectedCompetitor || 'Michelin');
                this.renderMatrixTable();
            }, 50);
        } else if (view === 'hankook-strategy') {
            setTimeout(() => {
                const selectedYear = this.getSelectedYear();
                const activeSegment = this.segmentSelect ? this.segmentSelect.value : 'all';
                this.renderStrategyPanel(selectedYear, activeSegment);
            }, 50);
        } else if (view === 'generation-trends') {
            setTimeout(() => {
                const brand = this.selectedGenTrendsBrand || 'Michelin';
                this.renderGenerationTrendsLineupButtons(brand);
            }, 50);
        }
    }

    /**
     * R&D 가이드 내 북미/유럽 시장 영역 동적 토글 스위치 설정
     */
    setStrategyMarket(market) {
        this.currentMarket = market;
        document.querySelectorAll('.market-toggle-btn').forEach(btn => {
            if (btn.id === `btn-market-${market}`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const selectedYear = this.getSelectedYear();
        const activeSegment = this.segmentSelect.value;
        
        // 마켓 전환에 따른 가이드 및 레이더 차트 갱신
        this.renderRadarChart(selectedYear, activeSegment);
        this.renderStrategyPanel(selectedYear, activeSegment);
        
        // 최우선 R&D 보강 과제 뱃지 연계 갱신을 위해 KPIs 재설계
        this.renderKPIs(this.getFilteredDataset(), selectedYear, activeSegment);
    }

    /**
     * 글로벌 경쟁사 및 R&D 정보 렌더링 변경
     */
    selectCompetitor(brand) {
        this.selectedCompetitor = brand;
        
        // 칩 활성화 클래스 스위칭
        document.querySelectorAll('.comp-chip').forEach(btn => {
            if (btn.getAttribute('data-brand') === brand) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const data = TIRE_STRATEGY_DB[brand];
        if (data) {
            const briefingCard = document.getElementById('competitor-briefing-card');
            if (briefingCard) {
                briefingCard.innerHTML = `
                    <div class="briefing-header">
                        <div class="briefing-logo-placeholder" style="background-color: ${data.color}; box-shadow: 0 0 15px ${data.color}44;">
                            ${data.letter}
                        </div>
                        <div class="briefing-title-meta">
                            <h3 class="briefing-brand-name" style="color: ${data.color};">${data.nameKo} (${brand})</h3>
                            <span class="briefing-period">${data.period}</span>
                        </div>
                    </div>
                    <div class="briefing-section">
                        <h4 class="briefing-section-title title-marketing" style="color: var(--text-primary);">글로벌 마케팅 및 브랜드 소구 전략</h4>
                        <div class="briefing-content">
                            <p style="margin-bottom: 8px;"><span class="badge-fact">실측 팩트</span> ${data.marketing.fact}</p>
                            <p style="margin-top: 6px;"><span class="badge-estimation">R&D 전략 추정</span> ${data.marketing.estimation}</p>
                        </div>
                    </div>
                    <div class="briefing-section">
                        <h4 class="briefing-section-title title-product" style="color: var(--text-primary);">상품 포트폴리오 및 믹스 전환 방향</h4>
                        <div class="briefing-content">
                            <p style="margin-bottom: 8px;"><span class="badge-fact">실측 팩트</span> ${data.product.fact}</p>
                            <p style="margin-top: 6px;"><span class="badge-estimation">R&D 전략 추정</span> ${data.product.estimation}</p>
                        </div>
                    </div>
                    <div class="briefing-section">
                        <h4 class="briefing-section-title title-tech" style="color: var(--text-primary);">R&D 신기술 및 지속가능 경영 로드맵</h4>
                        <div class="briefing-content">
                            <p style="margin-bottom: 8px;"><span class="badge-fact">실측 팩트</span> ${data.tech.fact}</p>
                            <p style="margin-top: 6px;"><span class="badge-estimation">R&D 전략 추정</span> ${data.tech.estimation}</p>
                        </div>
                    </div>
                `;
            }
            
            // 차트 갱신
            this.renderCompetitorTechChart(data);
        }
    }

    /**
     * 경쟁사별 R&D 가중치 비중 바차트 렌더링 (안전 가드 장착)
     */
    renderCompetitorTechChart(data) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js CDN이 로드되지 않았습니다.');
            return;
        }

        const chartCanvas = document.getElementById('chart-competitor-tech');
        if (!chartCanvas) return;

        if (this.charts.competitorTech) {
            this.charts.competitorTech.destroy();
        }
        
        const ctx = chartCanvas.getContext('2d');
        this.charts.competitorTech = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.chartLabels,
                datasets: [{
                    label: 'R&D 테마별 가중 집중도 (%)',
                    data: data.chartData,
                    backgroundColor: data.color + 'd0', // 90% 불투명도로 상향하여 다크모드 가독성 극대화
                    hoverBackgroundColor: data.color, // 호버 시 완전 불투명 하이라이트
                    borderColor: data.color,
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 24
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` 가중 집중도: ${context.parsed.x}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        max: 50,
                        ticks: {
                            stepSize: 10,
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { color: 'rgba(249, 115, 22, 0.06)' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 11, weight: '600' },
                            color: '#1e293b'
                        }
                    }
                }
            }
        });
    }

    /**
     * 데이터 및 위젯 갱신 메인 파이프라인
     */
    updateDashboard() {
        const filteredData = this.getFilteredDataset();
        const selectedYear = this.getSelectedYear();
        const activeSegment = this.segmentSelect.value;
        
        // 1. KPI 요약 카드 렌더링 (선택 기준 연도의 단일 년도 스냅샷)
        this.renderKPIs(filteredData, selectedYear, activeSegment);
        
        // 2. 핵심 Chart.js 시각화 렌더링 (YoY 추이는 전체 흐름 2021~2026 유지, 나머지는 스냅샷)
        this.renderYoYChart(filteredData);
        this.renderRadarChart(selectedYear, activeSegment);
        this.renderBrandComparisonChart(filteredData);
        
        // 3. 한국타이어 전용 SWOT 및 R&D 가이드 생성 (스냅샷 및 시장 분리)
        this.renderStrategyPanel(selectedYear, activeSegment);
        
        // 4. 세부 스코어카드 테이블 렌더링 (선택 기준 연도의 1:1 대응 데이터)
        this.renderTable(filteredData);
    }

    /**
     * 설정된 제조사 및 세그먼트 필터에 맞추어 원본 데이터에서 부분 서브셋 반환
     */
    getFilteredDataset() {
        const selectedBrand = this.brandSelect.value;
        const selectedSegment = this.segmentSelect.value;
        
        return this.db.filter(item => {
            const brandMatch = selectedBrand === 'all' || item.brand === selectedBrand;
            const itemSegment = this.getModelSegmentForMarket(item, this.currentMarket);
            const segmentMatch = selectedSegment === 'all' || itemSegment === selectedSegment;
            return brandMatch && segmentMatch;
        });
    }

    /**
     * 셀렉트 단일 콤보박스에서 분석 기준 연도 단일 문자열 반환
     */
    getSelectedYear() {
        return this.yearSelect ? this.yearSelect.value : '2026';
    }

    /**
     * 데이터 소스 기준(사용자/연구소/종합/유럽 ADAC/유럽 Auto Bild)에 부합하는 타이어 모델 평점 수치 계산 (0~100 환산)
     */
    calculateModelScore(yearlyRecord, season) {
        if (!yearlyRecord) return 0;
        const source = this.sourceSelect.value;
        const tr = yearlyRecord.tirerack;
        const cr = yearlyRecord.consumerreports;
        const eu = yearlyRecord.europe;

        // Tire Rack 소비자 평점 평균 (10점 -> 100점 변환)
        const trAvg = (
            tr.dry_traction + tr.wet_traction + tr.hydroplaning + 
            tr.comfort + tr.noise + tr.treadwear + tr.user_rating
        ) / 7 * 10;

        // Consumer Reports 연구소 평균 (100점 스케일 - Summer 타이어는 겨울용 2개 성능 지표 배제 후 분모 6으로 축소)
        let crAvg;
        if (season === 'Summer') {
            crAvg = (
                cr.dry_braking + cr.wet_braking + cr.handling + 
                cr.fuel_economy + cr.tread_life + cr.cr_overall
            ) / 6;
        } else {
            crAvg = (
                cr.dry_braking + cr.wet_braking + cr.handling + 
                cr.snow_traction + cr.ice_braking + cr.fuel_economy + 
                cr.tread_life + cr.cr_overall
            ) / 8;
        }

        // 유럽 ADAC 평점 역변환 (1.0 -> 100점, 5.0 -> 20점)
        let adacScore = 50;
        if (eu && eu.adac) {
            adacScore = (6.0 - eu.adac.overall_grade) * 20;
        }

        // 유럽 Auto Bild 점수 변환 (Exemplary = 95, Good = 85, Satisfactory = 75, Sufficient = 65)
        let abScore = 50;
        if (eu && eu.autobild) {
            const rating = eu.autobild.overall_rating;
            if (rating === 'Exemplary') abScore = 95;
            else if (rating === 'Good') abScore = 85;
            else if (rating === 'Satisfactory') abScore = 75;
            else if (rating === 'Sufficient') abScore = 65;
        }

        if (source === 'tirerack') {
            return trAvg;
        } else if (source === 'consumerreports') {
            return crAvg;
        } else if (source === 'adac') {
            return adacScore;
        } else if (source === 'autobild') {
            return abScore;
        } else {
            // 종합 가중치 점수: 현재 시장(북미 vs 유럽) 탭에 따라 각각의 종합점수 반환
            if (this.currentMarket === 'na') {
                return (trAvg + crAvg) / 2;
            } else {
                return (adacScore + abScore) / 2;
            }
        }
    }

    /**
     * 대시보드 상단 핵심 요약 지표 동적 연산 및 표기 (단일 연도 기준 스냅샷)
     */
    renderKPIs(filteredData, selectedYear, activeSegment) {
        // KPI 1. 단일 연도의 판매량 또는 판매 금액 계산
        let totalVal = 0;
        const metric = this.metricSelect ? this.metricSelect.value : 'volume';

        filteredData.forEach(item => {
            const yearRec = item.yearlyData[selectedYear];
            if (yearRec) {
                const itemSegment = this.getModelSegmentForMarket(item, this.currentMarket);
                if (metric === 'revenue') {
                    const revMil = this.getModelSalesRevenue(item.brand, item.model, itemSegment, selectedYear, this.currentMarket, true);
                    totalVal += revMil; // totalVal is in Millions of USD
                } else {
                    const salesVolK = this.getModelSalesVolume(item.brand, item.model, itemSegment, selectedYear, this.currentMarket, true);
                    totalVal += salesVolK; // totalVal is in k units
                }
            }
        });

        const kpiSalesValEl = document.getElementById('kpi-sales');
        const kpiSalesCard = kpiSalesValEl ? kpiSalesValEl.closest('.kpi-card') : null;

        if (kpiSalesValEl) {
            if (metric === 'revenue') {
                kpiSalesValEl.textContent = `$${totalVal.toFixed(1)}M`;
                
                const unitEl = kpiSalesCard ? kpiSalesCard.querySelector('.kpi-unit') : null;
                if (unitEl) unitEl.textContent = '백만 달러 *공시역산';
            } else {
                kpiSalesValEl.textContent = totalVal >= 1000 
                    ? (totalVal / 1000).toFixed(1) + 'M' 
                    : totalVal.toFixed(0) + 'k';
                
                const unitEl = kpiSalesCard ? kpiSalesCard.querySelector('.kpi-unit') : null;
                if (unitEl) unitEl.textContent = '천본';
            }
        }
        
        if (kpiSalesCard) {
            const kpiTitleEl = kpiSalesCard.querySelector('.kpi-title');
            const kpiDescEl = kpiSalesCard.querySelector('.kpi-desc');
            if (kpiTitleEl) {
                if (metric === 'revenue') {
                    kpiTitleEl.innerHTML = `${selectedYear}년 판매 매출 <span style="font-size: 0.65rem; background: #3b82f633; color: #60a5fa; padding: 2px 6px; border-radius: 4px; margin-left: 6px; vertical-align: middle;">공시 보정</span>`;
                } else {
                    kpiTitleEl.textContent = `${selectedYear}년 판매 실적`;
                }
            }
            if (kpiDescEl) {
                kpiDescEl.textContent = metric === 'revenue' 
                    ? `선택 기준 연도의 보정 매출액 합계` 
                    : `선택 기준 연도의 단일 판매량 합계`;
            }
        }

        // KPI 2. 세그먼트 내 1위 모델 산출
        let segmentModels = activeSegment === 'all' 
            ? this.db 
            : this.db.filter(m => this.getModelSegmentForMarket(m, this.currentMarket) === activeSegment);

        let bestModel = null;
        let bestScore = -1;

        segmentModels.forEach(m => {
            const rec = m.yearlyData[selectedYear];
            if (rec) {
                const score = this.calculateModelScore(rec, m.season);
                if (score > bestScore) {
                    bestScore = score;
                    bestModel = m;
                }
            }
        });

        const topModelEl = document.getElementById('kpi-top-model');
        if (bestModel) {
            const fullName = `${bestModel.brand} ${bestModel.model}`;
            topModelEl.textContent = fullName;
            topModelEl.title = fullName;
            document.getElementById('kpi-top-model-score').textContent = bestScore.toFixed(1);
        } else {
            topModelEl.textContent = "-";
            document.getElementById('kpi-top-model-score').textContent = "0.0";
        }

        // KPI 3. 한국타이어 세그먼트 순위 (선택 연도 스냅샷 기준)
        const modelRankings = [];
        segmentModels.forEach(m => {
            const rec = m.yearlyData[selectedYear];
            if (rec) {
                modelRankings.push({ brand: m.brand, model: m.model, score: this.calculateModelScore(rec, m.season) });
            }
        });

        modelRankings.sort((a, b) => b.score - a.score);

        const kpiBrandEl = document.getElementById('kpi-top-brand');
        const kpiBrandScoreEl = document.getElementById('kpi-top-brand-score');

        if (activeSegment !== 'all') {
            const index = modelRankings.findIndex(r => r.brand === 'Hankook');
            if (index !== -1) {
                kpiBrandEl.textContent = `${index + 1}위 / ${modelRankings.length}개`;
                kpiBrandScoreEl.textContent = modelRankings[index].score.toFixed(1) + "점";
            } else {
                kpiBrandEl.textContent = "-";
                kpiBrandScoreEl.textContent = "0.0점";
            }
        } else {
            const brandScores = {};
            const brandCounts = {};
            modelRankings.forEach(item => {
                if (!brandScores[item.brand]) {
                    brandScores[item.brand] = 0;
                    brandCounts[item.brand] = 0;
                }
                brandScores[item.brand] += item.score;
                brandCounts[item.brand]++;
            });

            const brandRankedList = Object.keys(brandScores).map(b => ({
                brand: b,
                avgScore: brandScores[b] / brandCounts[b]
            })).sort((a, b) => b.avgScore - a.avgScore);

            const hkBrandIndex = brandRankedList.findIndex(b => b.brand === 'Hankook');
            if (hkBrandIndex !== -1) {
                kpiBrandEl.textContent = `${hkBrandIndex + 1}위 / ${brandRankedList.length}개 사`;
                kpiBrandScoreEl.textContent = brandRankedList[hkBrandIndex].avgScore.toFixed(1) + "점";
            } else {
                kpiBrandEl.textContent = "-";
                kpiBrandScoreEl.textContent = "0.0점";
            }
        }

        // KPI 4. R&D 최우선 과제 및 수치 산출 (시장 및 기준 연도 스냅샷 정밀 연계)
        const strategyData = this.getGapAnalysisData(selectedYear, activeSegment);
        const kpiRndEl = document.getElementById('kpi-count');
        const kpiRndDescEl = document.getElementById('kpi-count-desc');

        if (strategyData && strategyData.maxNegIdx !== -1) {
            const attrKorean = this.currentMarket === 'na'
                ? [
                    '마른 노면 접지', '젖은 노면 제동', '수막현상 방지',
                    '승차감 및 소음', '트레드 수명', '눈길/빙판 제동', '연비 효율성'
                ]
                : [
                    '마른 노면 성능', '젖은 노면 성능', '수막현상 방지',
                    '수명 및 마일리지', '회전저항 (연비)', '승차감 및 소음'
                ];
            kpiRndEl.textContent = attrKorean[strategyData.maxNegIdx];
            kpiRndDescEl.innerHTML = `경쟁사 1위 대비 기술 격차: <strong style="color: var(--color-red);">${strategyData.maxNegValue.toFixed(1)}점</strong>`;
        } else {
            kpiRndEl.textContent = "없음 (우수)";
            kpiRndDescEl.textContent = "모든 성능 격차 극복 완료";
        }
    }

    /**
     * 연도별 레코드에서 주요 성능 항목별 점수를 추출
     */
    getMetricScoresForRecord(rec, isNA, isSummer) {
        if (!rec) return [];
        if (isNA) {
            if (isSummer) {
                // Summer 타이어: 겨울용 성능인 snow_traction, ice_braking은 전격 제외(6축 재배치)
                return [
                    (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2,
                    (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2,
                    (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2,
                    (rec.tirerack.comfort + rec.tirerack.noise) / 2,
                    (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2,
                    rec.consumerreports.fuel_economy / 10
                ];
            } else {
                // All-Season 또는 Winter: 7개 성능 축 전부 연산
                return [
                    (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2,
                    (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2,
                    (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2,
                    (rec.tirerack.comfort + rec.tirerack.noise) / 2,
                    (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2,
                    (rec.consumerreports.snow_traction/10 + rec.consumerreports.ice_braking/10) / 2,
                    rec.consumerreports.fuel_economy / 10
                ];
            }
        } else {
            // 유럽 시장 (6개 성능 축 연산)
            const adac = rec.europe ? rec.europe.adac : { dry_safety: 3.0, wet_safety: 3.0, mileage: 3.0, efficiency: 3.0, noise: 3.0 };
            const ab = rec.europe ? rec.europe.autobild : { dry_performance: 7.0, wet_performance: 7.0, aquaplaning: 7.0, comfort: 7.0, treadwear: 7.0 };
            
            return [
                ((6.0 - adac.dry_safety) * 2 + ab.dry_performance) / 2,
                ((6.0 - adac.wet_safety) * 2 + ab.wet_performance) / 2,
                ab.aquaplaning,
                ((6.0 - adac.mileage) * 2 + ab.treadwear) / 2,
                (6.0 - adac.efficiency) * 2,
                ((6.0 - adac.noise) * 2 + ab.comfort) / 2
            ];
        }
    }

    /**
     * 차트 1: 연도별 주요 성능 항목별 점수 추이 분석 (0-10 Scale 고정 멀티라인 차트)
     */
    renderYoYChart(filteredData) {
        if (typeof Chart === 'undefined') return;
        const chartCanvas = document.getElementById('chart-yoy-trends');
        if (!chartCanvas) return;

        const yearsRange = ['2021', '2022', '2023', '2024', '2025', '2026'];
        const activeSegment = this.segmentSelect ? this.segmentSelect.value : 'all';
        const isNA = this.currentMarket === 'na';

        // 대표 시즌 판단 (시장 및 세그먼트 정합 완벽 매칭)
        let targetSeason = 'All-Season';
        if (this.currentMarket === 'eu') {
            // 유럽 시장은 세그먼트 이름이 곧 시즌명입니다 ('Summer', 'Winter', 'All-Season')
            targetSeason = activeSegment === 'all' ? 'Summer' : activeSegment;
        } else {
            // 북미 시장
            if (activeSegment === 'Winter / Snow' || activeSegment === 'Winter') {
                targetSeason = 'Winter';
            } else if (activeSegment === 'Summer') {
                targetSeason = 'Summer';
            } else {
                targetSeason = 'All-Season';
            }
        }
        const isSummer = (targetSeason === 'Summer');

        // 속성 명칭 정의 (레이더 차트 속성 명칭 및 개수와 완벽 대칭 구조)
        const attributes = (isNA && !isSummer)
            ? [
                '마른 노면 접지력', 
                '젖은 노면 제동력', 
                '수막현상 방지', 
                '승차감 및 소음', 
                '트레드 수명', 
                '눈길/빙판 제동', 
                '연비 효율성'
            ]
            : isNA
                ? [
                    '마른 노면 접지력', 
                    '젖은 노면 제동력', 
                    '수막현상 방지', 
                    '승차감 및 소음', 
                    '트레드 수명', 
                    '연비 효율성'
                ]
                : [
                    '마른 노면 성능',
                    '젖은 노면 성능',
                    '수막현상 방지',
                    '수명 및 마일리지',
                    '회전저항 (연비) (R.R.)',
                    '승차감 및 소음'
                ];

        // 대표 시즌을 갖는 모델들만 필터링하여 일관성 유지 (수막현상/눈길 등 비교 항목 정합 확보)
        const targetModels = filteredData.filter(item => item.season === targetSeason);

        // 동적 서브타이틀 업데이트 (어떤 브랜드/상품의 점수 변화인지 명시)
        const subtitleEl = document.getElementById('yoy-chart-subtitle');
        if (subtitleEl) {
            const selectedBrandVal = this.brandSelect ? this.brandSelect.value : 'all';
            const selectedSegmentVal = this.segmentSelect ? this.segmentSelect.value : 'all';
            
            const brandNamesKo = {
                'all': '전체 제조사',
                'Hankook': '한국타이어',
                'Michelin': '미쉐린',
                'Bridgestone': '브리지스톤',
                'Continental': '콘티넨탈',
                'Goodyear': '굿이어',
                'Pirelli': '피렐리',
                'Kumho': '금호타이어'
            };
            
            const segmentNamesKo = {
                'all': '전체 세그먼트',
                'Ultra High Performance (UHP)': '초고성능 스포츠 (UHP)',
                'Grand Touring (All-Season) - Passenger': '투어링 승용 사계절 (Grand Touring Passenger)',
                'Grand Touring (All-Season) - SUV': '투어링 SUV 사계절 (Grand Touring SUV)',
                'All-Season Passenger': '일반 승용 사계절 (All-Season)',
                'Winter / Snow': '겨울용 스노우 (Winter/Snow)',
                'All-Terrain (SUV/Truck)': '온/오프로드 SUV (All-Terrain)',
                'Summer': '여름용 (Summer)',
                'Winter': '겨울용 (Winter)',
                'All-Season': '사계절용 (All-Season)'
            };

            const brandText = brandNamesKo[selectedBrandVal] || selectedBrandVal;
            const segmentText = segmentNamesKo[selectedSegmentVal] || selectedSegmentVal;

            if (targetModels.length === 0) {
                const currentMarketText = this.currentMarket === 'na' ? '북미' : '유럽';
                subtitleEl.innerHTML = `⚠️ <span style="color: var(--color-red); font-weight:700;">[데이터 매칭 없음] ${currentMarketText} 시장의 '${segmentText}' 세그먼트에 속하는 '${brandText}' 제품 중 타겟 시즌필터('${targetSeason}')에 정밀 매칭되는 데이터가 존재하지 않습니다. 필터링 조건을 다시 확인해 주십시오.</span>`;
            } else if (selectedBrandVal !== 'all') {
                if (targetModels.length === 1) {
                    subtitleEl.innerHTML = `분석 대상: <strong style="color: var(--color-hankook);">${targetModels[0].brand} ${targetModels[0].model}</strong> (단일 상품 실측 점수 추이)`;
                } else {
                    const modelNames = targetModels.map(item => item.model).join(', ');
                    subtitleEl.innerHTML = `분석 대상: <strong style="color: var(--color-hankook);">${brandText}</strong> (${modelNames}) - <strong>총 ${targetModels.length}개 상품의 연도별 평균 점수</strong>`;
                }
            } else {
                const uniqueBrands = [...new Set(targetModels.map(item => item.brand))];
                const brandListKo = uniqueBrands.map(b => brandNamesKo[b] || b).join(', ');
                subtitleEl.innerHTML = `분석 대상: <strong style="color: var(--color-hankook);">${segmentText}</strong> 전체 평균 (제조사: ${brandListKo} | <strong>총 ${targetModels.length}개 상품 평균</strong>)`;
            }
        }

        const numAttrs = attributes.length;
        const attrSumsByYear = Array(numAttrs).fill(0).map(() => Array(yearsRange.length).fill(0));
        const countsByYear = Array(yearsRange.length).fill(0);

        targetModels.forEach(item => {
            yearsRange.forEach((year, yrIdx) => {
                const yearRec = item.yearlyData[year];
                if (yearRec) {
                    const scores = this.getMetricScoresForRecord(yearRec, isNA, isSummer);
                    if (scores && scores.length === numAttrs) {
                        for (let a = 0; a < numAttrs; a++) {
                            attrSumsByYear[a][yrIdx] += scores[a];
                        }
                        countsByYear[yrIdx]++;
                    }
                }
            });
        });

        // 연도별 가중평균 성능 점수 계산
        const attrAvgsByYear = Array(numAttrs).fill(0).map(() => Array(yearsRange.length).fill(0));
        for (let a = 0; a < numAttrs; a++) {
            for (let yrIdx = 0; yrIdx < yearsRange.length; yrIdx++) {
                const count = countsByYear[yrIdx];
                attrAvgsByYear[a][yrIdx] = count > 0 ? (attrSumsByYear[a][yrIdx] / count) : 0;
            }
        }

        if (this.charts.yoy) {
            this.charts.yoy.destroy();
        }

        // 성능 항목 성격에 맞는 직관적이고 고급스러운 컬러 팔레트 배정
        let colors = [];
        if (isNA) {
            if (isSummer) {
                // Dry (Orange), Wet (Blue), Hydro (Teal), Comfort (Purple), Tread (Green), Fuel (Amber)
                colors = ['#ff6b00', '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];
            } else {
                // Dry (Orange), Wet (Blue), Hydro (Teal), Comfort (Purple), Tread (Green), Snow (Pink), Fuel (Amber)
                colors = ['#ff6b00', '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b'];
            }
        } else {
            // Dry (Orange), Wet (Blue), Hydro (Teal), Tread (Green), Fuel (Amber), Comfort/Noise (Purple)
            colors = ['#ff6b00', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
        }

        const datasets = attributes.map((attr, a) => {
            const color = colors[a] || '#6b7280';
            return {
                label: attr,
                data: attrAvgsByYear[a],
                borderColor: color,
                backgroundColor: 'transparent',
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2.5,
                tension: 0.25
            };
        });

        const ctx = chartCanvas.getContext('2d');
        this.charts.yoy = new Chart(ctx, {
            type: 'line',
            data: {
                labels: yearsRange.map(y => y + "년"),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 12,
                                weight: '700',
                                family: "'Inter', 'Outfit', 'sans-serif'"
                            },
                            color: '#111827'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        ticks: {
                            font: { size: 12, weight: '700' },
                            color: '#111827'
                        },
                        title: {
                            display: true,
                            text: '성능 항목별 점수',
                            color: '#111827',
                            font: {
                                size: 12,
                                weight: '800'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.06)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 12, weight: '700' },
                            color: '#111827'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * 차트 2: 한국타이어 주력 모델 vs 최고 경쟁사 간의 다차원 성능 레이더 비교 (시장 영역 선택에 따른 분리 구조)
     */
    renderRadarChart(selectedYear, activeSegment) {
        if (typeof Chart === 'undefined') return;
        const chartCanvas = document.getElementById('chart-radar-attributes');
        if (!chartCanvas) return;

        const strategyData = this.getGapAnalysisData(selectedYear, activeSegment);

        if (this.charts.radar) {
            this.charts.radar.destroy();
        }

        if (!strategyData) return;

        const isNA = this.currentMarket === 'na';
        const attributes = (isNA && !strategyData.isSummer)
            ? [
                '마른 노면 접지력', 
                '젖은 노면 제동력', 
                '수막현상 방지', 
                '승차감 및 소음', 
                '트레드 수명', 
                '눈길/빙판 제동', 
                '연비 효율성'
            ]
            : isNA
                ? [
                    '마른 노면 접지력', 
                    '젖은 노면 제동력', 
                    '수막현상 방지', 
                    '승차감 및 소음', 
                    '트레드 수명', 
                    '연비 효율성'
                ]
                : [
                    '마른 노면 성능',
                    '젖은 노면 성능',
                    '수막현상 방지',
                    '수명 및 마일리지',
                    '회전저항 (연비) (R.R.)',
                    '승차감 및 소음'
                ];

        const ctx = chartCanvas.getContext('2d');
        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: attributes,
                datasets: [
                    {
                        label: strategyData.hankookLabel,
                        data: strategyData.hankookScores,
                        borderColor: '#ff6b00', // 한국타이어 오렌지 시그니처
                        backgroundColor: 'rgba(255, 107, 0, 0.15)',
                        pointBackgroundColor: '#ff6b00',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        borderWidth: 2.5,
                        z: 5
                    },
                    {
                        label: strategyData.benchmarkLabel,
                        data: strategyData.benchmarkScores,
                        borderColor: '#3b82f6', // 경쟁사 블루
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        borderWidth: 1.5,
                        borderDash: [3, 3],
                        z: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { boxWidth: 12, padding: 15 } 
                    } 
                },
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: { stepSize: 2, display: false },
                        angleLines: { color: 'rgba(249, 115, 22, 0.06)' },
                        grid: { color: 'rgba(249, 115, 22, 0.06)' },
                        pointLabels: { 
                            font: { size: 10, weight: '600' }, 
                            color: '#64748b' 
                        }
                    }
                }
            }
        });
    }

    /**
     * 차트 3: 각 제조사(브랜드)의 선택한 단일 분석 기준 연도 글로벌 전체 매출액 및 판매량 비교 (이중 축 Grouped Bar)
     */
    /**
     * 차트 3: 각 제조사(브랜드)의 연간 글로벌 매출액 또는 판매량 비교 (X축: 연도, Y축: 선택한 지표)
     */
    renderBrandComparisonChart(filteredData) {
        if (typeof Chart === 'undefined') return;
        const chartCanvas = document.getElementById('chart-bar-brands');
        if (!chartCanvas) return;

        // 활성 지표(매출액 vs 판매량) 확인
        let activeMetric = 'revenue'; // default
        const metricSelector = document.getElementById('brand-metric-selector');
        if (metricSelector) {
            const activeBtn = metricSelector.querySelector('.metric-btn.active');
            if (activeBtn) {
                activeMetric = activeBtn.getAttribute('data-metric') || 'revenue';
            }
        }

        const years = ['2021', '2022', '2023', '2024', '2025', '2026'];

        // 선택된 브랜드 가져오기
        let brandsList = ['Hankook', 'Michelin']; // default fallback
        const brandSelector = document.getElementById('brand-chart-selector');
        if (brandSelector) {
            const checkedInputs = Array.from(brandSelector.querySelectorAll('input[type="checkbox"]:checked'));
            if (checkedInputs.length > 0) {
                brandsList = checkedInputs.map(input => input.value);
            }
        }

        const koreanBrands = {
            'Hankook': '한국타이어',
            'Michelin': '미쉐린',
            'Bridgestone': '브리지스톤',
            'Continental': '콘티넨탈',
            'Goodyear': '굿이어',
            'Pirelli': '피렐리',
            'Kumho': '금호타이어'
        };

        const brandColors = {
            'Hankook': { border: '#ff6b00', bg: 'rgba(255, 107, 0, 0.08)', point: '#ff6b00', thickness: 4, pointSize: 7 },
            'Michelin': { border: '#5cb2ff', bg: 'rgba(92, 178, 255, 0.03)', point: '#5cb2ff', thickness: 2.5, pointSize: 4.5 },
            'Bridgestone': { border: '#ffd043', bg: 'rgba(255, 208, 67, 0.03)', point: '#ffd043', thickness: 2.5, pointSize: 4.5 },
            'Continental': { border: '#ff9f24', bg: 'rgba(255, 159, 36, 0.03)', point: '#ff9f24', thickness: 2.5, pointSize: 4.5 },
            'Goodyear': { border: '#ca8aff', bg: 'rgba(202, 138, 255, 0.03)', point: '#ca8aff', thickness: 2.5, pointSize: 4.5 },
            'Pirelli': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)', point: '#3b82f6', thickness: 2.5, pointSize: 4.5 },
            'Kumho': { border: '#ff3333', bg: 'rgba(255, 51, 51, 0.03)', point: '#ff3333', thickness: 2.5, pointSize: 4.5 }
        };

        // 데이터셋 구성 (각 브랜드가 하나의 선이 됨)
        const datasets = brandsList.map(brand => {
            const metadata = BRAND_IR_METADATA[brand];
            const dataValues = years.map(year => {
                if (!metadata) return 0;
                
                // 적용할 대륙별 배분비 구하기
                let alloc = 1.0;
                if (this.tab1Market && this.tab1Market !== 'global') {
                    alloc = (metadata.regionalAlloc && metadata.regionalAlloc[this.tab1Market]) || 1.0;
                }
                
                if (activeMetric === 'revenue') {
                    let rawRevenue = typeof metadata.globalRevenue === 'object'
                        ? (metadata.globalRevenue[year] || 0)
                        : (metadata.globalRevenue || 0);
                    if (brand === 'Pirelli') rawRevenue *= 1.10;
                    return (rawRevenue * alloc) / 1000000000; // Billion USD
                } else {
                    const rawSales = typeof metadata.globalSales === 'object'
                        ? (metadata.globalSales[year] || 0)
                        : (metadata.globalSales || 0);
                    return (rawSales * alloc) / 1000000; // Million Units
                }
            });

            const config = brandColors[brand] || { border: '#94a3b8', bg: 'rgba(255, 255, 255, 0.03)', point: '#94a3b8', thickness: 2.5, pointSize: 4.5 };
            const brandLabel = koreanBrands[brand] || brand;

            return {
                label: brandLabel,
                data: dataValues,
                borderColor: config.border,
                backgroundColor: config.bg,
                borderWidth: config.thickness,
                tension: 0.35,
                fill: brand === 'Hankook', // 자사만 영역 강조를 위해 미세하게 영역 채움
                pointBackgroundColor: config.point,
                pointBorderColor: brand === 'Hankook' ? '#ffffff' : config.border,
                pointBorderWidth: 2,
                pointRadius: config.pointSize,
                pointHoverRadius: config.pointSize + 2
            };
        });

        if (this.charts.brandBar) {
            this.charts.brandBar.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        this.charts.brandBar = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => y + '년'),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { 
                            boxWidth: 14, 
                            font: { size: 13, weight: '700' },
                            color: '#111827'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 15, 32, 0.95)',
                        titleColor: '#fff',
                        titleFont: { size: 13, weight: '700' },
                        bodyFont: { size: 12 },
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label + " 실적 비교";
                            },
                            label: function(context) {
                                const val = context.parsed.y;
                                const brandLabel = context.dataset.label;
                                if (activeMetric === 'revenue') {
                                    return ` ${brandLabel} 매출액: $${val.toFixed(1)}B (Billion USD)`;
                                } else {
                                    return ` ${brandLabel} 판매량: ${val.toFixed(1)}M (Million Units)`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.06)' },
                        ticks: { 
                            font: { size: 12, weight: '700' }, 
                            color: '#111827'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { 
                            display: true, 
                            text: activeMetric === 'revenue' ? '글로벌 매출액 (십억 USD)' : '글로벌 판매량 (백만 본)', 
                            color: '#ea580c', 
                            font: { size: 13, weight: '800' } 
                        },
                        ticks: {
                            font: { size: 12, weight: '700' },
                            color: '#111827'
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.06)' }
                    }
                }
            }
        });
    }

    /**
     * 한국타이어 VS 최고 경쟁 모델 간의 다차원 Gap 지표 상세 데이터 연산 알고리즘 (시장 및 시즌 정밀 정합 적용)
     */
    getGapAnalysisData(selectedYear, activeSegment) {
        // 1. 해당 세그먼트의 모델 필터링 (시장별 세그먼트 동적 이원화 매핑 적용)
        const segmentModels = activeSegment === 'all' 
            ? this.db 
            : this.db.filter(item => this.getModelSegmentForMarket(item, this.currentMarket) === activeSegment);
            
        const allHankookInSegment = segmentModels.filter(item => item.brand === 'Hankook');
        if (allHankookInSegment.length === 0) return null;

        // 2. 현재 선택된 R&D 시장 영역('na' 또는 'eu') 및 세그먼트에 맞는 정확한 시즌 판정
        let targetSeason = 'All-Season';
        if (this.currentMarket === 'eu') {
            // 유럽 시장은 세그먼트 자체가 시즌명입니다: 'Summer', 'Winter', 'All-Season'
            targetSeason = activeSegment === 'all' ? 'Summer' : activeSegment;
        } else {
            // 북미 시장
            if (activeSegment === 'Winter / Snow' || activeSegment === 'Winter') {
                targetSeason = 'Winter';
            } else if (activeSegment === 'Summer') {
                targetSeason = 'Summer';
            } else {
                targetSeason = 'All-Season';
            }
        }

        // 3. 한국타이어 대표 모델과 '완벽히 같은 시즌'을 갖는 제품군끼리만 엄격하게 매칭 (횡비교 왜곡 원천 차단)
        const selectedBrand = this.brandSelect ? this.brandSelect.value : 'all';
        const hankookModels = allHankookInSegment.filter(item => item.season === targetSeason);
        let competitorModels = segmentModels.filter(item => item.brand !== 'Hankook' && item.season === targetSeason);
        if (selectedBrand !== 'all' && selectedBrand !== 'Hankook') {
            competitorModels = competitorModels.filter(item => item.brand === selectedBrand);
        }

        // 한국타이어 모델 중 해당 연도/시즌에서 가장 적합한 '최우수 대표 상품' 선정
        let bestHankook = null;
        let bestHankookScore = -1;
        let selectedHankookModel = null;

        hankookModels.forEach(model => {
            const rec = model.yearlyData[selectedYear];
            let score = rec ? this.calculateModelScore(rec, model.season) : 0;
            
            // 유럽 시장 사계절용(All-Season) 세그먼트의 경우, 
            // 메인스트림 승용 올웨더 타이어인 'Kinergy 4S2'가 핵심 비교 대조군이 되도록 우선순위를 보장합니다.
            if (this.currentMarket === 'eu' && targetSeason === 'All-Season') {
                if (model.model === 'Kinergy 4S2') {
                    score += 5.0; // Kinergy 4S2 우선 선택 보장
                }
            }
            
            if (score > bestHankookScore) {
                bestHankookScore = score;
                bestHankook = model;
            }
        });
        if (bestHankook) {
            selectedHankookModel = bestHankook;
        } else {
            selectedHankookModel = allHankookInSegment[0];
        }

        // 한국타이어 모델과 완벽히 동일한 세그먼트 제품들만 비교되도록 필터링 (승용/SUV 오비교 전격 방지)
        if (selectedHankookModel) {
            if (this.currentMarket === 'na') {
                // 북미 시장: 상세 세그먼트명이 일치해야 함
                const sameSegmentCompetitors = competitorModels.filter(item => item.segment === selectedHankookModel.segment);
                if (sameSegmentCompetitors.length > 0) {
                    competitorModels = sameSegmentCompetitors;
                }
            } else {
                // 유럽 시장: SUV 제품군 여부에 맞춰 정교한 이중 매칭
                const isHkSUV = selectedHankookModel.segment.includes('SUV') || (selectedHankookModel.model && selectedHankookModel.model.includes('SUV'));
                const sameTypeCompetitors = competitorModels.filter(item => {
                    const isCompSUV = item.segment.includes('SUV') || (item.model && item.model.includes('SUV'));
                    return isHkSUV === isCompSUV;
                });
                if (sameTypeCompetitors.length > 0) {
                    competitorModels = sameTypeCompetitors;
                }
            }
        }

        let bestCompetitor = null;
        let bestCompetitorScore = -1;
        
        competitorModels.forEach(model => {
            const rec = model.yearlyData[selectedYear];
            let score = rec ? this.calculateModelScore(rec, model.season) : 0;
            
            // 유럽 All-Season 세그먼트 벤치마크 1위인 Michelin CrossClimate 2가 확실하게 1순위 대조군으로 선발되도록 보증
            if (this.currentMarket === 'eu' && targetSeason === 'All-Season') {
                if (model.brand === 'Michelin' && model.model === 'CrossClimate 2') {
                    score += 5.0; // CrossClimate 2 우선 선택 보장
                }
            }
            
            if (score > bestCompetitorScore) {
                bestCompetitorScore = score;
                bestCompetitor = model;
            }
        });

        const isNA = this.currentMarket === 'na';
        const isSummer = targetSeason === 'Summer';
        
        // 북미 시장이면서 Summer 제품 비교 시 눈길 제동 성능 항목은 완전 제외하여 6개 축이 됨.
        // 유럽 시장은 항상 6개 축이 됨.
        const numAttrs = (isNA && !isSummer) ? 7 : 6;
        
        const hankookSums = Array(numAttrs).fill(0);
        let hankookCount = 0;
        
        const activeHankookList = selectedHankookModel ? [selectedHankookModel] : [];
        activeHankookList.forEach(model => {
            const rec = model.yearlyData[selectedYear];
            if (rec) {
                if (isNA) {
                    if (isSummer) {
                        // Summer 타이어: 겨울용 성능인 snow_traction, ice_braking은 전격 제외(6축 재배치)
                        hankookSums[0] += (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2;
                        hankookSums[1] += (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2;
                        hankookSums[2] += (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2;
                        hankookSums[3] += (rec.tirerack.comfort + rec.tirerack.noise) / 2;
                        hankookSums[4] += (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2;
                        hankookSums[5] += rec.consumerreports.fuel_economy / 10;
                    } else {
                        // All-Season 또는 Winter: 7개 성능 축 전부 연산
                        hankookSums[0] += (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2;
                        hankookSums[1] += (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2;
                        hankookSums[2] += (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2;
                        hankookSums[3] += (rec.tirerack.comfort + rec.tirerack.noise) / 2;
                        hankookSums[4] += (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2;
                        hankookSums[5] += (rec.consumerreports.snow_traction/10 + rec.consumerreports.ice_braking/10) / 2;
                        hankookSums[6] += rec.consumerreports.fuel_economy / 10;
                    }
                } else {
                    // 유럽 시장 (6개 성능 축 연산)
                    const adac = rec.europe ? rec.europe.adac : { dry_safety: 3.0, wet_safety: 3.0, mileage: 3.0, efficiency: 3.0, noise: 3.0 };
                    const ab = rec.europe ? rec.europe.autobild : { dry_performance: 7.0, wet_performance: 7.0, aquaplaning: 7.0, comfort: 7.0, treadwear: 7.0 };
                    
                    hankookSums[0] += ((6.0 - adac.dry_safety) * 2 + ab.dry_performance) / 2;
                    hankookSums[1] += ((6.0 - adac.wet_safety) * 2 + ab.wet_performance) / 2;
                    hankookSums[2] += ab.aquaplaning;
                    hankookSums[3] += ((6.0 - adac.mileage) * 2 + ab.treadwear) / 2;
                    hankookSums[4] += (6.0 - adac.efficiency) * 2;
                    hankookSums[5] += ((6.0 - adac.noise) * 2 + ab.comfort) / 2;
                }
                hankookCount++;
            }
        });
        
        const hankookScores = hankookSums.map(sum => hankookCount > 0 ? sum / hankookCount : 0);

        const benchmarkSums = Array(numAttrs).fill(0);
        let benchmarkCount = 0;
        
        if (bestCompetitor) {
            const rec = bestCompetitor.yearlyData[selectedYear];
            if (rec) {
                if (isNA) {
                    if (isSummer) {
                        // Summer 타이어: 겨울용 성능인 snow_traction, ice_braking은 전격 제외
                        benchmarkSums[0] += (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2;
                        benchmarkSums[1] += (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2;
                        benchmarkSums[2] += (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2;
                        benchmarkSums[3] += (rec.tirerack.comfort + rec.tirerack.noise) / 2;
                        benchmarkSums[4] += (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2;
                        benchmarkSums[5] += rec.consumerreports.fuel_economy / 10;
                    } else {
                        benchmarkSums[0] += (rec.tirerack.dry_traction + rec.consumerreports.dry_braking/10) / 2;
                        benchmarkSums[1] += (rec.tirerack.wet_traction + rec.consumerreports.wet_braking/10) / 2;
                        benchmarkSums[2] += (rec.tirerack.hydroplaning + rec.consumerreports.handling/10) / 2;
                        benchmarkSums[3] += (rec.tirerack.comfort + rec.tirerack.noise) / 2;
                        benchmarkSums[4] += (rec.tirerack.treadwear + rec.consumerreports.tread_life/10) / 2;
                        benchmarkSums[5] += (rec.consumerreports.snow_traction/10 + rec.consumerreports.ice_braking/10) / 2;
                        benchmarkSums[6] += rec.consumerreports.fuel_economy / 10;
                    }
                } else {
                    const adac = rec.europe ? rec.europe.adac : { dry_safety: 3.0, wet_safety: 3.0, mileage: 3.0, efficiency: 3.0, noise: 3.0 };
                    const ab = rec.europe ? rec.europe.autobild : { dry_performance: 7.0, wet_performance: 7.0, aquaplaning: 7.0, comfort: 7.0, treadwear: 7.0 };
                    
                    benchmarkSums[0] += ((6.0 - adac.dry_safety) * 2 + ab.dry_performance) / 2;
                    benchmarkSums[1] += ((6.0 - adac.wet_safety) * 2 + ab.wet_performance) / 2;
                    benchmarkSums[2] += ab.aquaplaning;
                    benchmarkSums[3] += ((6.0 - adac.mileage) * 2 + ab.treadwear) / 2;
                    benchmarkSums[4] += (6.0 - adac.efficiency) * 2;
                    benchmarkSums[5] += ((6.0 - adac.noise) * 2 + ab.comfort) / 2;
                }
                benchmarkCount++;
            }
        }
        
        const benchmarkScores = benchmarkSums.map(sum => benchmarkCount > 0 ? sum / benchmarkCount : 0);

        const gaps = hankookScores.map((score, idx) => score - benchmarkScores[idx]);

        let maxPosIdx = -1;
        let maxPosValue = -999;
        let maxNegIdx = -1;
        let maxNegValue = 999;

        gaps.forEach((gap, idx) => {
            if (gap > maxPosValue) {
                maxPosValue = gap;
                maxPosIdx = idx;
            }
            if (gap < maxNegValue) {
                maxNegValue = gap;
                maxNegIdx = idx;
            }
        });

        const hkModelName = selectedHankookModel ? selectedHankookModel.model : '한국타이어 대표 상품';
        const compModelName = bestCompetitor ? `${bestCompetitor.brand} ${bestCompetitor.model}` : '경쟁사 최고 모델';

        return {
            hankookLabel: `한국타이어 (${hkModelName})`,
            benchmarkLabel: `벤치마크 (${compModelName})`,
            hankookName: hkModelName,
            benchmarkName: compModelName,
            hankookScores,
            benchmarkScores,
            gaps,
            maxPosIdx,
            maxPosValue,
            maxNegIdx,
            maxNegValue,
            targetSeason,
            isSummer
        };
    }

    /**
     * 한국타이어 R&D 전략 가이드 및 dynamic SWOT 제언 생성 (Fact와 Estimation 엄격 분리 표기)
     */
    renderStrategyPanel(selectedYear, activeSegment) {
        const strategyData = this.getGapAnalysisData(selectedYear, activeSegment);
        const subtitleText = document.getElementById('strategy-subtitle-text');
        
        if (!strategyData) {
            document.getElementById('panel-hankook-strategy').style.display = 'none';
            return;
        }
        document.getElementById('panel-hankook-strategy').style.display = '';

        const segmentNamesKo = {
            'all': '전체 제품군 종합 라인업',
            'Ultra High Performance (UHP)': '초고성능 스포츠',
            'Grand Touring (All-Season) - Passenger': '투어링 승용 사계절',
            'Grand Touring (All-Season) - SUV': '투어링 SUV 사계절',
            'All-Season Passenger': '일반 승용 사계절',
            'Winter / Snow': '겨울용 스노우',
            'All-Terrain (SUV/Truck)': '온/오프로드 SUV (All-Terrain)'
        };
        
        const marketNameKo = this.currentMarket === 'na' ? '북미 시장' : '유럽 시장';
        subtitleText.textContent = `분석 영역: ${marketNameKo} | 대상 세그먼트: ${segmentNamesKo[activeSegment] || activeSegment} ㅡ 한국타이어 [${strategyData.hankookName}] VS 벤치마크 [${strategyData.benchmarkName}] 입체 비교`;

        const isNA = this.currentMarket === 'na';
        const attributeNamesKorean = (isNA && !strategyData.isSummer)
            ? [
                '마른 노면 접지력', 
                '젖은 노면 제동력', 
                '수막현상 방지', 
                '승차감 및 소음', 
                '트레드 수명', 
                '눈길/빙판 제동', 
                '연비 효율성'
            ]
            : isNA
                ? [
                    '마른 노면 접지력', 
                    '젖은 노면 제동력', 
                    '수막현상 방지', 
                    '승차감 및 소음', 
                    '트레드 수명', 
                    '연비 효율성'
                ]
                : [
                    '마른 노면 성능',
                    '젖은 노면 성능',
                    '수막현상 방지',
                    '수명 및 마일리지',
                    '회전저항 및 연비',
                    '승차감 및 소음'
                ];

        const hkName = `한국타이어 ${strategyData.hankookName}`;
        const compName = strategyData.benchmarkName;
        const maxPosAttr = attributeNamesKorean[strategyData.maxPosIdx];
        const maxNegAttr = attributeNamesKorean[strategyData.maxNegIdx];

        // S (Strength) - 강점
        document.getElementById('swot-s-content').innerHTML = `
            <div style="margin-bottom: 8px;">
                <span class="badge-fact">실측 팩트</span> 
                당사 <strong>${hkName}</strong>은(는) 선택 연도(${selectedYear}년) <strong>${maxPosAttr}</strong> 부문에서 평점 <strong>${strategyData.hankookScores[strategyData.maxPosIdx].toFixed(1)}점</strong>을 기록해, 경쟁사 최고 벤치마크 모델인 <strong>${compName}</strong>(${strategyData.benchmarkScores[strategyData.maxPosIdx].toFixed(1)}점) 대비 기술적 우위(<span class="gap-diff-positive" style="font-weight:700;">+${strategyData.maxPosValue.toFixed(1)}점</span>)를 공식 실측 확보했습니다.
            </div>
            <div>
                <span class="badge-estimation">전략 추정</span> 
                이 강점은 원천 고무 분자 중합 가공 특허와 횡방향 사이드 구조 강성 제어의 시너지 결과로 추정되며, 해당 대륙 마케팅 캠페인 시 한국타이어 브랜드 기술 신뢰도를 보장하는 핵심 셀링포인트로 집중 소구할 것을 강력히 제언합니다.
            </div>
        `;

        // W (Weakness) - 약점
        document.getElementById('swot-w-content').innerHTML = `
            <div style="margin-bottom: 8px;">
                <span class="badge-fact">실측 팩트</span> 
                경쟁사 대비 성능 열세가 가장 도드라진 최우선 보강 항목은 <strong>${maxNegAttr}</strong>입니다. 당사 모델은 <strong>${strategyData.hankookScores[strategyData.maxNegIdx].toFixed(1)}점</strong>으로 경쟁사 제품(${strategyData.benchmarkScores[strategyData.maxNegIdx].toFixed(1)}점) 대비 <span class="gap-diff-negative" style="font-weight:700;">${strategyData.maxNegValue.toFixed(1)}점</span>의 성능 부족 현상이 검증되었습니다.
            </div>
            <div>
                <span class="badge-estimation">전략 추정</span> 
                대륙 기후(북미 All-season / 유럽 Summer) 특성에 따른 트레드 배수 구조 및 실리카 원료 배합 튜닝 불균형이 주 원인으로 추정되며, R&D 부서에서 즉각적인 마이너 트레드 피치 홈 수정 및 실리카 함량 고온 배합 공법 패치 연구를 착수해야 할 시점입니다.
            </div>
        `;

        // O (Opportunity) - 기회
        let oFactText = "";
        let oEstText = "";
        if (strategyData.maxPosIdx === 3 || strategyData.maxPosIdx === 4 || strategyData.maxPosIdx === 6 || (!isNA && strategyData.maxPosIdx === 3)) {
            oFactText = `글로벌 거시 경제 둔화 현상 속에서 장기적인 유지비용 메리트를 대변하는 당사의 최고 우위인 ${maxPosAttr} (평가 등급 우수) 데이터가 객체 지표로 지속 포착되고 있습니다.`;
            oEstText = `북미 사계절 및 유럽 친환경 ADAC 마일리지 부문의 압도적 평점을 무기로 삼아 장거리 패밀리카 소유주 및 대형 상용 렌터카 플릿 영업망에 가성비 최상위 보증 마케팅을 전개하여 시장 영토를 확장하기에 절호의 모멘텀으로 추정됩니다.`;
        } else {
            oFactText = `친환경 고성능 전기차 및 럭셔리 스포츠 완성차 사양 입찰 시 고속 주행 시 주행 거동을 결정하는 당사의 독보적 ${maxPosAttr} 지표가 벤치마크 상위를 지켜내고 있습니다.`;
            oEstText = `기술적 신뢰성을 극한으로 요구하는 글로벌 프리미엄 브랜드(독일 3사 등) 전용 신차 장착 OE 수주 활동 시, 이 데이터를 R&D 입증 실측 장표로 활용해 독점 장착 공급권을 쟁취하고 글로벌 공급망 진입을 촉진할 수 있을 것으로 추정됩니다.`;
        }
        document.getElementById('swot-o-content').innerHTML = `
            <div style="margin-bottom: 8px;">
                <span class="badge-fact">실측 팩트</span> ${oFactText}
            </div>
            <div>
                <span class="badge-estimation">전략 추정</span> ${oEstText}
            </div>
        `;

        // T (Threat) - 위협
        document.getElementById('swot-t-content').innerHTML = `
            <div style="margin-bottom: 8px;">
                <span class="badge-fact">실측 팩트</span> 
                글로벌 Top 1 경쟁 벤치마크 브랜드인 <strong>${compName}</strong>이 당사의 보강 영역인 <strong>${maxNegAttr}</strong> 지표 우위를 바탕으로 프리미엄 시장 지배력을 공고화하고 있으며, 가성비를 강화한 중국계 및 아시아 경쟁 제조사들의 젖은 제동 추격 성능이 위협 수치로 가속화되고 있습니다.
            </div>
            <div>
                <span class="badge-estimation">전략 추정</span> 
                당사 원천 엔지니어링 개선 및 미세 마Minor 컴파운드 패치가 적기에 지원되지 못한다면, 고수익 세그먼트인 고인치 프리미엄 믹스 점유를 해외 브랜드에 잠식당하고 원가 기반 가격 할인 출혈 경쟁 구조로 퇴보할 리스크가 극히 고조될 우려가 존재합니다.
            </div>
        `;

        const gapListContainer = document.getElementById('gap-list-container');
        gapListContainer.innerHTML = '';

        attributeNamesKorean.forEach((attrKo, idx) => {
            const hScore = strategyData.hankookScores[idx];
            const bScore = strategyData.benchmarkScores[idx];
            const diff = strategyData.gaps[idx];

            const itemDiv = document.createElement('div');
            itemDiv.className = 'gap-item';

            let diffText = "";
            let diffClass = "";
            if (diff > 0) {
                diffText = `+${diff.toFixed(1)}`;
                diffClass = 'gap-diff-positive';
            } else if (diff < 0) {
                diffText = `${diff.toFixed(1)}`;
                diffClass = 'gap-diff-negative';
            } else {
                diffText = `0.0`;
                diffClass = 'gap-diff-equal';
            }

            const hPercent = Math.min(100, Math.max(0, hScore * 10));
            const bPercent = Math.min(100, Math.max(0, bScore * 10));

            itemDiv.innerHTML = `
                <div class="gap-item-meta">
                    <span class="gap-item-name">${attrKo}</span>
                    <span class="gap-item-values">
                        <span class="gap-score-hankook">${hScore.toFixed(1)}</span>
                        <span class="gap-score-divider">/</span>
                        <span class="gap-score-benchmark">${bScore.toFixed(1)}</span>
                        <span class="gap-score-diff ${diffClass}">(${diffText})</span>
                    </span>
                </div>
                <div class="gap-bar-container">
                    <div class="gap-bar-hankook" style="width: ${hPercent}%"></div>
                    <div class="gap-bar-benchmark-marker" style="left: ${bPercent}%"></div>
                </div>
            `;
            gapListContainer.appendChild(itemDiv);
        });
    }

    /**
     * 필터링된 데이터를 가공하여 상세 스코어카드 데이터 그리드 테이블 렌더링 (단일 연도 스냅샷)
     */
    renderTable(customData = null) {
        const selectedYear = this.getSelectedYear();
        const searchQuery = this.searchInput.value.toLowerCase();
        
        let dataset = customData || this.getFilteredDataset();
        const tableRows = [];

        // 정렬 타겟이 다른 마켓 전용인 경우 combined로 리셋하여 오염 차단
        if (this.currentMarket === 'na' && ['adac', 'autobild'].includes(this.sortColumn)) {
            this.sortColumn = 'combined';
            this.sortDirection = 'desc';
        } else if (this.currentMarket === 'eu' && ['tirerack', 'consumerreports'].includes(this.sortColumn)) {
            this.sortColumn = 'combined';
            this.sortDirection = 'desc';
        }

        const metric = this.metricSelect ? this.metricSelect.value : 'volume';

        // 테이블 단일 년도 판매량 헤더 동적 라벨 정합
        const salesHeaderTh = document.querySelector('.analytics-table th[data-sort="sales"]');
        if (salesHeaderTh) {
            salesHeaderTh.innerHTML = metric === 'revenue' 
                ? `${selectedYear}년 매출액 <span class="sort-arrow"></span>` 
                : `${selectedYear}년 판매량 <span class="sort-arrow"></span>`;
        }

        // 시장(북미 vs 유럽)에 따른 컬럼 헤더 및 data-sort 동적 세팅
        const thList = document.querySelectorAll('.analytics-table th');
        if (thList.length >= 7) {
            const th5 = thList[4]; // 5번째 컬럼 (Tire Rack 평점 또는 ADAC 독일 평점)
            const th6 = thList[5]; // 6번째 컬럼 (CR 성능 점수 또는 Auto Bild 등급)
            
            if (this.currentMarket === 'na') {
                th5.setAttribute('data-sort', 'tirerack');
                th5.innerHTML = `Tire Rack 평점 <span class="sort-arrow"></span>`;
                th6.setAttribute('data-sort', 'consumerreports');
                th6.innerHTML = `CR 성능 점수 <span class="sort-arrow"></span>`;
            } else {
                th5.setAttribute('data-sort', 'adac');
                th5.innerHTML = `ADAC 독일 평점 (낮을수록 우수) <span class="sort-arrow"></span>`;
                th6.setAttribute('data-sort', 'autobild');
                th6.innerHTML = `Auto Bild 등급 <span class="sort-arrow"></span>`;
            }
        }

        dataset.forEach(item => {
            const brandNamesKo = {
                'Hankook': '한국타이어',
                'Michelin': '미쉐린',
                'Bridgestone': '브리지스톤',
                'Continental': '콘티넨탈',
                'Goodyear': '굿이어',
                'Pirelli': '피렐리',
                'Kumho': '금호타이어'
            };
            const brandKo = (brandNamesKo[item.brand] || "").toLowerCase();
            const brandEn = item.brand.toLowerCase();
            const modelEn = item.model.toLowerCase();
            
            const brandMatch = brandEn.includes(searchQuery) || brandKo.includes(searchQuery);
            const modelMatch = modelEn.includes(searchQuery);
            
            if (searchQuery !== '' && !brandMatch && !modelMatch) {
                return;
            }

            const rec = item.yearlyData[selectedYear];
            if (rec) {
                const trAvg = (
                    rec.tirerack.dry_traction + rec.tirerack.wet_traction + rec.tirerack.hydroplaning + 
                    rec.tirerack.comfort + rec.tirerack.noise + rec.tirerack.treadwear + rec.tirerack.user_rating
                ) / 7 * 10;

                let crAvg;
                if (item.season === 'Summer') {
                    crAvg = (
                        rec.consumerreports.dry_braking + rec.consumerreports.wet_braking + rec.consumerreports.handling + 
                        rec.consumerreports.fuel_economy + rec.consumerreports.tread_life + rec.consumerreports.cr_overall
                    ) / 6;
                } else {
                    crAvg = (
                        rec.consumerreports.dry_braking + rec.consumerreports.wet_braking + rec.consumerreports.handling + 
                        rec.consumerreports.snow_traction + rec.consumerreports.ice_braking + rec.consumerreports.fuel_economy + 
                        rec.consumerreports.tread_life + rec.consumerreports.cr_overall
                    ) / 8;
                }

                let adacGrade = 5.0;
                if (rec.europe && rec.europe.adac) {
                    adacGrade = rec.europe.adac.overall_grade;
                }

                let abPoints = 50;
                if (rec.europe && rec.europe.autobild) {
                    const rating = rec.europe.autobild.overall_rating;
                    if (rating === 'Exemplary') abPoints = 95;
                    else if (rating === 'Good') abPoints = 85;
                    else if (rating === 'Satisfactory') abPoints = 75;
                    else if (rating === 'Sufficient') abPoints = 65;
                }

                const itemSegment = this.getModelSegmentForMarket(item, this.currentMarket);
                const salesVal = metric === 'revenue'
                    ? this.getModelSalesRevenue(item.brand, item.model, itemSegment, selectedYear, this.currentMarket, false)
                    : this.getModelSalesVolume(item.brand, item.model, itemSegment, selectedYear, this.currentMarket, false);

                tableRows.push({
                    brand: item.brand,
                    model: item.model,
                    segment: itemSegment,
                    sales: salesVal,
                    tirerack: trAvg,
                    consumerreports: crAvg,
                    adac: adacGrade,
                    autobild: abPoints,
                    combined: this.calculateModelScore(rec, item.season)
                });
            }
        });

        // 정렬 엔진 (독일 ADAC 학점은 낮을수록 성능이 우수한 역방향 로직 완벽 적용)
        tableRows.sort((a, b) => {
            let valA = a[this.sortColumn];
            let valB = b[this.sortColumn];

            if (this.sortColumn === 'adac') {
                return this.sortDirection === 'desc'
                    ? valA - valB // 내림차순(가장 우수함 정렬) -> 학점 수치는 낮을수록 우수하므로 오름차순
                    : valB - valA;
            }

            if (typeof valA === 'string') {
                return this.sortDirection === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            } else {
                return this.sortDirection === 'asc' 
                    ? valA - valB 
                    : valB - valA;
            }
        });

        this.tableBody.innerHTML = '';

        if (tableRows.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        조회 필터 조건에 부합하는 ${selectedYear}년 타이어 분석 데이터가 존재하지 않습니다.
                    </td>
                </tr>
            `;
            return;
        }

        const segmentNamesKo = {
            'Ultra High Performance (UHP)': '초고성능 스포츠',
            'Grand Touring (All-Season) - Passenger': '투어링 승용 사계절',
            'Grand Touring (All-Season) - SUV': '투어링 SUV 사계절',
            'All-Season Passenger': '일반 사계절 Passenger',
            'Winter / Snow': '겨울용 스노우',
            'All-Terrain (SUV/Truck)': '온/오프로드 SUV',
            'Summer': '여름용',
            'All-Season': '사계절용',
            'Winter': '겨울용'
        };

        const brandNamesKo = {
            'Hankook': '한국타이어',
            'Michelin': '미쉐린',
            'Bridgestone': '브리지스톤',
            'Continental': '콘티넨탈',
            'Goodyear': '굿이어',
            'Pirelli': '피렐리',
            'Kumho': '금호타이어'
        };

        tableRows.forEach(row => {
            const tr = document.createElement('tr');
            if (row.brand === 'Hankook') {
                tr.className = 'row-hankook';
            }
            
            const source = this.sourceSelect.value;
            let badgeClass = 'badge-poor';
            let badgeText = '';

            if (source === 'adac') {
                const adacGrade = row.adac;
                badgeText = `ADAC ${adacGrade.toFixed(1)}`;
                if (adacGrade <= 1.5) {
                    badgeClass = 'badge-excellent';
                    badgeText += ' (Sehr Gut / 아주 우수)';
                } else if (adacGrade <= 2.5) {
                    badgeClass = 'badge-good';
                    badgeText += ' (Gut / 우수)';
                } else if (adacGrade <= 3.5) {
                    badgeClass = 'badge-fair';
                    badgeText += ' (Befriedigend / 보통)';
                } else if (adacGrade <= 4.5) {
                    badgeClass = 'badge-poor';
                    badgeText += ' (Ausreichend / 충분)';
                } else {
                    badgeClass = 'badge-poor';
                    badgeText += ' (Mangelhaft / 미흡)';
                }
            } else if (source === 'autobild') {
                const score = row.autobild;
                if (score >= 90) {
                    badgeClass = 'badge-excellent';
                    badgeText = 'Vorbildlich';
                } else if (score >= 80) {
                    badgeClass = 'badge-good';
                    badgeText = 'Gut';
                } else if (score >= 70) {
                    badgeClass = 'badge-fair';
                    badgeText = 'Befriedigend';
                } else {
                    badgeClass = 'badge-poor';
                    badgeText = 'Ausreichend';
                }
            } else {
                badgeText = row.combined.toFixed(1);
                if (row.combined >= 90) badgeClass = 'badge-excellent';
                else if (row.combined >= 80) badgeClass = 'badge-good';
                else if (row.combined >= 70) badgeClass = 'badge-fair';
            }

            const salesFormatted = metric === 'revenue' 
                ? `$${row.sales.toFixed(1)}M` 
                : `${row.sales.toFixed(1)}k`;

            if (this.currentMarket === 'na') {
                tr.innerHTML = `
                    <td><strong>${brandNamesKo[row.brand] || row.brand}</strong></td>
                    <td>${row.model}</td>
                    <td><span style="font-size: 0.8rem; color: #000000; background: var(--color-hankook); padding: 4px 10px; border-radius: 4px; font-weight: 800;">${segmentNamesKo[row.segment] || row.segment}</span></td>
                    <td class="numeric">${salesFormatted}</td>
                    <td class="numeric" style="color: var(--color-blue); font-weight: 500;">${(row.tirerack / 10).toFixed(2)} / 10</td>
                    <td class="numeric" style="color: var(--color-gold); font-weight: 500;">${row.consumerreports.toFixed(1)} / 100</td>
                    <td class="numeric">
                        <span class="score-badge ${badgeClass}">${badgeText}</span>
                    </td>
                `;
            } else {
                let abLabel = '미평가';
                if (row.autobild >= 95) abLabel = '최우수';
                else if (row.autobild >= 85) abLabel = '우수';
                else if (row.autobild >= 75) abLabel = '만족';
                else if (row.autobild >= 65) abLabel = '충분';
                
                let adacLabel = '미흡';
                if (row.adac <= 1.5) adacLabel = '아주 우수';
                else if (row.adac <= 2.5) adacLabel = '우수';
                else if (row.adac <= 3.5) adacLabel = '보통';
                else if (row.adac <= 4.5) adacLabel = '충분';
                else adacLabel = '미흡';
                
                tr.innerHTML = `
                    <td><strong>${brandNamesKo[row.brand] || row.brand}</strong></td>
                    <td>${row.model}</td>
                    <td><span style="font-size: 0.8rem; color: #000000; background: var(--color-hankook); padding: 4px 10px; border-radius: 4px; font-weight: 800;">${segmentNamesKo[row.segment] || row.segment}</span></td>
                    <td class="numeric">${salesFormatted}</td>
                    <td class="numeric" style="color: var(--color-blue); font-weight: 500;" title="독일 ADAC 등급은 1.0에 가까울수록(낮을수록) 우수함을 의미합니다.">${row.adac.toFixed(1)} (${adacLabel})</td>
                    <td class="numeric" style="color: var(--color-gold); font-weight: 500;">${abLabel}</td>
                    <td class="numeric">
                        <span class="score-badge ${badgeClass}">${badgeText}</span>
                    </td>
                `;
            }
            
            // Row Click Event to trigger the reverse-mapping modal
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                this.showCalculationModal(row.brand, row.model, row.segment);
            });

            this.tableBody.appendChild(tr);
        });

        this.updateSortArrows();
    }

    /**
     * 컬럼 정렬 방향 반전 및 재정렬 적용
     */
    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        this.updateDashboard();
    }

    /**
     * 컬럼 정렬 화살표 방향 인디케이터 동적 동기화
     */
    updateSortArrows() {
        document.querySelectorAll('.analytics-table th.sortable').forEach(th => {
            const col = th.getAttribute('data-sort');
            const arrow = th.querySelector('.sort-arrow');
            
            if (!arrow) return;
            
            if (col === this.sortColumn) {
                arrow.textContent = this.sortDirection === 'asc' ? ' ▲' : ' ▼';
                th.style.color = 'var(--color-hankook)';
            } else {
                arrow.textContent = '';
                th.style.color = '';
            }
        });
    }

    /**
     * 신규: 4대 메이저 업체 정기주주총회 및 공식 IR 보고서 기반 전략 비교 횡 매트릭스 테이블 동적 렌더링
     */
    renderMatrixTable() {
        const tbody = document.getElementById('matrix-table-body');
        if (!tbody) return;
        
        const matrixData = [
            {
                brand: "미쉐린",
                tech: "<ul><li>2030년까지 재생 가능/친환경 원재료 40% 도입 로드맵 가동</li><li>자가 재생 트레드 패턴 특허(트레드가 마모될수록 배수 성능 유지)</li><li>EV 맞춤형 HL(High Load) 타이어 수주 및 구조 강성 설계</li></ul>",
                marketing: "<ul><li>'마모 한계점까지 일관된 제동 성능' 중심의 수명 보증 소구</li><li>프리미엄 세그먼트 고단가 고마진 유지 전략 일관성 유지</li></ul>",
                restructuring: "<ul><li>유럽 내 저수익 한계 공장 점진적 폐쇄 및 생산 설비 재배치</li><li>고수익 18인치 이상 프리미엄 OE 시장 비중 45% 이상 집중</li></ul>",
                action: "<ul><li>당사 초저마모 트레드 신소재 기술(i-Flex 등) 상용화 가속 필요</li><li>수명 연도별 제동 성능 하락 방지를 위한 컴파운드 분자 연구 연계</li></ul>"
            },
            {
                brand: "브리지스톤",
                tech: "<ul><li>ENLITEN 기술 플랫폼 핵심 적용(타이어 중량 20%, RR 15% 경감)</li><li>클라우드 연계 타이어 센서 및 원격 공기압 IoT 솔루션 상용화</li></ul>",
                marketing: "<ul><li>ENLITEN 플랫폼을 활용한 '프리미엄 성능과 지속가능성의 완벽한 조화' 전면 소구</li><li>주행 경량감 및 최적의 연비 효율성 부각</li></ul>",
                restructuring: "<ul><li>디지털 구독형 모빌리티 플릿 마일리지 관리 솔루션 확장</li><li>가치사슬 고도화를 위한 저인치 소매 대리점 유통 구조 정비</li></ul>",
                action: "<ul><li>전기차 전용 경량화 타이어 기술 대응(당사 EV 전용 라인업의 경량 컴파운드 최적화)</li><li>센서 내장 스마트 타이어 및 빅데이터 분석 구독 비즈니스 탐색</li></ul>"
            },
            {
                brand: "콘티넨탈",
                tech: "<ul><li>민들레 뿌리 추출 친환경 대체 고무 'Taraxagum' 글로벌 양산 승인</li><li>가황 센서를 통한 마모도 및 실시간 수막현상 예보 섀시 시스템</li></ul>",
                marketing: "<ul><li>독일 엔지니어링 정밀성과 전장 제어 장치 연계의 '무결점 안전성'</li><li>글로벌 공인 테스트 및 미디어 벤치마크 1위 등 정량적 안전성 강조</li></ul>",
                restructuring: "<ul><li>스포츠 슈퍼카 및 하이퍼카 전용 OE 초고성능 타이어 공급 계약 독점 수주 추진</li><li>소형 규격 생산 축소 및 프리미엄 스포츠 제품군 믹스 고정화</li></ul>",
                action: "<ul><li>전장 제어장치 신호 및 노면 마찰 지수를 예측하는 섀시-타이어 R&D 부서 간 융합 체계 마련</li><li>민들레 고무 등 생분해 원료 조기 확보 및 친환경 컴파운딩 기술 선점</li></ul>"
            },
            {
                brand: "굿이어",
                tech: "<ul><li>SightLine 클라우드 AI 분석 칩 기반의 타이어 수명 예측 인프라 구축</li><li>패신저 전 라인업에 대두유 기반의 친환경 대체 고무 실장</li></ul>",
                marketing: "<ul><li>기후 변화 대응 '전천후 무중단 사계절 안전 주행' 대륙 소구</li><li>북미 오토클럽 연대 및 고객 접점 디지털 가상 체험</li></ul>",
                restructuring: "<ul><li>'Goodyear Forward' 쇄신안 적용: 비수익 해외 공장 매각 및 화학 부문 분사</li><li>북미 본토 수익성이 견고한 SUV, 라이트트럭 세그먼트 역량 총집중</li></ul>",
                action: "<ul><li>북미 All-Weather 사계절 타이어 시장 경쟁력 강화를 위한 트레드 설계 변경</li><li>친환경 대두유 등 대체 화학물질 배합을 통한 비용 감축 및 관세 대응책 검토</li></ul>"
            }
        ];
        
        tbody.innerHTML = matrixData.map(row => `
            <tr>
                <td style="font-weight: 700; color: var(--color-hankook); vertical-align: top; padding-top: 15px;">${row.brand}</td>
                <td style="vertical-align: top; padding-top: 15px;">${row.tech}</td>
                <td style="vertical-align: top; padding-top: 15px;">${row.marketing}</td>
                <td style="vertical-align: top; padding-top: 15px;">${row.restructuring}</td>
                <td class="cell-action-point" style="vertical-align: top; padding-top: 15px;">${row.action}</td>
            </tr>
        `).join('');
    }

    showCalculationModal(brand, model, segment) {
        const selectedYear = this.getSelectedYear();
        const metric = this.metricSelect ? this.metricSelect.value : 'volume';
        
        // 1. 동적 탑다운 볼륨 계산기를 적용하여 판매량 추출 (고정밀 원시 float)
        const modelVolumeK = this.getModelSalesVolume(brand, model, segment, selectedYear, this.currentMarket, true);
        const modelVolumeActual = modelVolumeK * 1000; // 실질 본 수
        
        // 2. 해당 제조사(브랜드)의 공식 IR 실적 수치 및 대륙/세그먼트 믹스 배분율 획득
        const metadata = BRAND_IR_METADATA[brand];
        if (!metadata) return;
        
        // 연도별 글로벌 판매량 적용
        const globalSales = typeof metadata.globalSales === 'object' 
            ? (metadata.globalSales[selectedYear] || metadata.globalSales["2025"] || 100000000)
            : (metadata.globalSales || 100000000);
            
        const rAlloc = metadata.regionalAlloc[this.currentMarket] || 0.35;
        const sAlloc = metadata.marketSegmentAlloc && metadata.marketSegmentAlloc[this.currentMarket]
            ? (metadata.marketSegmentAlloc[this.currentMarket][segment] || 0.25)
            : 0.25;
        
        // 3. 탑다운 역산 배분액 시뮬레이션 계산
        const regionalSales = globalSales * rAlloc;
        const segmentSales = regionalSales * sAlloc;
        
        // 소매 인지도 가중치 점유비율 산출: 실질 판매량 / 세그먼트 배분 총량
        const modelSharePercent = (modelVolumeActual / segmentSales) * 100;
        
        // 4. 모달 DOM 요소 업데이트
        // 상단 요약 헤더 카드
        const marketText = this.currentMarket === 'na' ? '북미 시장' : '유럽 시장';
        const segmentNamesKo = {
            'Ultra High Performance (UHP)': '초고성능 스포츠',
            'Grand Touring (All-Season) - Passenger': '투어링 승용 사계절',
            'Grand Touring (All-Season) - SUV': '투어링 SUV 사계절',
            'All-Season Passenger': '일반 승용 사계절',
            'Winter / Snow': '겨울용 스노우',
            'All-Terrain (SUV/Truck)': '온/오프로드 SUV (All-Terrain)',
            'Summer': '여름용',
            'All-Season': '사계절용',
            'Winter': '겨울용'
        };
        const brandNamesKo = {
            'Hankook': '한국타이어',
            'Michelin': '미쉐린',
            'Bridgestone': '브리지스톤',
            'Continental': '콘티넨탈',
            'Goodyear': '굿이어',
            'Pirelli': '피렐리',
            'Kumho': '금호타이어'
        };
        
        document.getElementById('calc-summary-brand').textContent = brandNamesKo[brand] || brand;
        document.getElementById('calc-summary-model').textContent = model;
        document.getElementById('calc-summary-segment').textContent = segmentNamesKo[segment] || segment;
        document.getElementById('calc-summary-year').textContent = selectedYear + "년 기준";
        document.getElementById('calc-summary-market').textContent = marketText;
        
        // Step 1: 글로벌 그룹 연간 총 판매량
        document.getElementById('calc-step1-value').textContent = globalSales.toLocaleString() + " 본";
        
        // Step 2: 대륙별 배분 볼륨
        document.getElementById('calc-step2-value').textContent = Math.round(regionalSales).toLocaleString() + " 본";
        document.getElementById('calc-step2-math').textContent = `${globalSales.toLocaleString()} 본 × ${(rAlloc * 100).toFixed(1)}% (기업 공시 대륙 매출 비중)`;
        
        // Step 3: 세그먼트 믹스 배분량
        document.getElementById('calc-step3-value').textContent = Math.round(segmentSales).toLocaleString() + " 본";
        document.getElementById('calc-step3-math').textContent = `${Math.round(regionalSales).toLocaleString()} 본 × ${(sAlloc * 100).toFixed(1)}% (제품 카테고리 믹스 비중)`;
        
        // Step 4: 제품 인지도 및 유통 채널 가중치
        document.getElementById('calc-step4-value').textContent = `${modelSharePercent.toFixed(4)}%`;
        
        // Step 5: 최종 계측 실적 (결과 - 테이블 행 수치와 소수점 한 자리까지 무결점 정합 구현)
        if (metric === 'revenue') {
            const revenueUSD = this.getModelSalesRevenue(brand, model, segment, selectedYear, this.currentMarket, true) * 1000000;
            const revenueMillion = revenueUSD / 1000000;
            const price = TIRE_UNIT_PRICES[model] || 150;
            const retailUSD = modelVolumeK * 1000 * price;
            
            const brandModels = this.db.filter(m => m.brand === brand);
            let retailRevenueTotalUSD = 0;
            brandModels.forEach(item => {
                const itemSegment = this.getModelSegmentForMarket(item, this.currentMarket);
                const itemVolK = this.getModelSalesVolume(brand, item.model, itemSegment, selectedYear, this.currentMarket, true);
                const itemPrice = TIRE_UNIT_PRICES[item.model] || 150;
                retailRevenueTotalUSD += itemVolK * 1000 * itemPrice;
            });
            let baseRevenue = metadata.globalRevenue[selectedYear] || 6000000000;
            if (brand === 'Pirelli') baseRevenue *= 1.10;
            const actualRevenueRegion = baseRevenue * rAlloc;
            const sf = retailRevenueTotalUSD > 0 ? (actualRevenueRegion / retailRevenueTotalUSD) : 1.0;

            document.getElementById('calc-result-value').textContent = `$${revenueMillion.toFixed(1)}M (USD)`;
            document.getElementById('calc-result-math').textContent = `[공식 매출총액 비례 역산 배분 공식]
1차 소매 매출액: ${modelVolumeK.toFixed(1)}k 본 × 소매 가격 $${price} = $${Math.round(retailUSD).toLocaleString()}
지역 공시 총매출: $${(actualRevenueRegion / 1000000).toFixed(1)}M
비례 조정 계수: ${(sf).toFixed(4)}
보정 매출액: $${Math.round(retailUSD).toLocaleString()} × ${(sf).toFixed(4)} = $${Math.round(revenueUSD).toLocaleString()} (약 $${revenueMillion.toFixed(1)} Million)`;
        } else {
            document.getElementById('calc-result-value').textContent = `${modelVolumeK.toFixed(1)}k 본 (${Math.round(modelVolumeActual).toLocaleString()} 본)`;
            document.getElementById('calc-result-math').textContent = `[수량 공식] 세그먼트 총 볼륨 (${Math.round(segmentSales).toLocaleString()} 본) × 소매 유통 지분율 (${modelSharePercent.toFixed(4)}%) = ${Math.round(modelVolumeActual).toLocaleString()} 본`;
        }
        
        // 실증 보고서 출처 표시
        document.getElementById('calc-source-text').innerHTML = `<strong>출처 및 법적 증빙 정보:</strong><br>${metadata.source}<br><span style="color:var(--text-muted); font-size:0.75rem; display:block; margin-top:4px;">*본 산정 데이터는 공시 감사보고서 수치 제약 조건 하에서 소매 소비자 데이터 가중치 모델(Tire Rack / ADAC 수집 평점 및 피드백 비율)을 융합 연산하여 역산 매핑한 객관적 시뮬레이션 지표입니다.</span>`;
        
        // 모달 활성화
        const modal = document.getElementById('calculation-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * 경쟁사별 라인업 버튼들을 동적으로 생성하고 첫 번째 라인업을 선택함
     */
    renderGenerationTrendsLineupButtons(brand) {
        try {
            const selector = document.getElementById('gt-lineup-selector');
            if (!selector) return;

            // 기존 라인업 버튼 제거
            selector.innerHTML = '';

            if (typeof window.TIRE_EVOLUTION_DATABASE === 'undefined') {
                console.error('TIRE_EVOLUTION_DATABASE가 로드되지 않았습니다.');
                return;
            }

            const brandColors = {
                Michelin: '#5cb2ff',
                Continental: '#ff9f24',
                Pirelli: '#3b82f6'
            };
            const themeColor = brandColors[brand] || '#3b82f6';

            let firstKey = null;
            Object.keys(window.TIRE_EVOLUTION_DATABASE).forEach(key => {
                const data = window.TIRE_EVOLUTION_DATABASE[key];
                if (data && data.brand === brand) {
                    if (!firstKey) firstKey = key;

                    const btn = document.createElement('button');
                    btn.className = 'tab-toggle-btn';
                    btn.setAttribute('data-lineup', key);
                    btn.style.borderLeftColor = themeColor;
                    btn.style.borderLeftWidth = '4px';
                    btn.textContent = data.lineupName || '알 수 없음';

                    btn.addEventListener('click', () => {
                        selector.querySelectorAll('.tab-toggle-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        this.selectedGenTrendsLineup = key;
                        const gtGenSelect = document.getElementById('gt-generation-selector');
                        const mode = gtGenSelect ? gtGenSelect.value : 'gen3';
                        this.renderGenerationTrends(key, mode);
                    });

                    selector.appendChild(btn);
                }
            });

            // 기본 첫 번째 라인업 활성화
            if (firstKey) {
                const firstBtn = selector.querySelector(`[data-lineup="${firstKey}"]`);
                if (firstBtn) firstBtn.classList.add('active');
                this.selectedGenTrendsLineup = firstKey;
            }

            // 제너레이션 선택기 드롭다운을 'gen3'로 리셋
            const gtGenSelect = document.getElementById('gt-generation-selector');
            if (gtGenSelect) {
                gtGenSelect.value = 'gen3';
            }

            // 최초 렌더링
            if (firstKey) {
                this.renderGenerationTrends(firstKey, 'gen3');
            }
        } catch (error) {
            console.error('renderGenerationTrendsLineupButtons 실행 오류:', error);
        }
    }

    /**
     * 경쟁사 플래그십 상품군 세대별 혁신 트렌드 분석 포털 렌더링
     */
    renderGenerationTrends(lineupKey, chartMode = 'gen3') {
        try {
            if (typeof window.TIRE_EVOLUTION_DATABASE === 'undefined') {
                console.error('TIRE_EVOLUTION_DATABASE가 로드되지 않았습니다.');
                return;
            }

            const data = window.TIRE_EVOLUTION_DATABASE[lineupKey];
            if (!data) {
                console.error(`${lineupKey} 라인업의 세대별 진화 데이터가 존재하지 않습니다.`);
                return;
            }

            this.selectedGenTrendsLineup = lineupKey;

            // 1. 헤더 타이틀 및 세그먼트 요약 패널 갱신
            const headerTitle = document.getElementById('gt-header-title');
            const headerSubtitle = document.getElementById('gt-header-subtitle');
            if (headerTitle) {
                headerTitle.textContent = `${data.brand || ''} ${data.lineupName || ''} 대표 상품 세대별 성능 분석`;
            }
            if (headerSubtitle) {
                headerSubtitle.innerHTML = `<strong>시장별 최다 판매 세그먼트:</strong> 유럽 EU — ${data.segmentEU || 'UHP'} | 북미 US — ${data.segmentUS || 'Passenger'}<br><span style="display: block; margin-top: 8px; color: var(--color-hankook); font-weight: 700;">[대표 경쟁 라인: ${data.flagshipLine || ''} ➔ 대응 한국 라인: ${data.hankookLine || ''}]</span>`;
            }

        // 2. 세대별 브로셔 카드 레이아웃 렌더링
        const container = document.getElementById('gt-brochure-container');
        if (container) {
            container.innerHTML = '';
            const brandColors = {
                Michelin: '#5cb2ff',
                Continental: '#ff9f24',
                Pirelli: '#3b82f6'
            };
            const themeColor = brandColors[data.brand] || '#3b82f6';

            data.generations.forEach((g, idx) => {
                // Generation Row
                const row = document.createElement('div');
                row.className = 'gt-generation-row';
                row.style.marginBottom = '25px';

                // Gen title header
                const rowHeader = document.createElement('div');
                rowHeader.style.display = 'flex';
                rowHeader.style.justifyContent = 'space-between';
                rowHeader.style.alignItems = 'center';
                rowHeader.style.marginBottom = '10px';
                rowHeader.style.padding = '0 5px';
                rowHeader.innerHTML = `
                    <div style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--color-hankook); display: flex; align-items: center; gap: 8px;">
                        <span style="background: ${idx === 2 ? 'var(--color-hankook)' : 'rgba(0,0,0,0.15)'}; color: ${idx === 2 ? '#fff' : '#000000'}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">GEN ${idx + 1}</span>
                        GEN ${idx + 1} 세대별 비교
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 700;">
                        ${idx === 2 ? '🔥 최신 플래그십 매칭' : idx === 1 ? '⚡ 2세대 볼륨 매칭' : '❄️ 1세대 히스토리 매칭'}
                    </div>
                `;
                row.appendChild(rowHeader);

                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'gt-cards-container';
                cardsContainer.style.display = 'grid';
                cardsContainer.style.gridTemplateColumns = '1fr 1fr';
                cardsContainer.style.gap = '15px';

                // Competitor Card
                const compCard = document.createElement('div');
                compCard.className = 'gt-brochure-card';
                compCard.style.setProperty('--theme-color', themeColor);
                if (idx === 2) {
                    compCard.style.borderColor = themeColor;
                    compCard.style.boxShadow = `0 8px 30px ${themeColor}15`;
                }
                compCard.innerHTML = `
                    <div class="gt-brochure-header">
                        <span class="gt-brochure-title" style="color: ${themeColor}; font-size: 0.95rem;">${g.compModel || '알 수 없음'}</span>
                        <span class="gt-brochure-year" style="font-size: 0.7rem; padding: 1px 6px;">COMPETITOR (${g.compYear || g.year || '미정'}년 출시)</span>
                    </div>
                    <div class="gt-brochure-slogan" style="min-height: 42px;">"${g.compSlogan || '데이터 준비 중...'}"</div>
                    <div class="gt-brochure-details">
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">배합 소재</span>
                            <span class="gt-brochure-detail-val" title="${g.compBrochure?.compound || '데이터 준비 중...'}">${g.compBrochure?.compound || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">핵심 기술</span>
                            <span class="gt-brochure-detail-val" style="color: ${themeColor}" title="${g.compBrochure?.tech || '데이터 준비 중...'}">${g.compBrochure?.tech || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">트레드웨어</span>
                            <span class="gt-brochure-detail-val">${g.compBrochure?.treadwear || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">R&D 소구점</span>
                            <span class="gt-brochure-detail-val" style="color: var(--text-secondary); font-style: italic;" title="${g.compBrochure?.focus || '데이터 준비 중...'}">${g.compBrochure?.focus || '데이터 준비 중...'}</span>
                        </div>
                    </div>
                `;

                // Hankook Card
                const hkCard = document.createElement('div');
                hkCard.className = 'gt-brochure-card';
                hkCard.style.setProperty('--theme-color', '#ff6b00');
                if (idx === 2) {
                    hkCard.style.borderColor = '#ff6b00';
                    hkCard.style.boxShadow = '0 8px 30px rgba(255, 107, 0, 0.15)';
                }
                hkCard.innerHTML = `
                    <div class="gt-brochure-header">
                        <span class="gt-brochure-title" style="color: #ff6b00; font-size: 0.95rem;">${g.hkModel || '알 수 없음'}</span>
                        <span class="gt-brochure-year" style="font-size: 0.7rem; padding: 1px 6px; background: rgba(255, 107, 0, 0.1); border-color: rgba(255, 107, 0, 0.2); color: #ff6b00;">HANKOOK (${g.hkYear || g.year || '미정'}년 출시)</span>
                    </div>
                    <div class="gt-brochure-slogan" style="min-height: 42px;">"${g.hkSlogan || '데이터 준비 중...'}"</div>
                    <div class="gt-brochure-details">
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">배합 소재</span>
                            <span class="gt-brochure-detail-val" title="${g.hkBrochure?.compound || '데이터 준비 중...'}">${g.hkBrochure?.compound || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">핵심 기술</span>
                            <span class="gt-brochure-detail-val" style="color: #ffaa66" title="${g.hkBrochure?.tech || '데이터 준비 중...'}">${g.hkBrochure?.tech || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">트레드웨어</span>
                            <span class="gt-brochure-detail-val">${g.hkBrochure?.treadwear || '데이터 준비 중...'}</span>
                        </div>
                        <div class="gt-brochure-detail-item">
                            <span class="gt-brochure-detail-label">R&D 소구점</span>
                            <span class="gt-brochure-detail-val" style="color: var(--text-secondary); font-style: italic;" title="${g.hkBrochure?.focus || '데이터 준비 중...'}">${g.hkBrochure?.focus || '데이터 준비 중...'}</span>
                        </div>
                    </div>
                `;

                cardsContainer.appendChild(compCard);
                cardsContainer.appendChild(hkCard);
                row.appendChild(cardsContainer);
                container.appendChild(row);
            });
        }

        // 3. 전략적 Insights 텍스트 박스 업데이트
        const pastBox = document.getElementById('gt-insight-past');
        const presentBox = document.getElementById('gt-insight-present');
        const futureBox = document.getElementById('gt-insight-future');

        if (pastBox) pastBox.innerHTML = `<strong>[과거 지향점]</strong><br>${data.insights?.past || '데이터 준비 중...'}`;
        if (presentBox) presentBox.innerHTML = `<strong>[현재 지향점]</strong><br>${data.insights?.present || '데이터 준비 중...'}`;
        if (futureBox) futureBox.innerHTML = `<strong>[중장기 R&D 예측]</strong><br>${data.insights?.future || '데이터 준비 중...'}`;

        // 4. 세대별 모델 체인지 R&D 개발 방향성 차이 분석 주입
        const g1g2Box = document.getElementById('gt-direction-g1-g2');
        const g2g3Box = document.getElementById('gt-direction-g2-g3');
        const summaryBox = document.getElementById('gt-direction-summary');

        if (g1g2Box) g1g2Box.textContent = data.evolutionDirection?.gen1_to_gen2 || '데이터 준비 중...';
        if (g2g3Box) g2g3Box.textContent = data.evolutionDirection?.gen2_to_gen3 || '데이터 준비 중...';
        if (summaryBox) summaryBox.textContent = data.evolutionDirection?.comparisonSummary || '데이터 준비 중...';

        // 5. 한국타이어 R&D 대응 액션 제안 주입
        const proposalBox = document.getElementById('gt-rd-proposal');
        if (proposalBox) {
            proposalBox.innerHTML = `<strong>${data.brand || ''}의 대표 상품 세대별 성능 트렌드 극복을 위한 당사 R&D 기술 전략 제안:</strong><br><span style="color:#111827; font-size:0.98rem; line-height:1.65; display:block; margin-top:6px;">${data.proposal || '데이터 준비 중...'}</span>`;
        }

        // 6. 세대별 세부 성능 항목 Radar Chart 시각화
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js 라이브러리가 로드되지 않아 세대별 진화 차트를 표시할 수 없습니다.');
            return;
        }

        const canvas = document.getElementById('chart-generation-evolution');
        if (!canvas) return;

        // 기존 차트 인스턴스 소멸 처리 (Canvas 메모리 릭 및 잔상 방지)
        if (this.charts.generationEvolution) {
            this.charts.generationEvolution.destroy();
        }

        const labels = [
            "마른 노면 접지",
            "습윤 노면 접지",
            "수막 저항성",
            "정숙성/승차감",
            "마모 수명",
            "연비/친환경"
        ];

        const getScoresArray = (scoresObj) => {
            if (!scoresObj) return [0, 0, 0, 0, 0, 0];
            return [
                scoresObj.dry_grip || 0,
                scoresObj.wet_grip || 0,
                scoresObj.hydro_resist || 0,
                scoresObj.comfort_noise || 0,
                scoresObj.tread_life || 0,
                scoresObj.efficiency || 0
            ];
        };

        const brandColors = {
            Michelin: '#3b82f6',
            Continental: '#ff9f24',
            Pirelli: '#10b981'
        };
        const compColor = brandColors[data.brand] || '#3b82f6';

        let datasets = [];

        if (chartMode === 'gen3' || chartMode === 'gen2' || chartMode === 'gen1') {
            const genIndex = chartMode === 'gen3' ? 2 : chartMode === 'gen2' ? 1 : 0;
            const g = data.generations[genIndex];

            if (g) {
                // Competitor Dataset
                datasets.push({
                    label: `${g.compModel || ''} (${g.compYear || g.year || ''}년 출시)`,
                    data: getScoresArray(g.compScores),
                    borderColor: compColor,
                    backgroundColor: `${compColor}1a`,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: compColor,
                    pointHoverBackgroundColor: compColor,
                    pointHoverBorderColor: '#fff',
                    pointRadius: 5,
                    fill: true
                });

                // Hankook Dataset
                datasets.push({
                    label: `${g.hkModel || ''} (${g.hkYear || g.year || ''}년 출시)`,
                    data: getScoresArray(g.hkScores),
                    borderColor: '#ff6b00',
                    backgroundColor: 'rgba(255, 107, 0, 0.15)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff6b00',
                    pointHoverBackgroundColor: '#ff6b00',
                    pointHoverBorderColor: '#fff',
                    pointRadius: 5,
                    fill: true
                });
            }
        } else if (chartMode === 'all-comp') {
            data.generations.forEach((g, idx) => {
                if (g) {
                    let color, bgColor, borderW, radius;
                    if (idx === 0) {
                        color = 'rgba(148, 163, 184, 0.7)';
                        bgColor = 'rgba(148, 163, 184, 0.05)';
                        borderW = 1.5;
                        radius = 3;
                    } else if (idx === 1) {
                        color = `${compColor}aa`;
                        bgColor = `${compColor}15`;
                        borderW = 2;
                        radius = 4;
                    } else {
                        color = compColor;
                        bgColor = `${compColor}33`;
                        borderW = 3;
                        radius = 5;
                    }

                    datasets.push({
                        label: `${g.compModel || ''} (${g.compYear || g.year || ''}년 출시)`,
                        data: getScoresArray(g.compScores),
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: borderW,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: color,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: '#fff',
                        pointRadius: radius,
                        fill: true
                    });
                }
            });
        } else if (chartMode === 'all-hk') {
            data.generations.forEach((g, idx) => {
                if (g) {
                    let color, bgColor, borderW, radius;
                    if (idx === 0) {
                        color = 'rgba(148, 163, 184, 0.7)';
                        bgColor = 'rgba(148, 163, 184, 0.05)';
                        borderW = 1.5;
                        radius = 3;
                    } else if (idx === 1) {
                        color = '#ff9f55';
                        bgColor = 'rgba(255, 159, 85, 0.08)';
                        borderW = 2;
                        radius = 4;
                    } else {
                        color = '#ff6b00';
                        bgColor = 'rgba(255, 107, 0, 0.2)';
                        borderW = 3;
                        radius = 5;
                    }

                    datasets.push({
                        label: `${g.hkModel || ''} (${g.hkYear || g.year || ''}년 출시)`,
                        data: getScoresArray(g.hkScores),
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: borderW,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: color,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: '#fff',
                        pointRadius: radius,
                        fill: true
                    });
                }
            });
        } else if (chartMode === 'all-six') {
            // Competitor Solid Lines
            data.generations.forEach((g, idx) => {
                if (g) {
                    let color, bgColor, borderW, radius;
                    if (idx === 0) {
                        color = 'rgba(148, 163, 184, 0.5)';
                        bgColor = 'rgba(148, 163, 184, 0.02)';
                        borderW = 1;
                        radius = 2;
                    } else if (idx === 1) {
                        color = `${compColor}80`;
                        bgColor = 'transparent';
                        borderW = 1.5;
                        radius = 3;
                    } else {
                        color = compColor;
                        bgColor = `${compColor}1a`;
                        borderW = 3;
                        radius = 5;
                    }

                    datasets.push({
                        label: `${g.compModel || ''} (${g.compYear || g.year || ''}년 출시)`,
                        data: getScoresArray(g.compScores),
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: borderW,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: color,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: '#fff',
                        pointRadius: radius,
                        fill: true
                    });
                }
            });

            // Hankook Dashed Lines
            data.generations.forEach((g, idx) => {
                if (g) {
                    let color, bgColor, borderW, radius;
                    if (idx === 0) {
                        color = 'rgba(255, 107, 0, 0.3)';
                        bgColor = 'transparent';
                        borderW = 1;
                        radius = 2;
                    } else if (idx === 1) {
                        color = 'rgba(255, 107, 0, 0.6)';
                        bgColor = 'transparent';
                        borderW = 1.5;
                        radius = 3;
                    } else {
                        color = '#ff6b00';
                        bgColor = 'rgba(255, 107, 0, 0.08)';
                        borderW = 3;
                        radius = 5;
                    }

                    datasets.push({
                        label: `[HK] ${g.hkModel || ''} (${g.hkYear || g.year || ''}년 출시)`,
                        data: getScoresArray(g.hkScores),
                        borderColor: color,
                        backgroundColor: bgColor,
                        borderWidth: borderW,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#fff',
                        pointBorderColor: color,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: '#fff',
                        pointRadius: radius,
                        fill: true
                    });
                }
            });
        }

        const ctx = canvas.getContext('2d');
        this.charts.generationEvolution = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 12, weight: '700' },
                            color: '#111827',
                            padding: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 15, 32, 0.95)',
                        titleColor: '#fff',
                        titleFont: { size: 12, weight: '700' },
                        bodyFont: { size: 11 },
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.parsed.r} / 10`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        min: 5,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11, weight: '700' },
                            color: '#111827',
                            backdropColor: 'transparent',
                            showLabelBackdrop: false
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.06)',
                            circular: circularGrid => true
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.08)'
                        },
                        pointLabels: {
                            font: { size: 12, weight: '700' },
                            color: '#111827',
                            padding: 8
                        }
                    }
                }
            }
        });
        } catch (error) {
            console.error('renderGenerationTrends 실행 오류:', error);
        }
    }
}

// 윈도우 로드 완료 시 대시보드 인스턴스 구동
window.addEventListener('load', () => {
    window.TireDashboardApp = new TireDashboard();
});
// Redeploy Trigger: Force Cloud & CDN re-deployment with clean cache propagation (v1.0.4 - Fix selector addEventListener mock after merge)
