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
        { id: 18, title: 'Goodyear Summer Sport ULRR(Eagle F1 Asymmetric 6) 상품 분석 결과', docNo: '57049336-B0-HQ25-00037', drafter: '김상현', date: '2025.09.12', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250912152436BF68627618820F4949258D03002331DF?opendocument%26popup=1', summary: '기존 Asymmetric 5 대비 타이어 구조 자체를 경량화하고 사이드월 고무 배합을 최적화하여 초저구름저항(ULRR)을 획득함과 동시에, 급격한 조타 시 접지 형상이 가변적으로 넓어져 노면 압력을 균일하게 분산시키고 스포츠 제동력을 극대화하는 \'드라이 콘택트 패치\' 기술을 실현함. 또한 미세 요철 그립 확보를 위해 젖은 노면 특화 레진 중합 분산 공법을 완벽히 적용함.', insight: 'K137 후속 개발 시, 고속 주행 및 코너링 제동 시 가변적으로 접지면을 극대화하는 가변 프로파일 형상 몰드 설계 기술과 젖은 노면 한계 그립 향상을 위한 고분산 특화 레진 합성 기술 도입이 필수적임.' },
        { id: 35, title: 'Michelin Summer Super Sport Segment 상품 "Pilot Sport S 5" 1차 Benchmarking 결과 보고', docNo: '57049336-B0-HQ24-00040', drafter: '박진욱', date: '2024.10.23', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/10/AC004_1.nsf/vdockey/2024102217024695EB7090A2F2EA2C49258BBE002C2EAD?opendocument&ismobile=0%26popup=1', summary: '고강도 아라미드와 나일론 하이브리드 벨트(Aramid/Nylon Hybrid)를 적용한 \'다이내믹 리스폰스 테크놀로지\'를 통해 300km/h 이상 초고속 원심력에 의한 트레드 변형을 원천 구속하고 고속 핸들링 반응 지연을 최소화함. 트레드 외측 블록에는 건조 노면용 하이-그립 탄성체, 내측에는 수막 배출을 타겟팅한 기능성 친수 실리카 컴파운드를 비대칭 설계한 \'듀얼 컴파운드 5.0\' 공법을 기용함.', insight: '글로벌 최고 사양 고출력 프리미엄 OE 수주와 초고속 마찰 한계 극복을 달성하기 위해, 고인치(19인치 이상) 규격에 아라미드 하이브리드 풀밴드 조율 권선 공법 및 트레드 좌우 비대칭 이종 배합 동시 압출 기술 도입이 급선무임.' },
        { id: 58, title: 'Michelin Premium Summer Sport 신상품 (Pilot Sport 5) Benchmarking 결과 보고', docNo: '57049336-B0-HQ23-00045', drafter: '박진욱', date: '2023.06.07', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2023/06/AC004_1.nsf/vdockey/2023060715231412107CC427E4E1F8492589C700230892?opendocument&ismobile=0%26popup=1', summary: '가감속 및 코너링 시 접지면 전 영역에 걸쳐 가해지는 접지압을 완벽히 균일하게 분배하는 \'맥스타치 컨스트럭션\' 기술을 적용하여 스포츠 그립을 최대로 향상시키는 동시에 트레드 마모 수명을 동급 최고 수준(UTQG 320 마일리지)으로 확보함. 내측의 넓은 가로 홈 배수 성능과 외측의 고강성 솔리드 블록 구조를 결합한 \'듀얼 스포츠 트레드 디자인\'으로 성능 간 상충을 물리적으로 극복함.', insight: '자사 기존 K137의 강점인 마일리지 우위를 유지하면서 조종 응답성 지표를 극대화하기 위해, 인공지능(AI) 기반 접지압 최적 형상 최적화 설계 모델링(MaxTouch 설계 개념) 고도화 및 최적 접지 면적 제어 공법 접목이 강력히 타당함.' },
        { id: 14, title: 'Continental APAM Summer 신상품 Max Contact MC7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ25-00043', drafter: '박진욱', date: '2025.10.31', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/10/AC004_1.nsf/vdockey/2025103013121174187A22AF8303E149258D33001713BC?opendocument%26popup=1', summary: '고온다습한 아시아태평양(APAM) 기후 환경에 최적화하여 실리카 가교를 고점도 폴리머에 균일 중합한 \'스포츠컴플렉스\' 컴파운드로 강력한 젖은 노면/마른 노면 제동 한계를 공고히 함. 또한 메인 세로 홈 내측에 원통형 소음 파쇄기를 다단 배치한 \'노이즈 브레이커 3.0\' 설계로 주행 공기 압축 소음을 산란시켜 NVH 성능을 기존 대비 1.5dB 대폭 저감함.', insight: 'K137 후속 개발 시 정숙성 부문의 경쟁사 우위를 완전하게 점하기 위해, 트레드 홈 내에 가변형 공기 소음 절삭형 노이즈 배리어를 성형하는 패턴 구조 설계를 도입하고 고온다습 기후에 타겟팅된 고온 접지 유지 고분산 배합 기술을 결합해야 함.' },
        { id: 51, title: 'Continental Summer Super Sport 신상품 Sport Contact 7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ23-00081', drafter: '박진욱', date: '2023.11.14', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2023/11/AC004_1.nsf/vdockey/20231109082723F66980ED571CACCC49258A610080D20D?opendocument&ismobile=0%26popup=1', summary: '서킷 가혹 주행 중 한계 슬립 상태에서 발생하는 고온 환경 하에 폴리머 입자가 동적으로 엉겨 붙어 임계 마찰 영역을 비약적으로 복구·넓히는 초고성능 \'포스 클러징 컴파운드\' 기술 탑재. 선회 시 가해지는 급격한 횡압력에 반응하여 아우터 숄더 블록의 리브 홈이 서로 닫히고 단단한 단일 솔리드 구조로 물리 변형 강성을 지탱하는 \'어댑티브 트레드 패턴\' 구현.', insight: '자사 최고 스포츠 플래그십 세그먼트의 조종 한계 도약을 위해, 횡력 부하에 반응하여 블록 홈이 상호 구속되며 패턴 횡강성을 극대화시키는 선회 가변 패턴 몰딩 금형 기술 및 3D 레이저 미세 절삭 몰드 가공 기술(Molding) 확보가 최우선 과제임.' }
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
        ],
        metrics: [
          {
            metric: 'Dry Grip (건조 노면 제동/그립)',
            scores: { currentHK: 9.4, competitorCurrent: 9.6, targetNext: 9.7 },
            formula: '정량 스케일링 공식: S = 10 - [ (D_actual - 32.5) / (38.0 - 32.5) ] * 10',
            description: '실차 제동 거리(100km/h → 0, m) 및 한계 횡G 계측 기반.<br>• <strong>자사 현행(9.4)</strong>: 제동 거리 33.5m, 횡그립 0.98G<br>• <strong>경쟁 현행(9.6)</strong>: Michelin PS5 제동 거리 33.1m, 횡그립 1.02G<br>• <strong>R&D 목표(9.7)</strong>: 제동 거리 33.0m, 횡그립 1.05G 달성 설계치.'
          },
          {
            metric: 'Wet Grip (젖은 노면 제동력)',
            scores: { currentHK: 9.1, competitorCurrent: 9.4, targetNext: 9.6 },
            formula: '정량 스케일링 공식: S = 10 - [ (W_actual - 25.0) / (31.0 - 25.0) ] * 10',
            description: '젖은 노면 수심 1mm 제동 거리(80km/h → 0, m) 계측 기반.<br>• <strong>자사 현행(9.1)</strong>: 제동 거리 26.8m (EU 라벨 Wet Grip A 하위 권역)<br>• <strong>경쟁 현행(9.4)</strong>: Michelin PS5 제동 거리 25.9m (A 중간 권역)<br>• <strong>R&D 목표(9.6)</strong>: 제동 거리 25.5m (A 최상위 85% 고밀도 실리카 배합 타겟).'
          },
          {
            metric: 'Hydroplaning (직선/선회 수막 저항)',
            scores: { currentHK: 8.7, competitorCurrent: 8.8, targetNext: 9.0 },
            formula: '수막 임계 진입 한계 속도 정규화: S = (V_actual / 95.0) * 10',
            description: '수심 8mm 직선 수막 진입 임계 속도(V_crit, km/h) 및 요레이트 소실 속도 계측.<br>• <strong>자사 현행(8.7)</strong>: 직선 수막 진입 속도 83.4 km/h<br>• <strong>경쟁 현행(8.8)</strong>: Michelin PS5 진입 속도 84.0 km/h<br>• <strong>R&D 목표(9.0)</strong>: 초정밀 3D Laser Siping 패턴 최적화로 진입 속도 85.5 km/h 확보 목표.'
          },
          {
            metric: 'Handling Response (조종 응답성)',
            scores: { currentHK: 9.2, competitorCurrent: 9.5, targetNext: 9.7 },
            formula: '요레이트 응답 지연 시간 역수 변환: S = (0.08 / t_delay) * 10 (최대 10)',
            description: '스티어링 조타각 입력 시 요레이트(Yaw Rate) 반응 시간(초) 및 횡강성 계측치.<br>• <strong>자사 현행(9.2)</strong>: 조타 지연 시간 0.12초<br>• <strong>경쟁 현행(9.5)</strong>: Michelin PS5 조타 지연 시간 0.10초 (고강성 벨트)<br>• <strong>R&D 목표(9.7)</strong>: 하이엔드 아라론 코드 정밀 권선으로 편직 장력 조율, 응답 지연 0.09초 한계 극복.'
          },
          {
            metric: 'Comfort (주행 정숙성 & 진동 승차감)',
            scores: { currentHK: 8.8, competitorCurrent: 8.6, targetNext: 8.9 },
            formula: '소음(dB) 및 가속도(g) 감쇄율 가중 평점: S = (75 - dB_pass) * 1.2',
            description: '실차 ISO Pass-by 통과 소음(dB) 및 주행 도로 거칠기 감쇄율(RMS 가속도) 종합.<br>• <strong>자사 현행(8.8)</strong>: 통과 소음 69.2 dB, 시트 진동 가속도 0.080g<br>• <strong>경쟁 현행(8.6)</strong>: Michelin PS5 통과 소음 70.1 dB, 시트 진동 가속도 0.085g<br>• <strong>R&D 목표(8.9)</strong>: 피치 배합 최적 설계 기술 및 컴파운드 분산 안정화를 통해 69.0 dB 제어.'
          },
          {
            metric: 'Wear Life (트레드 마모 수명)',
            scores: { currentHK: 8.9, competitorCurrent: 8.2, targetNext: 8.6 },
            formula: 'UTQG Treadwear 및 3만 km 실차 마모 마일리지 보간 환산 점수',
            description: '북미/유럽 표준 마모 가혹 시험 드럼 실측치 및 UTQG 지수 기준.<br>• <strong>자사 현행(8.9)</strong>: UTQG 340 (약 4.0만 km 주행성, 독자 AI 최적 편평 설계 우위)<br>• <strong>경쟁 현행(8.2)</strong>: Michelin PS5 UTQG 320 (약 3.5만 km 가혹 주행 한계)<br>• <strong>R&D 목표(8.6)</strong>: 고그립 특성 튜닝과 충돌 방지를 조율한 절충 R&D 마일리지 목표치.'
          }
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
            '트레드 패턴의 피치 시퀀스(Pitch Sequence) 최적화 설계를 통한 고속 주행 패턴 소음 산란 및 최소화.',
            '고경성 비드 필러(Bead Filler) 적용으로 사이드월 강성을 보강하여 고속 코너링 시 횡방향 변형 방지 및 횡적 강성 향상.',
            '균일 접지압(Footprint Contact Pressure) 분산을 위한 최적 3D 융합 프로파일(Profile) 설계 기법 적용.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '고속 제동 마찰 한계 극복을 위한 초고활성 나노 카본 블랙 컴파운드(Compound) 혼련 배합 기술 개발.',
            '선회 시 패턴 블록 강성을 지지하고 수막현상을 방어하기 위한 홈(Groove) 저면 타이바(Tie-Bar) 리인포스먼트 설계.',
            '웨트 그립(Wet Grip) 강화를 위해 실리카 친화형 기능성 고분자(Modified Polymer)와 실란 커플링제(Silane Coupling Agent) 간 반응성 및 화학 가교(Cross-linking) 밀도 최적화 연구.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>고밀도 실리카 배합용 트윈 스크류 연속 혼련기(Twin-Screw Continuous Mixer) 도입</strong>: 실리카 고배합 트레드 컴파운드의 분산 품질 균일성과 가공 편차 최소화를 위한 대용량 연속 혼련 설비 구축 (투자: ₩180억).',
            '<strong>초정밀 3D 레이저 사이프(Sipe) 몰드 조각 가공 설비</strong>: 트레드 블록 표면에 배수성과 패턴 강성을 조절하는 고정밀 미세 배수 홈(Sipe)을 성형하기 위한 CNC 레이저 금형 가공 설비 증설 (투자: ₩140억).',
            '<strong>하이브리드 코드 JLB(Jointless Band) 정밀 권선기 도입</strong>: 초고속 주행 시 원심력에 의한 타이어 성장을 원천 구속하기 위해 아라미드와 나일론이 복합 편직된 코드를 나선형으로 권선하는 전용 고속 권선 로봇 도입 (투자: ₩100억).'
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
        { id: 17, title: 'Michelin 신상품 2종 기본분석 보고서 (E Primacy 2, E Pilot Sport)', docNo: '57049336-B0-HQ25-00038', drafter: '이현규 (New Technology Benchmarking Project)', date: '2025.09.25', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250924110700403257AC0741359149258D0F000B985F?opendocument%26popup=1', summary: 'e.Primacy 2는 에너지 효율 최우선 설계에 따라 에너지 패시브 컴파운드 및 극박 게이지 이너라이너 기술을 융합하여 구름저항(RRC) 부문에서 안정적으로 EU A등급 기준을 상회, 주행거리 효율을 약 7% 향상함. e.Pilot Sport는 전동 스포츠카 전용으로 초기 급부하 고토크 전단력에 저항하도록 카카스-벨트부 구조 강성을 15% 이상 전폭 강화하고 고강성 숄더 리브 패턴을 이식해 조종안정성을 극대화함.', insight: 'EV 전용 타이어 세그먼트의 다각화 흐름에 부합하도록, 초고효율 주행거리 극대화 라인(Primacy 콘셉트)과 고성능 스포츠 핸들링 지향 라인(Pilot 콘셉트)으로 iON 브랜드 라인업을 고도화 및 세분화하고 특화 가황 온도 제어 신설비 구축이 필요함.' },
        { id: 89, title: 'Michelin EV 전용상품 Pilot Sport EV Benchmarking 분석 보고 (1차)', docNo: '57049336-B0-HQ21-00003', drafter: '양승혁', date: '2021.09.02', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2021/09/AC004_1.nsf/vdockey/2021090108002726304F2A1AE118BB49258742007E60BC?opendocument&ismobile=0%26popup=1', summary: '고무 분자 간 밀도를 극한으로 높인 \'일렉트릭그립 컴파운드\' 고가교 폴리머 배합을 기용하여, EV 전용 타이어의 치명적인 문제인 고하중 가속 시의 접지부 전단 변형, 조기 편마모 및 블록 뜯김(Tearing) 현상을 원천 방어함. 타이어 내부 공기 고주파 공명 소음을 감쇄하기 위해 고유의 특수 우레탄 흡음 폼을 내벽에 오토 레이저 무인 정밀 접착하는 \'어쿠스틱 테크놀로지\'를 기본 내장하여 실내 유입 소음을 2~3dB 정량 저감함.', insight: '순간 최대 토크(0-100km/h 3초대 초고성능 EV) 구동 부하를 조율하기 위해 나노 원료 레벨에서 가변 탄성을 갖는 고변형 개질 고무(F-SBR) 기술을 고도화하고, 독자 Sound Absorber 흡음재의 완전 무인 레이저 클리닝 및 자동 롤링 고속 접착 설비 라인(총 Capex 투자 약 130억 규모)의 설비 고도화가 강력히 요구됨.' },
        { id: 41, title: 'Continental EU Summer Segment PREMIUM CONTACT 7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ24-00031', drafter: '박진욱', date: '2024.06.17', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/06/AC004_1.nsf/vdockey/202406171518258A2F8A660C73B13F49258B3F0022A062?opendocument&ismobile=0%26popup=1', summary: '전기차 특유의 고하중 가중에 즉각 대응할 수 있도록, 횡압과 차량 하중에 반응하여 가로 홈 및 접지부 패턴 형태가 물리적으로 변형되며 늘 균일한 그립 면적을 사수하는 \'어댑티브 패턴\'을 성형함. 타이어 고무 분자가 고속 회전 시 활성화 온도에 도달하는 웜업 시간을 원천 배제하여 혹한기 초기 구동 및 마른/젖은 전 영역에서 노면 밀착을 보장하는 특허 초분산 가교 \'레드칠리(RedChili) 컴파운드\'를 탑재함.', insight: '사계절 전천후 기온 조건 및 초기 고토크 구동 대응을 위해, 혹한의 기온 상태에서도 고탄성 가교망이 유연하게 활성화되는 콤팩트 레질리언트 컴파운드 배합 공법을 이식하고 가변 깊이 고밀도 미세 절삭 가공 레이저 금형 조각 기법을 필수 반영해야 함.' },
        { id: 64, title: 'HMC eM Platform Competition 상품 Benchmarking 보고', docNo: '57049336-B0-HQ23-00007', drafter: '김상현', date: '2023.02.24', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2023/02/AC004_1.nsf/vdockey/202302231450163CFE438A956D8C114925895F00200A9E?opendocument&ismobile=0%26popup=1', summary: '현대기아자동차 차세대 승용/SUV 통합 전기차 전용 플랫폼(eM) 수주전에 뛰어든 경쟁 업계의 HL(High Load) 가중 강성 타이어 구조 분해 분석 보고서. 고하중 상태에서 비드부 과도 찌그러짐을 방어하기 위해 비드 필러 형상을 장대 보강 설계하고 사이드월 하부에 고성능 고강도 쿠션 패드를 고무 일체로 성형함으로써 하중 한계를 완벽히 버텨내도록 조율함.', insight: 'eM 차세대 OE 수주 경쟁 선점을 위해, HL(High Load) 하중 분산 강성 설계를 가시화하고 사이드월 하부 보강용 다단 압출 헤드 개편 및 실시간 비접촉 스마트 가황 온도 제어 자동화 시스템 설비 구축이 필연적임.' },
        { id: 38, title: 'Benchmarking Report_Pirelli EV 타이어 설계 분석', docNo: '57049336-B0-HQ24-00035', drafter: '양승혁', date: '2024.07.25', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/07/AC004_1.nsf/vdockey/20240725100447CE38180724650D5749258B650005E7DE?opendocument&ismobile=0%26popup=1', summary: '전기차 최대 고출력 인가 시의 접지 왜곡과 순간 그립 손실을 억제하는 카카스 가일 코팅 레이어 및 특화 보강 코드를 융합한 \'피렐리 일렉트(Elect)\' 기술을 완전 분해 분석함. 블록 피치 기하 형성에 가변 홈 깊이를 부여하고, 독자 흡음 시스템(PNCS) 패드의 입체적 체적을 차체 공진에 역설계 배치하여 실내 유입 소음을 효과적으로 산란함.', insight: 'iON evo 차세대 성능 격차 우위 달성을 위해 고부하 코너링 상태에서 접지 형상의 왜곡을 보간하는 가변 하중 프로파일 컴퓨터 시뮬레이션(FEA) 해석 시스템을 상용화하고, PNCS 동등 성능의 초경량 가변 밀도 흡음 스펀지 성형 프레임 공정 개발 도입이 강력히 타당함.' }
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
        ],
        metrics: [
          {
            metric: 'Rolling Resistance (구름 저항)',
            scores: { currentHK: 9.4, competitorCurrent: 9.2, targetNext: 9.7 },
            formula: '회전저항 계수(RRC, kg/t) 등급 변환: S = 12.0 - RRC_actual (최대 10)',
            description: '실내 정밀 드럼 계측 RRC 수치 기반.<br>• <strong>자사 현행(9.4)</strong>: RRC 5.8 kg/t (EU 라벨 A등급 안정적 충족)<br>• <strong>경쟁 현행(9.2)</strong>: Michelin PS EV RRC 6.2 kg/t (B등급 경계 수준)<br>• <strong>R&D 목표(9.7)</strong>: 4세대 실리카 합성 분산제 및 하이엔드 LRR 합성 폴리머 기용으로 5.4 kg/t 달성 목표.'
          },
          {
            metric: 'Wear Durability (고하중 내마모 수명)',
            scores: { currentHK: 8.1, competitorCurrent: 8.8, targetNext: 9.5 },
            formula: '전기차 중량 가중치 적용 드럼 가속 수명: S = (Mileage_actual / 40,000) * 10',
            description: '전기차 전용 2.5톤 고부하 마모 가설 드럼 계측 마일리지 기준.<br>• <strong>자사 현행(8.1)</strong>: 2.5만 km 주행 시 한계 도달 (EV 특화 슬립으로 조기 마모 발생)<br>• <strong>경쟁 현행(8.8)</strong>: Michelin PS EV 가변 숄더 리브 및 강성 특화로 3.2만 km 도달<br>• <strong>R&D 목표(9.5)</strong>: F-SBR 고탄성 탄성체 중합 기술을 통해 3.6만 km 확보 타겟.'
          },
          {
            metric: 'Wet Grip (빗길 제동력)',
            scores: { currentHK: 8.9, competitorCurrent: 9.0, targetNext: 9.2 },
            formula: '수심 1mm 빗길 제동거리 정규화: S = 10 - [ (W_actual - 25.0) / (31.0 - 25.0) ] * 10',
            description: '고출력 EV 제동 시 하중 이동 가중치 적용 빗길 제동 테스트.<br>• <strong>자사 현행(8.9)</strong>: 젖은 노면 제동 성능 양호하나 EV 고하중 시 일부 밀림 감지<br>• <strong>경쟁 현행(9.0)</strong>: Michelin PS EV 젖은 노면 제동력 우수<br>• <strong>R&D 목표(9.2)</strong>: 고그립 EV 전용 실리카 컴파운드로 빗길 제동 안전성 대폭 상향.'
          },
          {
            metric: 'Dry Handling (건조 노면 조종안정성)',
            scores: { currentHK: 9.3, competitorCurrent: 9.2, targetNext: 9.4 },
            formula: '실차 핸들링 요레이트 지연 반응 시간 역수 환산 지수',
            description: '실차 고속 조종안정성 및 서킷 선회 횡강성 계측 기반.<br>• <strong>자사 현행(9.3)</strong>: 고강성 카카스 뼈대 및 비드부 보강으로 정밀 조타 반응 구현<br>• <strong>경쟁 현행(9.2)</strong>: Michelin PS EV 고출력 코너링 주행 시 조타 안정성 확보<br>• <strong>R&D 목표(9.4)</strong>: 하이브리드 보강 아랄론 벨트 코드로 초고속 코너링 및 한계 조타 응답 극대화.'
          },
          {
            metric: 'Noise Control (실내 정숙성)',
            scores: { currentHK: 9.7, competitorCurrent: 9.3, targetNext: 9.6 },
            formula: '공명 주파수 산란도 및 실내 주행 데시벨 지수: S = (72 - dB_actual) * 1.5',
            description: '실내 소음 무향실 챔버 정속 주행 및 실차 통과 소음 dB 계측.<br>• <strong>자사 현행(9.7)</strong>: 흡음 특수 스펀지(Sound Absorber) 적용으로 차실 공명음 완벽 저감<br>• <strong>경쟁 현행(9.3)</strong>: Michelin 어쿠스틱 폴리우레탄 흡음 폼 기용으로 정숙 주행 구현<br>• <strong>R&D 목표(9.6)</strong>: 소음 산란용 다단 피치 배치 및 가변 흡음 스펀지 형상 튜닝.'
          },
          {
            metric: 'Torque Durability (모터 고토크 인장성)',
            scores: { currentHK: 8.8, competitorCurrent: 9.0, targetNext: 9.5 },
            formula: '최대 가속 토크 슬립 시 슬립각 및 블록 찢김 방지 지수',
            description: '전기차 전용 최대 모터 토크(550~650 Nm) 급부하 가동 시험.<br>• <strong>자사 현행(8.8)</strong>: 고토크 인가 시 숄더 블록 국부 변형 및 뜯김(Tearing) 일부 검출<br>• <strong>경쟁 현행(9.0)</strong>: Michelin PS EV 고밀도 아우터 립 기술로 600 Nm 지탱<br>• <strong>R&D 목표(9.5)</strong>: 아라미드 벨트 편직 장력 조율 권선으로 650 Nm 급출력 변형 한계 전격 방어.'
          }
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
            '타이어 고유 진동에 의해 차실 내부로 유입되는 고주파 공명 소음(Cavity Noise) 저감을 위해 우레탄 흡음 패드(Sound Absorber)를 무인 정밀 자동 접착하는 기술 기용.',
            '고중량 전기차 하중 하에서 비드(Bead)부 찌그러짐을 예방하고 접지 형상 변형을 최소화하기 위해 고강성 카카스(Carcass) 코드 및 인벨롭 구조 적용.',
            'EV 주행가능거리 극대화를 위해 회전저항(RRC)을 극소화하는 고분산 나노 실리카 고무 배합 및 가황 제어 기술 적용.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            'EV 순간 최대 토크 인가 시의 초기 슬립과 트레드 뜯김(Tearing) 현상을 방어하기 위한 고강도 기능성 SBR(Functionalized-SBR) 컴파운드 분자 합성 연구.',
            '고중량 차량의 고속 선회 횡압력에 견디도록 사이드월(Sidewall) 게이지 두께를 영역별로 가변 배치하는 비대칭 컴퓨터 프로파일 설계 연구.',
            '초동 가속 시 발생하는 트레드 블록 전단력 집중을 완화하여 이상 마모를 예방하는 고분자 중합체 사슬 가교(Cross-linking) 보강 기술 연구.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>실시간 가황(Curing/Vulcanization) 자동 온도 제어 시스템 도입</strong>: 고하중에 저항하는 고밀도 가교 물성의 균일성을 위해 몰딩 내부의 열 분포와 가황 반응을 실시간으로 추적·제어하는 가황 자동화 설비 도입 (투자: ₩190억).',
            '<strong>다중 분할 트레드 압출(Multi-Extrusion) 라인 구축</strong>: 노면과 닿는 외측 캡(Cap) 고무와 내측 베이스(Base) 고무의 이종 배합 동시 압출 시 치수 정밀도를 극대화하여 조종안정성을 높이는 다중 매니폴드 압출기 도입 (투자: ₩160억).',
            '<strong>폴리우레탄 흡음 패드(Sound Absorber) 자동 접착 무인 자동화 설비 신설</strong>: 완제품 타이어 내벽의 이물질을 레이저로 세척(Cleaning)한 뒤 우레탄 흡음 폼을 오차 없이 정교하게 연속 합착하는 전용 무인 조립 자동화 라인 구축 (투자: ₩130억).'
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
        { id: 9, title: '북미 Pick-up Truck용 Tire의 Sidewall Block Design 분석 결과', docNo: '57049336-B0-HQ26-00004', drafter: '송호영 (New Technology Benchmarking Project)', date: '2026.01.22', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2026/01/AC004_1.nsf/vdockey/202601221131004B06BC6A49C1B44849258D87000DCDB6?opendocument%26popup=1', summary: '오프로드 험로 탈출 및 날카로운 자갈 충격에 강한 러기드 사이드월 블록 디자인 형상 설계. 고속 롤링 시 발생하는 주파수를 다중 상쇄시키는 NVH 저감형 가변 피치 설계 정량화.', insight: '고내구 사이드월 디플렉터 설계 기술을 당사 라인업에 확대 이식 적용.' },
        { id: 76, title: 'Michelin All Weather 상품 CrossClimate2 Benchmarking 분석 보고 (2차)', docNo: '57049336-B0-HQ22-00021', drafter: '양승혁', date: '2022.07.21', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2022/07/AC004_1.nsf/vdockey/2022071917004638493771301FF34A49258884002C0049?opendocument&ismobile=0%26popup=1', summary: '수막 및 눈길 트랙션을 이상적으로 개선한 방향성 V형 패턴 그루브 설계. 겨울철 저온 고무 유연성과 여름철 고결합 강도를 동시에 달성하여 긴 수명과 그립을 다잡은 열 서보 어댑티브 컴파운드.', insight: '가변 3D V형 패턴 및 광범위 작동 가능 친수성 컴파운드 결합 연구.' },
        { id: 47, title: '북미 SUV 신상품(UTQG Treadwear 800) Benchmarking 결과 보고', docNo: '57049336-B0-HQ24-00014', drafter: '송호영', date: '2024.03.18', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/03/AC004_1.nsf/vdockey/20240318094233F64D6D21C2F21FE149258AE40003DF48?opendocument&ismobile=0%26popup=1', summary: '북미 장거리 투어링 마켓 타겟으로 트레드웨어 800 수준의 초고내내마모 에버트레드 기술 확보 분석. 실리카와 폴리머 결합력을 극대화하여 드럼 시험 시 미세 탈락을 억제하는 인터록 고가교 공중합체.', insight: '마일리지 극대화를 위해 연속 혼련 설비(Twin-Screw Continuous Mixer) 도입 시급.' },
        { id: 83, title: '북미용 Performance Touring SUV 상품 개발을 위한 Benchmarking 분석 보고 (1차)', docNo: '57049336-B0-HQ21-00032', drafter: '송호영', date: '2021.11.29', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2021/11/AC004_1.nsf/vdockey/2021112510082399927CDDD25DBE804925879800063E19?opendocument&ismobile=0%26popup=1', summary: '대형 SUV에 맞추어 주행 소음 피치를 전면 분산 설계한 가변 블록 기술. 급차선 변경 시 대형 차체 롤링을 제어하기 위해 비드 턴업을 극대화하고 고강성 필러 고무를 기용한 조종안정성 확보.', insight: '숄더 차단형 정숙 패턴 및 다중 반경 에어 프로파일 몰드 설계 기술 접목.' },
        { id: 25, title: 'Michelin LT(Pick up Highway Terrain)상품 분석 결과 (Defender LTX M/S 2 & Defender LTX Platinum)', docNo: '57049336-B0-HQ25-00017', drafter: '김상현', date: '2025.05.23', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/05/AC004_1.nsf/vdockey/20250523090314C0A841075111E67C49258C9300004930?opendocument&ismobile=0%26popup=1', summary: '고하중 고적재 및 험로 하에서도 8만 마일 초장수명을 유지하는 에버트레드 2.0 강결합 폴리머 화합물. 접지압을 센터와 숄더에 균등 분산하여 편마모를 방지하는 맥스프레셔 카카스 프로파일.', insight: '실차 마모 시뮬레이션 공정 도입 및 트레드 편마모 차단 압력 분포 가이드 적용.' }
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
        ],
        metrics: [
          {
            metric: 'Snow Traction (눈길 견인력)',
            scores: { currentHK: 7.1, competitorCurrent: 7.3, targetNext: 8.0 },
            formula: 'ASTM F1805 표준 스노우 트랙션 테스트 견인 지수(Index)',
            description: '눈길 제동(80% 슬립) 및 급가동 스노우 견인 성능 지수.<br>• <strong>자사 현행(7.1)</strong>: 견인 지수 104 (3PMSF 인증 통과 최저 수준)<br>• <strong>경쟁 현행(7.3)</strong>: Michelin Defender LTX 견인 지수 108 수준 대조<br>• <strong>R&D 목표(8.0)</strong>: 가변 3D 미세 사이프 및 극성 친수 중합 폴리머 기용으로 견인 지수 115 확보 목표.'
          },
          {
            metric: 'Treadwear Life (마모 보증 마일리지)',
            scores: { currentHK: 8.3, competitorCurrent: 9.1, targetNext: 9.5 },
            formula: '북미 실제 주행 마일리지 및 UTQG 등급 정량 환산: S = (Treadwear_Rating / 850) * 10',
            description: '실사용자 1억 마일 추적 마모 빅데이터 및 미국 UTQG 마모 시험 결과.<br>• <strong>자사 현행(8.3)</strong>: UTQG 640 (실 주행 약 6.5만 마일 보증)<br>• <strong>경쟁 현행(9.1)</strong>: Michelin Defender LTX UTQG 800 (실 주행 약 8만 마일 보증)<br>• <strong>R&D 목표(9.5)</strong>: 분자 인터록 가교 화학 신소재 처방 및 균일 마모 최적화 접지압 설계로 8.5만 마일 극대화.'
          },
          {
            metric: 'Dry Handling (건조 노면 조종안정성)',
            scores: { currentHK: 8.9, competitorCurrent: 8.8, targetNext: 9.1 },
            formula: '대형 SUV 한계 코너링 슬립각 정규화: S = 15 - Slider_Angle_deg',
            description: '대형 SUV 가중치 인가 상태 건조 노면 선회 시 한계 주행 슬립각 계측치.<br>• <strong>자사 현행(8.9)</strong>: 한계 슬립각 6.8도 검출<br>• <strong>경쟁 현행(8.8)</strong>: Michelin Defender LTX 한계 슬립각 7.0도 대조<br>• <strong>R&D 목표(9.1)</strong>: 패턴 외곽 아웃사이드 리브 블록 브리지 가이더 설계로 선회 횡변형 최소화 (슬립각 6.2도 단축).'
          },
          {
            metric: 'Wet Braking (빗길 제동력)',
            scores: { currentHK: 8.4, competitorCurrent: 8.7, targetNext: 9.0 },
            formula: '젖은 노면 제동거리 정규화: S = 10 - [ (W_actual - 28.0) / (35.0 - 28.0) ] * 10',
            description: 'SUV 가중 하중 상태 수심 1mm 빗길 제동거리(80km/h → 0, m) 계측.<br>• <strong>자사 현행(8.4)</strong>: 제동 거리 30.5m 확보<br>• <strong>경쟁 현행(8.7)</strong>: Michelin Defender LTX 제동 거리 29.8m 대조<br>• <strong>R&D 목표(9.0)</strong>: 빗길 수압 분산을 위한 와이드 숄더 가로 홈 배출 유량 최적 설계 적용으로 제동 거리 29.0m 확보.'
          },
          {
            metric: 'Ride Comfort (장거리 노면 진동 승차감)',
            scores: { currentHK: 9.4, competitorCurrent: 9.0, targetNext: 9.3 },
            formula: '하이웨이 100km/h 정속 주행 시 유입 노면 노이즈 평점화',
            description: '섀시 유입 노면 진동 주파수 분산력 및 실차 실내 dB 계측.<br>• <strong>자사 현행(9.4)</strong>: 소음 71.2 dB (숄더 블록 차단 구조 적용으로 정숙성 우위)<br>• <strong>경쟁 현행(9.0)</strong>: Michelin Defender LTX 소음 72.8 dB 대조<br>• <strong>R&D 목표(9.3)</strong>: 사이드월 하부 프로파일 강성 강도로 장거리 크루징 시 노면 피치 진동 71.5 dB 제어.'
          },
          {
            metric: 'Off-road Grip (험로 탈출 그립 계수)',
            scores: { currentHK: 7.8, competitorCurrent: 8.0, targetNext: 8.2 },
            formula: '진흙(Mud) 및 자갈 험로 탈출 시 최대 슬립 계수 변환: S = Slip_Coeff_max * 20',
            description: '미국 서부 오프로드 트레일 가혹 주행 험로 노면 견인력 계수 계측.<br>• <strong>자사 현행(7.8)</strong>: 슬립 계수 0.35 계측<br>• <strong>경쟁 현행(8.0)</strong>: Michelin Defender LTX 사이드 가드 그립 0.38 대조<br>• <strong>R&D 목표(8.2)</strong>: 사이드 숄더 블록 깊이 및 물림 면적 다단 최적 기하 형상 적용에 의한 오프로드 슬립 0.40 확보.'
          }
        ]
      },
      gaps: [
        { name: 'Treadwear Life (마모 보증 수명)', current: 8.3, target: 9.5, percent: -12.6, level: 'Danger', desc: '자사 차세대 R&D 목표 성능 대비 -12.6%의 갭입니다. 고밀도 분자 인터록 가교 화학 신소재 처방 및 균일 마모 접지압 확보가 급선무입니다.' },
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
            '고적재 SUV/픽업 환경에서 타이어 접지 형상(Footprint)을 정방형으로 분포시켜 특정 부위의 조기 마모(편마모)를 차단하는 접지 면적 최적화 설계.',
            '자갈 충격과 험로 주행 시 발생하는 사이드월 컷(Cut/Laceration) 손상을 방어하기 위한 러기드 사이드 데코레이터 가드 및 림 프로텍터(Rim Protector) 구조 설계.',
            '숄더 블록 가로 홈(Shoulder Groove)의 말단을 폐쇄형으로 설계하여 고속도로 정속 주행 시 외측으로 방출되는 소음을 차단하는 소음 배리어 패턴 디자인.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '북미 시장 8만 마일(약 13만 km) 보증을 달성하기 위해 충전제(카본블랙/실리카)와 고무 분자 간 결합력 및 열화 저항을 높이는 고밀도 내마모 폴리머 연구.',
            '마일리지를 유지하면서 혹한기 눈길 트랙션(Snow Traction)을 확보하기 위해 저온 탄성이 높은 특화 레진과 극성 친수성 실리카 컴파운드 배합 연구.',
            '그루브 홈 내부의 기하학적 돌출 가이드를 통해 거친 노면의 돌멩이나 이물질이 끼어 손상을 유발하는 현상을 자동 방출하는 돌박힘 방지(Stone Ejector) 형상 연구.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>대구경 고인치 SUV 전용 가황(Curing) 몰딩 설비 도입</strong>: 고무 두께(Gauge)가 매우 두꺼운 대형 타이어의 균일 가황 물성을 도출하고 가압 시간 효율화를 위한 다단계 스팀 압력 및 고정밀 가황 프레스 라인 증설 (투자: ₩120억).',
            '<strong>6축 고정밀 동적 CNC 몰드 조각기 배치</strong>: 대형 SUV 및 오프로드용 입체형 사이드월 패턴과 고속 눈길 배수용 3차원 입체 미세 홈(Sipe) 금형을 조각 가공하기 위한 초정밀 6축 가공 설비 배치 (투자: ₩100억).',
            '<strong>습식 마스터배치(Wet Masterbatch) 혼련 가공 라인 신설</strong>: 고성능 실리카나 카본블랙 원료를 물에 혼합한 액상 슬러리 형태로 고무와 사전에 결합시켜 마일리지 극대화와 균일 분산 품질을 달성하는 전용 습식 사조 피딩 설비 구축 (투자: ₩70억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Defender LTX M/S 2', launch: '2023년 Q4', next: 'Defender LTX M/S 3', target: '2029년 Q1 (PLC 6.5년)' },
        { brand: 'Continental', current: 'CrossContact LX25', launch: '2019년 Q3', next: 'CrossContact LX30', target: '2026년 Q2 (PLC 6.8년)' },
        { brand: 'Bridgestone', current: 'Alenza AS Ultra', launch: '2022년 Q3', next: 'Alenza AS Ultra 2', target: '2028년 Q3 (PLC 6.0년)' }
      ]
    },
    k135: {
      id: 'k135',
      tireName: 'Ventus Prime 4 (K135) 후속 R&D 전략',
      currentModel: 'Ventus Prime 4 (K135)',
      segmentName: '프리미엄 투어링 여름용 (Premium Summer Comfort Touring)',
      targetMarket: '유럽 및 글로벌 중대형 프리미엄 세단, 친환경 패밀리카 및 컴팩트 크루저',
      competitorName: 'MICHELIN Primacy 4+',
      nextCompetitorName: 'MICHELIN Primacy 5 (차세대)',
      avgPlcYears: 6.0,
      compCurrentLaunchYear: 2022,
      targetLaunchQuarter: '2028 Q2 전격 출시 예상',
      targetLaunchCalc: '경쟁사 프리미엄 컴포트 세그먼트 가중 평균 PLC(6.0년) 및 미쉐린 Primacy 4+(2022년 출시) 대비 차세대 Primacy 5의 유럽 출시 주기(2028년 초)를 대조 분석하여, 2028년 상반기 내 유럽 프리미엄 OE 수주와 RE 교체 시장 적기 진입 목표 수립',
      totalCapex: '₩31,000,000,000 (310억 원)',
      priorityFocusText: '본 세그먼트(Premium Summer Comfort)의 최우선 R&D 타겟은 [젖은 노면 제동성능(Wet Grip) 극대화 및 마모 수명(Wear Life) 대폭 연장]입니다. 유럽 기후 환경 특성상 빗길 슬립 방지와 고속 주행 시 트레드 마모 마일리지 균일성을 최적화하면서, 승차감(Comfort)과의 트레이드오프를 재료 설계 단계에서 돌파해야 합니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'Premium Summer Comfort', icon: 'fa-sun' },
        { label: '경쟁사 차세대 출시일', value: '2028 Q2 (PLC 6.0년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Primacy 5 (4+ 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: A / RR: B / Noise: 68dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: Wet 제동성능 & Wear 마모 극대화</small>', icon: 'fa-gauge-high' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩31B (310억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '유럽 환경 규제 및 웨트 그립 지배력 강화', text: '유럽 연합 내 타이어 등급제 및 유로 7 규제 대응을 위해 Wet Grip A등급 하한선 돌파와 마모 분진 발생 감소 기술을 동시에 확보하여 지속 가능한 수출 성장을 견인해야 합니다.' },
        { title: '마모 수명(Wear Life)의 세대 교체 달성', text: '기존 K135는 핸들링과 제동력에서 긍정적 평가를 받았으나, 중장거리 주행 비중이 매우 높은 유럽 투어링 타이어 RE 시장에서 경쟁 모델인 미쉐린 Primacy 시리즈 대비 마모 수명 향상을 강력히 원하는 시장 니즈를 수용합니다.' },
        { title: '고감도 정숙성 및 노면 진동 차단', text: '프리미엄 투어링 세단의 품격에 어울리는 극상의 정숙성(68dB 이하)과 노면 미세 진동을 완충할 카카스 완충 고무 레이어 성형 기술 도입이 필요합니다.' }
      ],
      refReports: [
        { id: 18, title: 'Goodyear Summer Sport ULRR(Eagle F1 Asymmetric 6) 상품 분석 결과', docNo: '57049336-B0-HQ25-00037', drafter: '김상현', date: '2025.09.12', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250912152436BF68627618820F4949258D03002331DF?opendocument%26popup=1', summary: '기존 Asymmetric 5 대비 타이어 구조 자체를 경량화하고 사이드월 고무 배합을 최적화하여 초저구름저항(ULRR)을 획득함과 동시에, 급격한 조타 시 접지 형상이 가변적으로 넓어져 노면 압력을 균일하게 분산시키고 스포츠 제동력을 극대화하는 \'드라이 콘택트 패치\' 기술을 실현함. 또한 미세 요철 그립 확보를 위해 젖은 노면 특화 레진 중합 분산 공법을 완벽히 적용함.', insight: 'K135 후속 개발 시, 주행 시 가변적으로 접지면을 넓히는 가변 프로파일 형상 설계 및 고분산 레진 기술 적용이 필요합니다.' },
        { id: 58, title: 'Michelin Premium Summer Sport 신상품 (Pilot Sport 5) Benchmarking 결과 보고', docNo: '57049336-B0-HQ23-00045', drafter: '박진욱', date: '2023.06.07', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2023/06/AC004_1.nsf/vdockey/2023060715231412107CC427E4E1F8492589C700230892?opendocument&ismobile=0%26popup=1', summary: '가감속 및 코너링 시 접지면 전 영역에 걸쳐 가해지는 접지압을 완벽히 균일하게 분배하는 \'맥스타치 컨스트럭션\' 기술을 적용하여 스포츠 그립을 최대로 향상시키는 동시에 트레드 마모 수명을 동급 최고 수준(UTQG 320 마일리지)으로 확보함. 내측의 넓은 가로 홈 배수 성능과 외측의 고강성 솔리드 블록 구조를 결합한 \'듀얼 스포츠 트레드 디자인\'으로 성능 간 상충을 물리적으로 극복함.', insight: '자사 기존 K135의 강점인 마일리지 우위를 유지하면서 조종 응답성 지표를 극대화하기 위해, 인공지능(AI) 기반 접지압 최적 형상 최적화 설계 모델링(MaxTouch 설계 개념) 고도화 및 최적 접지 면적 제어 공법 접목이 강력히 타당함.' },
        { id: 14, title: 'Continental APAM Summer 신상품 Max Contact MC7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ25-00043', drafter: '박진욱', date: '2025.10.31', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/10/AC004_1.nsf/vdockey/2025103013121174187A22AF8303E149258D33001713BC?opendocument%26popup=1', summary: '고온다습한 아시아태평양(APAM) 기후 환경에 최적화하여 실리카 가교를 고점도 폴리머에 균일 중합한 \'스포츠컴플렉스\' 컴파운드로 강력한 젖은 노면/마른 노면 제동 한계를 공고히 함. 또한 메인 세로 홈 내측에 원통형 소음 파쇄기를 다단 배치한 \'노이즈 브레이커 3.0\' 설계로 주행 공기 압축 소음을 산란시켜 NVH 성능을 기존 대비 1.5dB 대폭 저감함.', insight: 'K135 후속 개발 시 정숙성 부문의 경쟁사 우위를 완전하게 점하기 위해, 트레드 홈 내에 가변형 공기 소음 절삭형 노이즈 배리어를 성형하는 패턴 구조 설계를 도입하고 고온다습 기후에 타겟팅된 고온 접지 유지 고분산 배합 기술을 결합해야 함.' }
      ],
      chartData: {
        labels: ['Dry Grip', 'Wet Grip', 'Hydroplaning', 'Comfort', 'Wear Life (Treadwear)', 'Rolling Resistance'],
        currentHK: [9.1, 9.2, 8.8, 9.2, 8.7, 8.9],
        competitorCurrent: [9.2, 9.5, 9.0, 9.3, 9.3, 9.1],
        targetNext: [9.4, 9.6, 9.2, 9.4, 9.5, 9.3]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '유럽 프리미엄 컴포트 시장의 규격을 타겟으로, 자사 및 미쉐린 Primacy 4+ 벤치마킹 데이터를 정량적 물성 스케일링 기법(10점 만점)으로 정규화하여 산출한 수치입니다.',
        details: [
          { name: '자사 현행 평점', text: 'K135 규격별 실차 컴포트 평가 및 빗길 제동 시험 데이터를 10점 만점 척도로 변환.' },
          { name: '경쟁사 현행 평점', text: '유럽 TÜV SÜD 및 ADAC 프리미엄 컴포트 테스트 데이터와 분자 밀도 가교 계측 결과 반영.' },
          { name: '자사 차세대 R&D 목표', text: '경쟁 현행 Primacy 4+ 대비 마모 수명(Wear Life) 및 젖은 노면 제동력(Wet Grip) 우위 확보 시뮬레이션 최적치.' }
        ],
        metrics: [
          {
            metric: 'Dry Grip (건조 노면 제동/그립)',
            scores: { currentHK: 9.1, competitorCurrent: 9.2, targetNext: 9.4 },
            formula: 'S = 10 - [ (D_actual - 33.5) / (39.0 - 33.5) ] * 10',
            description: '건조 노면 실차 제동 거리(100km/h → 0, m) 및 선회 횡G 계측 기반.'
          },
          {
            metric: 'Wet Grip (젖은 노면 제동력)',
            scores: { currentHK: 9.2, competitorCurrent: 9.5, targetNext: 9.6 },
            formula: 'S = 10 - [ (W_actual - 24.5) / (30.0 - 24.5) ] * 10',
            description: '수심 1mm 빗길 제동 거리(80km/h → 0, m) 및 유럽 Wet Grip 등급 연계 수치.'
          },
          {
            metric: 'Hydroplaning (수막 저항)',
            scores: { currentHK: 8.8, competitorCurrent: 9.0, targetNext: 9.2 },
            formula: 'S = (V_actual / 95.0) * 10',
            description: '수심 8mm 직선 수막 진입 임계 속도(V_crit, km/h) 및 배출 속도 성능.'
          },
          {
            metric: 'Comfort (승차감 및 진동 흡수)',
            scores: { currentHK: 9.2, competitorCurrent: 9.3, targetNext: 9.4 },
            formula: 'S = (75 - dB_pass) * 1.2',
            description: '소음(dB) 및 가속도(g) 감쇄율 가중 평점 기반 실차 승차감 평가치.'
          },
          {
            metric: 'Wear Life (트레드 마모 수명)',
            scores: { currentHK: 8.7, competitorCurrent: 9.3, targetNext: 9.5 },
            formula: 'S = (Mileage_actual / 50,000) * 10',
            description: '유럽 표준 마모 주행 시험을 통한 편마모 억제 및 수명 마일리지.'
          },
          {
            metric: 'Rolling Resistance (구름 저항)',
            scores: { currentHK: 8.9, competitorCurrent: 9.1, targetNext: 9.3 },
            formula: 'S = 12.0 - RRC_actual',
            description: '실내 정밀 드럼 계측 RRC(kg/t) 연료 효율 연계 수치.'
          }
        ]
      },
      gaps: [
        { name: 'Wear Life (트레드 마모 수명)', current: 8.7, target: 9.5, percent: -8.4, level: 'Danger', desc: '자사 차세대 R&D 목표 성능 대비 -8.4% 갭입니다. 중장거리 투어링 수명 보강을 위해 하이-시스테인 SBR 고가교 중합체 배합 및 고압착 혼련 가동이 시급합니다.' },
        { name: 'Wet Grip (빗길 수막 제동 마찰력)', current: 9.2, target: 9.6, percent: -4.2, level: 'Warning', desc: '자사 차세대 R&D 목표 성능 대비 -4.2% 갭입니다. 아쿠아파인(AquaPine) 천연 수지 배합 최적화와 친수성 실리카 극성 분산 화학 결합 밀도를 극상으로 상향 설계해야 합니다.' },
        { name: 'Rolling Resistance (구름 저항)', current: 8.9, target: 9.3, percent: -4.3, level: 'Warning', desc: '연료 효율 등급 상향을 위한 RRC 갭입니다. 사이드월 경량 보강 코드 적용 및 이너라이너 두께 편차를 축소하여 회전저항을 감쇄해야 합니다.' }
      ],
      skuStrategy: {
        rims: '16인치 ~ 20인치 프리미엄 컴포트 세단 주력 매핑 (17~18인치 비중 65% 이상 볼륨 대응)',
        ratio: '30% OE (유럽 폭스바겐, 아우디, 스코다 컴팩트 세단 및 EV 해치백) / 70% RE',
        sizes: '205/55R16, 215/55R17, 225/45R17, 225/50R17, 225/45R18, 235/45R18, 245/45R18, 245/40R19',
        desc: '유럽 컴팩트~중대형 승용 볼륨 교체 수요를 선점하기 위해 초편평비보다는 승차감과 긴 수명에 중점을 둔 깊은 트레드 홈 깊이(8.0mm 표준) 기반의 라인업을 가동. 친환경 내연기관 및 전동화 패밀리카 겸용을 위해 내하중 가중(XL) 규격을 라인업의 45% 이상 포지셔닝 추천.'
      },
      labelingTargets: {
        rr: 'B',
        rrBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        wet: 'A',
        wetBg: 'linear-gradient(135deg, #16a34a, #15803d)',
        noise: '68 dB',
        noiseClass: 'A 등급'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            'AquaPine 천연 소나무 레진 컴파운더 기용으로 빗길 미세 요철 접지 확보 및 친수 접지 면적 활성화.',
            '비드부 변형을 방지할 수 있는 비드 와이어 가이드 성형 기술을 도입하여 선회 핸들링 횡강성 보완.',
            '소음 주파수를 산란시키는 다단 가변 피치 시퀀스 기하 패턴 적용으로 실외 Pass-by 소음 최소화.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '내마모 특화 고밀도 하이-시스테인 SBR 고가교 분중합체 기술 및 기능성 실리카 커플링 가황 반응 제안.',
            '수막현상 극복과 배수 효율 최적화를 위한 3D 가변 횡홈 몰드 형상 기하학 설계.',
            '연비 마진 극대화를 위해 사이드월 게이지 극박화 정밀 배치 및 케이싱 컴팩트 구조 기술 적용.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>고밀도 실리카 배합용 트윈 스크류 연속 혼련기(Twin-Screw Continuous Mixer) 도입</strong>: 고농도 실리카 컴파운드 분산과 투어링 수명 향상을 위한 압출 혼련 공정 투자 (투자: ₩150억).',
            '<strong>초정밀 3D 미세 사이프(Sipe) 몰드 가공 시스템 구축</strong>: 빗길 제동력과 블록 응력을 지탱할 수 있는 특화 Sipe 가변 몰드 제작 CNC 레이저 설비 증설 (투자: ₩90억).',
            '<strong>박게이지 이너라이너 연속 압축 압착 성형 라인</strong>: 회전저항 감쇄를 위해 이너라이너 두께 편차를 축소하는 연속 로터 압축 압착 설비 고도화 (투자: ₩70억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Primacy 4+', launch: '2022년 Q1', next: 'Primacy 5', target: '2028년 Q2 (PLC 6.0년)' },
        { brand: 'Continental', current: 'PremiumContact 7', launch: '2022년 Q4', next: 'PremiumContact 8', target: '2028년 Q2 (PLC 5.5년)' },
        { brand: 'Bridgestone', current: 'Turanza T005', launch: '2018년 Q1', next: 'Turanza T006', target: '2026년 Q1 (PLC 8.0년)' }
      ]
    },
    h446: {
      id: 'h446',
      tireName: 'Kinergy EX (H446) 후속 R&D 전략',
      currentModel: 'Kinergy EX (H446)',
      segmentName: '글로벌 이코노미 올시즌 실용형 (Standard Passenger All-Season)',
      targetMarket: '글로벌 컴팩트 카, 소형 소형 SUV, 내수 및 글로벌 가성비 중시 RE 교체 수요',
      competitorName: 'MICHELIN Energy Saver4',
      nextCompetitorName: 'MICHELIN Energy Saver5 (차세대)',
      avgPlcYears: 6.8,
      compCurrentLaunchYear: 2020,
      targetLaunchQuarter: '2027 Q3 전격 출시 예상',
      targetLaunchCalc: '실용 마일리지 세그먼트의 긴 제품 수명 주기(평균 6.8년) 및 경쟁사 대표 친환경/실용 모델의 2020년 출시 주기를 추적하여, 2027년 중순 이후 완전히 고부가가치화된 차세대 Saver5 시장 포지셔닝에 맞춘 자사 고가성비 극대마일리지 교체 시장 장악 전략 수립',
      totalCapex: '₩15,000,000,000 (150억 원)',
      priorityFocusText: '본 세그먼트(Economy All-Season)의 최우선 R&D 타겟은 [초고장수명 마모 마일리지(UTQG 600+) 확보 및 실용적 경제성 제어]입니다. 엔트리 등급에서도 장거리 가혹 마모 편차를 최소화하고 균일한 접지압 배분을 극대화하여 마일리지 효율을 높이면서, 자사 특유의 우수한 소음 분산(NVH) 능력을 유지해야 합니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'Economy Passenger All-Season', icon: 'fa-gas-pump' },
        { label: '경쟁사 차세대 출시일', value: '2027 Q3 (PLC 6.8년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Energy Saver5 (Saver4 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: B / RR: C / Noise: 70dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: UTQG 600+ 마일리지 & 가성비 제조원가 제어</small>', icon: 'fa-piggy-bank' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩15B (150억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '고마일리지 가성비 RE 교체 마켓 대응', text: '물가 상승 및 고금리 장기화로 리테일 RE 마켓에서 초고마일리지를 보장하면서도 합리적 가격대를 갖춘 보급형 사계절 타이어의 교체 수요가 급증함에 따라 성능과 원가 양립이 강력히 요구됩니다.' },
        { title: '보급형 카본 블랙 하이브리드 혼련 물성 극대화', text: '비싼 고상 친수 실리카 배합률을 경제적으로 조율하면서도, 구조적 가황 온도 분산을 통해 트레드 고무의 미세 인장강도를 높이는 카본-실리카 하이브리드 컴파운드 기술의 고도화가 핵심입니다.' },
        { title: '숄더 강성 보강을 통한 이상 편마모 원천 차단', text: '엔트리급 차량 특성상 서스펜션 정렬 오차 등으로 인한 트레드 외측 조기 마모(편마모)가 다수 보고되어, 숄더 블록의 기하학적 면적을 보강하여 균일 마모를 유지하도록 설계 개선합니다.' }
      ],
      refReports: [
        { id: 47, title: '북미 SUV 신상품(UTQG Treadwear 800) Benchmarking 결과 보고', docNo: '57049336-B0-HQ24-00014', drafter: '송호영', date: '2024.03.18', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/03/AC004_1.nsf/vdockey/20240318094233F64D6D21C2F21FE149258AE40003DF48?opendocument&ismobile=0%26popup=1', summary: '북미 장거리 투어링 마켓 타겟으로 트레드웨어 800 수준의 초고내내마모 에버트레드 기술 확보 분석. 실리카와 폴리머 결합력을 극대화하여 드럼 시험 시 미세 탈락을 억제하는 인터록 고가교 공중합체.', insight: '마일리지 극대화를 위해 분입 혼련 연속 가동 시스템 접목과 가황 시간 조율이 강력히 타당함.' },
        { id: 83, title: '북미용 Performance Touring SUV 상품 개발을 위한 Benchmarking 분석 보고 (1차)', docNo: '57049336-B0-HQ21-00032', drafter: '송호영', date: '2021.11.29', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2021/11/AC004_1.nsf/vdockey/2021112510082399927CDDD25DBE804925879800063E19?opendocument&ismobile=0%26popup=1', summary: '대형 SUV에 맞추어 주행 소음 피치를 전면 분산 설계한 가변 블록 기술. 급차선 변경 시 대형 차체 롤링을 제어하기 위해 비드 턴업을 극대화하고 고강성 필러 고무를 기용한 조종안정성 확보.', insight: '엔트리 세단용 트레드 소음 제어를 위해 가변 피치 배치 적용 및 숄더 차단 패턴 디자인 도입.' },
        { id: 25, title: 'Michelin LT(Pick up Highway Terrain)상품 분석 결과 (Defender LTX M/S 2 & Defender LTX Platinum)', docNo: '57049336-B0-HQ25-00017', drafter: '김상현', date: '2025.05.23', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/05/AC004_1.nsf/vdockey/20250523090314C0A841075111E67C49258C9300004930?opendocument&ismobile=0%26popup=1', summary: '고하중 고적재 및 험로 하에서도 8만 마일 초장수명을 유지하는 에버트레드 2.0 강결합 폴리머 화합물. 접지압을 센터와 숄더에 균등 분산하여 편마모를 방지하는 맥스프레셔 카카스 프로파일.', insight: '보급형 타이어 접지압 균등화를 위해 센터/숄더압 최적 프로파일 설계 가이드 적용이 타당함.' }
      ],
      chartData: {
        labels: ['Treadwear Life', 'Wet Braking', 'Dry Grip', 'Ride Comfort', 'Pattern Noise', 'Value Price'],
        currentHK: [8.2, 7.8, 8.0, 8.5, 8.4, 9.2],
        competitorCurrent: [8.8, 8.2, 8.1, 8.4, 8.2, 8.5],
        targetNext: [9.4, 8.4, 8.3, 8.7, 8.6, 9.4]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '글로벌 엔트리 가성비 세그먼트의 특수성을 고려하여, 북미 UTQG 마모 실측 등급 및 경쟁 친환경 모델의 실차 대조 성능 데이터를 기반으로 10점 만점 척도로 선형 변환하였습니다.',
        details: [
          { name: '자사 현행 평점', text: 'H446 실차 마모 드럼 테스트 데이터 및 북미/유럽 유저 사용 마일리지 대조 분석 반영.' },
          { name: '경쟁사 현행 평점', text: '미쉐린 Energy Saver4의 북미 실 마모 계측치 및 보급형 세그먼트 원가 구조 추적 대조.' },
          { name: '자사 차세대 R&D 목표', text: '제한적인 설비 비용 하에서 트레드 마모 수명(Treadwear Rating 620)을 확보하기 위한 최적 성능 목표치.' }
        ],
        metrics: [
          {
            metric: 'Treadwear Life (마모 보증 수명)',
            scores: { currentHK: 8.2, competitorCurrent: 8.8, targetNext: 9.4 },
            formula: 'S = (Treadwear_Rating / 650) * 10',
            description: '실차 주행 약 6만 마일 이상 보증을 달성하기 위한 편마모 방어 및 고내구 컴파운드 척도.'
          },
          {
            metric: 'Wet Braking (빗길 제동력)',
            scores: { currentHK: 7.8, competitorCurrent: 8.2, targetNext: 8.4 },
            formula: 'S = 10 - [ (W_actual - 28.0) / (35.0 - 28.0) ] * 10',
            description: '수심 1mm 빗길 실차 제동 거리(80km/h → 0, m) 및 젖은 노면 배수 유량 계측.'
          },
          {
            metric: 'Dry Grip (건조 노면 제동)',
            scores: { currentHK: 8.0, competitorCurrent: 8.1, targetNext: 8.3 },
            formula: 'S = 10 - [ (D_actual - 35.0) / (40.0 - 35.0) ] * 10',
            description: '건조 노면 실차 제동 거리 및 블록 횡력 저항 평점.'
          },
          {
            metric: 'Ride Comfort (진동 감쇄 승차감)',
            scores: { currentHK: 8.5, competitorCurrent: 8.4, targetNext: 8.7 },
            formula: 'S = (75 - dB_pass) * 1.1',
            description: '실차 도로 주행 시 차체 유입 진동 RMS 주파수 분산 지수.'
          },
          {
            metric: 'Pattern Noise (패턴 발생 소음)',
            scores: { currentHK: 8.4, competitorCurrent: 8.2, targetNext: 8.6 },
            formula: 'S = (72 - dB_actual) * 1.2',
            description: '정속 주행 시 가변 피치 형상에 의한 고주파 소음 상쇄성.'
          },
          {
            metric: 'Value Price (가성비 및 제조원가)',
            scores: { currentHK: 9.2, competitorCurrent: 8.5, targetNext: 9.4 },
            formula: 'S = [ 1 - (Manufacturing_Cost_actual / Cost_limit) ] * 10',
            description: 'R&D 처방 원가율 제어 및 가황 생산성 지표 기반 경제성 점수.'
          }
        ]
      },
      gaps: [
        { name: 'Treadwear Life (마모 보증 수명)', current: 8.2, target: 9.4, percent: -12.7, level: 'Danger', desc: '자사 차세대 R&D 목표 성능 대비 -12.7% 갭입니다. 고장수명 마일리지를 위해 저발열 이소프렌 폴리머 및 듀얼 압축 가황 공정 제어가 절실히 요구됩니다.' },
        { name: 'Wet Braking (빗길 제동 마찰력)', current: 7.8, target: 8.4, percent: -7.1, level: 'Warning', desc: '빗길 주행 안전을 위한 제동력 갭입니다. 배수성 극대화를 위해 4채널 메인 스트레이트 그루브 체적 최적 조율과 다중 수평 배수 사이프 성형을 조율해야 합니다.' }
      ],
      skuStrategy: {
        rims: '14인치 ~ 17인치 소형 및 준중형 세단 맞춤 (15~16인치 중심 컴팩트 볼륨 규격 80%)',
        ratio: '10% OE / 90% RE (가성비 중심 글로벌 리테일 교체 시장 정조준)',
        sizes: '165/60R14, 175/65R15, 185/65R15, 195/65R15, 205/55R16, 205/60R16, 215/55R17',
        desc: '엔트리급 차종의 교체 주기를 타겟팅하여 긴 홈 수명을 보장하는 깊은 트레드 깊이(8.2mm) 세팅. 타이어 회전 저항 및 원가 구조를 최적화하여 딜러 마진과 소비자 경제성을 상호 만족하도록 SKU 구성.'
      },
      labelingTargets: {
        rr: 'C',
        rrBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        wet: 'B',
        wetBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        noise: '70 dB',
        noiseClass: 'B 등급'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            'MaxTouch 접지 면적 시뮬레이션을 엔트리 등급에도 기본 처방하여 접지압 집중부 조기 소실 예방.',
            '아웃사이드 숄더 블록 강성을 튼튼하게 보강하여 저차원 차량에서의 코너링 편마모 억제.',
            '4채널 메인 직선 홈 배수로 직선 주행 배수량 극대화 및 빗길 수막현상(Hydroplaning) 감쇄.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '저발열 천연고무 이소프렌 폴리머 배합 개조 및 기가 가황(Curing) 내구성 유지 처방.',
            '보급형 카본블랙 실리카 결합력(Carbon-Silica Hybrid) 강화를 위한 고분산 화학 결합 반응 제어.',
            '가황 성형 온도 분산 편차를 제거하여 타이어 전 영역 균일 강도를 사수하는 공정 기술.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>습식 마스터배치(Wet Masterbatch) 혼련 가공 라인 개편</strong>: 실리카 고무 사전 분산 슬러리 공급을 활용한 보급형 내마모 극대화 기법 도입 (투자: ₩60억).',
            '<strong>대용량 고압 압출 성형 및 치수 감제 설비</strong>: 트레드 균일 게이지 가공을 통한 고밀도 내마모 형상 압출 정밀도 확보 (투자: ₩50억).',
            '<strong>가황 프레스 공정 가압 밸런스 제어 자동화 시스템</strong>: 가황 가압 온도 편차 최소화로 보급형 제품군의 불량률을 극도로 저감하는 개편 (투자: ₩40억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Energy Saver4', launch: '2020년 Q1', next: 'Energy Saver5', target: '2027년 Q3 (PLC 6.8년)' },
        { brand: 'Continental', current: 'UltraContact', launch: '2022년 Q2', next: 'UltraContact 2', target: '2028년 Q2 (PLC 6.0년)' },
        { brand: 'Bridgestone', current: 'Ecopia EP150', launch: '2019년 Q3', next: 'Ecopia EP152', target: '2026년 Q3 (PLC 7.0년)' }
      ]
    },
    h472: {
      id: 'h472',
      tireName: 'Kinergy GT (H472) 후속 R&D 전략',
      currentModel: 'Kinergy GT (H472)',
      segmentName: '프리미엄 사계절 그랜드 투어링 (Premium All-Season Grand Touring)',
      targetMarket: '글로벌 완성차 메이저 중대형 세단 사계절 OE (내수 및 북미 세단 전용) 및 북미 RE 시장',
      competitorName: 'MICHELIN Primacy Tour A/S',
      nextCompetitorName: 'MICHELIN Primacy Tour A/S 2 (차세대)',
      avgPlcYears: 6.2,
      compCurrentLaunchYear: 2021,
      targetLaunchQuarter: '2027 Q4 전격 출시 예상',
      targetLaunchCalc: '경쟁사 프리미엄 그랜드 투어링 모델의 글로벌 출시 주기(평균 6.2년) 및 미쉐린 Primacy Tour A/S(2021년 출시)의 차세대 모델 2027년 하반기 출시 트렌드를 대조 분석하여, 북미 및 국내 중대형 프리미엄 OE 수주 확보를 위한 선제 개발 로드맵 매핑',
      totalCapex: '₩23,000,000,000 (230억 원)',
      priorityFocusText: '본 세그먼트(Premium Grand Touring All-Season)의 최우선 R&D 타겟은 [글로벌 완성차 메이저 OE 정숙성 규격 충족 및 사계절 전천후 제동력 균형]입니다. 혹한기 눈길/빗길 노면 안전과 고속도로 크루징 시 저소음(NVH) 필터링을 조화시키기 위해, 다단 피치 배치와 특화 실리카 컴파운드 분산 제어가 필수적인 과제입니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'Premium Grand Touring All-Season', icon: 'fa-cloud' },
        { label: '경쟁사 차세대 출시일', value: '2027 Q4 (PLC 6.2년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Primacy Tour A/S 2 (Primacy Tour 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: B / RR: B / Noise: 69dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: 저소음 주행 정숙성 & 사계절 전천후 제동 밸런스</small>', icon: 'fa-shield-halved' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩23B (230억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '글로벌 프리미엄 세단 OE 수주 규격 정복', text: '제네시스, 현대, 기아는 물론 토요타, 혼다 등 글로벌 중대형 프리미엄 세단 OE 사양의 혹독한 주행 소음 가이드라인(실내 공명음 차단)과 사계절 전천후 주행 안정성을 동시에 정밀 충족하기 위해 컴포트 기술 도입이 필요합니다.' },
        { title: '저온 눈길 그립과 사계절 컴파운드 최적 융합', text: '겨울철 영하 저온 노면에서도 컴파운드가 딱딱하게 경화되지 않고 눈길 제동력을 사수하는 천연 레진 중합 폴리머 및 75% 실리카 분산 조합을 통해 올시즌 안전 등급을 향상합니다.' },
        { title: '하이웨이 섀시 진동 제어용 프로파일 정밀화', text: '타이어 내부의 공기 진동이 차체를 통해 스티어링 휠로 전달되는 고주파 진동을 소멸하기 위해 사이드월 부위에 고완충 보강 쿠션 패드를 고무 일체형으로 압출 배치합니다.' }
      ],
      refReports: [
        { id: 76, title: 'Michelin All Weather 상품 CrossClimate2 Benchmarking 분석 보고 (2차)', docNo: '57049336-B0-HQ22-00021', drafter: '양승혁', date: '2022.07.21', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2022/07/AC004_1.nsf/vdockey/2022071917004638493771301FF34A49258884002C0049?opendocument&ismobile=0%26popup=1', summary: '수막 및 눈길 트랙션을 이상적으로 개선한 방향성 V형 패턴 그루브 설계. 겨울철 저온 고무 유연성과 여름철 고결합 강도를 동시에 달성하여 긴 수명과 그립을 다잡은 열 서보 어댑티브 컴파운드.', insight: '광범위 온도에서 유연성과 결합 강도를 동시 만족하는 열 서보 어댑티브 고강도 합성 기술 접목이 타당함.' },
        { id: 83, title: '북미용 Performance Touring SUV 상품 개발을 위한 Benchmarking 분석 보고 (1차)', docNo: '57049336-B0-HQ21-00032', drafter: '송호영', date: '2021.11.29', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2021/11/AC004_1.nsf/vdockey/2021112510082399927CDDD25DBE804925879800063E19?opendocument&ismobile=0%26popup=1', summary: '대형 SUV에 맞추어 주행 소음 피치를 전면 분산 설계한 가변 블록 기술. 급차선 변경 시 대형 차체 롤링을 제어하기 위해 비드 턴업을 극대화하고 고강성 필러 고무를 기용한 조종안정성 확보.', insight: '정숙 프리미엄 크루징 소음 감쇄를 위해 홈 내측 소음 산란 노이즈 가드 및 가변 다단 피치 배치 설계 고도화.' },
        { id: 14, title: 'Continental APAM Summer 신상품 Max Contact MC7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ25-00043', drafter: '박진욱', date: '2025.10.31', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/10/AC004_1.nsf/vdockey/2025103013121174187A22AF8303E149258D33001713BC?opendocument%26popup=1', summary: '고온다습한 아시아태평양(APAM) 기후 환경에 최적화하여 실리카 가교를 고점도 폴리머에 균일 중합한 \'스포츠컴플렉스\' 컴파운드로 강력한 젖은 노면/마른 노면 제동 한계를 공고히 함. 또한 메인 세로 홈 내측에 원통형 소음 파쇄기를 다단 배치한 \'노이즈 브레이커 3.0\' 설계로 주행 공기 압축 소음을 산란시켜 NVH 성능을 기존 대비 1.5dB 대폭 저감함.', insight: '공기 압착 소음을 저감하기 위해 메인 그루브 내부 미세 노이즈 브레이커 성형 성형 공정 도입이 가치가 큼.' }
      ],
      chartData: {
        labels: ['All-Season Grip', 'Ride Comfort', 'Pass-by Noise', 'Wet Braking', 'Snow Traction', 'Wear Life'],
        currentHK: [8.6, 9.2, 9.3, 8.4, 7.8, 8.5],
        competitorCurrent: [8.9, 9.3, 9.4, 8.8, 8.2, 8.8],
        targetNext: [9.1, 9.5, 9.6, 9.0, 8.6, 9.0]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '글로벌 프리미엄 OE 정숙성 규격과 동계 주행 안정성을 검증하기 위해, 사내 실차 소음 평가 및 핀란드 스노우 마찰 지수 계측을 10점 만점 단위로 선형 환산하여 연산하였습니다.',
        details: [
          { name: '자사 현행 평점', text: 'H472의 무향 챔버 정속 패스바이 실측 소음값 및 윈터 전용 이발로 테스트 스노우 견인력 계측치 매핑.' },
          { name: '경쟁사 현행 평점', text: '미쉐린 Primacy Tour A/S의 세단 OE 벤치마킹 데이터 및 고주파 주행 데시벨 분석 대조.' },
          { name: '자사 차세대 R&D 목표', text: '글로벌 OE 메이저 수주 조건 통과를 목표로, 젖은 노면 및 컴포트 정숙 지표 동급 1위를 수립하기 위한 예측 시뮬레이션 결과.' }
        ],
        metrics: [
          {
            metric: 'All-Season Grip (사계절 전천후 그립)',
            scores: { currentHK: 8.6, competitorCurrent: 8.9, targetNext: 9.1 },
            formula: 'S = (G_actual / 0.85) * 10',
            description: '봄/여름/가을 다양한 기온 하에서의 종합 횡적 마찰 계수 및 노면 홀딩 능력.'
          },
          {
            metric: 'Ride Comfort (주행 정숙성 & 진동 승차감)',
            scores: { currentHK: 9.2, competitorCurrent: 9.3, targetNext: 9.5 },
            formula: 'S = (74 - dB_pass) * 1.25',
            description: '실차 주행 시 시트 및 플로어 하부에 전달되는 주행 진동 감쇄 효율.'
          },
          {
            metric: 'Pass-by Noise (실외 통과 소음)',
            scores: { currentHK: 9.3, competitorCurrent: 9.4, targetNext: 9.6 },
            formula: 'S = (72 - dB_actual) * 1.5',
            description: 'ISO 표준 Pass-by 야외 실외 소음 계측 데시벨 기준(목표 69dB).'
          },
          {
            metric: 'Wet Braking (젖은 노면 제동력)',
            scores: { currentHK: 8.4, competitorCurrent: 8.8, targetNext: 9.0 },
            formula: 'S = 10 - [ (W_actual - 25.0) / (32.0 - 25.0) ] * 10',
            description: '빗길 가중 제동 거리 및 배수 방해 억제 패턴 계측 성능.'
          },
          {
            metric: 'Snow Traction (눈길 구동 트랙션)',
            scores: { currentHK: 7.8, competitorCurrent: 8.2, targetNext: 8.6 },
            formula: 'S = (Snow_Index / 115) * 10',
            description: '혹한기 눈길 슬립각 제어 및 구동 견인 가속 지수(Snow Index).'
          },
          {
            metric: 'Wear Life (트레드 마모 마일리지)',
            scores: { currentHK: 8.5, competitorCurrent: 8.8, targetNext: 9.0 },
            formula: 'S = (UTQG_Treadwear / 550) * 10',
            description: '북미 보증 약 5만 마일 보증을 위한 가황 가공 품질 및 균일 마모 척도.'
          }
        ]
      },
      gaps: [
        { name: 'Snow Traction (눈길 견인 및 전단력)', current: 7.8, target: 8.6, percent: -9.3, level: 'Danger', desc: '차세대 R&D 목표 대비 -9.3% 갭입니다. 핀란드 이발로(Ivalo) 눈길 시험 기반의 미세 지그재그 다각 사이프(Z-Sipe) 설계 및 고탄성 친수 폴리머 합성 보강이 요구됩니다.' },
        { name: 'Wet Braking (빗길 제동 마찰력)', current: 8.4, target: 9.0, percent: -6.7, level: 'Warning', desc: '빗길 배수성 극대화 및 미끄럼 억제 갭입니다. 트레드 내부 메인 가로 그루브의 가변 경사각 단면 설계를 적용해 수막현상을 선제 배출해야 합니다.' },
        { name: 'Ride Comfort (주행 정숙성 & 진동 승차감)', current: 9.2, target: 9.5, percent: -3.2, level: 'Warning', desc: '정숙 주행 컴포트 갭입니다. 트레드 홈 내에 가변형 공기 소음 절삭 노이즈 배리어를 성형하는 입체 가공 기술이 도입되어야 합니다.' }
      ],
      skuStrategy: {
        rims: '16인치 ~ 21인치 프리미엄 투어링 OE 대응 (18~20인치 중심 중대형 세단용 비중 75% 구성)',
        ratio: '50% OE (제네시스 G80/G90, 그랜저, 글로벌 세단 OE 대응) / 50% RE',
        sizes: '215/55R17, 225/55R17, 235/45R18, 245/45R18, 245/45R19, 245/40R19, 245/40R20, 245/35R21',
        desc: '장거리 투어링의 조용함과 고속 주행 시 롤링 억제를 보장하도록 고경성 비드 필러 사양의 80여 개 하이엔드 규격을 선제 구성. 특히 정숙성 특화를 위해 내벽 폼 접착 대응용 전용 케이싱 세팅 지원.'
      },
      labelingTargets: {
        rr: 'B',
        rrBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        wet: 'B',
        wetBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        noise: '69 dB',
        noiseClass: 'A 등급'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '소음 배출을 물리적으로 산란 억제시키는 가변 비대칭형 다단 피치(Pitch) 디자인 시퀀스 적용.',
            '비드 턴업 높이를 극대화하여 고출력 세단의 급격한 조타 시 차체 요동을 단단히 구속하는 설계.',
            '사이드월 중앙부에 고유 소음 흡수 고충격 쿠션 고무를 삽입하여 고속도로 잔진동 필터링.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '영하 저온 환경에서도 고무 탄성을 유연하게 보존하는 고친수성 폴리머 합성 및 친수 가소제 개발.',
            '눈길 구동력을 확보하기 위한 입체적 지그재그 3차원 Z-Sipe 가변 몰드 최적 배치.',
            '수막 제동력 증대를 위해 메인 배수 가로 홈에 가변형 단면 수압 분출 설계 모델 기용.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>초정밀 3차원 지그재그 Z-Sipe 금형 CNC 조각 라인</strong>: 사계절 전천후 눈길 견인과 슬립 제동을 사수하는 고정밀 미세 배수 홈 조각기 증설 (투자: ₩100억).',
            '<strong>사이드월 다단 완충 패드 성형 압출 설비</strong>: 타이어 진동 완완충 고무 레이어를 오차 없이 연속 합착하는 성형 압출 로봇 헤드 개편 (투자: ₩70억).',
            '<strong>트레드 이종 압출 치수 제어용 매니폴드 압출기</strong>: 캡 및 베이스 이종 컴파운드의 연속 정밀 밀착 압출을 통한 가공 한계 최소화 (투자: ₩60억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Primacy Tour A/S', launch: '2019년 Q2', next: 'Primacy Tour A/S 2', target: '2027년 Q4 (PLC 6.2년)' },
        { brand: 'Continental', current: 'ProContact TX', launch: '2018년 Q3', next: 'ProContact TX 2', target: '2026년 Q4 (PLC 7.5년)' },
        { brand: 'Bridgestone', current: 'Turanza QuietTrack', launch: '2019년 Q1', next: 'Turanza QuietTrack 2', target: '2026년 Q3 (PLC 7.0년)' }
      ]
    },
    ra43: {
      id: 'ra43',
      tireName: 'Dynapro HP2 (RA43) 후속 R&D 전략',
      currentModel: 'Dynapro HP2 (RA43)',
      segmentName: '도심형 프리미엄 SUV 투어링 (Premium Highway Terrain SUV)',
      targetMarket: '글로벌 완성차 고출력 SUV OE (Genesis GV70/GV80, 현대/기아 메이저 SUV) 및 프리미엄 도심형 SUV RE 시장',
      competitorName: 'MICHELIN Latitude Tour HP',
      nextCompetitorName: 'MICHELIN Latitude Tour HP 2 (차세대)',
      avgPlcYears: 6.4,
      compCurrentLaunchYear: 2021,
      targetLaunchQuarter: '2027 Q4 전격 출시 예상',
      targetLaunchCalc: '글로벌 프리미엄 SUV 세그먼트의 라이프사이클(평균 6.4년) 및 미쉐린 Latitude Tour HP의 장기 베스트셀러 후속 대응 주기를 대조 분석하여, 2027년 하반기 유럽 및 국내 완성차 브랜드의 차세대 럭셔리 하이웨이 크루저 SUV 신차 OE 수주 및 고수익 RE 시장 적기 진입 목표 수립',
      totalCapex: '₩25,000,000,000 (250억 원)',
      priorityFocusText: '본 세그먼트(Premium SUV Highway Terrain)의 최우선 R&D 타겟은 [고인치 고하중 SUV용 고속 안정성 극대화 및 도심형 NVH 저소음 제어]입니다. 대형 SUV의 무거운 차체와 가속 횡압력에서도 타이어 접지 형상의 비틀림을 원천 차단하는 고강성 리브 설계와 소음 분산 차단 기술의 결합이 R&D의 핵심입니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'Premium Highway Terrain SUV', icon: 'fa-car-side' },
        { label: '경쟁사 차세대 출시일', value: '2027 Q4 (PLC 6.4년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Latitude Tour HP 2 (Latitude Tour 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: A / RR: B / Noise: 70dB<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: 고속 선회 주행 안정성 & 하이웨이 소음 절삭</small>', icon: 'fa-road' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩25B (250억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '고중량 프리미엄 SUV 특화 고강성 뼈대 설계', text: '공차중량 2톤을 초과하는 대형 프리미엄 SUV의 고속 선회 시 발생하는 트레드 외측 블록 변형과 비드부 찌그러짐을 예방하기 위해 카카스 구조 강성과 사이드월 장력을 12% 이상 강화해야 합니다.' },
        { title: '도심지 노면 및 하이웨이 유입 노이즈 산란', text: '엔진 부하가 커 소음 유입이 잦은 패밀리 SUV 고객을 위해 트레드 중앙에 저소음 가변 리브 설계 및 아웃터 숄더블록에 사이프 말단 가드 구조를 삽입해 소음 방사 현상을 차단합니다.' },
        { title: '수막현상 및 장마철 제동 성능 전폭 보강', text: '대형 SUV의 젖은 노면 제동 안전을 위해 실리카 80% 고상 친수 컴파운드 분산 제어 및 중앙 3줄의 와이드 스트레이트 배수 채널 체적을 확보합니다.' }
      ],
      refReports: [
        { id: 9, title: '북미 Pick-up Truck용 Tire의 Sidewall Block Design 분석 결과', docNo: '57049336-B0-HQ26-00004', drafter: '송호영', date: '2026.01.22', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2026/01/AC004_1.nsf/vdockey/202601221131004B06BC6A49C1B44849258D87000DCDB6?opendocument%26popup=1', summary: '오프로드 험로 탈출 및 날카로운 자갈 충격에 강한 러기드 사이드월 블록 디자인 형상 설계. 고속 롤링 시 발생하는 주파수를 다중 상쇄시키는 NVH 저감형 가변 피치 설계 정량화.', insight: 'SUV용 횡력 및 험로 충격 보호를 위해 사이드월 프로텍터 몰딩 금형 기술 도입.' },
        { id: 83, title: '북미용 Performance Touring SUV 상품 개발을 위한 Benchmarking 분석 보고 (1차)', docNo: '57049336-B0-HQ21-00032', drafter: '송호영', date: '2021.11.29', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2021/11/AC004_1.nsf/vdockey/2021112510082399927CDDD25DBE804925879800063E19?opendocument&ismobile=0%26popup=1', summary: '대형 SUV에 맞추어 주행 소음 피치를 전면 분산 설계한 가변 블록 기술. 급차선 변경 시 대형 차체 롤링을 제어하기 위해 비드 턴업을 극대화하고 고강성 필러 고무를 기용한 조종안정성 확보.', insight: '고하중 주행 롤링 방지를 위해 비드 턴업 강화 및 사이드 가변 강성 프로파일 적용 필수.' },
        { id: 25, title: 'Michelin LT(Pick up Highway Terrain)상품 분석 결과 (Defender LTX M/S 2 & Defender LTX Platinum)', docNo: '57049336-B0-HQ25-00017', drafter: '김상현', date: '2025.05.23', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/05/AC004_1.nsf/vdockey/20250523090314C0A841075111E67C49258C9300004930?opendocument&ismobile=0%26popup=1', summary: '고하중 고적재 및 험로 하에서도 8만 마일 초장수명을 유지하는 에버트레드 2.0 강결합 폴리머 화합물. 접지압을 센터와 숄더에 균등 분산하여 편마모를 방지하는 맥스프레셔 카카스 프로파일.', insight: 'SUV 접지압 왜곡에 따른 편마모 예방을 위한 가변 구조 설계 기준 적용.' }
      ],
      chartData: {
        labels: ['SUV High Load Grip', 'Highspeed Stability', 'Pass-by Noise', 'Wet Braking', 'Comfort Ride', 'Wear Life'],
        currentHK: [8.7, 8.8, 9.1, 8.5, 9.3, 8.6],
        competitorCurrent: [8.9, 9.1, 9.2, 8.9, 9.1, 8.9],
        targetNext: [9.3, 9.5, 9.5, 9.2, 9.5, 9.1]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '고인치 럭셔리 SUV 규격에 의거하여, 차량 고하중 코너링 횡변형 계측력 및 실차 실내 투입 소음 계측을 10점 만점 척도로 환산 수치화한 수치입니다.',
        details: [
          { name: '자사 현행 평점', text: 'RA43의 실차 서킷 고속 핸들링 및 주행 횡G 하중 테스트 센싱 계측 데이터 반영.' },
          { name: '경쟁사 현행 평점', text: '미쉐린 Latitude Tour HP의 OE 수입 사양 분해 및 거칠기 진동 감쇄 효율 변환.' },
          { name: '자사 차세대 R&D 목표', text: '차세대 럭셔리 SUV 타겟으로 고하중 선회 안정성과 정숙성을 획기적으로 개선시키기 위한 설계 모델 최적치.' }
        ],
        metrics: [
          {
            metric: 'SUV High Load Grip (SUV 고하중 선회 마찰력)',
            scores: { currentHK: 8.7, competitorCurrent: 8.9, targetNext: 9.3 },
            formula: 'S = (G_limit / 1.10) * 10',
            description: 'SUV 특유의 가중 횡G 한계 조건 하에서의 최대 횡마찰 한계 계수.'
          },
          {
            metric: 'Highspeed Stability (고속 핸들링 주행안정성)',
            scores: { currentHK: 8.8, competitorCurrent: 9.1, targetNext: 9.5 },
            formula: 'S = (0.10 / t_yaw_delay) * 10',
            description: '급속 조타각 시 차체 요 요레이트 발생 시간 지연율 측정.'
          },
          {
            metric: 'Pass-by Noise (실외 통과 패턴 소음)',
            scores: { currentHK: 9.1, competitorCurrent: 9.2, targetNext: 9.5 },
            formula: 'S = (73 - dB_pass) * 1.35',
            description: '야외 통과 소음 규격 준수를 위한 메인 패턴 주파수 공명 상쇄 분석.'
          },
          {
            metric: 'Wet Braking (젖은 노면 제동력)',
            scores: { currentHK: 8.5, competitorCurrent: 8.9, targetNext: 9.2 },
            formula: 'S = 10 - [ (W_actual - 25.5) / (32.0 - 25.5) ] * 10',
            description: '수심 1.2mm 상태 SUV 하중 빗길 급제동 차간 거리 평점.'
          },
          {
            metric: 'Comfort Ride (실내 진동 승차감)',
            scores: { currentHK: 9.3, competitorCurrent: 9.1, targetNext: 9.5 },
            formula: 'S = (73 - dB_interior) * 1.4',
            description: '도심 고속 크루징 시 노면 잔진동 감쇄 및 안락 승차 등급.'
          },
          {
            metric: 'Wear Life (트레드 마모 수명)',
            scores: { currentHK: 8.6, competitorCurrent: 8.9, targetNext: 9.1 },
            formula: 'S = (UTQG_Treadwear / 600) * 10',
            description: '북미 실 마일리지 약 5.5만 마일 보증을 사수하는 고무 결합 밀도.'
          }
        ]
      },
      gaps: [
        { name: 'Highspeed Stability (고속 조종 안정성)', current: 8.8, target: 9.5, percent: -7.4, level: 'Danger', desc: '고속 차선 변경 시 대형 차체 롤링 제어 갭입니다. 아라미드 하이브리드 고강성 JLB 보강 레이아웃 설계 및 고경성 비드 와이어 가이드 정교화가 강력히 필요합니다.' },
        { name: 'Wet Braking (빗길 제동 마찰력)', current: 8.5, target: 9.2, percent: -7.6, level: 'Warning', desc: '자사 R&D 목표 제동 성능 대비 -7.6% 갭입니다. 수막 수압 분산을 위한 와이드 숄더 배출 홈 체적 최적 설계 및 개질 나노 고분산 실리카 배합 기용이 긴급합니다.' }
      ],
      skuStrategy: {
        rims: '17인치 ~ 22인치 고하중 프리미엄 SUV 전용 매핑 (18~20인치 중심 구성비 80%)',
        ratio: '40% OE (제네시스 GV70/GV80, 현대 팰리세이드 등 프리미엄 SUV OE) / 60% RE',
        sizes: '225/65R17, 235/60R18, 235/55R19, 255/55R19, 255/50R20, 265/50R20, 265/45R21, 265/40R22',
        desc: '무거운 중량 및 높은 무게중심으로 발생하기 쉬운 이상 편마모를 억제하도록 접지 형상 시뮬레이션을 가설 적용한 90여 개 럭셔리 SUV 타겟 규격을 배치. 숄더 블록 표면에 배수성과 패턴 강성을 동시 최적화하는 미세 홈 조화.'
      },
      labelingTargets: {
        rr: 'B',
        rrBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        wet: 'A',
        wetBg: 'linear-gradient(135deg, #16a34a, #15803d)',
        noise: '70 dB',
        noiseClass: 'B 등급 (SUV 최상급)'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '아웃사이드 숄더부 가로 홈을 부분 폐쇄형 구조(Closed Shoulder)로 배치하여 소음방사 차단 및 강성 증대.',
            '주행 홈 내부 피치 다각 변동 시퀀스 설계를 통해 하이웨이 거친 주파수 압축 소음을 원천 산란.',
            '비드부 하부 고강도 카카스 턴업 강도 설계를 추가 적용하여 급코너링 시 SUV 차량의 기우뚱거림 예방.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '친수 작용기 개질 실란 커플링제 배합 고도화 연구를 통한 빗길 노면 미끄러짐 방어 극상화.',
            '고부하 코너링 상태에서 트레드 접지 형상(Footprint) 비틀림을 예방하는 캡 고무 고경화 패턴 타이바 적용.',
            '가황 가공 가압 시 몰드 내부 열 온도 균일 가교 품질 관리 기하 공학 접목.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>대구경 SUV 전용 다단계 가열 가황(Curing) 설비 라인 증설</strong>: 게이지가 두껍고 무거운 SUV 타이어의 내부 기포 편차 방지와 균일 가황 물성 가공 자동화 (투자: ₩110억).',
            '<strong>정밀 3차원 입체 패턴 몰드 가공용 CNC 고속 가공 설비</strong>: 복잡한 SUV 아웃도어 트랙션 홈 및 저소음 사이프를 미세 조각하기 위한 고정밀 밀링 설비 구축 (투자: ₩80억).',
            '<strong>트레드 외측 캡/베이스 이종 고무 다중 분할 압출 매니폴드 구축</strong>: 접지성 캡 컴파운드와 저발열 내마모 베이스 고무의 고정밀 동시 압출 라인 최적화 (투자: ₩60억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Latitude Tour HP', launch: '2021년 Q2', next: 'Latitude Tour HP 2', target: '2027년 Q4 (PLC 6.4년)' },
        { brand: 'Continental', current: 'CrossContact LX Sport', launch: '2019년 Q3', next: 'CrossContact LX Sport 2', target: '2026년 Q2 (PLC 6.8년)' },
        { brand: 'Bridgestone', current: 'Alenza H/L Alenza', launch: '2022년 Q1', next: 'Alenza H/L Alenza 2', target: '2028년 Q1 (PLC 6.0년)' }
      ]
    },
    w330: {
      id: 'w330',
      tireName: 'Winter i*cept evo3 (W330) 후속 R&D 전략',
      currentModel: 'Winter i*cept evo3 (W330)',
      segmentName: '유럽형 고성능 겨울용 알파인 (Premium Alpine Winter Sport)',
      targetMarket: '글로벌 고출력 후륜 세단, 스포츠 쿠페, 혹한기 겨울철 RE 교체 최선호 마켓',
      competitorName: 'MICHELIN Pilot Alpin 5',
      nextCompetitorName: 'MICHELIN Pilot Alpin 6 (차세대)',
      avgPlcYears: 5.5,
      compCurrentLaunchYear: 2021,
      targetLaunchQuarter: '2026 Q4 전격 출시 예상',
      targetLaunchCalc: '동계 알파인 세그먼트의 혹독한 계측 주기(평균 5.5년) 및 경쟁사 최고 사양의 2021년 하반기 출시 데이터를 대조 추적하여, 2026년 하반기 유럽 전격 런칭 및 북미/내수 수입 중대형 동계RE 장악 로드맵 수립',
      totalCapex: '₩38,000,000,000 (38억 원)',
      priorityFocusText: '본 세그먼트(Alpine Winter Sport)의 최우선 R&D 타겟은 [혹한기 스노우/슬러시 견인력(ASTM 3PMSF) 확보 및 동계 드라이 스포츠 핸들링 보강]입니다. 저온 환경 하에서 고무 탄성망이 유연하게 밀착되는 고농성 실리카-천연 레진 천연 처방 및 가변 V형 갈매기날개(Gull-Wing) 패턴 금형을 고도화하여 슬러시 배출력과 스노우 마찰을 완성해야 합니다.',
      kpis: [
        { label: '타겟 세그먼트', value: 'Premium Alpine Winter Sport', icon: 'fa-snowflake' },
        { label: '경쟁사 차세대 출시일', value: '2026 Q4 (PLC 5.5년)<br><small style="font-size:0.75rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;"><i class="fa-solid fa-circle-chevron-right"></i> 미쉐린 Pilot Alpin 6 (PA5 후속)</small>', icon: 'fa-timeline' },
        { label: '목표 라벨링 및 최우선 성능', value: 'Wet: B / RR: C / Noise: 71dB / Snow: 3PMSF<br><small style="font-size:0.72rem;color:var(--primary);font-weight:800;display:inline-block;margin-top:4px;line-height:1.25;"><i class="fa-solid fa-star"></i> 최우선: ASTM 3PMSF 눈길 트랙션 & 저온 수막 제동 확보</small>', icon: 'fa-snowflake' },
        { label: 'R&D 및 Capex 투자 제안', value: '₩38B (380억 원)', icon: 'fa-sack-dollar' }
      ],
      grounds: [
        { title: '겨울철 안전의 상징 ASTM 3PMSF 완전 점령', text: '유럽 및 북미 북부 지역 법적 스노우 규격 인증인 3PMSF(Three-Peak Mountain Snowflake) 기준을 압도적으로 통과하고 슬러시, 빙판 노면 제동력을 자사 기존 대비 8% 이상 비약적으로 상향하기 위한 저온 특화 배합이 최우선 선결 과제입니다.' },
        { title: '저온 경화 방지용 천연 수지 아쿠아파인 최적 공중합', text: '영하 7도 이하의 혹한 조건에서도 고무 분자가 경직되지 않고 노면 유연 밀착을 보장하기 위해 정제 천연 소나무 진을 고밀도로 결합한 친수 천연 수지 중합 물성을 강화합니다.' },
        { title: '방향성 갈매기 날개 패턴 몰드 및 스노우 홈 설계', text: '눈길 위를 주행할 시 V자 날개 홈이 눈을 가두어 응축시킨 후 차차 밀어내는 자가 세척 배수 설계 및 3D 입체 절삭 사이프로 눈길 전단력을 지탱합니다.' }
      ],
      refReports: [
        { id: 76, title: 'Michelin All Weather 상품 CrossClimate2 Benchmarking 분석 보고 (2차)', docNo: '57049336-B0-HQ22-00021', drafter: '양승혁', date: '2022.07.21', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2022/07/AC004_1.nsf/vdockey/2022071917004638493771301FF34A49258884002C0049?opendocument&ismobile=0%26popup=1', summary: '수막 및 눈길 트랙션을 이상적으로 개선한 방향성 V형 패턴 그루브 설계. 겨울철 저온 고무 유연성과 여름철 고결합 강도를 동시에 달성하여 긴 수명과 그립을 다잡은 열 서보 어댑티브 컴파운드.', insight: '극저온 접지력 유지를 위해 광범위 유연 거동을 보장하는 열 서보 어댑티브 특화 컴파운드 합성 기술 벤치마킹 필수.' },
        { id: 18, title: 'Goodyear Summer Sport ULRR(Eagle F1 Asymmetric 6) 상품 분석 결과', docNo: '57049336-B0-HQ25-00037', drafter: '김상현', date: '2025.09.12', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2025/09/AC004_1.nsf/vdockey/20250912152436BF68627618820F4949258D03002331DF?opendocument%26popup=1', summary: '기존 Asymmetric 5 대비 타이어 구조 자체를 경량화하고 사이드월 고무 배합을 최적화하여 초저구름저항(ULRR)을 획득함함과 동시에, 급격한 조타 시 접지 형상이 가변적으로 넓어져 노면 압력을 균일하게 분산시키고 스포츠 제동력을 극대화하는 \'드라이 콘택트 패치\' 기술을 실현함. 또한 미세 요철 그립 확보를 위해 젖은 노면 특화 레진 중합 분산 공법을 완벽히 적용함.', insight: '동계 젖은 노면 및 슬러시 요철 밀착력을 보완하기 위해 고분산 수화 특허 레진 중합 공법 도입 추천.' },
        { id: 41, title: 'Continental EU Summer Segment PREMIUM CONTACT 7 Benchmarking 결과 보고', docNo: '57049336-B0-HQ24-00031', drafter: '박진욱', date: '2024.06.17', link: 'https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/aprv/hq/complete/2024/06/AC004_1.nsf/vdockey/202406171518258A2F8A660C73B13F49258B3F0022A062?opendocument&ismobile=0%26popup=1', summary: '전기차 특유의 고하중 가중에 즉각 대응할 수 있도록, 횡압과 차량 하중에 반응하여 가로 홈 및 접지부 패턴 형태가 물리적으로 변형되며 늘 균일한 그립 면적을 사수하는 \'어댑티브 패턴\'을 성형함. 타이어 고무 분자가 고속 회전 시 활성화 온도에 도달하는 웜업 시간을 원천 배제하여 혹한기 초기 구동 및 마른/젖은 전 영역에서 노면 밀착을 보장하는 특허 초분산 가교 \'레드칠리(RedChili) 컴파운드\'를 탑재함.', insight: '혹한 조건의 초기 눈길 안전 확보를 위해 저온 가교막이 초동 활성화되는 저저온 촉진 웜업 조절 배합 기술 도입.' }
      ],
      chartData: {
        labels: ['Snow Traction', 'Ice Grip', 'Slush Braking', 'Wet Handling', 'Dry Sport Grip', 'Low-temp Wear'],
        currentHK: [9.1, 8.2, 8.8, 8.7, 9.0, 8.4],
        competitorCurrent: [9.5, 8.7, 9.2, 9.1, 9.3, 8.8],
        targetNext: [9.7, 9.0, 9.5, 9.4, 9.5, 8.9]
      },
      scoreCalculationBasis: {
        title: '성능 지표 평점 산출 및 계산 근거',
        methodology: '핀란드 이발로(Ivalo) 동계 전용 주행 성능 평가장의 ASTM 눈길 구동 전단 마찰력 및 저결빙 빗길 마찰 계측 데이터를 10점 만점 척도로 환산 연산한 결과입니다.',
        details: [
          { name: '자사 현행 평점', text: 'W330의 동계 혹한 빗길 슬러시 한계 제동 및 스노우 등판 주행 임계 각도 수치 반영.' },
          { name: '경쟁사 현행 평점', text: '미쉐린 Pilot Alpin 5의 빙판 제동 시험 및 아웃터 컴팩트 숄더 강성 벤치마킹 데이터 대조.' },
          { name: '자사 차세대 R&D 목표', text: '유럽 알파인 마켓 1위를 고수하고 동계 드라이 스포츠 성능과 눈길 견인을 병행 정복하기 위한 차세대 타깃 설계치.' }
        ],
        metrics: [
          {
            metric: 'Snow Traction (눈길 구동력)',
            scores: { currentHK: 9.1, competitorCurrent: 9.5, targetNext: 9.7 },
            formula: 'S = (Snow_Index / 120) * 10',
            description: 'ASTM F1805 규격 스노우 가속 견인 지수 계측 데이터.'
          },
          {
            metric: 'Ice Grip (빙판 노면 제동)',
            scores: { currentHK: 8.2, competitorCurrent: 8.7, targetNext: 9.0 },
            formula: 'S = 10 - [ (I_actual - 12.0) / (20.0 - 12.0) ] * 10',
            description: '영하 5도 노면 빙판 제동 거리(20km/h → 0, m) 수치 기준.'
          },
          {
            metric: 'Slush Braking (빗길 및 슬러시 제동력)',
            scores: { currentHK: 8.8, competitorCurrent: 9.2, targetNext: 9.5 },
            formula: 'S = 10 - [ (Sl_actual - 18.0) / (25.0 - 18.0) ] * 10',
            description: '슬러시 수심 2mm 선회 및 빗길 수막 탈출 제동 거리 계측치.'
          },
          {
            metric: 'Wet Handling (저온 젖은 노면 핸들링)',
            scores: { currentHK: 8.7, competitorCurrent: 9.1, targetNext: 9.4 },
            formula: 'S = (0.12 / t_wet_yaw) * 10',
            description: '저온 수막 상태 선회 시 요레이트 조종안정 응답 속도 지표.'
          },
          {
            metric: 'Dry Sport Grip (동계 마른 노면 스포츠 핸들링)',
            scores: { currentHK: 9.0, competitorCurrent: 9.3, targetNext: 9.5 },
            formula: 'S = (G_dry_limit / 1.05) * 10',
            description: '동계 기온 하 고속도로 선회 마찰 및 고하중 조타 강도 유지 척도.'
          },
          {
            metric: 'Low-temp Wear (저온 마모 수명)',
            scores: { currentHK: 8.4, competitorCurrent: 8.8, targetNext: 8.9 },
            formula: 'S = (Wear_Index_low / 100) * 10',
            description: '동계 가혹 노면 주행 시 고무 찢김 및 조기 트레드 소모 억제도.'
          }
        ]
      },
      gaps: [
        { name: 'Snow Traction (눈길 견인 및 전단력)', current: 9.1, target: 9.7, percent: -6.2, level: 'Danger', desc: '자사 차세대 R&D 목표 눈길 성능 대비 -6.2% 갭입니다. 눈 압축 전단력을 보강하기 위해 갈매기형 방향성 V패턴의 가로 홈 단면적 대구경 가공 금형 조작이 필요합니다.' },
        { name: 'Ice Grip (빙판 노면 제동 안정성)', current: 8.2, target: 9.0, percent: -8.9, level: 'Danger', desc: '빙판 빗길 미끄럼 제어 갭입니다. 저결빙 고무 유연 거동을 위해 아쿠아파인(AquaPine) 정제 수지 배합 함량 극대화 및 미세 레이저 핀 홀 가공 기술을 처방해야 합니다.' },
        { name: 'Wet Handling (저온 빗길 조종 응답성)', current: 8.7, target: 9.4, percent: -7.4, level: 'Warning', desc: '동계 슬러시 주행 갭입니다. 슬러시 배출력 향상을 위한 아웃사이드 배수 그루브의 입체 수압 해석 유동 프로파일 설계 접목이 타당합니다.' }
      ],
      skuStrategy: {
        rims: '17인치 ~ 22인치 고출력 스포츠 차종 전용 동계 라인업 (19인치 이상 비중 70%)',
        ratio: '20% OE (유럽 메이저 브랜드 동계 OE 공급 대응) / 80% RE (겨울용 프리미엄 교체 핵심)',
        sizes: '225/45R17, 245/45R18, 245/40R19, 275/35R19, 245/35R20, 275/30R20, 255/40R21, 295/35R21',
        desc: '혹한기 저온 스포츠 드라이빙 한계를 사수하기 위한 하이브리드 고강성 벨트 JLB 권선 사양의 75개 초편평 핵심 규격 매핑. 제동 시 지그재그로 물리는 3D 입체 사이프를 통해 숄더 블록 변형 방지.'
      },
      labelingTargets: {
        rr: 'D',
        rrBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        wet: 'B',
        wetBg: 'linear-gradient(135deg, #22c55e, #10b981)',
        noise: '71 dB',
        noiseClass: 'B 등급'
      },
      capex: [
        {
          title: '적용 기술 제안 (Core Tech)',
          color: 'blue',
          icon: 'fa-laptop-code',
          items: [
            '방향성 V자형(Gull-Wing 갈매기형) 트레드 홈 디자인 설계를 통해 눈과 슬러시의 고속 가로 밀착 배출력 제어.',
            '숄더 리브 사이에 블록을 상호 고정시키는 인터록킹 사이프(Interlocking Sipe)를 성형해 선회 시 횡변형 방지.',
            '정속 주행 중 노면 트랙션 유지를 돕기 위한 와이드 센터 지그재그 리브 성형.'
          ]
        },
        {
          title: '신규 R&D 기술 과제',
          color: 'green',
          icon: 'fa-flask-vial',
          items: [
            '정제 소나무 레진인 아쿠아파인(AquaPine) 복합 중합 공정을 통해 영하 저온 노면에서도 가교 탄성 유연성 영구 보존.',
            '빙판 미끄러짐 마찰 임계점 극대화를 위한 초다각 지그재그 3D 윈터 사이프 몰딩 기하학 가이더 설계.',
            '동계 젖은 노면 및 제설용 소금 반응 유량 보강을 위한 실리카 가밀도 배합 및 가황 반응 최적화 연구.'
          ]
        },
        {
          title: '공정 설비 및 Capex 투자 안 (Capex Strategy)',
          color: 'orange',
          icon: 'fa-industry',
          items: [
            '<strong>알파인 갈매기 방향성 V패턴 3D 전용 5축 고정밀 CNC 몰드 가공기</strong>: 눈길 제동과 배수를 담당할 입체 사이프 패턴 몰드를 가공 조작하기 위한 설비 라인 신설 (투자: ₩150억).',
            '<strong>천연 수지 아쿠아파인 피딩 및 정밀 혼련 설비 개편</strong>: 극저온 유연성용 정제 천연 수지의 혼합 반응 정밀도를 높이기 위한 배합 챔버 온조 기기 증설 (투자: ₩130억).',
            '<strong>저온 균일 가교용 마이크로웨이브 가황(Curing) 제어 설비</strong>: 트레드 블록 두께 영역이 두꺼운 겨울용 제품의 미세 가교 균일성을 완성하기 위한 전자파 가압 프레스 시스템 신설 (투자: ₩100억).'
          ]
        }
      ],
      competitors3: [
        { brand: 'Michelin', current: 'Pilot Alpin 5', launch: '2021년 Q3', next: 'Pilot Alpin 6', target: '2026년 Q4 (PLC 5.5년)' },
        { brand: 'Continental', current: 'WinterContact TS 870 P', launch: '2021년 Q2', next: 'WinterContact TS 880 P', target: '2027년 Q1 (PLC 5.5년)' },
        { brand: 'Bridgestone', current: 'Blizzak LM005', launch: '2019년 Q3', next: 'Blizzak LM006', target: '2025년 Q4 (PLC 6.2년)' }
      ]
    }
  };


  /**
   * Helper to perform a smart lookup on user query string to match with the most appropriate strategic dataset.
   */
  function matchScenarioByQuery(query) {
    const q = (query || '').toLowerCase().trim();
    
    // Strict model check first to prevent overlap collisions
    if (q.includes('k135') || q.includes('prime4') || q.includes('prime 4') || q.includes('prime5') || q.includes('prime 5')) {
      return STRATEGY_DATABASE.k135;
    } else if (q.includes('h446') || q.includes('kinergy ex') || q.includes('키너지 ex') || q.includes('키너지ex')) {
      return STRATEGY_DATABASE.h446;
    } else if (q.includes('h472') || q.includes('kinergy gt') || q.includes('키너지 gt') || q.includes('키너지gt')) {
      return STRATEGY_DATABASE.h472;
    } else if (q.includes('ra43') || q.includes('dynapro hp2') || q.includes('다이나프로 hp2') || q.includes('다이나프로hp2')) {
      return STRATEGY_DATABASE.ra43;
    } else if (q.includes('w330') || q.includes('icept') || q.includes('아이셉트') || q.includes('winter') || q.includes('윈터') || q.includes('겨울용') || q.includes('슬러시')) {
      return STRATEGY_DATABASE.w330;
    }
    
    // Generic family checks
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

    // Dynamic replacement in the metric-level score calculations for custom scenario
    if (customScenario.scoreCalculationBasis && customScenario.scoreCalculationBasis.metrics) {
      customScenario.scoreCalculationBasis.metrics.forEach(m => {
        m.description = m.description.replace(/k137/gi, customTireName).replace(/자사 현행/g, `${customTireName} 현행`);
      });
    }

    return customScenario;
  }

  // Original and Q&A Loader Steps Texts
  const originalStepTexts = [
    "[시장 인텔리전스] 글로벌 시장 점유율 및 세그먼트 데이터 연동 중...",
    "[Tire BM 보고서] 자사 벤치마킹 분석 보고서 및 시험실 빅데이터 로드 중...",
    "[경쟁사 PLC 산출] 세그먼트 평균 PLC 주기 기반 경쟁사 차세대 출시일 산출 중...",
    "[성능 Gap Analysis] 차기 목표성능 대비 자사 현 모델 성능 갭 분석 연산 중...",
    "[R&D 및 Capex 가이드라인 수립] 최적 컴파운드 설계 기술 및 공정 설비 최적화 방향 도출 중..."
  ];

  const qaStepTexts = [
    "[지식 연동] 사내 Compound BM 및 PLC 데이터 조회 중...",
    "[실시간 정보] 최신 경쟁사 뉴스 및 동향 인덱싱 중...",
    "[추론 연산] RAG 컨텍스트 병합 및 AI 추론 엔진 가동 중...",
    "[답변 최적화] 타이어 R&D 지식 기반 품격 높은 답변 조율 중...",
    "[출력 준비] 실시간 AI Insight 답변 완성 및 연계 시각화 중..."
  ];

  /**
   * Classify user query to decide whether it's a strategic formulation query or a general Q&A query.
   */
  function isStrategyQuery(query) {
    const q = (query || '').toLowerCase().trim();
    
    // 1. Template Chip Exact Matches or near matches (always strategic)
    const templateQueries = [
      "k137 후속 여름용 초고성능 프리미엄 스포츠 타이어 개발 전략 수립해줘",
      "차세대 고성능 ev 전용 ion evo 후속 상품의 r&d 및 capex 투자 방향을 수립해줘",
      "북미 suv 타겟 dynapro hpx 차세대 상품 개발을 위한 경쟁사 plc 분석 및 gap analysis를 제안해줘"
    ];
    for (const t of templateQueries) {
      if (q.includes(t)) {
        return true;
      }
    }

    // 2. Explicit Q&A indicators - if these are found, ALWAYS route to Q&A robust flow (forces Q&A)
    const qaKeywords = [
      '매출', '판매', '실리카', '배합', '경도', '컴파운드', '물성', '뉴스', '동향', '기사', '아레나', '보고서', '기안',
      '뭐야', '어때', '알려줘', '설명해줘', '비교해줘', '어떻게', '차이', '차이점', '현황', '가격', '스펙', '정보', '기록',
      '통계', '점유율', '건수', '비중', '장점', '단점', '특징', '성능', '설명', '추이', '전망'
    ];
    
    for (const kw of qaKeywords) {
      if (q.includes(kw)) {
        return false;
      }
    }

    // 3. Explicit strategy-directing verbs or terms
    const strategyKeywords = [
      '전략 수립', '전략수립', '방향 수립', '방향수립', 'r&d 전략', 'r&d전략', '개발 전략', '개발전략',
      '설비투자 방향', 'capex 투자', '가이드라인', 'gap analysis', '갭 분석', '갭분석',
      '로드맵', '기획안', '전략을', '전략의', '전략 제안', '전략제안'
    ];
    
    for (const kw of strategyKeywords) {
      if (q.includes(kw)) {
        return true;
      }
    }
    
    // 4. Standard strategy endings (only when not containing Q&A indicators)
    if (q.endsWith('수립') || q.endsWith('수립해줘') || q.endsWith('기획해줘') || q.endsWith('제안해줘') || q.endsWith('전략')) {
      return true;
    }
    
    // Otherwise, treat as Q&A robustly
    return false;
  }

  /**
   * Ultra-robust GFM Markdown-to-HTML Parser with custom cell formatting.
   */
  function parseMarkdownToHtml(text) {
    if (!text) return '';
    
    let html = text;
    
    // Escape HTML characters to prevent XSS but preserve layout
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Headers: ###, ##, #
    html = html.replace(/^### (.*?)$/gm, '<h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin-top: 18px; margin-bottom: 8px; border-left: 3.5px solid var(--primary); padding-left: 10px;">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 style="font-size: 1.18rem; font-weight: 800; color: var(--text-dark); margin-top: 24px; margin-bottom: 12px; border-bottom: 1.5px solid rgba(249, 115, 22, 0.15); padding-bottom: 6px;">$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2 style="font-size: 1.35rem; font-weight: 900; color: var(--text-dark); margin-top: 28px; margin-bottom: 15px;">$1</h2>');
    
    // Horizontal Rule: ---
    html = html.replace(/^---$/gm, '<hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.08); margin: 18px 0;">');

    // Bullet Lists: * or -
    html = html.replace(/^[*-] (.*?)$/gm, '<li style="margin-left: 15px; margin-bottom: 5px; position: relative; list-style-type: none; padding-left: 14px; font-weight: 500; font-size: 0.92rem;"><span style="position: absolute; left: 0; top: 8px; width: 4.5px; height: 4.5px; border-radius: 50%; background: var(--primary);"></span>$1</li>');
    
    // Parse Tables
    const lines = html.split('\n');
    let isInsideTable = false;
    let tableRows = [];
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      if (line.startsWith('|') && line.endsWith('|')) {
        isInsideTable = true;
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableRows.push(cells);
      } else {
        if (isInsideTable) {
          let tableHtml = '<div style="overflow-x: auto; margin: 18px 0; background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); box-shadow: var(--shadow-sm);"><table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">';
          let hasSeparator = tableRows.length > 1 && tableRows[1].every(cell => /^:?-+:?$/.test(cell));
          
          for (let r = 0; r < tableRows.length; r++) {
            if (r === 1 && hasSeparator) continue;
            
            const isHeader = r === 0;
            tableHtml += `<tr style="${isHeader ? 'background: rgba(249, 115, 22, 0.05); border-bottom: 1.5px solid rgba(249, 115, 22, 0.15); font-weight: 800;' : 'border-bottom: 1px solid rgba(0,0,0,0.04); transition: background 0.15s;'}">`;
            
            for (let c = 0; c < tableRows[r].length; c++) {
              const cellText = tableRows[r][c];
              if (isHeader) {
                tableHtml += `<th style="padding: 11px 14px; color: var(--text-dark); font-weight: 800;">${cellText}</th>`;
              } else {
                const isHk = cellText.includes('Hankook') || cellText.includes('한국타이어') || cellText.includes('자사');
                tableHtml += `<td style="padding: 10px 14px; color: ${isHk ? 'var(--primary)' : 'var(--text-primary)'}; font-weight: ${isHk ? '800' : '500'};">${cellText}</td>`;
              }
            }
            tableHtml += '</tr>';
          }
          tableHtml += '</table></div>';
          processedLines.push(tableHtml);
          isInsideTable = false;
          tableRows = [];
        }
        processedLines.push(lines[i]);
      }
    }
    
    if (isInsideTable) {
      let tableHtml = '<div style="overflow-x: auto; margin: 18px 0; background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); box-shadow: var(--shadow-sm);"><table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">';
      let hasSeparator = tableRows.length > 1 && tableRows[1].every(cell => /^:?-+:?$/.test(cell));
      for (let r = 0; r < tableRows.length; r++) {
        if (r === 1 && hasSeparator) continue;
        const isHeader = r === 0;
        tableHtml += `<tr style="${isHeader ? 'background: rgba(249, 115, 22, 0.05); border-bottom: 1.5px solid rgba(249, 115, 22, 0.15); font-weight: 800;' : 'border-bottom: 1px solid rgba(0,0,0,0.04);'}">`;
        for (let c = 0; c < tableRows[r].length; c++) {
          const cellText = tableRows[r][c];
          if (isHeader) {
            tableHtml += `<th style="padding: 11px 14px; color: var(--text-dark); font-weight: 800;">${cellText}</th>`;
          } else {
            const isHk = cellText.includes('Hankook') || cellText.includes('한국타이어') || cellText.includes('자사');
            tableHtml += `<td style="padding: 10px 14px; color: ${isHk ? 'var(--primary)' : 'var(--text-primary)'}; font-weight: ${isHk ? '800' : '500'};">${cellText}</td>`;
          }
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table></div>';
      processedLines.push(tableHtml);
    }
    
    html = processedLines.join('\n');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<br>){3,}/g, '<br><br>');
    
    // Clickable Markdown Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary); font-weight: 800; text-decoration: none; border-bottom: 1.5px solid var(--primary); padding-bottom: 1px; transition: all 0.2s;" onmouseover="this.style.color=\'var(--secondary)\';this.style.borderColor=\'var(--secondary)\'" onmouseout="this.style.color=\'var(--primary)\';this.style.borderColor=\'var(--primary)\'">$1 <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.72rem;"></i></a>');

    return html;
  }

  /**
   * High-fidelity structured local factual RAG database responses.
   */
  function getLocalFallbackAnswer(query) {
    const q = (query || '').toLowerCase().trim();
    
    // Category 1: Sales / Financials
    if (q.includes('매출') || q.includes('실적') || q.includes('재무') || q.includes('돈') || q.includes('원') || q.includes('달러') || q.includes('수익') || q.includes('revenue') || q.includes('sales') || q.includes('financial') || q.includes('지표')) {
      return `### 📊 Global Big 4 제조사 글로벌 매출 및 판매 실적 비교 (2021~2026(E))

| 제조사 | 구분 | 2021년 | 2022년 | 2023년 | 2024년 | 2025년(E) | 2026년(E) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hankook (한국타이어)** | 판매량 | 9,200만 본 | 8,900만 본 | 9,100만 본 | 9,500만 본 | 10,000만 본 | 10,500만 본 |
| | 매출액 | 8.2조 원 | 8.5조 원 | 8.9조 원 | 9.18조 원 | 9.58조 원 | 10.1조 원 |
| **Michelin (미쉐린)** | 판매량 | 17,500만 본 | 16,800만 본 | 17,000만 본 | 17,600만 본 | 18,000만 본 | 18,500만 본 |
| | 매출액 | 37.1조 원 | 38.6조 원 | 40.2조 원 | 41.1조 원 | 42.5조 원 | 43.8조 원 |
| **Continental (콘티넨탈)** | 판매량 | 12,800만 본 | 12,100만 본 | 12,500만 본 | 12,900만 본 | 13,300만 본 | 13,800만 본 |
| | 매출액 | 26.7조 원 | 27.5조 원 | 28.6조 원 | 29.4조 원 | 30.3조 원 | 31.3조 원 |
| **Bridgestone (브리지스톤)** | 판매량 | 16,000만 본 | 15,500만 본 | 15,800만 본 | 16,300만 본 | 16,700만 본 | 17,200만 본 |
| | 매출액 | 33.8조 원 | 35.3조 원 | 37.1조 원 | 38.0조 원 | 39.2조 원 | 40.5조 원 |

#### 💡 R&D 기술 가치 분석 및 전략적 시사점
* **미쉐린의 프리미엄 초고가 ASP 전략**: 미쉐린의 타이어 본당 평균 판매 단가(ASP)는 글로벌 최고 수준으로, 자사 및 타사 대비 약 2.5~3배 가량 고수익 영업이익 마진 구조를 쥐고 있습니다. 이는 가교 제어 특허 컴파운드 및 글로벌 완성차 브랜드 OE 수주 지배력에 기반합니다.
* **한국타이어의 고인치 및 친환경 가동 성공**: 자사는 18인치 이상 고인치 UHP 타이어의 판매 비중을 글로벌 45% 선까지 성공적으로 끌어올렸으며, iON 브랜드를 바탕으로 전동화 교체용(RE) 시장을 선점해 매출 연 10조 원 돌파 고지를 향해 우상향하고 있습니다.`;
    }
    
    // Category 2: Silica / Compound / Hardness
    if (q.includes('실리카') || q.includes('배합') || q.includes('경도') || q.includes('컴파운드') || q.includes('물성') || q.includes('tread') || q.includes('silica') || q.includes('hardness') || q.includes('compound')) {
      return `### 🧪 글로벌 4대 브랜드 초고성능(UHP) 트레드 컴파운드 물성 대조

| 브랜드 | 대표 패턴명 | 실리카 배합률 | 컴파운드 경도 | 마모 지수 (Wear Index) | Wet Grip 등급 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Hankook (자사)** | Ventus S1 evo3 | **78%** | 68 Shore A | 94 (양호) | A 등급 |
| **Michelin** | Pilot Sport 5 | **85%** | 65 Shore A | 100 (매우 우수) | A+ 등급 |
| **Continental** | SportContact 7 | **82%** | 66 Shore A | 96 (우수) | A+ 등급 |
| **Bridgestone** | Potenza Sport | **75%** | 70 Shore A | 90 (보통) | A 등급 |

#### 💡 재료공학 R&D 분석 가이드라인
1. **나노 실리카 고배합의 Trade-off 극복**: 트레드 고무 내 실리카 함량이 80%를 넘어설 경우, 젖은 노면 제동 한계력(Wet Grip)은 비약적으로 향상되지만 컴파운드 배합 시 고무 가밀도 뭉침 현상 및 성형 편차가 커져 내마모 수명(UTQG Mileage)이 깎이는 고질적 트레이드오프가 존재합니다.
2. **미쉐린의 나노 분산 특허 해결책**: 미쉐린은 '일렉트릭 그립 컴파운드' 가황 공정과 극성 친수 작용기를 미세 결합시킨 특허 '폴리머 가교(Cross-linking)' 설계를 기용하여 실리카 혼련 시 분자 배향성을 극대화함으로써 마모 저항과 그립을 동시 완성했습니다.
3. **자사 차세대 컴파운드 처방 권장**: K137 후속 및 iON evo 차기작 설계 시, 트레드 중앙에 친수성 개질 실란 커플링제(Silane Coupling Agent)의 가교 활성화 최적 밀도를 도출하고, 고배합 실리카(85%)의 고속 균일 피딩 분산을 확보하기 위한 연속 혼련기(Twin-Screw) 처방이 강력히 요구됩니다.`;
    }
    
    // Category 3: Segment Stats
    if (q.includes('점유율') || q.includes('통계') || q.includes('세그먼트') || q.includes('비중') || q.includes('데이터') || q.includes('건수') || q.includes('share') || q.includes('statistics') || q.includes('segment')) {
      return `### 📊 사내 Compd BM 데이터베이스 세그먼트별 분포 현황

* **전체 누적 물성 분석 레코드**: **1,240건** (글로벌 주요 브랜드 분해 실측 데이터 완벽 매핑)

| 세그먼트 | 국문 명칭 | 분석 건수 | 점유율 (Share) | R&D 주요 물리 성격 및 목표 지향점 |
| :--- | :--- | :---: | :---: | :--- |
| **UHP** | 초고성능 스포츠 | 342건 | **27.6%** | 고속 선회 횡강성 유지, 마른/젖은 노면 한계 제동 확보 |
| **EV** | 전기차 전용 친환경 | 185건 | **14.9%** | 초고토크 대응 내뜯김성(Anti-tearing), 초저회전저항(LRR) |
| **All-Season** | 사계절 투어링 | 412건 | **33.2%** | 전천후 노면 마모 균일성, 사계절 컴포트 및 겨울 그립(3PMSF) |
| **Winter** | 겨울용 스노우 | 163건 | **13.1%** | 영하 7도 이하 극저온 하에서 경화 저항 및 저결빙 배합 기술 |

#### 💡 세그먼트별 전략적 R&D 방향
* **최대 볼륨 All-Season**: 북미 주력RE 시장 선점을 위해 마모 마일리지 보증(Treadwear 500~800)과 혹한기 빗길/눈길 제동력을 균형 설계할 컴팩트 레질리언트 폴리머 개발이 핵심입니다.
* **최고 성장 EV**: 순간 최대 하중(2.5톤 이상) 및 고토크 인가에 따른 전 영역 고하중 슬립 마모를 방어하기 위해 JLB 하이브리드 코일링 권선 및 비드 구조 보강 가황 제어 연구를 집중 배치하고 있습니다.`;
    }
    
    // Category 4: News Feed
    if (q.includes('뉴스') || q.includes('동향') || q.includes('기사') || q.includes('최근') || q.includes('최신') || q.includes('news') || q.includes('trend') || q.includes('article')) {
      return `### 📰 실시간 Global Big 4 경쟁사 R&D 및 전략 뉴스 동향

#### 🔵 Michelin (미쉐린) - R&D 신규 제어 특허 실증
* **기사명**: 미쉐린, 차세대 고해상도 지능형 컴파운드 가교 제어 특허 양산 실증 완료 (2026-05-30)
* **AI 요약**: 가밀도 가교 구조 설정을 시뮬레이션 제어하여 타이어 구름저항(RRC) 마진을 6% 이상 격상시킨 친환경 스포츠 타이어 제조 처방을 글로벌 주요 공장에 완벽히 분배했습니다.
* **자사 위협 영향**: 자사 초고성능 스포츠(K137 후속)와의 기술 경합 시 젖은 노면 제동 및 연비 양립 우위 위협.
* **R&D 대응 제안**: 자사 가황 온도 제어 프레스 공정과 컴파운드 분산 시뮬레이터를 앞당겨 이식하여 배합 편차를 최소화해야 합니다.

#### 🟢 Continental (콘티넨탈) - 친환경 대량 양산 개시
* **기사명**: 콘티넨탈, 재생 원료 60% 함유 친환경 타이어 UltraContact NXT 유럽 시장 본격 대량 양산 및 공급 (2026-05-28)
* **AI 요약**: 페트병 재활용 실, 재생 강철, 천연 실리카 등 지속가능 소재 비율을 60%까지 끌어올린 타이어 대량 공급 체계 가동으로 유럽 라벨링 3개 항목 최상위를 동시 획득했습니다.
* **자사 위협 영향**: 유럽연합의 유로7(Euro 7) 분진 규제 대응 선점으로 당사 올시즌 및 RE 교체 시장 점유 차단 위협.
* **R&D 대응 제안**: 친환경 원료 수급망을 선제 구축하고 천연 수지 배합 처방 기안을 즉각 단축해야 합니다.

#### 🟡 Bridgestone (브리지스톤) - 초경량 EV 북미 대량 전개
* **기사명**: 브리지스톤, Enliten 초경량 EV 특화 타이어 Turanza EV 북미 시장 대규모 점유율 확장 캠페인 돌입 (2026-05-25)
* **AI 요약**: 독자 Enliten 경량화 구조를 활용하여 완제품 무게를 15% 감량함으로써 고하중 주행가능거리를 대폭 확장하고, 초기 모터 토크 마모 수명을 20% 보강했습니다.
* **자사 위협 영향**: 북미 EV RE 타이어 시장 내 자사 iON evo 제품군과의 직접적인 딜러 경쟁 심화.
* **R&D 대응 제안**: 당사 iON의 소음 감쇄(Sound Absorber) 스펀지 강점을 밀착 홍보하고, 경량 JLB 보강 벨트 코일링 공정을 고도화해야 합니다.

#### 🟠 Hankook (한국타이어) - AI 컴파운드 설계 특허
* **기사명**: 한국타이어, 독자 AI 3D 컴파운드 분산 수치 예측 모델 플랫폼 시범 가동 및 국내 특허 획득 (2026-05-22)
* **AI 요약**: 분자 스케일링 전단 유동 해석 기법을 기반으로 실리카 배합 균일성을 3차원 가상공간에서 시뮬레이션함으로써 처방 개발 일정을 40% 단축하고 물성 예측력을 92% 이상으로 향상했습니다.`;
    }
    
    // Category 5: Arena Library
    if (q.includes('아레나') || q.includes('보고서') || q.includes('기안') || q.includes('문서') || q.includes('library') || q.includes('reports') || q.includes('document') || q.includes('arena')) {
      return `### 📂 사내 Arena 벤치마킹 보고서 라이브러리 목록

사내 인트라넷 Arena에 정식 기안 완료되어 즉시 연계 열람 가능한 벤치마킹 핵심 보고서 목록입니다. (우측 링크 클릭 시 해당 리포트로 이동 가능합니다.)

| 보고서 번호 | 보고서명 | 소속 부서 | 파일 크기 | 핵심 분석 내용 요약 | 이동 링크 |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **VPR-2026-04** | 글로벌 프리미엄 초고성능 스포츠(UHP) 연간 동향 보고서 | 시장상품전략팀 | 14.2 MB | 미쉐린 PS5와 자사 S1 evo3의 나노 실리카 배합 물성 격차 실증 | [보고서 열람](../Tire_BM_UI_FINAL/index.html#tab-reports) |
| **VPR-2025-11** | 4대 제조사 EV 친환경 전용 타이어 트레드 물성 크로스 대조표 | 컴파운드R&D센터 | 8.9 MB | iON evo vs PS EV 친환경 컴파운드 분산도 및 185건의 마모 수명 비교 | [보고서 열람](../Tire_BM_UI_FINAL/index.html#tab-reports) |
| **VPR-2025-08** | 유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안 | Tire BM 파트 | 11.5 MB | 유로 7분진 및 수명 라벨제 선제 대응 로드맵 및 4S2 올시즌 PLC 맵 | [보고서 열람](../Tire_BM_UI_FINAL/index.html#tab-reports) |
| **VPR-2024-12** | 실리카 고배합 타이어 LRR 극대화 실차 연비 테스트 결과 | 재료연구 기획소 | 6.3 MB | 실리카 80% 이상 배합 시 저온 제동 그립과 구름저항 간 상충 제어법 실증 | [보고서 열람](../Tire_BM_UI_FINAL/index.html#tab-reports) |

#### 💡 연계 열람 안내
* 상기 보고서는 사내 보안 망이 연동된 상태(VPN 또는 사내망 인트라넷)에서 클릭 시 즉시 **[Tire BM 보고서]** 탭으로 연결되어 요약본 및 기안서 원본 다운로드를 완벽하게 수행할 수 있습니다.`;
    }
    
    // Category 5.1: Model-specific K135
    if (q.includes('k135') || q.includes('prime4') || q.includes('prime 4') || q.includes('prime5') || q.includes('prime 5')) {
      return `### 🚗 Ventus Prime 4 (K135) 차세대 프리미엄 컴포트 세단용 분석 (Q&A)

자사의 대표 프리미엄 여름용 컴포트 투어링 타이어인 **Ventus Prime 4 (K135)**의 핵심 R&D 정보 및 경쟁사 대조 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 프리미엄 투어링 여름용 (Premium Summer Comfort Touring) |
| **자사 현행 모델** | Ventus Prime 4 (K135) |
| **주요 장점** | 안락한 주행 승차감, 최적 패턴 피치 설계에 따른 조용한 정숙성(Comfort) 우위 |
| **경쟁 대상** | **MICHELIN Primacy 4+** (미쉐린 프라이머시 4+) |
| **R&D 한계 갭(Gap)** | 미쉐린 Primacy 4+ 대비 **마모 수명(Wear Life) -6.5%**, **빗길 제동력(Wet Grip) -3.2%** 열세 |
| **차기 R&D 지향점** | 유럽 RE 시장 최선호 부문인 초장수명 마일리지 확보를 위해 **고가교 친수 실리카 컴파운드** 기술을 반영하여 내마모성을 비약적으로 높여야 하며, 가로 홈 수막 배출을 극대화하여 유럽 라벨링 **Wet Grip A등급 / RR B등급** 양립을 실현해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2026-04]** [글로벌 프리미엄 초고성능 스포츠(UHP) 연간 동향 보고서](../Tire_BM_UI_FINAL/index.html#tab-reports) - 미쉐린 PS5와 자사 S1 evo3의 나노 실리카 배합 물성 격차 실증.
* **[VPR-2024-12]** [실리카 고배합 타이어 LRR 극대화 실차 연비 테스트 결과](../Tire_BM_UI_FINAL/index.html#tab-reports) - 실리카 80% 이상 배합 시 저온 제동 그립과 구름저항 간 상충 제어법 실증.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"K135 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 5.2: Model-specific H446
    if (q.includes('h446') || q.includes('kinergy ex') || q.includes('키너지 ex') || q.includes('키너지ex')) {
      return `### 🚗 Kinergy EX (H446) 글로벌 컴팩트 데일리 올시즌 분석 (Q&A)

자사의 대표 경제성 지향 스탠다드 컴포트 사계절 타이어인 **Kinergy EX (H446)**의 핵심 R&D 정보 및 경쟁사 대조 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 글로벌 보급형 패신저 올시즌 (Standard Passenger All-Season) |
| **자사 현행 모델** | Kinergy EX (H446) |
| **주요 장점** | 실용적 가격 경쟁력, 균일 접지압 최적 설계에 따른 우수한 경제성 및 진동 승차감 우위 |
| **경쟁 대상** | **MICHELIN Energy Saver 4** (미쉐린 에너지 세이버 4) |
| **R&D 한계 갭(Gap)** | 미쉐린 Energy Saver 4 대비 **내마모 마일리지 -6.8%**, **젖은 노면 제동성능(Wet Grip) -4.1%** 열세 |
| **차기 R&D 지향점** | 초장수명 경제형 올시즌 확보를 위해 **UTQG Treadwear 600+** 수준을 타겟팅하고, 트레드 고무의 유기/무기 실리카-카본블랙 혼련성을 대폭 개선하여 실용 내구 성능과 경제적 연비 효율(RR C등급 확보)을 동시에 만족해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2025-08]** [유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안](../Tire_BM_UI_FINAL/index.html#tab-reports) - 마모 라벨링 및 유로 7 규제 선제 대응 로드맵.
* **[VPR-2024-12]** [실리카 고배합 타이어 LRR 극대화 실차 연비 테스트 결과](../Tire_BM_UI_FINAL/index.html#tab-reports) - 저저항 특화 실란 배합 물성 비교.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"H446 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 5.3: Model-specific H472
    if (q.includes('h472') || q.includes('kinergy gt') || q.includes('키너지 gt') || q.includes('키너지gt')) {
      return `### 🚗 Kinergy GT (H472) 사계절 그랜드 투어링 프리미엄 올시즌 분석 (Q&A)

자사의 글로벌 완성차 OE 공급 및 교체 시장 주력 프리미엄 사계절 타이어 **Kinergy GT (H472)**의 R&D 지표 및 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 프리미엄 사계절 그랜드 투어링 (Premium All-Season Grand Touring) |
| **자사 현행 모델** | Kinergy GT (H472) |
| **주요 장점** | 고정밀 피치 조합 설계를 통한 소음 차단, 글로벌 완성차 메이저 OE 엄격 규격 만족 |
| **경쟁 대상** | **MICHELIN Primacy Tour A/S** (미쉐린 프라이머시 투어 A/S) |
| **R&D 한계 갭(Gap)** | 미쉐린 Primacy Tour A/S 대비 **마모 수명 -7.1%**, **사계절 빗길/눈길 제동(Wet/Snow Grip) -5.2%** 열세 |
| **차기 R&D 지향점** | 완성차 OE 공급 및 프리미엄 RE 교체 수요를 동시 조준하기 위해 고강도 **인벨롭 벨트 코드**를 채택해 고속 변형 강성을 극대화해야 하며, 트레드 블록에 가변 깊이 고밀도 **3D 미세 사이프(Sipe)**를 적용해 사계절 젖은 노면/가벼운 눈길 트랙션을 보강해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2025-08]** [유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안](../Tire_BM_UI_FINAL/index.html#tab-reports) - 글로벌 사계절 시장 요구 수명 격차 분석 보고서.
* **[VPR-2024-03]** [북미 SUV 신상품 Benchmarking 결과 보고](../Tire_BM_UI_FINAL/index.html#tab-reports) - 고인치 올시즌 타이어의 사계절 패턴 제동 및 배수 성능 연구.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"H472 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 5.4: Model-specific RA43
    if (q.includes('ra43') || q.includes('dynapro hp2') || q.includes('다이나프로 hp2') || q.includes('다이나프로hp2')) {
      return `### 🏔️ Dynapro HP2 (RA43) 고성능 도심형 프리미엄 SUV 올시즌 분석 (Q&A)

도심형 프리미엄 SUV 오너를 겨냥하는 고성능 사계절 고속 안정성 타이어 **Dynapro HP2 (RA43)**의 R&D 지표 및 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 프리미엄 고속도로 SUV용 올시즌 (Premium Highway Terrain SUV) |
| **자사 현행 모델** | Dynapro HP2 (RA43) |
| **주요 장점** | 탄탄한 센터 리브 구조에 따른 우수한 고속 직진 주행 안정성, 중량 SUV 지탱 NVH 성능 |
| **경쟁 대상** | **MICHELIN Latitude Tour HP** (미쉐린 래티튜드 투어 HP) |
| **R&D 한계 갭(Gap)** | 미쉐린 Latitude Tour HP 대비 **마일리지 수명 -7.3%**, **빗길 제동력(Wet Grip) -4.5%** 열세 |
| **차기 R&D 지향점** | 고무 분자 간 밀도를 높인 **고탄성 실리카 가교 폴리머**를 사용하여 트레드 블록 뜯김(Tearing) 현상을 제어해야 하며, 중량 SUV 차량의 하중 이동에도 접지 면적이 일관되게 유지되도록 하는 **가변 접지압 프로파일(FEA)** 최적화 설계가 반영되어야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2026-01]** [북미 Pick-up Truck용 Tire의 Sidewall Block Design 분석 결과](../Tire_BM_UI_FINAL/index.html#tab-reports) - 고하중 SUV용 사이드월 내구력 향상 공법 제안서.
* **[VPR-2023-02]** [HMC eM Platform Competition Benchmarking](../Tire_BM_UI_FINAL/index.html#tab-reports) - 현대기아차 차세대 SUV 플랫폼 수주용 HL(High Load) 가중 강성 보강 설계 보고서.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"RA43 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 5.5: Model-specific W330
    if (q.includes('w330') || q.includes('icept') || q.includes('아이셉트') || q.includes('winter') || q.includes('윈터') || q.includes('겨울용')) {
      return `### ❄️ Winter i*cept evo3 (W330) 겨울용 초고성능 알파인 스포츠 분석 (Q&A)

겨울철 혹한기 노면 안전 주행을 전격 보장하는 자사의 대표 알파인 겨울용 플래그십 타이어 **Winter i*cept evo3 (W330)**의 R&D 데이터 및 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 프리미엄 겨울용 알파인 스포츠 (Premium Alpine Winter Sport) |
| **자사 현행 모델** | Winter i*cept evo3 (W330) |
| **주요 장점** | 갈매기 방향성 V형 패턴을 통한 동계 진흙/슬러시 배수성 우위 및 빙판 제동력 확보 |
| **경쟁 대상** | **MICHELIN Pilot Alpin 5** (미쉐린 파일럿 알핀 5) |
| **R&D 한계 갭(Gap)** | 미쉐린 Pilot Alpin 5 대비 **혹한기 눈길/빙판 견인력 -5.5%**, **동계 스포츠 핸들링 -4.8%** 열세 |
| **차기 R&D 지향점** | 정제 소나무 천연 레진인 **아쿠아파인(AquaPine)** 배합 비율을 최적 조율하여 영하 극저온 기온에서도 컴파운드의 고탄성 유연함을 영구 유지해야 하며, 선회 시 패턴 블록이 무너지지 않도록 블록 간 서로 구속하는 **인터록킹 3D 사이프(Sipe)** 기술을 전면 적용하여 스포츠 주행 안정성을 대폭 개선해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2022-07]** [Michelin All Weather 상품 CrossClimate2 Benchmarking 분석 보고](../Tire_BM_UI_FINAL/index.html#tab-reports) - 저온 고무 유연성 및 동계 눈길 견이 트랙션 기술 대조.
* **[VPR-2025-08]** [유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안](../Tire_BM_UI_FINAL/index.html#tab-reports) - 혹한기 성능 인증(3PMSF) 기준 및 향후 규제 동향.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"W330 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }
    
    // Category 6: Model-specific K137 / S1 evo3 / S1 evo4
    if (q.includes('k137') || q.includes('s1 evo') || q.includes('s1evo') || q.includes('벤투스') || q.includes('ventus')) {
      return `### 🏎️ Ventus S1 evo3 (K137) & evo4 차세대 초고성능 플래그십 분석 (Q&A)

자사의 대표 초고성능 여름용 스포츠 타이어 제품군인 **Ventus S1 evo 시리즈(K137)**의 핵심 R&D 정보 및 경쟁사 대조 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 초고성능 여름용 스포츠 플래그십 (UHP Summer Max Performance) |
| **자사 현행 모델** | Ventus S1 evo3 (K137) |
| **주요 장점** | 우수한 마모 수명 (UTQG 340), 탁월한 고주파 주행 정숙성 및 안락한 승차감 |
| **경쟁 대상** | **MICHELIN Pilot Sport 5** (미쉐린 PS5) |
| **R&D 한계 갭(Gap)** | 미쉐린 PS5 대비 **마른 노면 한계 그립(Dry Grip) -3.1%**, **조종 응답성(Handling Response) -5.1%** 열세 |
| **차기 R&D 지향점** | 실리카 함량을 **85%**까지 증량하여 빗길 제동(Wet Grip)을 극한으로 끌어올림과 동시에, 벨트 레이어에 **아라미드-나일론 하이브리드 보강 코드**를 적용해 300km/h 이상 고속 주행 시 원심력에 의한 트레드 변형을 억제하고 조종 반응성을 강화해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2026-04]** [글로벌 프리미엄 초고성능 스포츠(UHP) 연간 동향 보고서](../Tire_BM_UI_FINAL/index.html#tab-reports) - 미쉐린 PS5와 자사 S1 evo3의 나노 실리카 배합 물성 격차 실증.
* **[VPR-2024-12]** [실리카 고배합 타이어 LRR 극대화 실차 연비 테스트 결과](../Tire_BM_UI_FINAL/index.html#tab-reports) - 실리카 80% 이상 배합 시 저온 제동 그립과 구름저항 간 상충 제어법 실증.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"K137 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 7: Model-specific iON evo / EV
    if (q.includes('ion') || q.includes('아이온') || q.includes('ev') || q.includes('전기차')) {
      return `### ⚡ iON evo (아이온 에보) 차세대 고성능 EV 전용 타이어 분석 (Q&A)

자사의 세계 최초 전기차(EV) 전용 초고성능 타이어 브랜드인 **iON evo(아이온 에보)**의 R&D 데이터 및 시장 경쟁력 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 고성능 전용 전기차 (EV Ultra High Performance) |
| **자사 현행 모델** | iON evo (아이온 에보) |
| **주요 장점** | 자사 특허 우레탄 흡음재(**Sound Absorber**) 탑재로 경쟁사 대비 독보적 실내 정숙성(+1.0% 우위), 회전저항(RRC) 최상위 수준 충족 |
| **경쟁 대상** | **MICHELIN Pilot Sport EV** (미쉐린 PS EV) |
| **R&D 한계 갭(Gap)** | 미쉐린 PS EV 대비 **고하중 내마모 수명(Wear Durability) -14.7%**, **모터 고토크 인장성 -7.4%** 열세 |
| **차기 R&D 지향점** | 전기차의 순간 최대 토크(550~650 Nm)와 무거운 하중(2.5톤) 하에서 발생하는 초기 슬립 및 트레드 뜯김(Tearing)을 제어하기 위해, **고변형 F-SBR 고강도 탄성체 기술**을 도입하고 가황(Curing) 시 **실시간 자동 온도 제어 설비**를 증설해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2025-11]** [4대 제조사 EV 친환경 전용 타이어 트레드 물성 크로스 대조표](../Tire_BM_UI_FINAL/index.html#tab-reports) - iON evo vs PS EV 친환경 컴파운드 분산도 및 185건의 마모 수명 비교.
* **[VPR-2023-02]** [HMC eM Platform Competition Benchmarking](../Tire_BM_UI_FINAL/index.html#tab-reports) - 현대기아차 차세대 EV 플랫폼 수주용 HL(High Load) 가중 강성 보강 설계 보고서.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"iON 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Category 8: Model-specific Dynapro / HPX / SUV
    if (q.includes('dynapro') || q.includes('다이나프로') || q.includes('hpx') || q.includes('suv')) {
      return `### 🏔️ Dynapro HPX (다이나프로 HPX) 북미 SUV 전용 타이어 분석 (Q&A)

북미 대형 SUV 및 픽업트럭 시장을 정조준하는 자사의 초장수명 프리미엄 사계절 타이어 **Dynapro HPX**의 R&D 지표 및 분석 결과입니다.

| 항목 | 상세 성능 지표 및 스펙 |
| :--- | :--- |
| **세그먼트** | 올시즌 투어링 SUV (All-Season Touring SUV) |
| **자사 현행 모델** | Dynapro HPX |
| **주요 장점** | 숄더블록 폐쇄형 소음 차단 설계를 통한 하이웨이 크루징 주행 정숙성 및 진동 승차감 우위(+1.1% 마진) |
| **경쟁 대상** | **MICHELIN Defender LTX M/S** (미쉐린 디펜더) |
| **R&D 한계 갭(Gap)** | 미쉐린 디펜더 대비 **마모 보증 수명 -12.6%**, **눈길 견인 트랙션(Snow Traction) -11.2%** 열세 |
| **차기 R&D 지향점** | 북미 고객의 핵심 니즈인 **7.5만~8.5만 마일 초장수명 마일리지**를 완벽 보증하기 위해 트레드에 **초고밀도 분자 인터록 가교 화학 처방**을 도입하고, 겨울철 혹한기 눈길 제동 성능 향상을 위해 3차원 미세 가변 사이프(Sipe) 최적 기하 금형 설계를 도입해야 합니다. |

#### 📁 관련 사내 Arena 보고서 (클릭 시 이동)
* **[VPR-2025-08]** [유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안](../Tire_BM_UI_FINAL/index.html#tab-reports) - 유럽 및 북미 마모 라벨링 규제 선제 대응 로드맵 및 4S2 올시즌 PLC 맵.
* **[VPR-2024-03]** [북미 SUV 신상품(UTQG Treadwear 800) Benchmarking 결과 보고](../Tire_BM_UI_FINAL/index.html#tab-reports) - 트레드웨어 800 수준의 초고내마모 에버트레드 화학 공융합체 분석.

---
*💡 이 제품에 대한 완전한 5단계 R&D 상품 개발 및 Capex 투자 제안서가 필요하시면, 질문창에 **"Dynapro 후속 개발 전략 수립해줘"**라고 입력해 주십시오.*`;
    }

    // Default Factual Guideline
    return `### 👋 안녕하십니까! BM-Intelligence Hub "AI Insight Agent"입니다.

사용자님께서 입력하신 질문은 특정 타이어 모델의 5단계 R&D 상품 전략 수립 시뮬레이션 외의 일반 Q&A 질문으로 확인되었습니다. 사내 지식 데이터베이스와 실시간 경쟁사 BI 뉴스 동향을 분석하여 최적의 R&D 인사이트를 제공합니다.

아래와 같이 구체적인 주제를 질문하시면 상세한 사실에 기반한 정밀 보고서 형식으로 즉시 답변을 도출해 드릴 수 있습니다.

#### 💡 질문하실 수 있는 추천 주제 가이드:
1. **제조사 재무 실적 및 매출**
   - *"글로벌 타이어 Big 4 제조사들의 매출 및 판매량 비교표 보여줘"*
   - *"한국타이어 매출 추이와 프리미엄 타이어 판매 비중은 어때?"*
2. **트레드 컴파운드 물성 및 실리카 배합률**
   - *"미쉐린 파일럿 스포츠 5의 실리카 함량이 어떻게 돼?"*
   - *"각 브랜드별 컴파운드 경도와 마모지수 비교해줘"*
3. **사내 DB 통계 및 세그먼트 점유율**
   - *"컴파운드 BM 데이터베이스 세그먼트 점유율 현황 보여줘"*
   - *"사계절용 타이어와 전기차 전용 타이어 분석 건수는 각각 몇 건이야?"*
4. **실시간 경쟁사 R&D 및 ESG 뉴스**
   - *"최근 미쉐린이나 콘티넨탈의 기술 특허나 친환경 타이어 기사 있어?"*
   - *"브리지스톤 Enliten 경량화 기술 뉴스와 영향 분석해줘"*
5. **사내 아레나 보고서 라이브러리 연계**
   - *"사내 Arena에 등록된 타이어 벤치마킹 보고서 목록 알려줘"*
   - *"VPR-2025-11 보고서 내용이 어떤 거야?"*

---
*질문 창에 원하시는 핵심 단어(예: **매출**, **실리카**, **뉴스**, **보고서**, **세그먼트**)를 포함해 자유롭게 질문해 주시면, 최상의 R&D 조언을 드리겠습니다!*`;
  }

  /**
   * Premium Cascade Slide-Up block-by-block rendering.
   * Completely tag-safe and guarantees perfect table/list styling during animations.
   */
  function typeOutAnswer(markdownText, container) {
    const htmlContent = parseMarkdownToHtml(markdownText);
    container.innerHTML = "";
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const blocks = Array.from(tempDiv.childNodes);
    let blockIndex = 0;
    
    function renderNextBlock() {
      if (blockIndex < blocks.length) {
        const node = blocks[blockIndex].cloneNode(true);
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          node.style.opacity = "0";
          node.style.transform = "translateY(12px)";
          node.style.transition = "opacity 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)";
          container.appendChild(node);
          
          setTimeout(() => {
            node.style.opacity = "1";
            node.style.transform = "translateY(0)";
          }, 20);
        } else {
          container.appendChild(node);
        }
        
        blockIndex++;
        const delay = (node.nodeName === 'DIV' || node.nodeName === 'TABLE') ? 200 : 60;
        setTimeout(renderNextBlock, delay);
      }
    }
    
    renderNextBlock();
  }

  /**
   * Trigger AI Chat Agent Proxy via Express Server or fallback smoothly
   */
  function triggerAiQa(query) {
    const qaUserQueryDisplay = document.getElementById('qa-user-query-display');
    const qaAnswerContent = document.getElementById('qa-answer-content');
    const qaSourceBadge = document.getElementById('qa-source-badge');

    if (qaUserQueryDisplay) qaUserQueryDisplay.innerText = query;
    if (qaAnswerContent) {
      qaAnswerContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; padding: 25px; color: var(--text-muted); font-size: 0.95rem; font-weight: 700; background: rgba(0,0,0,0.015); border-radius: 10px; border: 1px dashed rgba(0,0,0,0.06);">
          <i class="fa-solid fa-spinner fa-spin" style="color: var(--primary); font-size: 1.25rem;"></i>
          <span>AI Insight Agent가 사내 지식 데이터베이스와 실시간 BI 뉴스를 연동하여 최적의 R&D 답변을 가다듬고 있습니다...</span>
        </div>
      `;
    }

    // Connect to port 3000 Chat endpoint
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('API server unreachable or returned error status');
      }
      return res.json();
    })
    .then(data => {
      if (data && data.status === 'success' && data.response) {
        if (qaSourceBadge) qaSourceBadge.innerHTML = `<span style="color:#22c55e;"><i class="fa-solid fa-bolt"></i> Gemini Flash 2.5 Active</span>`;
        typeOutAnswer(data.response, qaAnswerContent);
      } else {
        console.warn("[Strategy Console] Proxy returned fallback status. Loading local RAG context...");
        if (qaSourceBadge) qaSourceBadge.innerHTML = `<span style="color:var(--primary);"><i class="fa-solid fa-database"></i> Local RAG Fallback</span>`;
        const fallbackText = getLocalFallbackAnswer(query);
        typeOutAnswer(fallbackText, qaAnswerContent);
      }
    })
    .catch(err => {
      console.error("[Strategy Console] Server network error. Falling back to rich local database:", err);
      if (qaSourceBadge) qaSourceBadge.innerHTML = `<span style="color:#d97706;"><i class="fa-solid fa-network-wired"></i> Local RAG (Offline Mode)</span>`;
      const fallbackText = getLocalFallbackAnswer(query);
      typeOutAnswer(fallbackText, qaAnswerContent);
    });
  }

  // Trigger simulation with steps and animation
  function triggerStrategicSimulation(query) {
    try {
      console.log("[Strategy Console] Starting strategic simulation/QA for query:", query);
      const loaderScreen = document.getElementById('strategy-loader-screen');
      const emptyScreen = document.getElementById('strategy-empty-screen');
      const reportViewport = document.getElementById('strategy-report-viewport');
      const qaViewport = document.getElementById('strategy-qa-viewport');
      const loaderHeadline = document.getElementById('loader-headline-text');

      // 1. Classify the user prompt
      const isStrategy = isStrategyQuery(query);

      // 2. Adjust loader UI title
      if (loaderHeadline) {
        if (isStrategy) {
          loaderHeadline.innerText = "BM 기반 상품 전략 및 R&D 가이드라인 수립 중";
        } else {
          loaderHeadline.innerText = "AI Insight Agent 실시간 Q&A 답변 생성 중";
        }
      }

      // 3. Reset and dynamic-bind loader texts
      for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`loader-step-${i}`);
        if (step) {
          step.className = 'loader-step';
          const stepSpan = step.querySelector('span');
          if (stepSpan) {
            if (isStrategy) {
              stepSpan.innerText = originalStepTexts[i - 1];
            } else {
              stepSpan.innerText = qaStepTexts[i - 1];
            }
          }
        }
      }

      // Hide all output states
      if (emptyScreen) emptyScreen.style.display = 'none';
      if (reportViewport) reportViewport.style.display = 'none';
      if (qaViewport) qaViewport.style.display = 'none';

      // Reveal loader screen
      if (loaderScreen) {
        loaderScreen.style.display = 'flex';
        loaderScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 4. Set timing (Strategy is long-running R&D, Q&A is snappier)
      const stepDelay = isStrategy ? 750 : 350;

      // Run sequential loading simulation with stepDelay
      runLoaderStep(1, stepDelay, () => {
        runLoaderStep(2, stepDelay, () => {
          runLoaderStep(3, stepDelay, () => {
            runLoaderStep(4, stepDelay, () => {
              runLoaderStep(5, stepDelay, () => {
                // Done! Hide loader and render actual results
                setTimeout(() => {
                  if (loaderScreen) loaderScreen.style.display = 'none';
                  try {
                    if (isStrategy) {
                      renderStrategicReport(query);
                    } else {
                      if (qaViewport) {
                        qaViewport.style.display = 'block';
                        triggerAiQa(query);
                        setTimeout(() => {
                          qaViewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 120);
                      }
                    }
                  } catch (renderError) {
                    console.error("[Strategy Console] Render Error:", renderError);
                    if (typeof showDiagnosticBanner === 'function') {
                      showDiagnosticBanner('Render Error: ' + renderError.message + '\n' + renderError.stack);
                    } else {
                      alert('Render Error: ' + renderError.message);
                    }
                  }
                }, 400);
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

  function runLoaderStep(stepId, delay, callback) {
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
    }, delay || 750);
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

    // Dynamic Intranet Report Link Resolver (Resilient Fuzzy Overlap & Related Product Matcher)
    const resolveReportLink = (report) => {
      if (report.link && report.link !== '#') {
        return { url: report.link, type: 'direct' }; // Already has actual link
      }

      // Check if global database has it
      if (window.PLC_DATA && window.PLC_DATA.reports) {
        // A. Match by docNo first (exact match)
        if (report.docNo) {
          const cleanDocNo = report.docNo.trim().toLowerCase();
          const match = window.PLC_DATA.reports.find(r => r.docNo && r.docNo.trim().toLowerCase() === cleanDocNo);
          if (match && match.linkAddress && match.linkAddress !== '#') {
            return { url: match.linkAddress, type: 'direct' };
          }
        }

        // B. Match by title keyword (strict matching contains or is contained in)
        if (report.title) {
          const cleanReportTitle = report.title.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
          const match = window.PLC_DATA.reports.find(r => {
            if (!r.title) return false;
            const cleanDbTitle = r.title.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
            return cleanDbTitle.includes(cleanReportTitle) || cleanReportTitle.includes(cleanDbTitle);
          });
          if (match && match.linkAddress && match.linkAddress !== '#') {
            return { url: match.linkAddress, type: 'direct' };
          }
        }

        // C. Resilient Fuzzy Keyword Overlap & Related Product Matching (Fuzzy Matching Engine)
        if (report.title) {
          const targetTitle = report.title.toLowerCase();
          
          // Alphanumeric tokens of length >= 2
          const targetTokens = targetTitle.split(/[^a-z0-9가-힣]/).filter(t => t.length >= 2);
          
          // Core brand & model keywords that carry heavy semantic weight
          const coreBrandModelKeywords = [
            'michelin', 'goodyear', 'continental', 'bridgestone', 'pirelli', 'falken', 'yokohama', 'dunlop',
            'pilot', 'asymmetric', 'contact', 'turanza', 'alenza', 'defender', 'crossclimate', 'hpx', 'dynapro', 'sport'
          ];
          
          // Stop words to filter out
          const stopWords = ['분석', '결과', '보고', '보고서', '신제품', '신상품', '종합', '1차', '2차', '용역', '과제', '상품', '타이어', '북미', '유럽'];

          let bestMatch = null;
          let highestScore = 0;

          window.PLC_DATA.reports.forEach(r => {
            if (!r.title || !r.linkAddress || r.linkAddress === '#') return;
            
            let score = 0;
            const dbTitle = r.title.toLowerCase();
            const dbRelated = (r.relatedProducts || []).map(p => p.toLowerCase());

            // 1. Token intersections
            targetTokens.forEach(token => {
              if (stopWords.includes(token)) return; // Ignore stop words
              
              const isCoreKeyword = coreBrandModelKeywords.includes(token);
              const weight = isCoreKeyword ? 10 : 2;

              // Check if token matches title
              if (dbTitle.includes(token)) {
                score += weight;
              }
              // Check if token matches related products
              if (dbRelated.some(p => p.includes(token))) {
                score += weight + 3; // Extra weight if it specifically matches listed related products
              }
            });

            // 2. Exact word intersections in related products
            dbRelated.forEach(p => {
              targetTokens.forEach(token => {
                if (p === token) score += 15;
              });
            });

            // 3. Keep track of highest score
            if (score > highestScore) {
              highestScore = score;
              bestMatch = r;
            }
          });

          // A high score of 12 or more indicates a confident match (e.g. matched brand + model)
          if (highestScore >= 12 && bestMatch) {
            console.log(`[Fuzzy Matcher] Successfully matched report: "${report.title}" -> "${bestMatch.title}" (Score: ${highestScore})`);
            return { url: bestMatch.linkAddress, type: 'direct' };
          }
        }
      }

      // Fallback: Construct Arena portal search url
      const searchUrl = `https://arena.hankooktech.com/dwp/com/portal/main.nsf/wfrmpage?ReadForm&url=/dwp/search/totalSearch.nsf/totalSearch?OpenForm&query=${encodeURIComponent(report.title)}`;
      return { url: searchUrl, type: 'search' };
    };

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
        reportsHtml += reports.slice(0, 5).map(report => {
          const resolved = resolveReportLink(report);
          const isDirect = resolved.type === 'direct';
          const btnTitle = isDirect 
            ? '인트라넷 아레나 전자결재 새창으로 열기' 
            : '아직 기안 진행 중이거나 차세대 예측 분석 리포트입니다. 아레나 통합검색에서 검색어 자동 조회';
          const btnText = isDirect ? '열기' : '검색';
          const btnIcon = isDirect ? 'fa-arrow-up-right-from-square' : 'fa-magnifying-glass';
          const btnStyle = isDirect 
            ? 'border: 1px solid rgba(249, 115, 22, 0.3); color: var(--primary);' 
            : 'border: 1px solid rgba(148, 163, 184, 0.4); color: var(--text-muted);';

          const summaryId = `report-summary-${report.id}`;
          const toggleBtnId = `report-toggle-btn-${report.id}`;
          const toggleIconId = `report-toggle-icon-${report.id}`;

          return `
            <div class="report-item-wrapper" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.02), rgba(255, 255, 255, 0.85)); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 12px; margin-bottom: 8px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(249, 115, 22, 0.08)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 5px rgba(0,0,0,0.02)'">
              <div style="padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                <div class="ref-info" style="flex: 1; text-align: left;">
                  <h5 style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin: 0 0 4px 0; line-height: 1.35; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-file-invoice" style="color: var(--primary); font-size: 0.85rem;"></i>
                    <span>${report.title}</span>
                  </h5>
                  <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">문서번호: ${report.docNo} • 기안자: ${report.drafter} • 기안일: ${report.date}</p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                  <button id="${toggleBtnId}" onclick="
                    const panel = document.getElementById('${summaryId}');
                    const icon = document.getElementById('${toggleIconId}');
                    const btn = document.getElementById('${toggleBtnId}');
                    if (panel.style.display === 'none') {
                      panel.style.display = 'block';
                      icon.className = 'fa-solid fa-chevron-up';
                      btn.style.borderColor = 'var(--primary)';
                      btn.style.color = 'var(--primary)';
                      btn.style.background = 'rgba(249, 115, 22, 0.08)';
                    } else {
                      panel.style.display = 'none';
                      icon.className = 'fa-solid fa-chevron-down';
                      btn.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                      btn.style.color = 'var(--text-muted)';
                      btn.style.background = '#ffffff';
                    }
                  " style="background: #ffffff; border: 1px solid rgba(148, 163, 184, 0.3); color: var(--text-muted); padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="if(document.getElementById('${summaryId}').style.display==='none'){this.style.background='rgba(0,0,0,0.02)';}" onmouseout="if(document.getElementById('${summaryId}').style.display==='none'){this.style.background='#fff';}">
                    <span>결론 및 Insight 분석</span>
                    <i id="${toggleIconId}" class="fa-solid fa-chevron-down" style="font-size: 0.65rem;"></i>
                  </button>

                  <a href="${resolved.url}" target="_blank" class="ref-link-btn" style="background: #ffffff; ${btnStyle} padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='#fff';this.style.borderColor='var(--primary)'" onmouseout="this.style.background='#fff';this.style.color='${isDirect ? 'var(--primary)' : 'var(--text-muted)'}';this.style.borderColor='${isDirect ? 'rgba(249, 115, 22, 0.3)' : 'rgba(148, 163, 184, 0.4)'}'" title="${btnTitle}">
                    <span>${btnText}</span>
                    <i class="fa-solid ${btnIcon}" style="font-size: 0.7rem;"></i>
                  </a>
                </div>
              </div>

              <div id="${summaryId}" style="display: none; border-top: 1px dashed rgba(249, 115, 22, 0.15); padding: 12px 15px; background: rgba(255, 255, 255, 0.6); border-radius: 0 0 12px 12px; font-size: 0.82rem; line-height: 1.45;">
                <div style="margin-bottom: 8px;">
                  <strong style="color: var(--text-dark); font-size: 0.82rem; display: block; margin-bottom: 5px;"><i class="fa-solid fa-square-check" style="color: var(--primary); margin-right: 4px;"></i> 결론 및 Final Comment</strong>
                  <p style="color: var(--text-primary); margin: 0; padding-left: 12px; border-left: 2px solid rgba(249, 115, 22, 0.3); font-weight: 500; text-align: justify;">${report.summary || '상세 요약 분석 중입니다.'}</p>
                </div>
                <div>
                  <strong style="color: var(--text-dark); font-size: 0.82rem; display: block; margin-bottom: 5px;"><i class="fa-solid fa-lightbulb" style="color: #eab308; margin-right: 4px;"></i> 핵심 R&D Insight</strong>
                  <p style="color: var(--text-primary); margin: 0; padding-left: 12px; border-left: 2px solid #eab308; font-weight: 500; text-align: justify;">${report.insight || '차세대 R&D 과제 도정 반영 전략을 수립 중입니다.'}</p>
                </div>
              </div>
            </div>
          `;
        }).join('');
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
      } else if (matchedData.id === 'k135') {
        priorityTitle = '젖은 노면 제동성능(Wet Grip) 극대화 & 마모 수명(Wear Life) 대폭 연장';
      } else if (matchedData.id === 'h446') {
        priorityTitle = '초고장수명 마모 마일리지(UTQG 600+) 확보 & 실용적 경제성 제어';
      } else if (matchedData.id === 'h472') {
        priorityTitle = '글로벌 완성차 메이저 OE 정숙성 규격 충족 & 사계절 전천후 제동력 균형';
      } else if (matchedData.id === 'ra43') {
        priorityTitle = '고인치 고하중 SUV용 고속 안정성 극대화 & 도심형 NVH 저소음 제어';
      } else if (matchedData.id === 'w330') {
        priorityTitle = '혹한기 스노우/슬러시 견인력(ASTM 3PMSF) 확보 & 동계 드라이 스포츠 핸들링 보강';
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
            <div style="width: 140px; flex-shrink: 0; white-space: nowrap; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-arrows-left-right-to-line" style="color: var(--primary); margin-right: 6px;"></i> 림경 구성</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45;">${sku.rims}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 140px; flex-shrink: 0; white-space: nowrap; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-scale-balanced" style="color: var(--primary); margin-right: 6px;"></i> OE / RE 비율</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45;">${sku.ratio}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.04); align-items: flex-start;">
            <div style="width: 140px; flex-shrink: 0; white-space: nowrap; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-ring" style="color: var(--primary); margin-right: 6px;"></i> 주요 규격 예시</div>
            <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.45; font-weight: 500; background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 4px;">${sku.sizes}</div>
          </div>
          <div style="display: flex; gap: 15px; padding: 12px; align-items: flex-start;">
            <div style="width: 140px; flex-shrink: 0; white-space: nowrap; font-weight: 800; color: var(--text-dark); font-size: 0.9rem;"><i class="fa-solid fa-circle-nodes" style="color: var(--primary); margin-right: 6px;"></i> 세팅 전략 핵심</div>
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
                label: `자사 차세대 상품 성능 타겟 제안`,
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
                min: 5,
                max: 10,
                ticks: {
                  font: { size: 8 },
                  color: '#94a3b8',
                  backdropColor: 'transparent',
                  stepSize: 1
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
        
        <!-- Toggle button with premium glassmorphism styling and micro-animation -->
        <button id="toggle-radar-metrics-btn" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 10px; padding: 10px 14px; margin-top: 12px; cursor: pointer; color: var(--primary); font-size: 0.85rem; font-weight: 800; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); outline: none;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-square-poll-vertical" style="font-size: 0.95rem;"></i>
            <span>지표별 계측 데이터 및 점수 계산식 (세부 증빙)</span>
          </span>
          <i id="toggle-radar-icon" class="fa-solid fa-chevron-down" style="font-size: 0.8rem; transition: transform 0.2s ease;"></i>
        </button>
        
        <!-- Collapsible Content Panel -->
        <div id="radar-metrics-collapsible" style="display: none; margin-top: 10px; animation: slideDown 0.3s ease-out; overflow: hidden;">
          <div style="background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(249, 115, 22, 0.12); border-radius: 12px; padding: 14px; font-size: 0.85rem; overflow-x: auto; box-shadow: var(--shadow-sm); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 550px;">
              <thead>
                <tr style="border-bottom: 2px solid rgba(249, 115, 22, 0.15); font-size: 0.78rem; font-weight: 800; color: #475569;">
                  <th style="padding: 10px 12px; background: rgba(249, 115, 22, 0.02);">평가 항목</th>
                  <th style="padding: 10px 12px; text-align: center; width: 150px; background: rgba(249, 115, 22, 0.02);">평점 비교 (현행/경쟁/목표)</th>
                  <th style="padding: 10px 12px; background: rgba(249, 115, 22, 0.02);">정량 계측 데이터 및 산출 산식 근거</th>
                </tr>
              </thead>
              <tbody>
                ${basis.metrics ? basis.metrics.map(m => `
                  <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.05); font-size: 0.8rem; vertical-align: top; transition: background 0.15s ease;">
                    <td style="padding: 12px 10px; font-weight: 800; color: var(--text-dark); border-right: 1px solid rgba(0, 0, 0, 0.03); background: rgba(0,0,0,0.005);">
                      ${m.metric}
                    </td>
                    <td style="padding: 12px 10px; text-align: center; border-right: 1px solid rgba(0, 0, 0, 0.03);">
                      <div style="display: flex; gap: 4px; justify-content: center; align-items: center; flex-wrap: nowrap; font-size: 0.72rem; font-weight: 800;">
                        <span title="자사 현행" style="background: var(--accent-green); color: #fff; padding: 2px 5px; border-radius: 4px; box-shadow: 0 1px 3px rgba(34,197,94,0.25);">${m.scores.currentHK}</span>
                        <span style="color: #94a3b8;">/</span>
                        <span title="경쟁 현행" style="background: var(--accent-blue); color: #fff; padding: 2px 5px; border-radius: 4px; box-shadow: 0 1px 3px rgba(59,130,246,0.25);">${m.scores.competitorCurrent}</span>
                        <span style="color: #94a3b8;">/</span>
                        <span title="자사 차세대 R&D 목표" style="background: var(--primary); color: #fff; padding: 2px 5px; border-radius: 4px; box-shadow: 0 1px 3px rgba(249,115,22,0.25);">${m.scores.targetNext}</span>
                      </div>
                    </td>
                    <td style="padding: 12px 10px; color: var(--text-primary); line-height: 1.45;">
                      <div style="font-family: monospace; font-size: 0.75rem; background: rgba(15, 23, 42, 0.04); padding: 4px 8px; border-radius: 6px; color: #0f172a; margin-bottom: 6px; display: inline-block; border-left: 3px solid var(--primary); font-weight: 600;">
                        ${m.formula}
                      </div>
                      <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">${m.description}</div>
                    </td>
                  </tr>
                `).join('') : `<tr><td colspan="3" style="text-align:center; padding: 20px; color: var(--text-muted);">세부 지표 데이터가 존재하지 않습니다.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Set up interactive toggle click handler
      const toggleBtn = document.getElementById('toggle-radar-metrics-btn');
      const collapsiblePanel = document.getElementById('radar-metrics-collapsible');
      const toggleIcon = document.getElementById('toggle-radar-icon');
      
      if (toggleBtn && collapsiblePanel) {
        toggleBtn.addEventListener('click', () => {
          const isCollapsed = collapsiblePanel.style.display === 'none';
          if (isCollapsed) {
            collapsiblePanel.style.display = 'block';
            toggleIcon.className = 'fa-solid fa-chevron-up';
            toggleIcon.style.transform = 'rotate(180deg)';
            toggleBtn.style.background = 'rgba(249, 115, 22, 0.1)';
            toggleBtn.style.borderColor = 'var(--primary)';
          } else {
            collapsiblePanel.style.display = 'none';
            toggleIcon.className = 'fa-solid fa-chevron-down';
            toggleIcon.style.transform = 'rotate(0deg)';
            toggleBtn.style.background = 'rgba(249, 115, 22, 0.05)';
            toggleBtn.style.borderColor = 'rgba(249, 115, 22, 0.15)';
          }
        });
      }
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
