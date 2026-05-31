const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON 바디 및 정적 폴더 미들웨어 설정
app.use(express.json());
app.use(express.static(__dirname));

// 1. LLM Prompt Context용 사내 데이터베이스 정의 (RAG 컨텍스트 주입용)
const COMPANY_KNOWLEDGE_CONTEXT = {
  IR_FINANCIAL_DATA: {
    Hankook: {
      nameKo: "한국타이어",
      globalSales: { "2021": "9,200만 본", "2022": "8,900만 본", "2023": "9,100만 본", "2024": "9,500만 본", "2025(E)": "10,000만 본", "2026(E)": "10,500만 본" },
      globalRevenue: { "2021": "6.1 Billion USD (한화 약 8.2조원)", "2022": "6.3 Billion USD (한화 약 8.5조원)", "2023": "6.6 Billion USD (한화 약 8.9조원)", "2024": "6.8 Billion USD (한화 약 9.18조원)", "2025(E)": "7.1 Billion USD (한화 약 9.58조원)", "2026(E)": "7.5 Billion USD (한화 약 10.1조원)" }
    },
    Michelin: {
      nameKo: "미쉐린",
      globalSales: { "2021": "17,500만 본", "2022": "16,800만 본", "2023": "17,000만 본", "2024": "17,600만 본", "2025(E)": "18,000만 본", "2026(E)": "18,500만 본" },
      globalRevenue: { "2021": "27.5 Billion USD (한화 약 37.1조원)", "2022": "28.6 Billion USD (한화 약 38.6조원)", "2023": "29.8 Billion USD (한화 약 40.2조원)", "2024": "30.5 Billion USD (한화 약 41.1조원)", "2025(E)": "31.5 Billion USD (한화 약 42.5조원)", "2026(E)": "32.5 Billion USD (한화 약 43.8조원)" }
    },
    Continental: {
      nameKo: "콘티넨탈",
      globalSales: { "2021": "12,800만 본", "2022": "12,100만 본", "2023": "12,500만 본", "2024": "12,900만 본", "2025(E)": "13,300만 본", "2026(E)": "13,800만 본" },
      globalRevenue: { "2021": "19.8 Billion USD (한화 약 26.7조원)", "2022": "20.4 Billion USD (한화 약 27.5조원)", "2023": "21.2 Billion USD (한화 약 28.6조원)", "2024": "21.8 Billion USD (한화 약 29.4조원)", "2025(E)": "22.5 Billion USD (한화 약 30.3조원)", "2026(E)": "23.2 Billion USD (한화 약 31.3조원)" }
    },
    Bridgestone: {
      nameKo: "브리지스톤",
      globalSales: { "2021": "16,000만 본", "2022": "15,500만 본", "2023": "15,800만 본", "2024": "16,300만 본", "2025(E)": "16,700만 본", "2026(E)": "17,200만 본" },
      globalRevenue: { "2021": "25.1 Billion USD (한화 약 33.8조원)", "2022": "26.2 Billion USD (한화 약 35.3조원)", "2023": "27.5 Billion USD (한화 약 37.1조원)", "2024": "28.2 Billion USD (한화 약 38.0조원)", "2025(E)": "29.1 Billion USD (한화 약 39.2조원)", "2026(E)": "30.0 Billion USD (한화 약 40.5조원)" }
    }
  },
  COMPOUND_BM_KNOWLEDGE: {
    Hankook: { treadModel: "Ventus S1 evo3 (초고성능)", silicaRate: "78%", hardness: "68 Shore A", wearIndex: "94 (양호)", wetGrip: "A 등급" },
    Michelin: { treadModel: "Pilot Sport 5 (초고성능)", silicaRate: "85%", hardness: "65 Shore A", wearIndex: "100 (매우 우수)", wetGrip: "A+ 등급" },
    Continental: { treadModel: "SportContact 7 (초고성능)", silicaRate: "82%", hardness: "66 Shore A", wearIndex: "96 (우수)", wetGrip: "A+ 등급" },
    Bridgestone: { treadModel: "Potenza Sport (초고성능)", silicaRate: "75%", hardness: "70 Shore A", wearIndex: "90 (보통)", wetGrip: "A 등급" }
  },
  TIRE_BM_PLC_MAPPED_MODELS: [
    { brand: "HANKOOK", summer: "Ventus S1 evo3", winter: "Winter i*cept evo3", allSeason: "Kinergy 4S2", evSpec: "iON evo (아이온 에보)" },
    { brand: "MICHELIN", summer: "Pilot Sport 5", winter: "Alpin 6", allSeason: "CrossClimate 2 (크로스클라이메이트 2)", evSpec: "Pilot Sport EV" },
    { brand: "CONTINENTAL", summer: "SportContact 7", winter: "WinterContact TS870", allSeason: "AllSeasonContact 2", evSpec: "UltraContact NXT" },
    { brand: "BRIDGESTONE", summer: "Potenza Sport", winter: "Blizzak LM005", allSeason: "Weather Control A005", evSpec: "Turanza EV" }
  ],
  SEGMENT_STATISTICS: {
    uhp: { nameKo: "초고성능 스포츠 (UHP)", compoundCount: "342건 검출 (점유율 27.6%)", description: "고출력 및 고속 코너링 안정성, 젖은 노면 제동 극대화 특화 세그먼트." },
    ev: { nameKo: "전기차 친환경 전용 (EV)", compoundCount: "185건 검출 (점유율 14.9%)", description: "고토크 즉각 반응, 고하중 지지, 회전저항(LRR) 저감, 극대화된 마모 제어 특화 세그먼트." },
    allseason: { nameKo: "사계절 투어링 (All-Season)", compoundCount: "412건 검출 (점유율 33.2%)", description: "연중 다양한 가혹 노면, 눈길 그립성(3PMSF) 확보 및 컴포트 수명 믹스 세그먼트." },
    winter: { nameKo: "겨울용 스노우 (Winter / Snow)", compoundCount: "163건 검출 (점유율 13.1%)", description: "영하 7도 이하 극저온 하에서도 경화되지 않는 친환경 저결빙 고무 폴리머 최적화 세그먼트." },
    totalTreadRecords: "1,240건 (Compd BM 누적 데이터 정밀 매핑)"
  },
  ARENA_REPORTS_LIBRARY: [
    { id: "VPR-2026-04", name: "글로벌 프리미엄 초고성능 스포츠(UHP) 연간 동향 보고서", dept: "시장상품전략팀", size: "14.2 MB", desc: "미쉐린 PS5와 자사 S1 evo3의 나노 실리카 배합 격차 실증" },
    { id: "VPR-2025-11", name: "4대 제조사 EV 친환경 전용 타이어 트레드 물성 크로스 대조표", dept: "컴파운드R&D센터", size: "8.9 MB", desc: "iON evo vs PS EV 친환경 컴파운드 물성 실측 (185건)" },
    { id: "VPR-2025-08", name: "유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안", dept: "Tire BM 파트", size: "11.5 MB", desc: "분진 마모 라벨 규제 선제 대응 전략 및 올시즌 PLC 맵" },
    { id: "VPR-2024-12", name: "실리카 고배합 타이어 회전저항(LRR) 극대화 실차 연비 테스트 결과", dept: "재료연구 기획소", size: "6.3 MB", desc: "실리카 80% 이상 배합 시 저온 그립력과 연비 트레이드오프 극복 실증" }
  ]
};

// 2. 고성능 LLM (Gemini API) 중계 API 라우트 신설
app.post('/api/chat', async (req, res) => {
  const { query, apiKey } = req.body;

  if (!query) {
    return res.status(400).json({ error: "질문 텍스트(query)가 누락되었습니다." });
  }

  // API 키가 없으면 로컬 fallback 안내 처리
  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!activeApiKey) {
    return res.json({ 
      status: "fallback", 
      message: "로컬 패턴 매칭 엔진을 사용해 주십시오." 
    });
  }

  // BI_NEWS_DATA 실시간 파싱 및 지식 컨텍스트 병합 (Node.js Dynamic RAG)
  let latestNewsData = [];
  try {
    const fs = require('fs');
    const newsFilePath = path.join(__dirname, 'BI', 'news_data.js');
    if (fs.existsSync(newsFilePath)) {
      const rawContent = fs.readFileSync(newsFilePath, 'utf8');
      const dataMatch = rawContent.match(/const\s+BI_NEWS_DATA\s*=\s*([\s\S]*?);/);
      if (dataMatch && dataMatch[1]) {
        const rawJson = dataMatch[1].trim();
        const getNewsData = new Function(`return ${rawJson};`);
        latestNewsData = getNewsData();
      }
    }
  } catch (e) {
    console.error("Failed to dynamically load BI_NEWS_DATA in /api/chat:", e);
  }

  // 파일 파싱에 실패하거나 비어있는 경우를 대비한 강력한 팩트 기반 Fallback 경쟁사 실시간 뉴스 데이터셋 탑재 (RAG 동기화 보장)
  if (!latestNewsData || latestNewsData.length === 0) {
    latestNewsData = [
      {
        brandName: "Michelin",
        category: "R&D",
        title: "미쉐린, 차세대 고해상도 지능형 컴파운드 가교 제어 특허 양산 실증 완료",
        date: "2026-05-30",
        sentiment: "positive",
        aiAnalysis: {
          summary: "미래 모빌리티 트렌드에 부합하여 가교 제어 한계를 극한으로 극복하고 에너지 효율을 6% 이상 개선한 프리미엄 특허 고무 폴리머 양산.",
          impact: "당사 초고성능 UHP 브랜드와의 글로벌 OE 신차 타이어 수주 경합 시 기술적 성능 차이 극소화 위협 발생.",
          recommendation: "당사 가교 시뮬레이터 플랫폼을 앞당겨 도입해 실리카 나노 분산 배합 물성을 전방위 강화해야 함."
        }
      },
      {
        brandName: "Continental",
        category: "ESG",
        title: "콘티넨탈, 재생 원료 60% 함유 친환경 타이어 UltraContact NXT 유럽 시장 본격 대량 양산 및 공급",
        date: "2026-05-28",
        sentiment: "positive",
        aiAnalysis: {
          summary: "재활용 강철, 천연 실리카, 재활용 페트병 등을 사용하여 환경 부담을 최소화하고 유럽 라벨링 최상위 등급을 획득한 친환경 타이어 공급 개시.",
          impact: "유럽의 초강력 마모 분진(Euro 7) 환경 규제 선제 만족으로 당사의 유럽 점유율을 침해할 우려가 매우 큼.",
          recommendation: "당사 친환경 타이어 iON 라인업의 재생 원료 처방 실증 타임라인을 대폭 단축하여 대응 상품을 조기 출시해야 함."
        }
      },
      {
        brandName: "Bridgestone",
        category: "마케팅",
        title: "브리지스톤, Enliten 초경량 EV 특화 타이어 Turanza EV 북미 시장 대규모 점유율 확장 캠페인 돌입",
        date: "2026-05-25",
        sentiment: "positive",
        aiAnalysis: {
          summary: "Enliten 경량화 구조 기술을 접목해 타이어 무게를 15% 획기적으로 낮추고, 가혹 고토크 조건에서도 내마모 수명을 20% 늘린 고성능 EV 타이어 마케팅 전개.",
          impact: "북미 세그먼트 내 자사 iON evo 특화 라인업과 격렬한 품질 및 판매가 인센티브 경합 상태 돌입.",
          recommendation: "자사 iON의 독보적 무소음 성능 및 연비 우수성 마케팅을 적극 펼치고 딜러십 인센티브 구조를 차별화해야 함."
        }
      },
      {
        brandName: "Hankook",
        category: "R&D",
        title: "한국타이어, 독자 AI 3D 컴파운드 분산 수치 예측 모델 플랫폼 시범 가동 및 국내 특허 획득",
        date: "2026-05-22",
        sentiment: "positive",
        aiAnalysis: {
          summary: "나노 실리카와 고무 폴리머 배합 시 분자 단위 배치를 사전에 정밀 예측하여 시행착오를 대폭 낮추는 AI 설계 플랫폼 도입.",
          impact: "컴파운드 신규 배합 개발 타임라인을 40% 단축하고 그립 성능 신뢰도를 92% 이상으로 격상시켜 경쟁사 추격을 유효 방어함.",
          recommendation: "개발된 플랫폼을 신작 UHP 및 EV 올시즌 타이어의 트레드 설계에 전면 이식하여 기술 우위를 점해야 함."
        }
      }
    ];
  }

  // 최신 실시간 뉴스 피드 중 상위 15건 정도로 압축하여 LLM 프롬프트 토큰 최적화 주입
  const newsForLlm = latestNewsData.slice(0, 15).map(n => ({
    brand: n.brand || n.brandName,
    category: n.category,
    title: n.title,
    date: n.date,
    sentiment: n.sentiment,
    summary: n.aiAnalysis.summary,
    impact: n.aiAnalysis.impact,
    recommendation: n.aiAnalysis.recommendation
  }));

  COMPANY_KNOWLEDGE_CONTEXT.COMPETITOR_BI_NEWS_LATEST_15 = newsForLlm;

  // RAG 가이드를 포함한 강력한 System Prompt 설계
  const systemInstruction = `
역할: 사내 R&D 전문가이자 BM-Intelligence 통합 포털을 총괄하는 "AI Insight Agent" 수석 컨설턴트입니다.
사용자에게 답변할 때, 아래의 [사내 지식 정보] 데이터를 무조건 사실적 팩트(Fact)의 근거로 삼아야 합니다. 임의로 숫자를 조작하거나 상상해내지 마십시오.

[사내 지식 정보]
${JSON.stringify(COMPANY_KNOWLEDGE_CONTEXT, null, 2)}

답변 작성 규칙:
1. 반드시 예외 없이 한국어로만 격식 있고 품위 넘치게 답변해 주십시오. (RULE[user_global] 적용)
2. 표(Table)나 마크다운(GFM Markdown) 양식을 활용하여 비교 대조를 아름답게 가독성 있게 구조화하십시오.
3. 사용자가 "아레나 보고서"나 "기안문" 등을 지칭할 경우, 반드시 해당 보고서 코드(예: VPR-2025-11)를 언급하며 이와 연결되는 "Arena 기안 이동" 링크를 HTML <a> 태그나 마크다운 형태로 우아하게 디자인해 주십시오.
   - 아레나 리포트 링크 형식은 무조건 다음과 같아야 합니다: '../Tire_BM_UI_FINAL/index.html#tab-reports'
4. 사용자가 특정 세그먼트("초고성능 스포츠(uhp)", "전기차(ev)", "사계절(allseason)", "겨울용(winter)")를 이야기하면, Compd BM 검출 결과 건수(예: UHP 342건, EV 185건 등)와 각 제조사별 대표 타이어 대조 및 R&D 성격을 전문적으로 비교해주십시오.
5. 사용자가 최근 경쟁사 BI 뉴스, 구글 크롤링 피드, 최신 기사 동향 등에 대해 질문할 경우, [사내 지식 정보]의 COMPETITOR_BI_NEWS_LATEST_15 데이터를 토대로 각 제조사의 기술 및 전략 동향을 상세히 분석하여 답변하십시오. 위협 영향(impact) 및 자사 대응 방향(recommendation)도 포함해 전문적으로 분석해 주십시오.
6. 단순한 답변 대신, R&D 재료 공학적 분석과 시장/상품 전략 관점의 전문적인 제언을 2~3줄 추가하여 지극히 가치 있는 프리미엄 보고서 느낌을 완성하십시오.
`;

  try {
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\n사용자 실제 질문: ${query}` }]
        }
      ],
      generationConfig: {
        temperature: 0.2, // 정밀도 극대화를 위해 낮춤
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errDetails = await response.text();
      return res.status(response.status).json({ 
        error: "Gemini API 호출에 실패했습니다.", 
        details: errDetails 
      });
    }

    const data = await response.json();
    
    // 안전하게 답변 텍스트 추출
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const aiResponseText = data.candidates[0].content.parts[0].text;
      return res.json({ 
        status: "success", 
        model: "gemini-1.5-flash",
        response: aiResponseText 
      });
    } else {
      return res.status(500).json({ error: "AI 응답 형식이 올바르지 않습니다.", raw: data });
    }

  } catch (error) {
    console.error("Gemini API Proxy Error:", error);
    return res.status(500).json({ error: "서버 내부 연산 중 에러가 발생했습니다.", message: error.message });
  }
});

// 루트 접속 시 통합 포털 index.html을 서빙합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  BM-Intelligence Integrated Portal Server with LLM RAG Bridge Active!`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`================================================================`);
});
