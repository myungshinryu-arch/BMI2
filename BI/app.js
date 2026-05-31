/**
 * ====================================================================
 * Application Script: Global Top 4 BI News Dashboard
 * ====================================================================
 * 글로벌 Top 4 경쟁사(Michelin, Bridgestone, Continental, Goodyear)의
 * 비즈니스 인텔리전스(BI), R&D 기술 동향, 경영 성과 및 ESG 성과를
 * 실시간 모니터링하고 분석하는 프리미엄 스크립트입니다.
 */

// 1. Mock BI News Dataset (풍부하고 실감 나는 글로벌 경쟁사 정보)
const BI_NEWS_DATA = [
    {
        id: 1,
        brand: 'michelin',
        brandName: 'Michelin',
        category: 'R&D',
        title: '미쉐린, 특수 가교 실리카 배합 기반 차세대 초고성능(UHP) EV 타이어 공개',
        excerpt: '미쉐린이 마모 수명을 25% 가속 개선하고, EV 중량으로 인한 편마모를 제어하는 특수 고무 배합 및 지능형 고분자 특허 공법을 적용한 차세대 타이어 라인업을 유럽 시장에 시범 도입합니다.',
        content: `<strong>미쉐린(Michelin) 연구소</strong>는 기존 내연기관 대비 차량 중량이 무겁고 회전 토크가 즉각 발현되는 전기차(EV) 환경의 가혹한 물성 요건을 충족하기 위해, 특수 가교 밀도를 극대화한 실리카 배합 원천 기술 개발에 성공했다고 발표했습니다.
        <br><br>
        이번에 새롭게 도입된 고분자 매트릭스 결합 제어 기술은 전기차의 초기 슬립 현상을 최소화하여 타이어 접지면에 가해지는 압력을 균일하게 분산시킵니다. 이를 통해 타이어 수명을 기존 동급 제품 대비 무려 25% 이상 늘리고, 젖은 노면에서의 제동 거리 또한 약 8% 단축시키는 괄목할 성과를 거두었습니다.
        <br><br>
        이 제품은 올해 하반기부터 미쉐린의 유럽 주요 공장(독일 및 프랑스 공장)에서 양산을 가동할 예정이며, 메이저 프리미엄 완성차 업체의 고성능 EV 모델에 신차용(OE) 타이어로 우선 공급 계약을 맺은 상태입니다. 이는 당사의 고부가가치 타이어(iON) 시장 점유율에 직접적인 경쟁 압박으로 작용할 것으로 분석됩니다.`,
        date: '2026-05-30',
        sentiment: 'positive',
        sentimentScore: 92,
        tags: ['UHP', 'EV 타이어', '특수 실리카', '공밀도 가교'],
        aiAnalysis: {
            summary: '초고밀도 폴리머 네트워크 설계를 통한 EV용 고마모/고제동 밸런스 타이어 상용화 돌입.',
            impact: '당사의 플래그십 EV 브랜드인 iON 제품군 대비 마모 마일리지가 대등하거나 우위에 설 우려가 있음.',
            recommendation: '당사 9세대 EV 컴파운드의 실리카 분산제 기술을 업그레이드하고 특허 출원을 가동하여 고강도 지능형 컴파운드 마케팅 선제 전개 필요.'
        }
    },
    {
        id: 2,
        brand: 'bridgestone',
        brandName: 'Bridgestone',
        category: 'M&A',
        title: '브리지스톤, 유럽 플릿 솔루션 시장 장악을 위한 스마트 물류 센싱 기업 추가 인수',
        excerpt: '브리지스톤이 스마트 모빌리티 솔루션 사업 부문을 확대하기 위해 텔레매틱스 기반 고지능 센싱 솔루션 기업을 인수하고, 자사의 "Tirematics" 플랫폼에 전격 통합을 단행했습니다.',
        content: `<strong>브리지스톤(Bridgestone)</strong>은 자회사 Webfleet Solutions를 연계하여, 플릿 관리 및 타이어 압력/온도를 실시간 분석 추적하는 프리미엄 소프트웨어 기업을 인수 합병하는 최종 계약서에 서명했습니다.
        <br><br>
        이번 인수를 통해 브리지스톤은 단순한 타이어 생산 기지를 공급하는 하드웨어 제조업체에서 탈피하여, 대형 물류 트럭 플릿 및 상용차 운송사를 타깃으로 한 '타이어 라이프사이클 솔루션 플랫폼(TaaS, Tire as a Service)' 생태계를 완벽하게 완성하겠다는 구상을 구체화하고 있습니다.
        <br><br>
        새롭게 개발된 무선 IoT 스마트 센서칩은 가혹한 고온 고압 조건에서도 정밀하게 타이어 접지 상태 및 마모 정도를 자율 연산하여 운송 관제 센터로 즉각 송신합니다. 이를 통해 오일 교환 주기 및 로테이션 권장 타임을 미리 경고하여 운송사 비용을 15% 이상 혁신적으로 절감합니다.`,
        date: '2026-05-29',
        sentiment: 'positive',
        sentimentScore: 85,
        tags: ['플릿 솔루션', 'IoT 센서', '스마트 물류', 'TaaS 플랫폼'],
        aiAnalysis: {
            summary: '물류 플릿 최적화를 위한 텔레매틱스 기반 디지털 스마트 솔루션 지배력 극대화.',
            impact: '완성차 및 대형 운송 업체들이 타이어 구매 시 소프트웨어 관리 플랫폼 통합을 강하게 요구하는 트렌드가 가속화됨.',
            recommendation: '당사 독자 솔루션 시스템의 편의성을 고도화하고, 글로벌 주요 상용차 메이커와의 협업 시 스마트 센서 무료 번들 프로모션을 전략 도입해야 함.'
        }
    },
    {
        id: 3,
        brand: 'continental',
        brandName: 'Continental',
        category: 'ESG',
        title: '콘티넨탈, 민들레 추출 천연고무 "Taraxagum" 상용화 승인 획득 및 양산 라인 확장',
        excerpt: '콘티넨탈이 동남아시아 고무나무 의존도를 대폭 탈피하고, 유럽 현지에서 재배 가능한 민들레 뿌리 추출 천연 고무 대량 정제 및 양산 테스트를 마치고 본격적인 공장 설립에 들어갑니다.',
        content: `<strong>콘티넨탈(Continental)</strong>은 수년간 축적해 온 민들레 추출 천연고무 기술인 'Taraxagum(타락사검)'을 적용한 자전거 및 고성능 승용차 타이어가 마침내 국제 규격 친환경 및 물성 안전성 공식 승인을 통과했다고 밝혔습니다.
        <br><br>
        민들레 뿌리에서 고순도 고무 라텍스를 축출하는 이 기술은 고무나무 재배 한계선을 극복하여 유럽 현지 농가에서 대량 재배가 가능하다는 장점이 있어, 글로벌 물류 유통비 절감 및 아마존 산림 파괴 논란을 원천적으로 차단합니다.
        <br><br>
        콘티넨탈은 유럽 연합(EU)의 공급망 실사법 및 탄소 장벽에 대응하여, 2028년까지 신차 OE 공급 타이어 전체에 민들레 천연고무 비율을 최대 30%까지 점진적으로 확대하겠다는 공격적인 친환경 타임라인을 제시했습니다.`,
        date: '2026-05-28',
        sentiment: 'positive',
        sentimentScore: 88,
        tags: ['민들레 고무', 'Taraxagum', '친환경 원자재', '공급망 탄력성'],
        aiAnalysis: {
            summary: '열대 우림 파괴 없는 유럽 현지 조달형 친환경 지속가능 대체고무 대량 양산 국면 진입.',
            impact: '유럽 내 메이저 오리지널 메이커들이 ESG 점수 비중을 강화함에 따라 당사의 친환경 점검도 수위에 비상이 걸림.',
            recommendation: '국내외 바이오 연구기관과 파트너십을 통해 민들레 고무 외에 오렌지 오일, 가이율(Guayule) 등 독자 친환경 에멀전 고분자 연구를 가속화해야 함.'
        }
    },
    {
        id: 4,
        brand: 'goodyear',
        brandName: 'Goodyear',
        category: 'R&D',
        title: '굿이어, 자율주행 특화 비공기식 타이어(NPT) 통합 섀시 제어 실차 테스팅 완료',
        excerpt: '굿이어가 공기압 누출이나 펑크 위험이 전무한 비공기식 타이어(Airless Tire)를 자율주행 셔틀 차량에 장착하여 실차 연속 가혹 시험 주행에 성공했다고 공표했습니다.',
        content: `<strong>굿이어(Goodyear)</strong>는 차세대 모빌리티의 게임 체인저로 꼽히는 비공기식 타이어(Non-Pneumatic Tire)에 정밀 섀시 자세 제어 센서를 임베디드화한 혁신 주행 테스트를 북미 특화 실험장에서 마쳤습니다.
        <br><br>
        공기압이 없어 펑크 우려가 없는 이 미래형 타이어는 스포크(Spoke) 구조체 설계 기술을 최적화하여 횡방향 강성을 대폭 보강했으며, 노면 충격을 서스펜션보다 앞서 1차 흡수함으로써 자율주행 차량 탑승객의 승차감을 대폭 끌어올렸습니다.
        <br><br>
        특히, 차세대 타이어 내부에 밀리미터 단위의 소형 가속도 및 온도 센서를 탑재하여, 차량의 차체제어(ESC) 컴퓨터와 연동 시 노면의 미끄럼 상태 및 급작스러운 그립 변화를 0.05초 만에 예측 감지하고 제동 토크를 실시간 보정하는 첨단 지능형 기술을 선보였습니다.`,
        date: '2026-05-27',
        sentiment: 'positive',
        sentimentScore: 81,
        tags: ['비공기식 타이어', 'Airless', '자율주행 셔틀', '섀시 연동 제어'],
        aiAnalysis: {
            summary: '자율주행 환경에 대응하는 펑크 제로 비공기식 하이브리드 지능형 스포크 구조 양산화 타진.',
            impact: '단거리 도심 순환 셔틀 및 배송 모빌리티 시장에서 공기식 타이어의 점진적 퇴조가 일어날 가능성 포착.',
            recommendation: '국책 과제 및 사내 미래R&D 조직을 통해 고신뢰성 에어로 스포크 디자인 및 점진 복원력 소재 배합 기술 로드맵 전격 수립 필수.'
        }
    },
    {
        id: 5,
        brand: 'michelin',
        brandName: 'Michelin',
        category: '실적',
        title: '미쉐린, 유럽 내 노후화된 저수익 승용차용 타이어 공장 2개소 선제적 폐쇄 가동',
        excerpt: '미쉐린이 고비용 저효율 구조의 보급형 일반 타이어 생산 라인을 전격 통폐합하고, 초고성능 프리미엄 및 대구경 라인업 중심의 하이엔드 올인 전략으로 경영 노선을 재편합니다.',
        content: `<strong>미쉐린(Michelin) 본사</strong>는 최근 급증하는 아시아 가성비 브랜드들의 공격적인 저가 공세를 극복하고 장기 이익률 15% 이상을 철저히 사수하기 위해, 유럽 내 수명 주기가 만료된 노후화 타이어 생산 라인 2곳에 대한 폐쇄 조치를 시행했습니다.
        <br><br>
        이번 구조조정을 바탕으로 연간 약 1억 2천만 유로의 고정비용을 추가 세이브할 예정이며, 절감한 가용 재원을 전부 전기차 전용 하이그립 타이어 및 19인치 이상 초고인치 대구경 프리미엄 타이어 신제품 개발에 몰아넣을 방침입니다.
        <br><br>
        글로벌 경기 둔화와 수요 양극화가 뚜렷해짐에 따라 경쟁사들이 단순 마켓 쉐어 확장 싸움을 멈추고 고부가가치 믹스 고도화로 전술을 초압축 전환하고 있음을 증명하는 핵심 지표입니다.`,
        date: '2026-05-25',
        sentiment: 'neutral',
        sentimentScore: 68,
        tags: ['구조조정', '생산라인 최적화', '프리미엄 믹스', '마진 극대화'],
        aiAnalysis: {
            summary: '저수익 라인을 철수하고 친환경 및 고수익 초고인치 하이엔드 믹스 집중을 통한 체질 다변화.',
            impact: '유럽 내 마켓에서 하이엔드 시장을 두고 당사와 미쉐린 간의 정면 승부 강도가 한층 가열될 전망.',
            recommendation: '유럽 유통 관로 및 고성능 완성차 전용 특화 OE 스펙 신속 라인업 확대로, 미쉐린의 공백 가동 타이밍을 노려야 함.'
        }
    },
    {
        id: 6,
        brand: 'goodyear',
        brandName: 'Goodyear',
        category: '실적',
        title: '굿이어, 북미 1분기 영업 이익 예측치 상회… 고인치 SUV 및 고마모 수명 신제품 호재',
        excerpt: '굿이어가 북미 및 남미 시장에서 프리미엄 올웨더(All-Weather) 타이어 라인업의 판매 호조로 1분기 어닝 서프라이즈 및 이익 반등을 달성했습니다.',
        content: `<strong>굿이어(Goodyear)</strong>는 최근 단행한 북미 시장 대리점 유통망 수수료 정비 및 신개념 전천후 사계절용 하이엔드 타이어 판매 폭증에 힘입어 시장 전망치를 약 12% 웃도는 영업이익 실적을 공시했습니다.
        <br><br>
        특히 날씨 변화가 변화무쌍하고 겨울철 폭설과 빗길 노면이 번갈아 나타나는 북미 동부 지역에서 굿이어의 겨울철 성능 특화 올시즌 제품이 기후 대응성 측면에서 폭발적인 소비자 신뢰를 획득하며 매진 행렬을 이루었습니다.
        <br><br>
        굿이어는 이에 그치지 않고, 3분기 대형 SUV 및 픽업 트럭용 'Wrangler' 고인치 익스트림 내구성 신작 라인을 공격적으로 런칭하여 경쟁사들을 따돌리고 점유율 정상을 공고히 지켜내겠다는 마케팅 예산을 증액 수립했습니다.`,
        date: '2026-05-20',
        sentiment: 'positive',
        sentimentScore: 78,
        tags: ['어닝 서프라이즈', '올웨더 타이어', '픽업트럭용', '유통채널 혁신'],
        aiAnalysis: {
            summary: '북미 특화 올웨더 마켓 선점 및 유통채널 단일화를 통한 마진 방어 대폭 성공.',
            impact: '북미 시장에서 점유율 경쟁 중인 자사의 올시즌 및 올웨더 제품군에 잠재적인 영업 장애 요인이 발생.',
            recommendation: '북미용 최고급 올웨더 라인인 Kinergy 4S2 브랜딩을 강화하고 딜러망 리베이트 제도를 경쟁사 수준 이상으로 매력있게 리디자인해야 함.'
        }
    },
    {
        id: 7,
        brand: 'continental',
        brandName: 'Continental',
        category: 'M&A',
        title: '콘티넨탈, 수소차용 고내압 튜브 및 전용 컴파운드 설계 전문 테크 스타트업 전격 투자',
        excerpt: '콘티넨탈 R&D 및 전략투자 부문이 수소전지 차량에 필요한 특수 무누설 소재 및 내산화 고기밀 컴파운드 핵심 역량을 확보하기 위해 독일 지능형 소재 벤처에 거액을 투자했습니다.',
        content: `<strong>콘티넨탈(Continental)</strong> 벤처 캐피털 사업부는 독일 프랑크푸르트에 기반을 둔 차세대 고내성 폴리머 매트릭스 설계 테크 스타트업의 지분 35%를 전격 인수했다고 밝혔습니다.
        <br><br>
        이 기업은 수소 분자 특유의 미세 탈출 누설을 분자 단위에서 포집 및 차단하는 특화 그리드 구조 엘라스토머 엔지니어링 특허를 대량 보유한 첨단 기술 기업입니다.
        <br><br>
        콘티넨탈은 장기적으로 2030 수소 상용차(FCEV) 본격 도래 시대를 내다보고, 일반 타이어를 넘어 극저온 충전 호스, 연료전지 스택 개스킷 및 고압 수소 전용 배관 시스템 사업 부문 독점 공급망을 미리 지배하겠다는 신성장 동력 벨트를 구축했습니다.`,
        date: '2026-05-18',
        sentiment: 'positive',
        sentimentScore: 79,
        tags: ['지분 인수', '수소차 컴포넌트', '폴리머 엘라스토머', 'FCEV 특화'],
        aiAnalysis: {
            summary: '미래형 상용 수소 모빌리티용 고기밀 엘라스토머 및 튜브 독자 기술 장벽 구축.',
            impact: '비타이어 비즈니스 영역에서 화학 폴리머 솔루션 신사업의 진입 장벽을 높이는 강력한 선점 효과 발생.',
            recommendation: '자사의 비타이어 고무 소재 사업부(화학 부서 등)와 공동 연구를 개시하여, 당사 고유의 FCEV 수소 수송용 튜브 원천 수급 전략 마련 시급.'
        }
    },
    {
        id: 8,
        brand: 'bridgestone',
        brandName: 'Bridgestone',
        category: 'ESG',
        title: '브리지스톤, 100% 지속가능한 천연 원료 기반 고성능 실리카 컴파운드 실증 양산 가동',
        excerpt: '브리지스톤이 타이어 제조 과정에서 오염 배출을 획기적으로 개선하기 위해, 화석 연료가 아닌 농업 부산물을 활용한 친환경 고분산 가공 기술 개발을 전 공장에 성공적으로 배치했습니다.',
        content: `<strong>브리지스톤(Bridgestone)</strong>은 기존 오일에 기초한 합성수지와 유독성 촉매를 일체 사용하지 않고, 쌀겨에서 탄화 가공 추출한 바이오 액티브 실리카와 유기 농업용 오일을 중합한 친환경 그린 컴파운드 타이어 양산을 전면 개시한다고 선포했습니다.
        <br><br>
        이 기술은 기존 타이어 제조 공정 시 배출되던 공장 탄소 배출량을 약 35% 즉각 저감하는 혁신을 이룩하였으며, 원재료의 최대 75%를 지속 가능한 자원으로 고도 치환하면서도 고무 본연의 회전저항(LRR) 성능을 오히려 4% 향상시키는 경이로운 화학 배합 밸런스를 입증했습니다.
        <br><br>
        브리지스톤은 이 제품을 'Enliten(엔라이튼)' 환경 테크 제품군에 완전 편입시키고 글로벌 메이저 메이커와의 환경 공조 마케팅을 강화하기 위해 적극적 홍보 캠페인에 착수했습니다.`,
        date: '2026-05-15',
        sentiment: 'positive',
        sentimentScore: 86,
        tags: ['Enliten', '쌀겨 실리카', '탄소 저감', '지속가능 원재료'],
        aiAnalysis: {
            summary: '친환경 가공 기술과 우수한 컴파운드 주행 제동 특성을 동시에 확보한 에코 테크 양산 성공.',
            impact: '유럽 친환경 등급 라벨링 최상 등급(A/A) 획득으로 해외 친환경 장벽 극복 시 매우 유리한 위치 차지.',
            recommendation: '당사 친환경 타이어 라인 개발 역량을 독려하고, 버려지는 천연소재 원재료의 자체 업사이클링 특화 공법을 서둘러 제품에 녹여내야 함.'
        }
    }
];

// App State Management (글로벌 상태 관리)
let currentTab = 'all-news';
let selectedBrand = 'all';
let currentCategory = 'all';
let searchQuery = '';

let brandShareChartInstance = null;
let categoryDistributionChartInstance = null;

// 2. DOM Elements Initialization (DOM 요소 초기화)
document.addEventListener('DOMContentLoaded', () => {
    // 사이드바 제어 요소
    const sidebar = document.getElementById('sidebar-nav');
    const sidebarToggleBtn = document.getElementById('btn-sidebar-toggle');
    
    // 탭 메뉴 버튼
    const menuItems = document.querySelectorAll('.menu-item');
    
    // 뉴스 필터 컨트롤러
    const newsSearchInput = document.getElementById('news-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const brandChipFilters = document.getElementById('brand-chip-filters');
    const categoryChipFilters = document.getElementById('category-chip-filters');
    
    // 컨테이너 및 모달
    const newsCardsContainer = document.getElementById('news-cards-container');
    const newsDetailModal = document.getElementById('news-detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // ==========================================
    // SIDEBAR MOUSELEAVE & TOGGLE GIMMICKS (사이드바 자동 숨김 & 토글 기믹)
    // ==========================================
    // 마우스가 사이드바 영역을 완전히 벗어나면 즉각적으로 active 소거 및 원상 복구
    sidebar.addEventListener('mouseleave', () => {
        sidebar.classList.remove('active');
        // 본문에 가해지는 불필요한 포커스 효과 제거
    });

    // 햄버거 토글 버튼 클릭 시 사이드바 상태 토글
    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        sidebar.classList.toggle('active');
    });

    // 화면 아무 곳이나 클릭할 때 사이드바 활성화 해제
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // ==========================================
    // TAB VIEW ROUTING SYSTEM (탭 뷰 라우팅 시스템)
    // ==========================================
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            if (!targetTab) return;

            // 메뉴 활성화 변경
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // 탭 패널 전환
            const panels = document.querySelectorAll('.tab-panel');
            panels.forEach(panel => panel.classList.remove('active-panel'));

            const activePanel = document.getElementById(`tab-content-${targetTab}`);
            if (activePanel) {
                activePanel.classList.add('active-panel');
            }

            // 상태 업데이트
            currentTab = targetTab;
            
            // 헤더 서브타이틀 동적 조율
            updateHeaderTitle(targetTab);

            // 탭 2 (트렌드 분석) 진입 시 Chart.js 초기화 가동
            if (targetTab === 'brand-analytics') {
                setTimeout(() => {
                    initAnalyticsCharts();
                }, 50); // DOM 렌더링 동기화용 딜레이
            }

            // 사이드바 자동 닫기 (이동 후 편의 제공)
            sidebar.classList.remove('active');
        });
    });

    // 헤더 소제목 및 캡션 동적 제어 함수
    function updateHeaderTitle(tabName) {
        const headerTitleText = document.getElementById('header-title-text');
        if (!headerTitleText) return;

        switch (tabName) {
            case 'all-news':
                headerTitleText.innerHTML = '<i class="fa-solid fa-list-check"></i> 글로벌 경쟁사 핵심 정보 실시간 파이프라인';
                break;
            case 'brand-analytics':
                headerTitleText.innerHTML = '<i class="fa-solid fa-chart-simple"></i> 핵심 4대 제조사 빅데이터 계량 분석 대시보드';
                break;
            case 'ai-digest':
                headerTitleText.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI 머신러닝 기반 3대 핵심 위협 트렌드 브리핑';
                break;
            default:
                headerTitleText.textContent = '글로벌 경쟁사 핵심 정보 실시간 파이프라인';
        }
    }

    // ==========================================
    // NEWS FILTER CHIPS INTERACTION (필터 칩 제어)
    // ==========================================
    // 제조사 필터 칩 클릭 이벤트
    if (brandChipFilters) {
        brandChipFilters.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            // 액티브 클래스 이식
            brandChipFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            selectedBrand = chip.getAttribute('data-brand');
            renderNewsFeed();
        });
    }

    // 카테고리 필터 칩 클릭 이벤트
    if (categoryChipFilters) {
        categoryChipFilters.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            // 액티브 클래스 이식
            categoryChipFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            currentCategory = chip.getAttribute('data-cat');
            renderNewsFeed();
        });
    }

    // 검색창 입력 이벤트 및 검색 지우기 버튼 감지
    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            
            if (searchQuery.length > 0) {
                searchClearBtn.style.display = 'block';
            } else {
                searchClearBtn.style.display = 'none';
            }
            renderNewsFeed();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            newsSearchInput.value = '';
            searchQuery = '';
            searchClearBtn.style.display = 'none';
            newsSearchInput.focus();
            renderNewsFeed();
        });
    }

    // ==========================================
    // RENDER NEWS FEED SYSTEM (뉴스 카드 동적 빌드)
    // ==========================================
    function renderNewsFeed() {
        if (!newsCardsContainer) return;
        newsCardsContainer.innerHTML = '';

        // 데이터 필터링 수행
        const filteredNews = BI_NEWS_DATA.filter(news => {
            // 1. 제조사 필터링
            const matchesBrand = (selectedBrand === 'all' || news.brand === selectedBrand);
            // 2. 카테고리 필터링
            const matchesCategory = (currentCategory === 'all' || news.category === currentCategory);
            // 3. 텍스트 검색 필터링
            const matchesSearch = !searchQuery || 
                news.title.toLowerCase().includes(searchQuery) ||
                news.excerpt.toLowerCase().includes(searchQuery) ||
                news.brandName.toLowerCase().includes(searchQuery) ||
                news.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
                news.category.toLowerCase().includes(searchQuery);

            return matchesBrand && matchesCategory && matchesSearch;
        });

        // 필터링 결과가 전혀 없는 경우 프리미엄 노티 피드백 출력
        if (filteredNews.length === 0) {
            newsCardsContainer.innerHTML = `
                <div class="card-premium" style="grid-column: 1 / -1; padding: 48px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
                    <i class="fa-solid fa-folder-open" style="font-size: 3.5rem; color: rgba(59, 130, 246, 0.25);"></i>
                    <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">검색된 비즈니스 뉴스가 존재하지 않습니다</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 420px; line-height: 1.6;">다른 키워드를 입력하시거나, 상단의 브랜드 필터 및 카테고리 칩 선택 상태를 재조정 해주시기 바랍니다.</p>
                </div>
            `;
            return;
        }

        // 필터링된 뉴스를 DOM 카드로 빌드
        filteredNews.forEach(news => {
            const card = document.createElement('div');
            card.className = 'news-card card-premium';
            card.setAttribute('data-id', news.id);

            // 감성 등급 표시용 템플릿
            let sentimentHtml = '';
            if (news.sentiment === 'positive') {
                sentimentHtml = `<span class="sentiment-meter positive"><i class="fa-solid fa-face-smile"></i> 호재 (${news.sentimentScore}점)</span>`;
            } else if (news.sentiment === 'neutral') {
                sentimentHtml = `<span class="sentiment-meter neutral"><i class="fa-solid fa-face-meh"></i> 중립 (${news.sentimentScore}점)</span>`;
            } else {
                sentimentHtml = `<span class="sentiment-meter negative"><i class="fa-solid fa-face-frown"></i> 우려 (${news.sentimentScore}점)</span>`;
            }

            // 태그 배지 가공
            const tagsHtml = news.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('');

            card.innerHTML = `
                <div class="news-card-meta">
                    <span class="brand-badge ${news.brand}">${news.brandName}</span>
                    <span class="news-date"><i class="fa-regular fa-calendar-days" style="margin-right: 4px;"></i> ${news.date}</span>
                </div>
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-excerpt">${news.excerpt}</p>
                <div class="news-card-tags">
                    ${tagsHtml}
                </div>
                <div class="news-card-footer">
                    ${sentimentHtml}
                    <span class="read-more-text">상세분석 <i class="fa-solid fa-circle-chevron-right"></i></span>
                </div>
            `;

            // 클릭 시 모달 팝업 연동
            card.addEventListener('click', () => {
                openNewsDetailModal(news.id);
            });

            newsCardsContainer.appendChild(card);
        });
    }

    // ==========================================
    // PREMIUM DETAIL MODAL CONTROLLER (모달 제어 및 상세 데이터 주입)
    // ==========================================
    function openNewsDetailModal(newsId) {
        const newsItem = BI_NEWS_DATA.find(n => n.id === newsId);
        if (!newsItem || !newsDetailModal || !modalCloseBtn) return;

        const modalBody = document.getElementById('modal-detail-content');
        if (!modalBody) return;

        // 감성 뱃지 정의
        let sentimentClass = newsItem.sentiment;
        let sentimentText = newsItem.sentiment === 'positive' ? '긍정적 (호재)' : (newsItem.sentiment === 'neutral' ? '중립' : '우려 (주의)');

        // 모달 내부 내용 조립
        modalBody.innerHTML = `
            <div class="modal-header-meta">
                <span class="brand-badge ${newsItem.brand}">${newsItem.brandName}</span>
                <span style="color: var(--text-muted);"><i class="fa-solid fa-tags" style="color: var(--primary);"></i> ${newsItem.category}</span>
                <span class="sentiment-score-badge ${sentimentClass}" style="margin-left: auto;">감성 지수: ${newsItem.sentimentScore}점 (${sentimentText})</span>
            </div>
            
            <h2 class="modal-title">${newsItem.title}</h2>
            
            <div class="modal-source-row">
                <span><i class="fa-solid fa-globe" style="margin-right: 4px;"></i> 글로벌 타이어 리서치 연계</span>
                <span><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> 분석 릴리즈: ${newsItem.date}</span>
            </div>
            
            <div class="modal-content-body">
                ${newsItem.content}
            </div>
            
            <!-- AI Deep Brain 분석 피드백 블록 -->
            <div class="modal-ai-analysis">
                <h4><i class="fa-solid fa-brain" style="filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.45));"></i> AI 심층 비즈니스 위협/대응 정합성 분석</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; background: rgba(255, 255, 255, 0.5); padding: 12px; border-radius: 8px; border: 1px dashed rgba(59, 130, 246, 0.15);">
                    <strong>[핵심 요약]</strong> ${newsItem.aiAnalysis.summary}
                </p>
                
                <div class="modal-ai-analysis-grid">
                    <div class="analysis-panel">
                        <h5><i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; margin-right: 4px;"></i> 당사 영향 및 위협 등급</h5>
                        <p>${newsItem.aiAnalysis.impact}</p>
                    </div>
                    <div class="analysis-panel">
                        <h5><i class="fa-solid fa-shield-halved" style="color: #10b981; margin-right: 4px;"></i> 당사 권장 권고 대응전략</h5>
                        <p>${newsItem.aiAnalysis.recommendation}</p>
                    </div>
                </div>
            </div>
        `;

        // 모달 표시
        newsDetailModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 뒷배경 스크롤 잠금
    }

    // 모달 닫기 제어
    function closeNewsDetailModal() {
        if (newsDetailModal) {
            newsDetailModal.classList.remove('active');
            document.body.style.overflow = ''; // 스크롤 해제
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeNewsDetailModal);
    }

    if (newsDetailModal) {
        newsDetailModal.addEventListener('click', (e) => {
            // 오버레이 뒷배경 클릭 시 닫기
            if (e.target === newsDetailModal) {
                closeNewsDetailModal();
            }
        });
    }

    // ESC 키 입력 시 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewsDetailModal();
        }
    });

    // ==========================================
    // CHART.JS ANALYTICS INITIALIZATION (통계 분석 차트 생성)
    // ==========================================
    function initAnalyticsCharts() {
        // 기존 생성된 인스턴스 소거 (안정적인 리사이징 및 갱신 지원)
        if (brandShareChartInstance) brandShareChartInstance.destroy();
        if (categoryDistributionChartInstance) categoryDistributionChartInstance.destroy();

        // 1. 제조사별 BI 뉴스 점유율 도넛 차트
        const brandShareCtx = document.getElementById('brandShareChart');
        if (brandShareCtx) {
            // 브랜드별 데이터 수집 가공
            const brands = ['michelin', 'bridgestone', 'continental', 'goodyear'];
            const brandCounts = brands.map(b => BI_NEWS_DATA.filter(n => n.brand === b).length);
            const brandLabels = ['Michelin', 'Bridgestone', 'Continental', 'Goodyear'];

            brandShareChartInstance = new Chart(brandShareCtx, {
                type: 'doughnut',
                data: {
                    labels: brandLabels,
                    datasets: [{
                        data: brandCounts,
                        backgroundColor: [
                            'rgba(30, 64, 175, 0.75)',  // Michelin Deep Blue
                            'rgba(234, 88, 12, 0.75)',  // Bridgestone Orange
                            'rgba(250, 176, 5, 0.75)',  // Continental Gold
                            'rgba(21, 128, 61, 0.75)'   // Goodyear Green
                        ],
                        borderColor: [
                            '#1e40af',
                            '#ea580c',
                            '#fab005',
                            '#15803d'
                        ],
                        borderWidth: 1.5,
                        hoverOffset: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: "'Outfit', 'Inter', sans-serif",
                                    weight: 'bold',
                                    size: 11
                                },
                                color: '#334155',
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const val = context.raw;
                                    const pct = ((val / total) * 100).toFixed(1);
                                    return ` ${context.label}: ${val}건 (${pct}%)`;
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // 2. 카테고리별 발행 분포 및 감성 분석 차트
        const catDistributionCtx = document.getElementById('categoryDistributionChart');
        if (catDistributionCtx) {
            // 카테고리 수집
            const categories = ['R&D', '실적', 'M&A', 'ESG'];
            const catCounts = categories.map(c => BI_NEWS_DATA.filter(n => n.category === c).length);
            
            // 카테고리별 감성 지수 평균 계산
            const catSentimentAverages = categories.map(c => {
                const items = BI_NEWS_DATA.filter(n => n.category === c);
                if (items.length === 0) return 0;
                const sum = items.reduce((acc, curr) => acc + curr.sentimentScore, 0);
                return Math.round(sum / items.length);
            });

            categoryDistributionChartInstance = new Chart(catDistributionCtx, {
                type: 'bar',
                data: {
                    labels: ['R&D/기술', '실적/경영', '투자/M&A', 'ESG/친환경'],
                    datasets: [
                        {
                            label: '발행 뉴스 수 (건)',
                            data: catCounts,
                            backgroundColor: 'rgba(59, 130, 246, 0.45)', // Premium Primary Blue Tint
                            borderColor: '#3b82f6',
                            borderWidth: 2,
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: '평균 감성 지수 (점)',
                            data: catSentimentAverages,
                            type: 'line',
                            borderColor: '#10b981', // Positive Green Line
                            backgroundColor: '#10b981',
                            borderWidth: 3,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#10b981',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.35,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: "'Outfit', sans-serif",
                                    weight: 'bold',
                                    size: 11
                                },
                                color: '#475569'
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: '뉴스 개수 (건)',
                                font: { family: "'Inter', sans-serif", weight: 'bold' },
                                color: '#475569'
                            },
                            ticks: {
                                stepSize: 1,
                                precision: 0,
                                color: '#64748b'
                            },
                            grid: {
                                color: 'rgba(226, 232, 240, 0.6)'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: '감성 지수 (점)',
                                font: { family: "'Inter', sans-serif", weight: 'bold' },
                                color: '#10b981'
                            },
                            min: 0,
                            max: 100,
                            ticks: {
                                color: '#10b981'
                            },
                            grid: {
                                drawOnChartArea: false // 이중 축의 겹치는 격자선 소거
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    weight: '600'
                                },
                                color: '#334155',
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    }
                }
            });
        }
    }

    // 최초 뉴스 피드 데이터 렌더링 호출
    renderNewsFeed();

    // ==========================================
    // DEEP LINKING VIA URL PARAMETERS (URL 파라미터 기반 딥링킹)
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const targetMenuItem = document.querySelector(`.menu-item[data-tab="${tabParam}"]`);
        if (targetMenuItem) {
            // 약간의 딜레이를 주어 안정적으로 탭 전환 및 차트 렌더링 동기화
            setTimeout(() => {
                targetMenuItem.click();
            }, 150);
        }
    }
});
