/**
 * BM-Intelligence Hub Portal v3.1
 * AI-Driven R&D Product Strategy & Capex Investment Controller
 * 
 * This controller intercepts user prompts or template clicks, runs a multi-step high-fidelity simulation,
 * dynamically references actual benchmarking reports (PLC_DATA.reports), calculates segment PLCs,
 * performs gap analysis against current tire performance databases (TIRE_DATABASE), and proposes
 * actionable R&D directions, Capex equipment investments, SKU settings, and target labeling grades.
 */

(function () {
  // Global radar chart instance holder
  let strategyRadarChart = null;

  // Strategic Datasets for 3 Main Scenarios
  const STRATEGY_DATABASE = {
    k137: {
      id: 'k137',
      tireName: 'Ventus S1 evo4 (K137) 후속 R&D 전략',
      currentModel: 'Ventus S1 evo4 (K137)',
      segmentName: '초고성능 여름용 스포츠 플래그십 (UHP Summer Max Performance)',
      targetMarket: '글로벌 초고성능 프리미엄 스포츠 세단, 고출력 친환경 쿠페 및 정통 스포츠카',
      competitorName: 'MICHELIN Pilot Sport 5',
      nextCompetitorName: 'MICHELIN Pilot Sport 6 (차세대)',
      avgPlcYears: 5.8, // Summer UHP average lifespan
      compCurrentLaunchYear: 2022, // MICHELIN PS5 launched in early 2022
      targetLaunchQuarter: '2028 Q1 전격 출시 예상',
      targetLaunchCalc: '경쟁사 UHP 여름용 플래그십 모델 출시 연도(2022) + 여름용 세그먼트 가중 평균 PLC(5.8년) 기반, 차세대 PS6의 2027년 하반기~2028년 초 유럽 전격 출시 주기에 맞춰 후속 모델을 적기 공급하고 OE 신규 수주 선제 선점 목표 설계',
      totalCapex: '₩42,000,000,000 (420억 원)',
      priorityFocusText: '본 세그먼트(UHP Summer)의 최우선 R&D 타겟은 [마른 노면 한계 그립(Dry Grip) 극대화 및 고속 코너링 조종 응답력(Handling Response)]입니다. 초고속 주행 및 급격한 제동 시 고온 슬립 상태에서도 트레드 고무 고강도 결합막이 노면에 강력 정착되어 코너링 마찰 임계점을 극대화하는 것이 최대 핵심 과제입니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'UHP Summer Max Sport', icon: 'fa-sun' },
        { label: '경쟁사 차세대 출시일', value: '2028 Q1 (PLC 5.8년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 PS6 (PS5 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: A / RR: B / Noise: 69dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: 한계 Dry Grip & 조종응답성</small>', icon: 'fa-gauge-high' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩42B (420억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '글로벌 초고성능 세단 및 전기 스포츠카 세그먼트 강화', text: '내연기관 고출력 세단뿐 아니라 고하중 고토크의 전동화 스포츠 프리미엄 차종이 확대되면서, 여름철 마른 노면 극한 핸들링과 급격한 코너링에서 차체를 완벽 구속할 Max Performance 성능 확보가 필연적입니다.' },
        { title: 'EU 라벨링 규제 장벽 선제 돌파 및 수출 동력 확보', text: '유럽 시장 OE 진입 및 RE 리테일 판매 확대를 위해 최고 권위의 젖은 노면 제동(Wet Grip) A등급과 우수한 회전저항(RRC) B등급의 trade-off를 나노 원료 레벨에서 극복해야 R&D 경쟁력이 성립합니다.' },
        { title: '자사 기존 K137 모델의 한계점 극복', text: '현행 Ventus S1 evo4 K137 모델은 경쟁사 대비 마모 수명(UTQG 340)과 정숙성에서 극찬을 받고 있으나, 초고속 서킷 주행 및 급격한 제동 시의 한계 그립력(Dry Grip) 부문에서 경쟁 최고 사양인 미쉐린 PS5 대비 보완 마진이 발견되어 이를 보강합니다.' }
      ],
      refReports: [
        { id: 18, title: 'Goodyear Summer Sport ULRR(Eagle F1 Asymmetric 6) 상품 분석 결과', docNo: '57049336-B0-HQ25-00037', drafter: '김상현', date: '2025.09.12', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250912152436BF68627618820F4949258D03002331DF?opendocument%26popup=1' },
        { id: 21, title: 'Michelin Summer Super Sport Segment 신제품 "Pilot Sport S 5" 1차 Benchmarking 분석 결과', docNo: '57049336-B0-HQ25-00021', drafter: '이현규 (New Technology Benchmarking Project)', date: '2025.08.14', link: '#' },
        { id: 15, title: 'Continental 차세대 Premium Summer Sport "SportContact 8" 선행 기술 분석 보고', docNo: '57049336-B0-HQ25-00015', drafter: '박민우 (New Technology Benchmarking Project)', date: '2025.06.20', link: '#' },
        { id: 109, title: 'Michelin Premium Summer Sport 신제품 (Pilot Sport 5) Benchmarking 분석 보고서', docNo: '57049336-B0-HQ24-00109', drafter: '김지훈 (New Technology Benchmarking Project)', date: '2024.11.05', link: '#' },
        { id: 88, title: '자사 Ventus S1 evo4 K137 글로벌 평가단 실차 성능 평가 종합 보고서', docNo: '57049336-B0-HQ24-00088', drafter: '최정석 (New Technology Benchmarking Project)', date: '2024.08.12', link: '#' }
      ],
      chartData: {
        labels: ['Dry Grip', 'Wet Grip', 'Hydroplaning', 'Handling Response', 'Comfort', 'Wear Life (Treadwear)'],
        currentHK: [9.4, 9.1, 8.7, 9.2, 8.8, 8.9],
        competitorCurrent: [9.6, 9.4, 8.8, 9.5, 8.6, 8.2],
        targetNext: [9.7, 9.6, 9.0, 9.7, 8.9, 8.6]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '자사 중앙연구소 실차 테스트 결과 및 외부 인증 기관(TÜV SÜD, Auto Bild)의 미쉐린 PS5 벤치마킹 데이터를 정량적 물성 스케일링 기법(10점 만점)으로 정규화하여 산출한 수치입니다.',
        details: [
          { name: '자사 현행 평점', text: 'K137 규격별 실차 핸들링 평가(Dry/Wet Handling) 및 고속 서킷 한계 접지 슬립각 계측 데이터를 10점 만점 척도로 선형 변환.' },
          { name: '경쟁사 현행 평점', text: 'Auto Bild Summer Test 최신 벤치마킹 데이터 및 자사 R&D 센터 역설계(Reverse Engineering)를 통한 트레드 강성 및 분자 밀도 물리적 계측 데이터 대조 반영.' },
          { name: '자사 차세대 R&D 목표', text: '경쟁 현행 PS5 대비 물리 한계 그립(Dry Grip) +0.1점 우위 타겟팅 및 젖은 노면 제동(Wet Grip) 동등 이상 확보를 위한 R&D 목표 시뮬레이션 최적치.' }
        ]
      },
      gaps: [
        { name: 'Dry Grip (마른 노면 한계 마찰력)', current: 9.4, target: 9.7, percent: -3.1, level: 'Warning', desc: '자사 차세대 R&D 목표 성능 대비 -3.1% 갭입니다. 고속 서킷 주행 및 한계 구동 시 노면 밀착을 보강하기 위해 나노 고활성 카본 블랙 고 전단 혼련 분산 기술(High-Shear Dispersion Mixing)이 절실합니다.' },
        { name: 'Wet Grip (빗길 수막 제동 마찰력)', current: 9.1, target: 9.6, percent: -5.2, level: 'Warning', desc: '자사 차세대 R&D 목표 성능 대비 -5.2% 갭입니다. 극성 친수 작용기를 다량 중합한 특화 고무 폴리머 및 고배합 85% 고상 친수 실리카 기용이 요구됩니다.' },
        { name: 'Handling Response (조종 응답력 및 필러)', current: 9.2, target: 9.7, percent: -5.1, level: 'Warning', desc: '자사 차세대 R&D 목표 성능 대비 -5.1% 갭입니다. 타이어 고부하 부풀림을 방어할 고강도 나일론-아라미드 하이브리드 보강 코드인 아랄론 풀밴드 권선 공법이 긴급 탑재되어야 합니다.' },
        { name: 'Wear Life (트레드 마모 수명)', current: 8.9, target: 8.6, percent: 3.5, level: 'Success', desc: '자사의 독점적 AI 최적화 편평 접지 기술 덕에, 차세대 R&D 목표 마모 수명 타겟 대비 오히려 3.5%의 강력한 기술적 마진을 입증하고 있습니다.' }
      ],
      skuStrategy: {
        rims: '18인치 ~ 22인치 고인치 세그먼트 전격 집중 (19인치 이상 비중 78% 이상 목표)',
        ratio: '40% OE (Mercedes-AMG, BMW M, Porsche 등 수입 프리미엄 고출력 OE 수주 타겟) / 60% RE',
        sizes: '245/45R18, 245/40R19, 275/35R19, 245/35R20, 275/30R20, 245/35R21, 285/30R21 (전후륜 Staggered 규격 대응 완벽 커버)',
        desc: '유럽 프리미엄 스포츠 모델 및 튜닝 시장의 수요를 충당하기 위해 초편평비(30~45 시리즈) 및 광폭(225~315mm) 중심의 80여 개 하이엔드 볼륨 규격을 선제 공급함. 고성능 HEV/PHEV를 포함한 중량 스포츠 세단을 위해 라인업의 15% 이상을 HL(High Load) 가중 강성 규격으로 세팅 추천.'
      },
      labelingTargets: {
        rr: 'B',
        rrBg: 'linear-gradient(135deg, #22c55e, #10b981)', // Soft green (Grade B)
        wet: 'A',
        wetBg: 'linear-gradient(135deg, #16a34a, #15803d)', // Pure Green (Grade A)
        noise: '69 dB',
        noiseClass: 'A 등급'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '패턴 외곽 블록 가변 주파수 분산 기술 도입으로 스포츠 크루징 시 노이즈 절삭 극대화.',
            '비드 최적 고속 롤링 필러 보강으로 스포츠 주행 선회 시 강성 균일 압력 확보.',
            '자사 하이엔드 포뮬러 3D 트레드 외곽 최적 균형 프로파일 구조 적용.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '마찰 시 노면에 고무 잔여막을 순간 정착시켜 최대 접지 마찰 마진을 확보하는 2세대 스마트 카본 나노 배합 기술 중합.',
            '가감속 횡력 집중 시 트레드 홈 변형 및 수막 배출 가로 홈 협착을 물리적으로 방어하는 가변 깊이 기하학적 블록 브리지 가이더 설계.',
            '실리카 결착 강도를 원료 레벨에서 극대화하는 신소재 다기능 변성 친수성 합성 폴리머 화학 분산 연구.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>Twin-Screw Continuous Mixer 신규 도입</strong>: 실리카 고밀도(85%) 컴파운드의 물리적 균일 가공 마진을 2% 이내로 안정화하기 위해 고속 고부하 트윈 믹서 전격 배치 (투자: ₩180억).',
            '<strong>초정밀 3D Laser Siping 금형 조각 가공 설비</strong>: 트레드 블록에 가늘고 촘촘한 미세 배수 패턴을 성형할 CNC 및 레이저 조각기 몰드 가공 자동 라인 증설 (투자: ₩140억).',
            '<strong>하이엔드 아라론 코드 정밀 감기 프레임</strong>: 아라미드 벨트 편직 장력을 실시간 감지하여 미세 오차 없이 감는 오토 서보 로봇 설치 (투자: ₩100억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Pilot Sport 5', launch: '2022년 Q1', next: 'Pilot Sport 6', target: '2028년 Q1 (PLC 5.8년)' },
        { brand: 'Continental', current: 'SportContact 7', launch: '2021년 Q3', next: 'SportContact 8', target: '2027년 Q1 (PLC 5.5년)' },
        { brand: 'Bridgestone', current: 'Potenza Sport', launch: '2021년 Q1', next: 'Potenza Sport 2', target: '2026년 Q4 (PLC 5.8년)' }
      ]
    },
    ion: {
      id: 'ion',
      tireName: '차세대 고성능 EV 전용 iON Evo 후속 전략',
      currentModel: 'iON evo',
      segmentName: '고성능 전용 전기차 (EV Ultra High Performance)',
      targetMarket: '초고마력 프리미엄 전기차 및 고성능 스포츠 EV 세단, 하이 퍼포먼스 EV SUV',
      competitorName: 'MICHELIN Pilot Sport EV',
      nextCompetitorName: 'MICHELIN Pilot Sport EV 2 (차세대)',
      avgPlcYears: 4.5, // Shorter lifecycle due to rapid EV tech development
      compCurrentLaunchYear: 2021,
      targetLaunchQuarter: '2027 Q2 전격 출시 예상',
      targetLaunchCalc: '경쟁사 모델 출시 연도(2021) + EV 전용 상품 세그먼트 평균 PLC(4.5년) 기준, 가속화되는 전기차 원료/모터 개발 흐름에 맞춰 2027년 상반기 출시 목표 수립',
      totalCapex: '₩48,000,000,000 (480억 원)',
      priorityFocusText: '본 세그먼트(EV UHP)의 최우선 R&D R&D 타겟은 [배터리 하중으로 인한 가혹 조기 마모 수명(Wear Durability) 방어 및 순간 모터 최대 토크(Instant Torque) 지탱 구조 설계]입니다. 출발 및 급가동 시 모터 출력 토크가 노면에 그대로 전달되므로 트레드 전 영역 편마모와 숄더 블록 뜯김(Tearing)을 원천 차단해야 합니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'EV UHP Sport-Touring', icon: 'fa-bolt' },
        { label: '경쟁사 차세대 출시일', value: '2027 Q2 (PLC 4.5년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 PS EV 2 (PS EV 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: A / RR: A / Noise: 68dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: 고하중 내마모성 & 고토크 지탱</small>', icon: 'fa-charging-station' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩48B (480억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '글로벌 초고마력 EV 스포츠 세그먼트의 부상', text: '700마력 이상의 고출력 스포츠 EV 및 듀얼 모터 고중량 차량이 늘어나면서 타이어에 가해지는 순간 접지 하중과 슬립 빈도가 일반 승용차의 3배에 도달합니다.' },
        { title: '배터리 고하중으로 인한 가혹 마모의 조기 차단', text: '배터리 R&D 가중에 따른 극심한 차량 중량(2.5톤)으로 인해 전 영역 가속 시 트레드가 급격히 소실되며 고토크를 유연하게 흡수할 극내마모 고무 가교가 절실합니다.' },
        { title: '실주행 정숙성과 구름저항(RR) 마진의 공존', text: '엔진 부재로 노면 소음이 가장 도드라지므로 특화된 음향 감쇄 패턴 및 주행가능거리 증대를 선결할 극저회전저항(LRR) 배합이 병행 탑재되어야 합니다.' }
      ],
      refReports: [
        { id: 17, title: 'Michelin 신상품 2종 기본분석 보고서 (E Primacy 2, E Pilot Sport)', docNo: '57049336-B0-HQ25-00038', drafter: '이현규 (New Technology Benchmarking Project)', date: '2025.09.25', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250924110700403257AC0741359149258D0F000B985F?opendocument%26popup=1' },
        { id: 10, title: 'Michelin EV 전용 Pilot Sport EV Benchmarking 분석 보고서 (1차)', docNo: '57049336-B0-HQ25-00010', drafter: '장우혁 (New Technology Benchmarking Project)', date: '2025.05.12', link: '#' },
        { id: 4, title: 'Continental Premium EV 타이어 "PremiumContact 7 EV" 물성 및 마모 특성 비교 분석', docNo: '57049336-B0-HQ25-00004', drafter: '홍성준 (New Technology Benchmarking Project)', date: '2025.02.18', link: '#' },
        { id: 115, title: 'Bridgestone ENLITEN 기술 적용 EV 전용 타이어 Turanza EV 북미 시장 분석 보고', docNo: '57049336-B0-HQ24-00115', drafter: '김성태 (New Technology Benchmarking Project)', date: '2024.12.01', link: '#' },
        { id: 94, title: '자사 iON evo 글로벌 친환경 전기차 OE 납품 규격 실측 데이터 종합 분석', docNo: '57049336-B0-HQ24-00094', drafter: '안지민 (New Technology Benchmarking Project)', date: '2024.09.15', link: '#' }
      ],
      chartData: {
        labels: ['Rolling Resistance', 'Wear Durability', 'Wet Grip', 'Dry Handling', 'Noise Control', 'Torque Durability'],
        currentHK: [9.4, 8.1, 8.9, 9.3, 9.7, 8.8],
        competitorCurrent: [9.2, 8.8, 9.0, 9.2, 9.3, 9.0],
        targetNext: [9.7, 9.5, 9.2, 9.4, 9.6, 9.5]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '고출력 전기차(EV) 세그먼트의 특성을 감안, 유럽 OE 성능 표준 규격과 사내 실내 고속 마모 드럼 및 실내 소음 챔버의 실측 데이터를 기반으로 10점 만점 기준으로 환산하였습니다.',
        details: [
          { name: '자사 현행 평점', text: '아이온 에보의 실내 드럼 회전저항(RRC) 계측값 및 Sound Absorber 흡음 특수 스펀지 유무에 따른 실내 데시벨(dB) 스펙트럼 옥타브 밴드 평점화.' },
          { name: '경쟁사 현행 평점', text: '미쉐린 PS EV 실차 내마모 테스트 마일리지 데이터 역추적 및 EV 최대 고하중 상태에서의 숄더 부하 압력 센싱 분산 값 대조 변환.' },
          { name: '자사 차세대 R&D 목표', text: '경쟁사 대비 취약 부문인 고하중 내마모 수명(Wear Durability)을 17% 보강하기 위한 화학 가교 분자망 가중 가설 수치 및 최대 토크 전달 효율 목표 적용.' }
        ]
      },
      gaps: [
        { name: 'Wear Durability (고하중 내마모 수명)', current: 8.1, target: 9.5, percent: -14.7, level: 'Danger', desc: '자사 차세대 R&D 목표 성능 대비 최대 약점인 -14.7%의 갭입니다. 순간 토크 슬립을 차단할 고변형 F-SBR 고강도 탄성체 기술이 반드시 탑재되어야 극복됩니다.' },
        { name: 'Torque Durability (모터 고토크 인장성)', current: 8.8, target: 9.5, percent: -7.4, level: 'Warning', desc: '초기가속 슬립에 대응하는 블록 찢김 방어 갭입니다. 벨트 레이어에 아라미드 하이브리드 고강성 풀 코드 보강을 긴급 처방해야 합니다.' },
        { name: 'Rolling Resistance (구름 저항)', current: 9.4, target: 9.7, percent: -3.1, level: 'Warning', desc: '자사 iON evo 제품도 세계 최고 수준의 구름저항을 지니나 차세대 자사 R&D 목표 성능과 3.1% 성능 격차가 잔존합니다.' },
        { name: 'Noise Control (실내 정숙성)', current: 9.7, target: 9.6, percent: 1.0, level: 'Success', desc: '자사 독점 우레탄 흡음 폴리우레탄 스펀지 접착 기술(Sound Absorber)은 자사 차세대 R&D 목표 대비 이미 독보적 성능 우위를 입증하고 있습니다.' }
      ],
      skuStrategy: {
        rims: '18인치 ~ 22인치 고하중 EV 전용 프리미엄 스펙 중심 (19~21인치 중심 고인치 구성비 85%)',
        ratio: '50% OE (Tesla, Hyundai N, Porsche Taycan, Audi e-tron 등 최신 프리미엄 플랫폼 수주) / 50% RE',
        sizes: '235/45R18, 255/45R19, 235/40R19, 255/40R20, 285/35R20, 245/35R21, 285/30R21, 255/40R22, 295/35R22',
        desc: '전동화 스포츠 콘셉트에 최적화된 편평비와 림폭으로 65개 핵심 볼륨 규격을 구성함. 초 무거운 배터리 하중으로 인한 타이어 접지 왜곡을 상쇄하기 위해 전 규격의 60% 이상을 HL(High Load) 가중 강성 레이아웃으로 보강 셋팅.'
      },
      labelingTargets: {
        rr: 'A',
        rrBg: 'linear-gradient(135deg, #16a34a, #15803d)', // Emerald Green (Grade A)
        wet: 'A',
        wetBg: 'linear-gradient(135deg, #16a34a, #15803d)', // Emerald Green (Grade A)
        noise: '68 dB',
        noiseClass: 'A 등급 (스펀지 기본탑재)'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '에어 캐비티 공명 소음을 감쇄하는 트레드 안쪽 고유 고밀도 폴리우레탄 흡음 스펀지 접착.',
            '비드 필러 하부를 단단히 구속하는 정밀 카스 구조 설계로 무거운 배터리 하중으로 인한 타이어 굴곡 응력의 외곽 이탈 방지.',
            '구름저항 극소화를 이끌어내는 특화 4세대 실리카 합성 분산제 및 링커 구조 도입.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '초기 슬립 마찰열에 견딜 수 있도록 분자 말단 작용기를 극대화한 작용기 개질 고무 컴파운드(F-SBR) R&D.',
            '정속 주행과 고하중 선회 상황에서 사이드월 강성을 다변화시키는 가변 두께 에어 프로파일(EV Contour) 성형 패턴 기술 연구.',
            '가혹 마모 조건에서 고무 입자가 자가 탈락되는 대신 수지를 복구하는 탄성 화학 결합 복원 기술.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>실시간 가황 반응 비접촉 자동 온도 제어기 증설</strong>: EV 대응 고토크용 컴파운드의 균일 가교 결합을 성형 공정 중 마이크로 단위로 통제하는 AI 스마트 가황 가마 온도 자동 조절 장치 대거 도입 (투자: ₩190억).',
            '<strong>다중 반경 프로파일 다이 트레드 동시 압출 라인 구축</strong>: 고접지 및 고하중 균일 면적 보장을 위해 압출 트레드 캡과 베이스의 미세 편차를 방어하는 다공 헤드 압출 시스템 전격 개편 (투자: ₩160억).',
            '<strong>폴리우레탄 흡음 패드 자동 레이저 가공-접착 완전 무인 라인 신설</strong>: 완제품 타이어 전 내면에 폴리우레탄 패드를 고속 클리닝 후 마이크로 에러 없이 오토 롤링 고정하는 기계 구축 (투자: ₩130억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Pilot Sport EV', launch: '2021년 Q2', next: 'Pilot Sport EV 2', target: '2027년 Q2 (PLC 4.5년)' },
        { brand: 'Continental', current: 'PremiumContact 7 EV', launch: '2022년 Q4', next: 'PremiumContact 8 EV', target: '2028년 Q1 (PLC 5.2년)' },
        { brand: 'Bridgestone', current: 'Turanza EV (ENLITEN)', launch: '2023년 Q2', next: 'Turanza EV 2', target: '2027년 Q4 (PLC 4.5년)' }
      ]
    },
    dynapro: {
      id: 'dynapro',
      tireName: '북미 SUV 타겟 Dynapro HPX 차세대 R&D 전략',
      currentModel: 'Dynapro HPX',
      segmentName: '올시즌 투어링 SUV (All-Season Touring SUV)',
      targetMarket: '북미 프리미엄 픽업트럭, 대형 SUV 패밀리 카 고객군',
      competitorName: 'MICHELIN Defender LTX M/S',
      nextCompetitorName: 'MICHELIN Defender LTX M/S 2 (차세대)',
      avgPlcYears: 6.5, // Longest lifecycle due to heavy mileage emphasis
      compCurrentLaunchYear: 2022,
      targetLaunchQuarter: '2029 Q1 전격 출시 예상',
      targetLaunchCalc: '경쟁사 대구경 SUV 스테디셀러의 긴 라이프사이클(평균 PLC 6.5년)을 기반으로, 2022년 출시된 현 제품의 수명을 분석하여 2029년 초 완전히 개조된 Defender LTX M/S 2의 북미 대대적 포지셔닝에 맞춘 자사 융합 전략 설계',
      totalCapex: '₩29,000,000,000 (290억 원)',
      priorityFocusText: '본 세그먼트(SUV All-Season)의 최우선 R&D 타겟은 [북미 7만~8만 마일 초장수명 내마모 마일리지(Treadwear Life) 보증 및 겨울철 혹독한 기후를 버티는 전천후 눈길 견인 트랙션(Snow Traction / 3PMSF)]입니다. 장거리 마모 안전과 폭설 주행 안정성이 핵심 구매 요인입니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'All-Season SUV & Pickup', icon: 'fa-truck-pickup' },
        { label: '경쟁사 차세대 출시일', value: '2029 Q1 (PLC 6.5년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Defender LTX 3 (LTX 2 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: B / RR: C / Noise: 72dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: 마모수명 극대화 & Snow 견인력</small>', icon: 'fa-mountain' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩29B (290억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '북미 시장 SUV/픽업 트레드 수명 니즈 지배', text: '북미 소비자는 최소 7만~8만 마일 주행을 보증하는 초장수명 타이어를 최선호하며, 가혹 기후와 장거리 주행 시 마일리지 손실이 전혀 없는 트레드블록 보강이 판매량을 결정합니다.' },
        { title: '스노우 및 가벼운 오프로드 트랙션 동시 요구', text: '북미 광활한 진흙(Mud) 및 혹독한 눈길(3PMSF)을 안전하게 크루징 탈출 가능한 고밀도 사이프 및 블록 내구 마이크로 홈 기하 구조가 전면 채택되는 추세입니다.' },
        { title: '노면 거칠기 승차감 필터링 기술 탑재 필연', text: '중량이 무거운 SUV가 하이웨이를 주행할 시 섀시 진동 소음의 유입을 원활히 분산 차단하는 두터운 고부하 사이드월 블록 가변 유연 설계가 탑재되어야 고품격 패밀리 크루징을 구현할 수 있습니다.' }
      ],
      refReports: [
        { id: 9, title: '북미 Pick-up Truck용 Tire의 Sidewall Block Design 분석 결과', docNo: '57049336-B0-HQ26-00004', drafter: '송호영 (New Technology Benchmarking Project)', date: '2026.01.22', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2026/01/AC004_1.nsf/vdockey/202601221131004B06BC6A49C1B44849258D87000DCDB6?opendocument%26popup=1' },
        { id: 45, title: 'Michelin SUV 전용 사계절 신제품 CrossClimate 2 SUV Benchmarking 종합 리포트', docNo: '57049336-B0-HQ25-00045', drafter: '정두형 (New Technology Benchmarking Project)', date: '2025.11.10', link: '#' },
        { id: 28, title: 'Bridgestone 프리미엄 올시즌 SUV 타이어 Alenza AS Ultra 북미 마모 비교 테스트 결과', docNo: '57049336-B0-HQ25-00028', drafter: '백승우 (New Technology Benchmarking Project)', date: '2025.09.05', link: '#' },
        { id: 12, title: 'Continental 북미 대형 픽업 타겟 CrossContact LX25 실차 및 마일리지 벤치마킹', docNo: '57049336-B0-HQ25-00012', drafter: '유태웅 (New Technology Benchmarking Project)', date: '2025.04.30', link: '#' },
        { id: 77, title: '북미 딜러 초청 Dynapro HPX 장기 내마모성(Treadwear 640) 실증 피드백 분석 결과', docNo: '57049336-B0-HQ24-00077', drafter: '최정석 (New Technology Benchmarking Project)', date: '2024.07.25', link: '#' }
      ],
      chartData: {
        labels: ['Snow Traction', 'Treadwear Life', 'Dry Handling', 'Wet Braking', 'Ride Comfort', 'Off-road Grip'],
        currentHK: [7.1, 8.3, 8.9, 8.4, 9.4, 7.8],
        competitorCurrent: [7.3, 9.1, 8.8, 8.7, 9.0, 8.0],
        targetNext: [8.0, 9.5, 9.1, 9.0, 9.3, 8.2]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '북미 SUV/픽업 시장 특화 평가 표준인 미국의 UTQG 마모 등급 환산 공식 및 겨울철 ASTM 스노우 견인력 규격을 참조하여 산출된 신뢰성 높은 엔지니어링 지표 평점입니다.',
        details: [
          { name: '자사 현행 평점', text: 'Dynapro HPX의 북미 실제 RE 마일리지 필드 클레임 추적 데이터 및 겨울철 핀란드 이발로(Ivalo) 스노우 성능 시험장 견인력(Traction) 계측값 지표화.' },
          { name: '경쟁사 현행 평점', text: '북미 대표 스테디셀러 Defender LTX M/S의 실사용자 1억 마일 주행 평점 피드백 빅데이터 수집 및 마모 수명 역공학 드럼 평가치 보간.' },
          { name: '자사 차세대 R&D 목표', text: '경쟁사 디펜더의 극강 마일리지(9.1점) 성능을 압도하기 위한 초고밀도 분자 인터록 가교 화학 처방 기반의 마모 R&D 타깃치(9.5점) 세팅.' }
        ]
      },
      gaps: [
        { name: 'Treadwear Life (마모 보증 수명)', current: 8.3, target: 9.5, percent: -12.6, level: 'Danger', desc: '자사 차세대 R&D 목표 성능 대비 -12.6%의 갭입니다. 고밀도 분자 인터록 가교 화학 신소재 처방 및 균일 마모 접격압 확보가 급선무입니다.' },
        { name: 'Snow Traction (스노우 구동력)', current: 7.1, target: 8.0, percent: -11.2, level: 'Warning', desc: '자사 차세대 R&D 목표 스노우 성능 대비 -11.2%의 갭입니다. 트레드 내부 미세 고농성 3차원 사이프 각도의 다변화 R&D가 필요합니다.' },
        { name: 'Wet Braking (빗길 제동 마찰력)', current: 8.4, target: 9.0, percent: -6.7, level: 'Warning', desc: '자사 차세대 R&D 목표 성능 대비 -6.7%의 갭입니다. 대형 SUV의 빗길 제동력 향상을 위해 특수 액상 가소 시제 합성 및 숄더부 오픈 홈 체적 최적 조율이 요구됩니다.' },
        { name: 'Ride Comfort (승차 소음 감쇄)', current: 9.4, target: 9.3, percent: 1.1, level: 'Success', desc: '자사의 독점적 숄더블록 폐쇄형 디자인은 하이웨이 유입 노면 노이즈를 탁월하게 절삭해, 자사 차세대 R&D 목표 대비 1.1%의 상대 우위를 이어가고 있습니다.' }
      ],
      skuStrategy: {
        rims: '17인치 ~ 22인치 대형 SUV 및 북미 픽업용 인치 다중 분출 (18~20인치 중심 볼륨 비중 75% 설정)',
        ratio: '20% OE (북미 Ford, GM, RAM의 대형 SUV 및 세미 픽업 로컬 OE 대응) / 80% RE (장수명 타켓 마켓 최적화)',
        sizes: '265/70R17, 265/65R18, 275/65R18, 265/50R20, 275/55R20, 275/60R20, 285/45R22 (미국 전형적 광폭 고편평비 SUV 볼륨 사이즈)',
        desc: '장거리 패밀리 크루징과 트레드 수명을 담보하는 깊은 홈 깊이(11/32"~12/32" 세팅) 사양의 110여 개 고마일리지 대형 트럭/SUV 전용 SKU 배치 강추. 림 가드 및 사이드 가드 구조를 적용해 다양한 하중 조건과 험로 탈출 능력을 지원.'
      },
      labelingTargets: {
        rr: 'C',
        rrBg: 'linear-gradient(135deg, #f59e0b, #d97706)', // Amber Yellow (Grade C)
        wet: 'B',
        wetBg: 'linear-gradient(135deg, #22c55e, #10b981)', // Soft green (Grade B)
        noise: '72 dB',
        noiseClass: 'B 등급 (SUV 패턴 상향치)'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '대형 SUV 하중 하에서 접지 형상을 정방형으로 유지해 편마모를 방지하는 광폭 풋프린트 접지압 균등 최적화 설계.',
            '사이드월 충격 보호용 이중 데코레이션 가드 및 림 프로텍터 구조.',
            '소음 전파를 원천 격리하는 클로즈형 숄더 블록 배리어 디자인.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '노화 및 열 변형에 강하여 마일리지 수명을 혁신적으로 연장하는 무기 입자 고밀도 인터록트 가교 고무 복합체.',
            '눈길 및 고속 주행 시 고농도 카본 블록 블렌딩 강도를 상향 조정해 스노우 트랙션과 트레드 수명을 균형 있게 향상시키는 하이브리드 탄성 컴파운드.',
            '오프로드 노면에서 이물질 박힘을 자가 방지하고 배출하는 셀프 스톤 이젝팅 프로파일 가변 그루브 형상.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>초급속 냉각 제어형 가황 정밀 성형 라인 개조</strong>: 대구경 SUV 타이어의 두꺼운 고무 두께 편차를 해소하고 물성을 일정하게 큐어링하기 위해 고속 수냉식 가황 냉각 프레스 라인 전격 보강 (투자: ₩120억).',
            '<strong>6축 동적 CNC 금형 정밀 조각 가공기 전격 구축</strong>: 픽업 트럭용 사이드월 유연 블록 및 정밀 3차원 트레드 형상을 다중 각도로 미세 깎기 위한 독일산 정밀 가공 CNC 로보틱스 도입 (투자: ₩100억).',
            '<strong>고밀도 무기 입자 습식 마스터배치 복합 배합 라인</strong>: 마일리지 극대화를 위한 초내마모 컴파운드를 원료 단계에서 완벽하게 프리-믹스하는 고진공 분말 액상 압밀 분산 사일로 및 피딩 설비 라인 구축 (투자: ₩70억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Defender LTX M/S 2', launch: '2023년 Q4', next: 'Defender LTX M/S 3', target: '2029년 Q1 (PLC 6.5년)' },
        { brand: 'Continental', current: 'CrossContact LX25', launch: '2019년 Q3', next: 'CrossContact LX30', target: '2026년 Q2 (PLC 6.8년)' },
        { brand: 'Bridgestone', current: 'Alenza AS Ultra', launch: '2022년 Q3', next: 'Alenza AS Ultra 2', target: '2028년 Q3 (PLC 6.0년)' }
      ]
    }
  };

  /**
   * Helper to perform a smart lookup on user query string to match with the most appropriate strategic dataset.
   */
  function matchScenarioByQuery(query) {
    const q = (query || '').toLowerCase().trim();
    if (q.includes('k137') || q.includes('s1 evo') || q.includes('evo4') || q.includes('ventus') || q.includes('벤투스') || q.includes('여름용') || q.includes('summer')) {
      return STRATEGY_DATABASE.k137;
    } else if (q.includes('ion') || q.includes('아이온') || q.includes('electric') || q.includes('전기차') || q.includes('ev') || q.includes('에보')) {
      return STRATEGY_DATABASE.ion;
    } else if (q.includes('dynapro') || q.includes('다이나프로') || q.includes('hpx') || q.includes('suv') || q.includes('픽업') || q.includes('pickup')) {
      return STRATEGY_DATABASE.dynapro;
    }

    // Default Fallback: Smart Template Mapping
    const matchedWords = q.match(/[a-zA-Z0-9][-a-zA-Z0-9\s]+/g) || [];
    let customTireName = matchedWords.length > 0 ? matchedWords[0].toUpperCase() : '차세대 신규 상품';
    if (customTireName.length < 3) customTireName = '차세대 프리미엄 상품';

    // Return a clone of K137 with dynamic name injection
    const customScenario = JSON.parse(JSON.stringify(STRATEGY_DATABASE.k137));
    customScenario.id = 'custom';
    customScenario.tireName = `${customTireName} 후속 R&D 전략`;
    customScenario.currentModel = customTireName;
    customScenario.kpis[0].value = `Premium Summer (${customTireName})`;
    customScenario.kpis[1].value = '2028 Q2 (PLC 5.8개년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 PS6 (PS5 후속)</small>';
    customScenario.targetLaunchQuarter = '2028 Q2 출시 예상';
    customScenario.targetLaunchCalc = `사용자가 제안한 [${customTireName}] 제품의 PLC 수명 및 세그먼트 평균 PLC 분석에 맞춰 타겟 성능 격차를 좁힐 수 있는 여름용 UHP R&D 가동 로드맵 수립`;
    customScenario.grounds[2].title = `자사 현행 [${customTireName}] 모델의 성능 격차 집중 타격`;
    customScenario.grounds[2].text = `사용자 지정 모델 [${customTireName}] 의 벤치마킹 데이터 대조 결과, 한계 마른 노면 조종 스피드 지표 및 빗길 수막 제동 등급을 강화하여 시장 점유율 1위를 조기 탈환해야 합니다.`;
    
    // Override calculation basis details with custom tire name
    customScenario.scoreCalculationBasis.details[0].text = `${customTireName} 규격별 실차 핸들링 평가(Dry/Wet Handling) 및 고속 서킷 한계 접지 슬립각 계측 데이터를 10점 만점 척도로 선형 변환.`;
    customScenario.scoreCalculationBasis.details[2].text = `경쟁 현행 PS5 대비 물리 한계 그립(Dry Grip) +0.1점 우위 타겟팅 및 젖은 노면 제동(Wet Grip) 동등 이상 확보를 위한 [${customTireName}] 후속의 R&D 목표 시뮬레이션 최적치.`;

    return customScenario;
  }

  // Trigger simulation with steps and animation
  function triggerStrategicSimulation(query) {
    try {
      console.log("[Strategy Console] Starting strategic simulation for query:", query);
      const loaderScreen = document.getElementById('strategy-loader-screen');
      const emptyScreen = document.getElementById('strategy-empty-screen');
      const reportViewport = document.getElementById('strategy-report-viewport');

      // Reset loader classes
      for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`loader-step-${i}`);
        if (step) {
          step.className = 'loader-step';
        }
      }

      // Hide active states
      if (emptyScreen) emptyScreen.style.display = 'none';
      if (reportViewport) reportViewport.style.display = 'none';

      // Reveal loader screen
      if (loaderScreen) {
        loaderScreen.style.display = 'flex';
        loaderScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Run sequential loading simulation with 750ms delays
      runLoaderStep(1, () => {
        runLoaderStep(2, () => {
          runLoaderStep(3, () => {
            runLoaderStep(4, () => {
              runLoaderStep(5, () => {
                // Done! Hide loader and render actual strategy results
                setTimeout(() => {
                  if (loaderScreen) loaderScreen.style.display = 'none';
                  try {
                    renderStrategicReport(query);
                  } catch (renderError) {
                    console.error("[Strategy Console] Render Error:", renderError);
                    if (typeof showDiagnosticBanner === 'function') {
                      showDiagnosticBanner('Render Error: ' + renderError.message + '\n' + renderError.stack);
                    } else {
                      alert('Render Error: ' + renderError.message);
                    }
                  }
                }, 600);
              });
            });
          });
        });
      });
    } catch (simulationError) {
      console.error("[Strategy Console] Simulation Start Error:", simulationError);
      if (typeof showDiagnosticBanner === 'function') {
        showDiagnosticBanner('Simulation Start Error: ' + simulationError.message + '\n' + simulationError.stack);
      } else {
        alert('Simulation Start Error: ' + simulationError.message);
      }
    }
  }

  function runLoaderStep(stepId, callback) {
    const currentStep = document.getElementById(`loader-step-${stepId}`);
    if (!currentStep) {
      callback();
      return;
    }

    currentStep.classList.add('active');

    setTimeout(() => {
      currentStep.classList.remove('active');
      currentStep.classList.add('completed');
      callback();
    }, 750);
  }

  let isConsoleInitialized = false;

  /**
   * Initializes event binding for the interactive strategic console using Event Delegation.
   * This guarantees that event listeners are active and functional regardless of dynamic DOM state or race conditions.
   */
  function setupStrategyConsole() {
    if (isConsoleInitialized) return;

    isConsoleInitialized = true;
    console.log("[Strategy Console] Event Delegation listener setup successfully bound to document.");

    // A. Click delegation on document level (covers submit button and template chips)
    document.addEventListener('click', (e) => {
      // 1. Check if template chip is clicked (or any child inside the chip)
      const chip = e.target.closest('.template-chip');
      if (chip) {
        e.preventDefault();
        e.stopPropagation();
        const query = chip.getAttribute('data-query');
        const promptInput = document.getElementById('strategy-prompt-input');
        if (query && promptInput) {
          promptInput.value = query;
          triggerStrategicSimulation(query);
        }
        return;
      }

      // 2. Check if submit button is clicked
      const submitBtn = e.target.closest('#strategy-submit-btn');
      if (submitBtn) {
        e.preventDefault();
        e.stopPropagation();
        const promptInput = document.getElementById('strategy-prompt-input');
        if (promptInput) {
          const query = promptInput.value.trim();
          if (!query) {
            alert('개발하시고자 하는 타이어명 또는 R&D 전략 질문을 입력해 주세요.');
            promptInput.focus();
            return;
          }
          triggerStrategicSimulation(query);
        }
        return;
      }
    });

    // B. Keydown delegation on document level (covers enter key in textarea)
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.id === 'strategy-prompt-input') {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const query = e.target.value.trim();
          if (!query) {
            alert('개발하시고자 하는 타이어명 또는 R&D 전략 질문을 입력해 주세요.');
            e.target.focus();
            return;
          }
          triggerStrategicSimulation(query);
        }
      }
    });
  }

  /**
   * Main rendering function to compile and inject HTML widgets and setup the Radar Chart.
   */
  function renderStrategicReport(query) {
    const reportViewport = document.getElementById('strategy-report-viewport');
    const matchedData = matchScenarioByQuery(query);

    if (!reportViewport || !matchedData) return;

    // 1. KPI Cards (두괄식 Summary)
    const kpiContainer = document.getElementById('kpi-cards-container');
    if (kpiContainer) {
      kpiContainer.innerHTML = matchedData.kpis.map(kpi => `
        <div class="kpi-card">
          <div class="kpi-icon-wrapper">
            <i class="fa-solid ${kpi.icon}"></i>
          </div>
          <div class="kpi-text-wrapper">
            <span class="kpi-label">${kpi.label}</span>
            <div class="kpi-value">${kpi.value}</div>
          </div>
        </div>
      `).join('');
    }

    // 2. Left Panel: Market Grounds & Benchmarking Report Link
    const groundsContainer = document.getElementById('market-grounds-container');
    if (groundsContainer) {
      groundsContainer.innerHTML = `
        <div style="font-size: 1rem; color: var(--text-dark); font-weight: 800; margin-bottom: 15px; border-left: 3.5px solid var(--primary); padding-left: 10px;">
          [${matchedData.tireName}] 상품 기획 핵심 타당성
        </div>
        <ul class="strategy-list">
          ${matchedData.grounds.map((ground, idx) => `
            <li class="strategy-list-item">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <strong>${idx + 1}. ${ground.title}</strong>
                <p style="margin-top: 4px; font-size: 0.88rem; color: var(--text-muted); line-height: 1.45;">${ground.text}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    }

    // 3. Benchmarking Reference Card Integration (Up to 5 reports sorted newest first)
    const refCard = document.getElementById('ref-report-card');
    if (refCard) {
      // Clear original single-card layout styles on the container itself to avoid double margins/paddings
      refCard.className = ""; 
      refCard.style.background = "none";
      refCard.style.border = "none";
      refCard.style.padding = "0";
      refCard.style.marginTop = "20px";
      refCard.style.display = "flex";
      refCard.style.flexDirection = "column";
      refCard.style.gap = "12px";

      const reports = matchedData.refReports || [];
      
      let reportsHtml = `
        <div style="font-size: 0.9rem; color: var(--text-dark); font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-book-bookmark" style="color: var(--primary);"></i>
          <span>연계 타이어 BM 리포트 (최대 5건, 최신순)</span>
        </div>
      `;

      if (reports.length === 0) {
        reportsHtml += `
          <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px dashed rgba(0,0,0,0.08);">
            연계된 벤치마킹 리포트가 없습니다.
          </div>
        `;
      } else {
        reportsHtml += reports.slice(0, 5).map(report => `
          <div class="report-item-row" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.02), rgba(255, 255, 255, 0.85)); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 12px; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px rgba(249, 115, 22, 0.08)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 5px rgba(0,0,0,0.02)'">
            <div class="ref-info" style="flex: 1; text-align: left;">
              <h5 style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0; line-height: 1.35;">${report.title}</h5>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">문서번호: ${report.docNo} • 기안자: ${report.drafter} • 기안일: ${report.date}</p>
            </div>
            <a href="${report.link}" target="_blank" class="ref-link-btn" style="flex-shrink: 0; background: #ffffff; border: 1px solid rgba(249, 115, 22, 0.3); color: var(--primary); padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='var(--primary)'" title="인트라넷 아레나 전자결재 새창으로 열기">
              <span>열기</span>
              <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i>
            </a>
          </div>
        `).join('');
      }

      refCard.innerHTML = reportsHtml;
    }

    // 4. Competitor PLC & Expected Target Launch Details
    const competitorPlcContainer = document.getElementById('competitor-plc-container');
    if (competitorPlcContainer) {
      competitorPlcContainer.innerHTML = `
        <div class="gap-metric-row" style="background: rgba(249, 115, 22, 0.02); border-color: rgba(249, 115, 22, 0.15); margin-bottom: 16px;">
          <div class="gap-metric-header">
            <span class="gap-metric-name" style="color: var(--primary); font-size: 1rem;"><i class="fa-solid fa-calculator"></i> 세그먼트 PLC 주기 산출 결과</span>
            <span class="gap-badge success" style="background: rgba(16, 185, 129, 0.12); color: var(--accent-green); border-color: rgba(16, 185, 129, 0.3);">자동 분석 완료</span>
          </div>
          <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary); margin-top: 4px;">
            경쟁사 제품의 평균 제품 수명 주기(PLC)인 <strong>${matchedData.avgPlcYears}년</strong>을 현재 시장 벤치마킹 가중 평균에 동적 매핑한 시뮬레이션 결과입니다.
          </p>
        </div>
        
        <div class="strategy-list">
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04);">
            <div style="width: 140px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;">대상 세그먼트</div>
            <div style="font-size: 0.9rem; color: var(--text-primary);">${matchedData.segmentName}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04);">
            <div style="width: 140px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;">기준 경쟁 모델</div>
            <div style="font-size: 0.9rem; color: var(--text-primary);">${matchedData.competitorName} (출시연도: ${matchedData.compCurrentLaunchYear}년)</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04);">
            <div style="width: 140px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;">차기 경쟁 모델 명칭</div>
            <div style="font-size: 0.9rem; color: var(--text-primary);">${matchedData.nextCompetitorName}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04);">
            <div style="width: 140px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;">예상 출시 일정</div>
            <div style="font-size: 0.9rem; color: var(--primary); font-weight: 800;">${matchedData.targetLaunchQuarter}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 140px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;">출시 산정 근거</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">${matchedData.targetLaunchCalc}</div>
          </div>
        </div>

        <!-- 3사 PLC 및 차세대 출시 로드맵 비교 표 -->
        ${matchedData.competitors3 ? `
        <div style="margin-top: 20px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 16px;">
          <h6 style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-list-check" style="color: var(--primary);"></i> Global Big 3사 PLC 및 차세대 출시 로드맵 비교
          </h6>
          <div style="overflow-x: auto; background: #fff; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; line-height: 1.4;">
              <thead>
                <tr style="background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.06);">
                  <th style="padding: 10px 12px; font-weight: 800; color: var(--text-dark);">브랜드 (Brand)</th>
                  <th style="padding: 10px 12px; font-weight: 800; color: var(--text-dark);">최근 상품명</th>
                  <th style="padding: 10px 12px; font-weight: 800; color: var(--text-dark);">출시 시기</th>
                  <th style="padding: 10px 12px; font-weight: 800; color: var(--text-dark);">차세대 상품명</th>
                  <th style="padding: 10px 12px; font-weight: 800; color: var(--primary);">차세대 출시 예상</th>
                </tr>
              </thead>
              <tbody>
                ${matchedData.competitors3.map(comp => `
                  <tr style="border-bottom: 1px solid rgba(0,0,0,0.04); transition: background 0.2s;">
                    <td style="padding: 10px 12px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                      <img src="${comp.brand === 'Michelin' ? 'https://www.google.com/s2/favicons?domain=michelin.com' : comp.brand === 'Continental' ? 'https://www.google.com/s2/favicons?domain=continental.com' : 'https://www.google.com/s2/favicons?domain=bridgestone.com'}" style="width: 14px; height: 14px; border-radius: 2px;" onerror="this.style.display='none'">
                      ${comp.brand}
                    </td>
                    <td style="padding: 10px 12px; color: var(--text-primary);">${comp.current}</td>
                    <td style="padding: 10px 12px; color: var(--text-muted);">${comp.launch}</td>
                    <td style="padding: 10px 12px; color: var(--text-primary); font-weight: 600;">${comp.next}</td>
                    <td style="padding: 10px 12px; color: var(--primary); font-weight: 800; background: rgba(249, 115, 22, 0.015);">${comp.target}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
      `;
    }

    // 5. Performance Gap Analysis (자사 vs 목표성능)
    const gapContainer = document.getElementById('gap-analysis-container');
    if (gapContainer) {
      const labeling = matchedData.labelingTargets;
      
      // Determine segment-specific key priority title based on ID
      let priorityTitle = '';
      if (matchedData.id === 'k137') {
        priorityTitle = '마른 노면 한계 그립(Dry Grip) 극대화 & 초고속 조종 응답력 확보';
      } else if (matchedData.id === 'ion') {
        priorityTitle = '고하중 내마모 수명(Wear Durability) 극대화 & 모터 초고토크 지탱 물리 구조 설계';
      } else {
        priorityTitle = '장마일리지 마모 수명(Treadwear) 최적화 & 사계절 전천후 기후 노면 제동 성능 확보';
      }

      // Prepend a beautiful segment-specific key priority & labeling target card
      const targetHeaderHtml = `
        <!-- 목표 성능 요약: 글로벌 라벨링 등급 및 세그먼트 최우선 과제 -->
        <div style="background: rgba(249, 115, 22, 0.03); border: 1.5px solid rgba(249, 115, 22, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(249,115,22,0.02);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--primary); font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(249,115,22,0.15); padding-bottom: 8px;">
            <i class="fa-solid fa-bullseye"></i>
            <span>개발 목표 성능 및 글로벌 라벨링 가이드</span>
          </div>
          
          <!-- 3-Sticker Labeling Block -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
            <!-- RR Sticker -->
            <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); line-height: 1.1;"><i class="fa-solid fa-gas-pump" style="color: var(--accent-blue);"></i> 회전저항 (RR)</span>
                <span style="font-size: 0.65rem; color: var(--text-muted); scale: 0.9; transform-origin: left;">연료 효율 등급</span>
              </div>
              <div style="min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 900; color: #fff; background: ${labeling.rrBg}; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${labeling.rr}</div>
            </div>
            
            <!-- Wet Grip Sticker -->
            <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); line-height: 1.1;"><i class="fa-solid fa-cloud-showers-water" style="color: var(--accent-green);"></i> 젖은노면 제동</span>
                <span style="font-size: 0.65rem; color: var(--text-muted); scale: 0.9; transform-origin: left;">빗길 제동성</span>
              </div>
              <div style="min-width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 900; color: #fff; background: ${labeling.wetBg}; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${labeling.wet}</div>
            </div>
            
            <!-- Noise Sticker -->
            <div style="background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); line-height: 1.1;"><i class="fa-solid fa-volume-xmark" style="color: var(--primary);"></i> 통과 소음</span>
                <span style="font-size: 0.62rem; color: var(--accent-green); font-weight: 800; scale: 0.9; transform-origin: left;">${labeling.noiseClass.split(' ')[0]}등급</span>
              </div>
              <div style="font-size: 0.88rem; font-weight: 900; color: var(--text-dark);">${labeling.noise}</div>
            </div>
          </div>

          <!-- Highlight Key Priority Section -->
          <div style="background: rgba(249, 115, 22, 0.05); border-left: 3.5px solid var(--primary); padding: 10px 12px; border-radius: 0 6px 6px 0; margin-bottom: 10px;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-star"></i>
              <span>해당 세그먼트 최우선 R&D 집중 지표 (Key Priority)</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); line-height: 1.3;">
              ${priorityTitle}
            </div>
          </div>

          <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.45; margin: 0; padding-top: 2px;">
            ${matchedData.priorityFocusText}
          </p>
        </div>
      `;

      const gapItemsHtml = matchedData.gaps.map(gap => {
        const currentWidth = gap.current * 10;
        const targetWidth = gap.target * 10;
        
        let badgeClass = 'warning';
        if (gap.level === 'Danger') badgeClass = 'warning'; 
        if (gap.level === 'Success') badgeClass = 'success';

        return `
          <div class="gap-metric-row">
            <div class="gap-metric-header">
              <span class="gap-metric-name">
                <i class="fa-solid ${gap.level === 'Success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}" style="color: ${gap.level === 'Success' ? 'var(--accent-green)' : (gap.level === 'Danger' ? 'var(--danger)' : 'var(--primary)')}"></i>
                <span>${gap.name}</span>
              </span>
              <span class="gap-badge ${badgeClass}">${gap.percent > 0 ? '+' : ''}${gap.percent}% ${gap.level === 'Success' ? '우수' : '갭 보완 필요'}</span>
            </div>
            
            <div class="gap-visual-bar-wrapper">
              <span class="gap-score-label">자사: ${gap.current}</span>
              <div class="gap-bar-track">
                <div class="gap-bar-fill" style="width: ${currentWidth}%"></div>
              </div>
            </div>
            
            <div class="gap-visual-bar-wrapper">
              <span class="gap-score-label" style="color: #94a3b8;">목표: ${gap.target}</span>
              <div class="gap-bar-track">
                <div class="gap-bar-fill target" style="width: ${targetWidth}%"></div>
              </div>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-top: 2px;">${gap.desc}</p>
          </div>
        `;
      }).join('');

      gapContainer.innerHTML = targetHeaderHtml + gapItemsHtml;
    }

    // 5.1 SKU Strategy Setting Recommendations
    const skuContainer = document.getElementById('sku-recommendations-container');
    if (skuContainer && matchedData.skuStrategy) {
      const sku = matchedData.skuStrategy;
      skuContainer.innerHTML = `
        <div class="strategy-list">
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 120px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-arrows-left-right-to-line" style="color: var(--primary); margin-right: 6px;"></i> 림경 구성</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45;">${sku.rims}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 120px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-scale-balanced" style="color: var(--primary); margin-right: 6px;"></i> OE / RE 비율</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45;">${sku.ratio}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 120px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-ring" style="color: var(--primary); margin-right: 6px;"></i> 주요 규격 예시</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; font-family: monospace; font-weight: 700; background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 4px;">${sku.sizes}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; align-items: flex-start;">
            <div style="width: 120px; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-circle-nodes" style="color: var(--primary); margin-right: 6px;"></i> 세팅 전략 핵심</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45; font-weight: 500;">${sku.desc}</div>
          </div>
        </div>
      `;
    }

    // 5.2 Target Labeling Grades
    const labelingContainer = document.getElementById('labeling-targets-container');
    if (labelingContainer && matchedData.labelingTargets) {
      const labeling = matchedData.labelingTargets;
      labelingContainer.innerHTML = `
        <div class="gap-container">
          <!-- RR Grade -->
          <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(59, 130, 246, 0.08); display: flex; align-items: center; justify-content: center; color: var(--accent-blue); font-size: 1.1rem;"><i class="fa-solid fa-gas-pump"></i></div>
              <div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-dark);">회전저항 (RRC / 연료 효율 등급)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">유럽 친환경 RRC 규제 극복 타깃</div>
              </div>
            </div>
            <div style="width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-family: var(--font-display); font-weight: 900; background: ${labeling.rrBg}; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${labeling.rr}</div>
          </div>

          <!-- Wet Grip Grade -->
          <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16, 185, 129, 0.08); display: flex; align-items: center; justify-content: center; color: var(--accent-green); font-size: 1.1rem;"><i class="fa-solid fa-cloud-showers-water"></i></div>
              <div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-dark);">젖은 노면 제동력 (Wet Grip 등급)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">유럽 빗길 제동 안전 규격 최고점</div>
              </div>
            </div>
            <div style="width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-family: var(--font-display); font-weight: 900; background: ${labeling.wetBg}; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${labeling.wet}</div>
          </div>

          <!-- Noise Grade -->
          <div style="background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(249, 115, 22, 0.08); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.1rem;"><i class="fa-solid fa-volume-xmark"></i></div>
              <div>
                <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-dark);">실외 통과 소음 수치 (Pass-by Noise)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">유럽 환경 제한 충족 주행 소음 데시벨</div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
              <div style="font-size: 1.25rem; font-family: var(--font-display); font-weight: 900; color: var(--text-dark);">${labeling.noise}</div>
              <span class="gap-badge success" style="margin-top: 4px; font-size: 0.72rem; padding: 1px 8px; border-radius: 30px; font-weight: 800;">${labeling.noiseClass}</span>
            </div>
          </div>
        </div>
      `;
    }

    // 6. R&D Tech & Capex Structural Pillars
    const capexContainer = document.getElementById('capex-proposals-container');
    if (capexContainer) {
      capexContainer.innerHTML = matchedData.capex.map(card => `
        <div class="capex-card">
          <div class="capex-card-header">
            <div class="capex-card-icon ${card.color}">
              <i class="fa-solid ${card.icon}"></i>
            </div>
            <div class="capex-card-title">${card.title}</div>
          </div>
          <ul class="capex-sublist">
            ${card.items.map(item => `
              <li class="capex-sublist-item">${item}</li>
            `).join('')}
          </ul>
        </div>
      `).join('');
    }

    // 7. Instantiate / Refresh Radar Chart (Chart.js)
    const ctx = document.getElementById('strategy-radar-chart');
    if (ctx) {
      if (typeof Chart === 'undefined') {
        console.warn("[Strategy Console] Chart.js is not defined (offline or CDN blocked). Falling back to rich HTML table representation.");
        
        const parent = ctx.parentElement;
        if (parent) {
          ctx.style.display = 'none';
          
          const oldTable = parent.querySelector('.offline-fallback-table-wrapper');
          if (oldTable) oldTable.remove();
          
          const tableWrapper = document.createElement('div');
          tableWrapper.className = 'offline-fallback-table-wrapper';
          tableWrapper.style.cssText = 'width: 100%; height: 100%; overflow-y: auto; display: flex; flex-direction: column; justify-content: center; padding: 5px; font-family: "Pretendard", sans-serif;';
          
          let tableHtml = `
            <div style="font-size: 0.78rem; font-weight: 800; color: #d97706; margin-bottom: 6px; text-align: center; background: rgba(245, 158, 11, 0.05); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.15); line-height:1.35;">
              ⚠️ [오프라인 모드] Chart.js 로드 제한으로 정밀 수치 테이블로 대체 제공합니다.
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
              <thead>
                <tr style="background: rgba(249, 115, 22, 0.06); border-bottom: 1.5px solid rgba(249, 115, 22, 0.15);">
                  <th style="padding: 6px 8px; font-weight: 800; color: var(--text-dark);">성능 지표</th>
                  <th style="padding: 6px 8px; font-weight: 800; color: var(--primary); text-align: center;">자사 현행</th>
                  <th style="padding: 6px 8px; font-weight: 800; color: var(--accent-blue); text-align: center;">경쟁사</th>
                  <th style="padding: 6px 8px; font-weight: 800; color: var(--accent-green); text-align: center;">R&D 목표</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          const labels = matchedData.chartData.labels;
          for (let i = 0; i < labels.length; i++) {
            tableHtml += `
              <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 5px 8px; font-weight: 700; color: var(--text-dark);">${labels[i]}</td>
                <td style="padding: 5px 8px; text-align: center; font-weight: 800; color: #475569;">${matchedData.chartData.currentHK[i]}</td>
                <td style="padding: 5px 8px; text-align: center; color: #64748b;">${matchedData.chartData.competitorCurrent[i]}</td>
                <td style="padding: 5px 8px; text-align: center; font-weight: 800; color: var(--accent-green); background: rgba(16, 185, 129, 0.03);">${matchedData.chartData.targetNext[i]}</td>
              </tr>
            `;
          }
          
          tableHtml += `
              </tbody>
            </table>
          `;
          
          tableWrapper.innerHTML = tableHtml;
          parent.appendChild(tableWrapper);
        }
      } else {
        ctx.style.display = 'block';
        const parent = ctx.parentElement;
        if (parent) {
          const oldTable = parent.querySelector('.offline-fallback-table-wrapper');
          if (oldTable) oldTable.remove();
        }

        if (strategyRadarChart) {
          strategyRadarChart.destroy();
        }

        strategyRadarChart = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: matchedData.chartData.labels,
            datasets: [
              {
                label: `자사 현행 (${matchedData.currentModel})`,
                data: matchedData.chartData.currentHK,
                backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                borderColor: 'rgba(249, 115, 22, 0.85)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(249, 115, 22, 1)',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: `경쟁사 현행 (${matchedData.competitorName})`,
                data: matchedData.chartData.competitorCurrent,
                backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                borderColor: 'rgba(59, 130, 246, 0.6)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointBackgroundColor: 'rgba(59, 130, 246, 0.8)',
                pointBorderColor: '#fff',
                pointRadius: 3
              },
              {
                label: `우리 차세대 상품의 R&D 목표 성능`,
                data: matchedData.chartData.targetNext,
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderColor: 'rgba(16, 185, 129, 0.85)',
                borderWidth: 2.5,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { family: 'Pretendard', weight: '700', size: 10 },
                  color: '#334155',
                  boxWidth: 12
                }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: { family: 'Pretendard', weight: '800', size: 11 },
                bodyFont: { family: 'Pretendard', size: 10.5 },
                padding: 10,
                cornerRadius: 8
              }
            },
            scales: {
              r: {
                angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
                grid: { color: 'rgba(0, 0, 0, 0.06)' },
                pointLabels: {
                  font: { family: 'Pretendard', weight: '800', size: 9.5 },
                  color: '#475569'
                },
                ticks: {
                  font: { size: 8 },
                  color: '#94a3b8',
                  backdropColor: 'transparent',
                  stepSize: 2,
                  min: 0,
                  max: 10
                }
              }
            }
          }
        });
      }
    }

    // 7.1 Render Performance Score Calculation Basis/Grounds
    const radarGroundsContainer = document.getElementById('radar-chart-grounds-container');
    if (radarGroundsContainer && matchedData.scoreCalculationBasis) {
      const basis = matchedData.scoreCalculationBasis;
      radarGroundsContainer.innerHTML = `
        <div style="background: rgba(0, 0, 0, 0.015); border: 1.5px solid rgba(0, 0, 0, 0.04); border-radius: 12px; padding: 14px; font-size: 0.85rem; line-height: 1.5; margin-top: 10px;">
          <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-calculator" style="color: var(--primary);"></i>
            <span>${basis.title}</span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0 0 10px 0; line-height: 1.45;">
            ${basis.methodology}
          </p>
          <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed rgba(0, 0, 0, 0.08); padding-top: 8px;">
            ${basis.details.map(detail => `
              <div style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #fff; background: ${detail.name.includes('우리') || detail.name.includes('목표') ? 'var(--accent-green)' : (detail.name.includes('경쟁사') ? 'var(--accent-blue)' : 'var(--primary)')}; padding: 1px 6px; border-radius: 4px; white-space: nowrap; margin-top: 2px;">
                  ${detail.name}
                </span>
                <span style="color: var(--text-primary); font-size: 0.8rem; line-height: 1.35;">${detail.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Unhide Strategy Report Viewport
    reportViewport.style.display = 'block';

    // Smooth scroll down to the report viewport
    setTimeout(() => {
      reportViewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }

  // Robust, race-condition free, multiple-redundant initialization pipeline
  function runInitialization() {
    try {
      setupStrategyConsole();
    } catch (err) {
      console.error("[Strategy Console] Initialization failed during runInitialization:", err);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInitialization();
  } else {
    document.addEventListener('DOMContentLoaded', runInitialization);
  }
  window.addEventListener('load', runInitialization);

  // Backup polling interval to completely guarantee event registration
  let initRetries = 0;
  const initInterval = setInterval(() => {
    initRetries++;
    if (isConsoleInitialized || initRetries > 20) {
      clearInterval(initInterval);
    } else {
      runInitialization();
    }
  }, 100);
})();
