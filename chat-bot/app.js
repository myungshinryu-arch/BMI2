// =============================================================
// AI Insight Chat Center - Client Logic Engine v3.3 (Premium Knowledge Upgrade)
// =============================================================

// 1. Local Rich Knowledge Base Dataset (Comp'd BM, Tire BM, Strategy, IR Data Integrated)
const AI_IR_DATA = {
  Hankook: {
    globalSales: { "2021": 9200, "2022": 8900, "2023": 9100, "2024": 9500, "2025": 10000, "2026": 10500 }, // 만 본
    globalRevenue: { "2021": 6.1, "2022": 6.3, "2023": 6.6, "2024": 6.8, "2025": 7.1, "2026": 7.5 }, // 십억 USD
    nameKo: "한국타이어",
    badge: "Hankook"
  },
  Michelin: {
    globalSales: { "2021": 17500, "2022": 16800, "2023": 17000, "2024": 17600, "2025": 18000, "2026": 18500 },
    globalRevenue: { "2021": 27.5, "2022": 28.6, "2023": 29.8, "2024": 30.5, "2025": 31.5, "2026": 32.5 },
    nameKo: "미쉐린",
    badge: "Michelin"
  },
  Continental: {
    globalSales: { "2021": 12800, "2022": 12100, "2023": 12500, "2024": 12900, "2025": 13300, "2026": 13800 },
    globalRevenue: { "2021": 19.8, "2022": 20.4, "2023": 21.2, "2024": 21.8, "2025": 22.5, "2026": 23.2 },
    nameKo: "콘티넨탈",
    badge: "Continental"
  },
  Bridgestone: {
    globalSales: { "2021": 16000, "2022": 15500, "2023": 15800, "2024": 16300, "2025": 16700, "2026": 17200 },
    globalRevenue: { "2021": 25.1, "2022": 26.2, "2023": 27.5, "2024": 28.2, "2025": 29.1, "2026": 30.0 },
    nameKo: "브리지스톤",
    badge: "Bridgestone"
  }
};

// Compd BM, Tire BM, Strategy Mock database for rich natural query answer
const COMPD_BM_KNOWLEDGE = {
  Hankook: { treadModel: "Ventus S1 evo3", silicaRate: "78%", hardness: "68 Shore A", wearIndex: "94", wetGrip: "A" },
  Michelin: { treadModel: "Pilot Sport 5", silicaRate: "85%", hardness: "65 Shore A", wearIndex: "100", wetGrip: "A+" },
  Continental: { treadModel: "SportContact 7", silicaRate: "82%", hardness: "66 Shore A", wearIndex: "96", wetGrip: "A+" },
  Bridgestone: { treadModel: "Potenza Sport", silicaRate: "75%", hardness: "70 Shore A", wearIndex: "90", wetGrip: "A" }
};

const TIRE_BM_KNOWLEDGE = [
  { brand: "HANKOOK", summer: "Ventus S1 evo3", winter: "Winter i*cept evo3", allSeason: "Kinergy 4S2", evSpec: "iON evo" },
  { brand: "MICHELIN", summer: "Pilot Sport 5", winter: "Alpin 6", allSeason: "CrossClimate 2", evSpec: "Pilot Sport EV" },
  { brand: "CONTINENTAL", summer: "SportContact 7", winter: "WinterContact TS870", allSeason: "AllSeasonContact 2", evSpec: "UltraContact NXT" },
  { brand: "BRIDGESTONE", summer: "Potenza Sport", winter: "Blizzak LM005", allSeason: "Weather Control A005", evSpec: "Turanza EV" }
];

const STRATEGY_BM_KNOWLEDGE = {
  Hankook: { priority: "친환경 고배합 실리카 수지 실용화", score: "8.9 / 10", patents: "1,240건", status: "글로벌 기술 추격형" },
  Michelin: { priority: "100% 지속 가능 원료 배합 및 경량화 구조", score: "9.6 / 10", patents: "3,120건", status: "글로벌 시장 선도형" },
  Continental: { priority: "합성 고무 천연 고무 대체 및 디지털 센싱 타이어", score: "9.2 / 10", patents: "2,045건", status: "유럽 기술 강자형" },
  Bridgestone: { priority: "스마트 마일리지 극대화 및 고성능 재생 타이어 실현", score: "9.4 / 10", patents: "2,890건", status: "전통 기술 우위형" }
};

// 1.5. Upgrade Domain Knowledge (Reports, Arena & Segment Cross Matrix)
const REPORT_LIBRARY_DB = [
  { id: "VPR-2026-04", name: "글로벌 프리미엄 초고성능 스포츠(UHP) 연간 동향 보고서", dept: "시장상품전략팀", size: "14.2 MB", arenaLink: "../Tire_BM_UI_FINAL/index.html#tab-reports" },
  { id: "VPR-2025-11", name: "4대 제조사 EV 친환경 전용 타이어 트레드 물성 크로스 대조표", dept: "컴파운드R&D센터", size: "8.9 MB", arenaLink: "../Tire_BM_UI_FINAL/index.html#tab-reports" },
  { id: "VPR-2025-08", name: "유럽 타이어 라벨링 규제 개정에 따른 자사 PLC 로드맵 기안", dept: "Tire BM 파트", size: "11.5 MB", arenaLink: "../Tire_BM_UI_FINAL/index.html#tab-reports" },
  { id: "VPR-2024-12", name: "실리카 고배합 타이어 회전저항(LRR) 극대화 실차 연비 테스트 결과", dept: "재료연구 기획소", size: "6.3 MB", arenaLink: "../Tire_BM_UI_FINAL/index.html#tab-reports" }
];

const SEGMENT_METADATA = {
  uhp: {
    nameKo: "초고성능 스포츠 (UHP)",
    michelinModel: "Pilot Sport 5",
    hankookModel: "Ventus S1 evo3",
    continentalModel: "SportContact 7",
    bridgestoneModel: "Potenza Sport",
    compoundCount: 342, // Compd BM UHP 매핑 데이터 건수
    description: "고출력 및 고속 선회 한계 제동 특화 세그먼트로 실리카 분산 중합 S-SBR 함량이 극대화된 영역입니다."
  },
  ev: {
    nameKo: "전기차 친환경 전용 (EV)",
    michelinModel: "Pilot Sport EV",
    hankookModel: "iON evo",
    continentalModel: "UltraContact NXT",
    bridgestoneModel: "Turanza EV",
    compoundCount: 185,
    description: "전기차 특유의 고하중 및 초기 극대 토크 대응, 극저연비 회전저항(LRR) 마모 저항성 특화 영역입니다."
  },
  allseason: {
    nameKo: "사계절 투어링 (All-Season)",
    michelinModel: "CrossClimate 2",
    hankookModel: "Kinergy 4S2",
    continentalModel: "AllSeasonContact 2",
    bridgestoneModel: "Weather Control A005",
    compoundCount: 412,
    description: "다년도 기후 변화 대응 및 눈길 마찰력(3PMSF)과 일반 마모 성능을 조화시킨 믹스 세그먼트입니다."
  },
  winter: {
    nameKo: "겨울용 스노우 (Winter / Snow)",
    michelinModel: "Alpin 6",
    hankookModel: "Winter i*cept evo3",
    continentalModel: "WinterContact TS870",
    bridgestoneModel: "Blizzak LM005",
    compoundCount: 163,
    description: "영하 7도 이하의 극저온 노면에서도 타이어 고무가 굳지 않는 친환경 천연 레진 다량 함유 세그먼트입니다."
  }
};


document.addEventListener('DOMContentLoaded', () => {
  setupLlmConfig();
  setupChatMessenger();
});

// LLM 상태 판별 및 UI 동적 변경 헬퍼
function isLlmActive() {
  const toggle = document.getElementById('llm-toggle');
  return toggle && toggle.checked;
}

function updateEngineStatusUI() {
  const activeEngineType = document.getElementById('active-engine-type');
  const aiStatusText = document.querySelector('.ai-status span:last-child');
  const aiStatusDot = document.querySelector('.ai-status-dot');
  const chatHeader = document.querySelector('.chat-header');
  
  // Footer elements
  const footerStatusText = document.getElementById('system-status-text');
  const footerStatusDot = document.getElementById('system-status-dot');

  if (isLlmActive()) {
    if (activeEngineType) activeEngineType.textContent = "Gemini 2.5 Flash (ADC)";
    if (aiStatusText) aiStatusText.textContent = "Gemini LLM Active";
    if (aiStatusDot) {
      aiStatusDot.style.backgroundColor = "var(--secondary)";
      aiStatusDot.style.boxShadow = "0 0 10px var(--secondary)";
    }
    if (chatHeader) chatHeader.classList.add('gemini-active-glow');
    
    // Footer UI (Active Blue Style)
    if (footerStatusText) footerStatusText.textContent = "Gemini Cloud RAG Active";
    if (footerStatusDot) {
      footerStatusDot.style.backgroundColor = "var(--secondary)";
      footerStatusDot.style.boxShadow = "0 0 8px var(--secondary)";
    }
  } else {
    if (activeEngineType) activeEngineType.textContent = "Local ML Model";
    if (aiStatusText) aiStatusText.textContent = "Smart Local Model Active";
    if (aiStatusDot) {
      aiStatusDot.style.backgroundColor = "var(--accent-green)";
      aiStatusDot.style.boxShadow = "0 0 10px var(--accent-green)";
    }
    if (chatHeader) chatHeader.classList.remove('gemini-active-glow');
    
    // Footer UI (Offline Local Green Style)
    if (footerStatusText) footerStatusText.textContent = "Offline Engine Active";
    if (footerStatusDot) {
      footerStatusDot.style.backgroundColor = "var(--primary)";
      footerStatusDot.style.boxShadow = "0 0 6px var(--primary)";
    }
  }
}

function setupLlmConfig() {
  const llmToggle = document.getElementById('llm-toggle');
  const geminiApiKeyInput = document.getElementById('gemini-api-key');
  const llmKeyContainer = document.getElementById('llm-key-container');

  if (!llmToggle || !geminiApiKeyInput || !llmKeyContainer) return;

  const llmEnabled = localStorage.getItem('llm_enabled') === null ? true : (localStorage.getItem('llm_enabled') === 'true');

  llmToggle.checked = llmEnabled;
  geminiApiKeyInput.value = "gcp-adc-auth";

  if (llmEnabled) {
    llmKeyContainer.style.display = 'flex';
  } else {
    llmKeyContainer.style.display = 'none';
  }

  updateEngineStatusUI();

  llmToggle.addEventListener('change', () => {
    localStorage.setItem('llm_enabled', llmToggle.checked);
    if (llmToggle.checked) {
      llmKeyContainer.style.display = 'flex';
    } else {
      llmKeyContainer.style.display = 'none';
    }
    updateEngineStatusUI();
  });
}

// Markdown Parser Helper
function parseMarkdown(text) {
  let html = text;
  if (typeof marked !== 'undefined') {
    html = marked.parse(text);
  } else {
    html = text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
  
  // Post-process: Wrap tables in a beautiful responsive scrollable container
  html = html.replace(/<table>/g, '<div style="overflow-x:auto; margin: 12px 0; border-radius: 8px; border: 1px solid rgba(59,130,246,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.02);"><table style="width:100%; border-collapse:collapse; background:rgba(255,255,255,0.7);">');
  html = html.replace(/<\/table>/g, '</table></div>');
  
  return html;
}

// 2. Chat Messenger Controller
function setupChatMessenger() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatHistory = document.getElementById('chat-history');
  const typingIndicator = document.getElementById('ai-typing-indicator');
  const presetChips = document.querySelectorAll('.ai-preset-chip');

  if (!chatInput || !sendBtn || !chatHistory) return;

  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight - 16) + 'px';
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.focus();

    typingIndicator.style.display = 'flex';
    scrollToBottom();

    // Check if query is meaningless (e.g. "ㅎㅎ", "ㅋㅋ", too short etc.)
    const isMeaningless = /^[ㄱ-ㅎㅏ-ㅣㅋㅋㅎㅎㅇㅇ\s\?\!\.]{1,10}$/i.test(text) || text.length < 3;

    if (isMeaningless) {
      console.log("[LLM] Meaningless or very short query detected. Using fast local rule-based engine.");
      setTimeout(() => {
        typingIndicator.style.display = 'none';
        const answerHtml = performAiNaturalQuery(text);
        appendMessage('bot', answerHtml, 'local');
        scrollToBottom();
      }, 300);
      return;
    }

    // Meaningful query: Force call to actual FastAPI /api/llm/chat endpoint!
    const contextObj = {
      ir_data: typeof AI_IR_DATA !== 'undefined' ? AI_IR_DATA : null,
      compd_bm: typeof COMPD_BM_KNOWLEDGE !== 'undefined' ? COMPD_BM_KNOWLEDGE : null,
      tire_bm: typeof TIRE_BM_KNOWLEDGE !== 'undefined' ? TIRE_BM_KNOWLEDGE : null,
      strategy: typeof STRATEGY_BM_KNOWLEDGE !== 'undefined' ? STRATEGY_BM_KNOWLEDGE : null,
      reports: typeof REPORT_LIBRARY_DB !== 'undefined' ? REPORT_LIBRARY_DB : null,
      segments: typeof SEGMENT_METADATA !== 'undefined' ? SEGMENT_METADATA : null,
      news_data: typeof BI_NEWS_DATA !== 'undefined' ? BI_NEWS_DATA : [],
      rule_based_result: typeof performAiNaturalQuery === 'function' ? performAiNaturalQuery(text) : null
    };

    const API_BASE = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1") || window.location.protocol === "file:"
      ? "http://localhost:8000"
      : "";

    const targetUrl = API_BASE + '/api/llm/chat';
    const payload = {
      query: text,
      context: contextObj
    };

    console.log("[LLM] Requesting Gemini LLM...");
    console.log("[LLM] Request URL:", targetUrl);
    console.log("[LLM] Request Payload:", payload);

    const startTime = performance.now();

    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const endTime = performance.now();
      const elapsedSec = (endTime - startTime) / 1000;
      
      console.log(`[LLM] Response received in ${elapsedSec.toFixed(3)}s`);
      console.log("[LLM] Response Data:", data);

      typingIndicator.style.display = 'none';
      if (data.status === 'success' && data.response) {
        console.log("[LLM] Gemini response used");
        const parsedResponse = parseMarkdown(data.response);
        appendMessage('bot', parsedResponse, 'gemini', elapsedSec, data.grounding_used, data.sources, data.badge);
      } else {
        const errDesc = data.message || "Unknown error";
        console.warn("[LLM] fallback used", errDesc);
        const answerHtml = performAiNaturalQuery(text);
        appendMessage('bot', `<p style="color:var(--accent-orange); font-weight:700; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Gemini API 연결 또는 연산 제한으로 로컬Fallback 모델로 답변합니다.</p>` + answerHtml, 'fallback', elapsedSec);
      }
      scrollToBottom();
    })
    .catch(error => {
      const endTime = performance.now();
      const elapsedSec = (endTime - startTime) / 1000;

      console.warn("[LLM] fallback used", error);
      console.log(`[LLM] Request failed in ${elapsedSec.toFixed(3)}s`);

      typingIndicator.style.display = 'none';
      const answerHtml = performAiNaturalQuery(text);
      appendMessage('bot', `<p style="color:var(--accent-orange); font-weight:700; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> 네트워크 장애 또는 에러가 발생하여 로컬 지능형 모델(Fallback)로 답변합니다.</p>` + answerHtml, 'fallback', elapsedSec);
      scrollToBottom();
    });
  }

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        chatInput.value = query;
        sendMessage();
      }
    });
  });
}

// 3. Append Message Markup Builder
function appendMessage(sender, content, mode = 'local', duration = null, grounding_used = false, sources = [], badge = null) {
  const chatHistory = document.getElementById('chat-history');
  if (!chatHistory) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-message' : 'bot-message'}`;

  let avatarIcon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  let senderName = sender === 'user' ? '사용자' : 'Local AI Insight Agent';
  let badgeHtml = '';

  if (sender === 'bot') {
    if (mode === 'gemini') {
      senderName = 'AI Insight Agent (Gemini)';
      avatarIcon = '<i class="fa-solid fa-brain" style="color: #a855f7;"></i>';
      msgDiv.classList.add('gemini-active-glow');
      const timeTag = duration ? ` • ${duration.toFixed(2)}s` : '';
      
      // Separate/detailed badges based on grounding usage and badge parameter
      let secondaryBadge = '';
      if (badge === 'hybrid') {
        secondaryBadge = `
          <span class="ai-badge hybrid-badge" style="margin-left: 6px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;">
            <i class="fa-solid fa-network-wired"></i>
            Hybrid 분석
          </span>
        `;
      } else if (badge === 'web' || (grounding_used && badge !== 'internal')) {
        secondaryBadge = `
          <span class="ai-badge web-grounding-badge" style="margin-left: 6px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border: none;">
            <i class="fa-solid fa-globe"></i>
            Web Grounding 사용
          </span>
        `;
      } else {
        secondaryBadge = `
          <span class="ai-badge internal-badge" style="margin-left: 6px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none;">
            <i class="fa-solid fa-database"></i>
            내부 데이터 기반
          </span>
        `;
      }

      badgeHtml = `
        <div class="ai-badge-container">
          <span class="ai-badge gemini-badge">
            <i class="fa-solid fa-bolt" style="animation: pulse 1.5s infinite;"></i>
            Gemini LLM${timeTag}
          </span>
          ${secondaryBadge}
        </div>
      `;
    } else if (mode === 'fallback') {
      senderName = 'AI Insight Agent (Fallback)';
      avatarIcon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--primary);"></i>';
      const timeTag = duration ? ` • ${duration.toFixed(2)}s` : '';
      badgeHtml = `
        <div class="ai-badge-container">
          <span class="ai-badge fallback-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            로컬 Fallback${timeTag}
          </span>
        </div>
      `;
    } else {
      senderName = 'Local AI Insight Agent';
      avatarIcon = '<i class="fa-solid fa-robot" style="color: var(--accent-green);"></i>';
      badgeHtml = `
        <div class="ai-badge-container">
          <span class="ai-badge local-badge">
            <i class="fa-solid fa-circle-info"></i>
            로컬 가이드 응답
          </span>
        </div>
      `;
    }
  }

  const useCollapsible = sender === 'bot' && (mode === 'gemini' || mode === 'fallback');
  const innerContent = useCollapsible 
    ? `<div class="msg-collapsible-container">${content}</div>`
    : content;

  // Build grounding sources section
  let sourcesHtml = '';
  if (sender === 'bot' && mode === 'gemini' && grounding_used && sources && sources.length > 0) {
    sourcesHtml = `
      <div class="msg-sources-container">
        <div class="sources-title">
          <i class="fa-solid fa-circle-info"></i>
          <span>참고 출처</span>
        </div>
        <ul class="sources-list">
    `;
    const visibleSources = sources.slice(0, 3);
    visibleSources.forEach(src => {
      const title = src.title || "참고 문서";
      const url = src.url || "";
      let domain = "";
      if (url) {
        try {
          const parsedUrl = new URL(url);
          domain = parsedUrl.hostname;
        } catch (e) {
          domain = url;
        }
      }
      
      const isInternalDomain = domain.includes("vertexaisearch.cloud.google.com") || domain.includes("google.com");
      const displayDomain = isInternalDomain ? "" : domain;

      sourcesHtml += `
        <li class="source-item">
          <a href="${url}" target="_blank" class="source-link-btn" title="${url}">
            <i class="fa-solid fa-file-lines"></i>
            <span>${title}</span>
            ${displayDomain ? `<span class="source-domain">(${displayDomain})</span>` : ''}
          </a>
        </li>
      `;
    });
    sourcesHtml += `
        </ul>
      </div>
    `;
  }

  msgDiv.innerHTML = `
    <div class="msg-avatar">
      ${avatarIcon}
    </div>
    <div class="msg-bubble-wrapper">
      <div class="msg-sender-name">${senderName}</div>
      <div class="msg-bubble" style="display: flex; flex-direction: column;">
        ${badgeHtml}
        ${innerContent}
        ${sourcesHtml}
      </div>
      <span class="msg-timestamp">${timeStr}</span>
    </div>
  `;

  chatHistory.appendChild(msgDiv);

  if (useCollapsible) {
    const container = msgDiv.querySelector('.msg-collapsible-container');
    if (container) {
      setTimeout(() => {
        const threshold = 260; // 260px 초과 시 접음
        if (container.scrollHeight > threshold) {
          container.classList.add('collapsed');
          
          const bubble = msgDiv.querySelector('.msg-bubble');
          const trigger = document.createElement('div');
          trigger.className = 'msg-expand-trigger';
          trigger.innerHTML = '<span>상세 내용 보기</span> <i class="fa-solid fa-chevron-down"></i>';
          
          trigger.addEventListener('click', () => {
            if (container.classList.contains('collapsed')) {
              container.classList.remove('collapsed');
              trigger.classList.add('expanded');
              trigger.querySelector('span').textContent = '상세 내용 접기';
            } else {
              container.classList.add('collapsed');
              trigger.classList.remove('expanded');
              trigger.querySelector('span').textContent = '상세 내용 보기';
              msgDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          });
          
          bubble.appendChild(trigger);
        }
      }, 50);
    }
  }
}

// 4. Natural Query Analysis and Response Generation (Supports Compd BM, Tire BM, and Strategy Deep Links)
function performAiNaturalQuery(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  
  // --- 4.1. Advanced Entity Extraction Engine ---
  // A. Brand Extraction
  let matchedBrand = null;
  let brandDisplayName = "";
  if (query.includes('미쉐린') || query.includes('michelin') || query.includes('미슐랭') || query.includes('미쉘') || query.includes('ps5') || query.includes('crossclimate') || query.includes('alpin')) {
    matchedBrand = 'Michelin';
    brandDisplayName = '미쉐린 (Michelin)';
  } else if (query.includes('한국') || query.includes('hankook') || query.includes('한타') || query.includes('ion') || query.includes('아이온') || query.includes('ventus') || query.includes('kinergy') || query.includes('s1 evo')) {
    matchedBrand = 'Hankook';
    brandDisplayName = '한국타이어 (Hankook)';
  } else if (query.includes('콘티') || query.includes('continental') || query.includes('컨티') || query.includes('sportcontact') || query.includes('ultracontact')) {
    matchedBrand = 'Continental';
    brandDisplayName = '콘티넨탈 (Continental)';
  } else if (query.includes('브리') || query.includes('bridgestone') || query.includes('potenza') || query.includes('blizzak') || query.includes('turanza')) {
    matchedBrand = 'Bridgestone';
    brandDisplayName = '브리지스톤 (Bridgestone)';
  }

  // B. Year Extraction
  let matchedYear = null;
  const yearRegex = /(2021|2022|2023|2024|2025|2026)/;
  const shortYearRegex = /\b(21|22|23|24|25|26)년\b/;
  const yearMatch = query.match(yearRegex);
  if (yearMatch) {
    matchedYear = yearMatch[1];
  } else {
    const shortMatch = query.match(shortYearRegex);
    if (shortMatch) {
      matchedYear = "20" + shortMatch[1];
    }
  }

  // C. Segment Extraction
  let matchedSegment = null;
  if (query.includes('uhp') || query.includes('스포츠') || query.includes('초고성능') || query.includes('고성능스포츠')) {
    matchedSegment = 'uhp';
  } else if (query.includes('ev') || query.includes('전기차') || query.includes('친환경') || query.includes('아이온') || query.includes('ion')) {
    matchedSegment = 'ev';
  } else if (query.includes('사계절') || query.includes('올시즌') || query.includes('all-season') || query.includes('all season') || query.includes('cc2')) {
    matchedSegment = 'allseason';
  } else if (query.includes('겨울') || query.includes('스노우') || query.includes('winter') || query.includes('snow') || query.includes('윈터') || query.includes('아이스')) {
    matchedSegment = 'winter';
  }

  // D. Specific Report ID & Name Extraction
  // Enhance REPORT_LIBRARY_DB with rich details
  const RICH_REPORT_DETAILS = {
    "VPR-2026-04": {
      summary: "2026년 글로벌 초고성능 스포츠(UHP) 시장의 최신 트렌드를 비교한 기안서입니다. 특히 미쉐린 PS5와 한국타이어 S1 evo3의 S-SBR 실리카 나노 분산 배합 차이에 따른 제동력 극대화 실증 데이터를 수록하고 있습니다.",
      status: "결재 완료 (기안 승인)",
      author: "홍길동 파트장 (시장상품전략팀)",
      date: "2026-04-12"
    },
    "VPR-2025-11": {
      summary: "글로벌 4대 메이커의 최신 전기차(EV) 전용 타이어 트레드 컴파운드 물성을 정밀 측정한 크로스 대조 보고서입니다. iON evo 제품군의 친환경 실리카 저구름저항(LRR) 배합 비율 및 마모 특성 데이터(185건)가 체계적으로 매핑되어 있습니다.",
      status: "결재 완료 (기안 승인)",
      author: "김철수 책임연구원 (컴파운드R&D센터)",
      date: "2025-11-28"
    },
    "VPR-2025-08": {
      summary: "유럽 환경청(EEA)의 타이어 미세 분진 및 마모 분출 라벨링 규제 개정에 따른 자사 제품 PLC(Product Life Cycle) 개발 및 출시 로드맵 기안서입니다. 사계절용 CC2 대응 개발 계획을 포함하고 있습니다.",
      status: "결재 완료 (기안 승인)",
      author: "이영희 파트장 (Tire BM 파트)",
      date: "2025-08-15"
    },
    "VPR-2024-12": {
      summary: "고배합 실리카(Silica Rate 80% 이상) 타이어의 저온 그립력 유지와 저구름저항(LRR) 트레이드오프 극복 실차 연비 검증 데이터 기안서입니다. Compd BM 및 Tire BM 통합 분석 성과가 요약되어 있습니다.",
      status: "결재 완료 (기안 승인)",
      author: "박민수 수석연구원 (재료연구 기획소)",
      date: "2024-12-05"
    }
  };

  let matchedReport = null;
  for (const rep of REPORT_LIBRARY_DB) {
    if (query.includes(rep.id.toLowerCase()) || query.includes(rep.id.replace(/-/g, '').toLowerCase()) || query.includes(rep.name.toLowerCase())) {
      matchedReport = rep;
      break;
    }
  }
  // Try mapping by year inside report queries
  if (!matchedReport && (query.includes('보고서') || query.includes('리포트') || query.includes('기안'))) {
    if (query.includes('uhp') || query.includes('스포츠') || query.includes('초고성능')) {
      matchedReport = REPORT_LIBRARY_DB[0]; // VPR-2026-04
    } else if (query.includes('ev') || query.includes('전기차') || query.includes('친환경')) {
      matchedReport = REPORT_LIBRARY_DB[1]; // VPR-2025-11
    } else if (query.includes('규제') || query.includes('라벨') || query.includes('유럽')) {
      matchedReport = REPORT_LIBRARY_DB[2]; // VPR-2025-08
    } else if (query.includes('실리카') || query.includes('연비') || query.includes('실차')) {
      matchedReport = REPORT_LIBRARY_DB[3]; // VPR-2024-12
    }
  }


  // --- 4.2. Intent Routing & Advanced Answers Generation ---

  // CASE 0: Competitor BI News Trend & Crawled Feeds
  const isNewsQuery = query.includes('뉴스') || query.includes('news') || query.includes('기사') || query.includes('동향') || query.includes('최근 소식') || query.includes('최근소식') || query.includes('크롤링') || query.includes('bi 뉴스') || query.includes('최신 뉴스') || query.includes('최신 기사') || query.includes('피드') || query.includes('소식') || query.includes('정보');
  if (isNewsQuery) {
    const newsDb = typeof BI_NEWS_DATA !== 'undefined' ? BI_NEWS_DATA : [];
    
    // 브랜드별로 필터링
    let filteredNews = newsDb;
    if (matchedBrand) {
      filteredNews = newsDb.filter(n => n.brand.toLowerCase() === matchedBrand.toLowerCase() || n.brandName.toLowerCase() === matchedBrand.toLowerCase());
    }

    let displayHtml = '';
    if (filteredNews.length === 0) {
      displayHtml = `
        <div style="background: rgba(249, 115, 22, 0.05); padding: 15px; border-radius: 8px; border: 1px dashed rgba(249, 115, 22, 0.2); text-align: center;">
          <p style="margin: 0; font-weight: 700; color: var(--text-dark);">검색된 최근 경쟁사 BI 뉴스가 없습니다.</p>
          <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">BI/news_data.js 리포지토리가 유효한지 확인해 주세요.</p>
        </div>
      `;
    } else {
      const topNews = filteredNews.slice(0, 4); // 최대 4개 기사 노출
      
      const newsCards = topNews.map(n => {
        let sentimentIcon = '<i class="fa-solid fa-circle-minus" style="color: #64748b;"></i>';
        let sentimentText = 'Neutral';
        let sentimentColor = '#64748b';
        if (n.sentiment === 'positive') {
          sentimentIcon = '<i class="fa-solid fa-circle-up" style="color: var(--accent-green);"></i>';
          sentimentText = 'Positive';
          sentimentColor = 'var(--accent-green)';
        } else if (n.sentiment === 'negative') {
          sentimentIcon = '<i class="fa-solid fa-circle-down" style="color: #ef4444;"></i>';
          sentimentText = 'Negative';
          sentimentColor = '#ef4444';
        }

        const tagsHtml = (n.tags || []).map(t => `<span style="font-size: 0.65rem; background: rgba(0,0,0,0.04); color: var(--text-muted); padding: 2px 6px; border-radius: 4px; font-weight: 700;">#${t}</span>`).join(' ');

        return `
          <div class="news-feed-card" style="background: rgba(255,255,255,0.7); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; padding: 15px; margin-bottom: 12px; transition: all 0.3s ease;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 0.72rem; font-weight: 800; background: rgba(249,115,22,0.1); color: var(--accent-orange); padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">
                ${n.brandName} • ${n.category}
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">
                <i class="fa-regular fa-calendar-days"></i> ${n.date}
              </span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 800; color: var(--text-dark); line-height: 1.4;">
              ${n.title}
            </h4>
            <p style="margin: 0 0 10px 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-main); font-weight: 500;">
              ${n.excerpt || n.content.substring(0, 100) + '...'}
            </p>
            <div style="background: rgba(249,115,22,0.02); border-left: 3px solid var(--accent-orange); padding: 8px 10px; margin-bottom: 10px; border-radius: 0 6px 6px 0;">
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-dark); margin-bottom: 3px;">
                <i class="fa-solid fa-microchip" style="color: var(--primary);"></i> AI 분석 브리핑
              </div>
              <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main); font-weight: 500;">
                <strong>요약:</strong> ${n.aiAnalysis.summary}<br>
                <strong>영향:</strong> <span style="color: #ef4444; font-weight: 700;">${n.aiAnalysis.impact}</span><br>
                <strong>대응책:</strong> <span style="color: var(--primary); font-weight: 700;">${n.aiAnalysis.recommendation}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem;">
              <div style="display: flex; gap: 4px;">
                ${tagsHtml}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 700; color: ${sentimentColor};">
                  ${sentimentIcon} ${sentimentText} (${n.sentimentScore}점)
                </span>
                <a href="${n.raw_link}" target="_blank" style="color: var(--primary); font-weight: 800; text-decoration: none; display: flex; align-items: center; gap: 2px;">
                  출처 뉴스 <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.65rem;"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      displayHtml = `
        <div style="max-height: 450px; overflow-y: auto; padding-right: 5px; margin-bottom: 15px;">
          ${newsCards}
        </div>
      `;
    }

    const titleText = matchedBrand ? `📰 [실시간 BI 뉴스] ${brandDisplayName} 최신 뉴스 피드` : '📰 [실시간 BI 뉴스] 글로벌 Top4 경쟁사 뉴스 종합 분석';
    const descText = matchedBrand 
      ? `크롤링된 100건 이상의 데이터베이스 중 <strong>${brandDisplayName}</strong>의 R&D 및 비즈니스 동향 뉴스를 실시간 파싱했습니다. AI 에이전트가 위협 영향도를 분석하여 드립니다.`
      : `실시간 구글 뉴스를 통해 수집된 <strong>100건 이상의 프리미엄 비즈니스 뉴스</strong> 중, 글로벌 Top4 타이어 제조사의 최신 R&D 기술 및 지속가능 특허 동향을 AI 기반으로 요약·추출했습니다.`;

    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        ${titleText}
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500; line-height: 1.5;">
        ${descText}
      </p>
      
      ${displayHtml}

      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 뉴스 포털 전체 이동:</span>
        <div class="source-links-row">
          <a href="../BI/index.html" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-newspaper"></i> 글로벌 Top4 경쟁사 BI 뉴스 전용 분석기 바로가기
          </a>
        </div>
      </div>
    `;
  }

  // CASE 1: Specific Report ID or Details Requested
  if (matchedReport) {
    const details = RICH_REPORT_DETAILS[matchedReport.id] || {
      summary: "사내 Arena 전자결재 시스템 연계 기술 기안서입니다. 상세 탭을 통해 원본 분석 결과를 열람하십시오.",
      status: "결재 완료",
      author: "Tire BM R&D 기획단",
      date: "최신 등록"
    };

    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        📂 [상세 분석] ${matchedReport.id} 기안 보고서 지식 가시화
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        요청하신 특정 기안 보고서 정보를 <strong>Tire BM 라이브러리 및 Arena 기안망</strong>에서 실시간 연계 파싱했습니다.
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th style="width: 25%;">구분 필드</th>
              <th>상세 기안 정보</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>보고서 코드</strong></td>
              <td><span class="status-badge" style="background: rgba(249, 115, 22, 0.1); color: var(--accent-orange); padding: 2px 8px; border-radius: 4px; font-weight: 800;">${matchedReport.id}</span></td>
            </tr>
            <tr>
              <td><strong>보고서 타이틀</strong></td>
              <td style="color: var(--text-dark); font-weight: 800;">${matchedReport.name}</td>
            </tr>
            <tr>
              <td><strong>담당 기안 부서</strong></td>
              <td>${matchedReport.dept} / ${details.author}</td>
            </tr>
            <tr>
              <td><strong>기안 작성 일자</strong></td>
              <td>${details.date} (결재 상태: <strong style="color: var(--accent-green);">${details.status}</strong>)</td>
            </tr>
            <tr>
              <td><strong>보고서 파일 크기</strong></td>
              <td>${matchedReport.size} (PDF 정밀 스캔 완료)</td>
            </tr>
            <tr style="background: rgba(249, 115, 22, 0.02);">
              <td><strong>주요 내용 요약</strong></td>
              <td style="line-height: 1.6; color: var(--text-main); font-weight: 500;">
                <i class="fa-solid fa-file-invoice" style="color: var(--accent-orange); margin-right: 5px;"></i>
                ${details.summary}
              </td>
            </tr>
          </tbody>
        </table>
        <p style="margin: 12px 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; font-weight: 600;">
          💡 <strong>Arena 전자결재 연계:</strong> 해당 문서는 Arena ID와 100% 매칭되어 있으며, 아래 아웃링크를 통해 실시간으로 사내 Arena 전자결재 시스템의 기안문 원본 및 결재 궤적을 실시간으로 추적·다운로드 하실 수 있습니다.
        </p>
      </div>
      
      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 연계 시스템 즉시 이동:</span>
        <div class="source-links-row">
          <a href="${matchedReport.arenaLink}" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Arena 기안문 및 보고서 뷰어로 바로 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 2: Compound Count & Quantitative Results Requested
  const isCountQuery = query.includes('몇건') || query.includes('몇 건') || query.includes('건수') || query.includes('결과수') || query.includes('검출수') || query.includes('데이터개수') || query.includes('통계');
  if (isCountQuery && matchedSegment) {
    const s = SEGMENT_METADATA[matchedSegment];
    const percentage = ((s.compoundCount / 1240) * 100).toFixed(1);
    
    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        🧪 Compd BM 원시 물성 결과 검출 건수 보고
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        Compd BM 컴파운드 원시 물성 데이터베이스(Tread Compound DB) 중 <strong>${s.nameKo}</strong> 세그먼트의 최신 실측 통계를 로드했습니다.
      </p>
      
      <div class="ai-answer-card" style="position: relative; overflow: hidden;">
        <!-- 전광판 스타일의 대형 게이지 카드 -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.01) 100%); border: 1px solid rgba(249,115,22,0.15); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 5px; text-transform: uppercase;">Compound BM DB Stat</span>
            <strong style="font-size: 2.2rem; color: var(--primary); font-weight: 900; letter-spacing: -1px;">
              ${s.compoundCount} <span style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark);">건 검출</span>
            </strong>
          </div>
          <div style="text-align: right;">
            <span class="status-badge" style="background: var(--primary); color: #fff; padding: 4px 10px; font-size: 0.75rem; font-weight: 800; border-radius: 20px;">
              점유율 ${percentage}%
            </span>
            <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-top: 5px; font-weight: 600;">전체 1,240건 대비</span>
          </div>
        </div>

        <table class="ai-table">
          <thead>
            <tr>
              <th style="width: 35%;">분석 지표</th>
              <th>세그먼트 세부 분석 매핑 정보</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>대상 세그먼트</strong></td>
              <td style="font-weight: 800; color: var(--text-dark);">${s.nameKo} (${matchedSegment.toUpperCase()})</td>
            </tr>
            <tr>
              <td><strong>미쉐린 매칭 모델</strong></td>
              <td style="color: var(--accent-orange); font-weight: 700;">${s.michelinModel}</td>
            </tr>
            <tr>
              <td><strong>자사(한국) 매칭 모델</strong></td>
              <td style="color: var(--text-dark); font-weight: 700;">${s.hankookModel}</td>
            </tr>
            <tr>
              <td><strong>세그먼트 주요 타겟</strong></td>
              <td style="font-size: 0.82rem; line-height: 1.5;">${s.description}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin: 12px 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; font-weight: 600;">
          💡 <strong>Compd BM 데이터 가이드:</strong> 현재 포털에 연동된 총 컴파운드 물성 레코드는 1,240건이며, ${s.nameKo} 세그먼트의 물성 실험 결과 수치는 <strong>총 ${s.compoundCount}건</strong>입니다. 이 데이터셋은 각사 실시간 고무 가황(Vulcanization) 상태와 인장 강도(Tensile Strength), 60℃ 및 0℃ 탄젠트 델타(tan δ) 그립력을 정확히 수치화하고 있습니다.
        </p>
      </div>

      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 원본 이동:</span>
        <div class="source-links-row">
          <a href="../Compd BM/index.html#tab-explorer" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-flask-vial"></i> Compd BM 물성 데이터셋 탐색기 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 3: Specific Segment Details & Competitor Matching Requested (UHP, EV, AllSeason, Winter)
  if (matchedSegment) {
    const s = SEGMENT_METADATA[matchedSegment];
    return `
      <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
        🛞 [경쟁 세그먼트 분석] ${s.nameKo} 대조군 매트릭스
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        질문하신 세그먼트를 감지하여 <strong>미쉐린 기준 핵심 타겟 모델 및 자사와 글로벌 경쟁사의 경쟁 모델 라인업</strong>을 매핑 대조 분석했습니다.
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th style="width: 35%;">분석 제조사 (Maker)</th>
              <th>매칭 타이어 모델 (Product Model)</th>
              <th>상태 / 포지션</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>미쉐린 (MICHELIN)</strong></td>
              <td style="color: var(--accent-orange); font-weight: 800; font-size: 0.9rem;">
                <i class="fa-solid fa-award" style="color: gold; margin-right: 4px;"></i> ${s.michelinModel}
              </td>
              <td><span class="status-badge" style="background: rgba(249,115,22,0.08); color: var(--accent-orange); font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 800;">세그먼트 벤치마크 기준</span></td>
            </tr>
            <tr>
              <td><strong>한국타이어 (HANKOOK)</strong></td>
              <td style="color: var(--text-dark); font-weight: 800; font-size: 0.9rem;">
                ${s.hankookModel}
              </td>
              <td><span class="status-badge" style="background: rgba(15,118,110,0.08); color: var(--primary); font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 800;">자사 주력 대응 모델</span></td>
            </tr>
            <tr>
              <td><strong>콘티넨탈 (CONTINENTAL)</strong></td>
              <td style="font-weight: 600;">${s.continentalModel}</td>
              <td>유럽 시장 주요 경쟁작</td>
            </tr>
            <tr>
              <td><strong>브리지스톤 (BRIDGESTONE)</strong></td>
              <td style="font-weight: 600;">${s.bridgestoneModel}</td>
              <td>글로벌 시장 대항마</td>
            </tr>
            <tr style="background: rgba(15,118,110,0.02);">
              <td><strong>Compd BM 통계 연계</strong></td>
              <td colspan="2" style="font-weight: 700; color: var(--primary);">
                <i class="fa-solid fa-flask"></i> 분석 완료된 트레드 컴파운드 물성 데이터: <strong>총 ${s.compoundCount}건</strong> 존재
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style="background: rgba(249, 115, 22, 0.03); border: 1px dashed rgba(249, 115, 22, 0.15); border-radius: 8px; padding: 12px; margin-top: 15px;">
          <strong style="color: var(--text-dark); font-size: 0.85rem; display: block; margin-bottom: 5px;"><i class="fa-solid fa-circle-info" style="color: var(--accent-orange);"></i> 세그먼트 핵심 R&D 속성:</strong>
          <span style="font-size: 0.8rem; line-height: 1.6; color: var(--text-main); font-weight: 500;">
            ${s.description} 자사는 이 세그먼트에서 미쉐린의 독점을 견제하기 위해 고유의 배합 패턴 및 Tread 블록 피치 가공 기술을 극대화 적용하고 있습니다.
          </span>
        </div>
      </div>

      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 관련 분석 시스템 이동:</span>
        <div class="source-links-row">
          <a href="../Tire_BM_UI_FINAL/index.html#tab-timeline" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-timeline"></i> Tire BM PLC 매트릭스 타임라인 이동
          </a>
          <a href="../Compd BM/index.html#tab-pattern-compare" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-code-compare"></i> Compd BM 상품 정밀 비교 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 4: IR Business Data with Specific Brand & Year
  const isIrQuery = query.includes('매출') || query.includes('매출액') || query.includes('판매') || query.includes('판매량') || query.includes('실적') || query.includes('이익') || query.includes('b usd') || query.includes('달러') || query.includes('수입');
  if (matchedBrand && matchedYear && isIrQuery) {
    const brandData = AI_IR_DATA[matchedBrand];
    const revenue = brandData.globalRevenue[matchedYear];
    const sales = brandData.globalSales[matchedYear];
    const isEstimated = parseInt(matchedYear) >= 2025;
    const statusText = isEstimated ? "향후 추정치(Est.)" : "감사보고서 확정치";

    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        📊 [실적 핀포인트] ${matchedYear}년 ${brandData.nameKo} IR 경영 지표
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        요청하신 <strong>${brandData.nameKo}</strong>의 <strong>${matchedYear}년도</strong> 공식 사업 공시 및 실적 보고서 데이터를 정밀 추출했습니다.
      </p>
      
      <div class="ai-answer-card">
        <!-- 메인 매출 하이라이트 큰 카드 -->
        <div style="background: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.01) 100%); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; padding: 18px; margin-bottom: 15px; text-align: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">GLOBAL REVENUE (${matchedYear})</span>
          <strong style="font-size: 2rem; color: var(--accent-orange); font-weight: 900; letter-spacing: -0.5px;">
            $${revenue.toFixed(1)} Billion USD
          </strong>
          <span style="font-size: 0.82rem; color: var(--text-dark); display: block; margin-top: 6px; font-weight: 700;">
            한화 약 <strong style="color: var(--primary); font-size: 0.95rem;">${(revenue * 1.35).toFixed(1)}조 원</strong> (평균 환율 1,350원 기준 환산)
          </span>
        </div>

        <table class="ai-table">
          <thead>
            <tr>
              <th style="width: 35%;">경영 지표 필드</th>
              <th>연간 실적 가공 데이터</th>
              <th>지표 해설 및 기준</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>글로벌 총 매출액</strong></td>
              <td style="color: var(--accent-orange); font-weight: 800;">$${revenue.toFixed(1)}B USD</td>
              <td>연간 누적 연결 매출 기준 (${statusText})</td>
            </tr>
            <tr>
              <td><strong>글로벌 총 출하량</strong></td>
              <td style="color: var(--text-dark); font-weight: 800;">${(sales / 100).toFixed(1)}백만 본 (pcs)</td>
              <td>누적 타이어 출하 기준 (${(sales * 10000).toLocaleString()}본 생산)</td>
            </tr>
            <tr>
              <td><strong>매출 정보 출처</strong></td>
              <td>${brandData.nameKo} IR 감사보고서</td>
              <td>정식 주주총회 보고 및 공시 데이터베이스 동기화</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin: 12px 0 0 0; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; font-weight: 600;">
          💡 <strong>매출액 비교 팁:</strong> ${matchedYear}년 기준 ${brandData.nameKo}의 매출액인 $${revenue.toFixed(1)}B USD는 글로벌 최고 수준의 실적 지표에 해당하며, 특히 고인치(18인치 이상) 프리미엄 타이어 판매 비중 확대에 힘입어 전년 대비 양호한 성장을 유지하고 있습니다.
        </p>
      </div>

      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 실적 원본 비교이동:</span>
        <div class="source-links-row">
          <a href="../index.html" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-earth-americas"></i> Global Top4 비교 메인 대시보드 바로가기
          </a>
        </div>
      </div>
    `;
  }

  // CASE 5: Compd BM Material & Silica Rate Questions
  const isCompoundQuery = query.includes('컴파운드') || query.includes('실리카') || query.includes('원료') || query.includes('고무') || query.includes('물성') || query.includes('레진') || query.includes('배합') || query.includes('tread') || query.includes('트레드') || query.includes('경도') || query.includes('마모');
  if (isCompoundQuery) {
    let specificRow = '';
    
    // Create comparison table with highlighting if specific brand matched
    specificRow = Object.keys(COMPD_BM_KNOWLEDGE).map(key => {
      const info = COMPD_BM_KNOWLEDGE[key];
      const koName = key === 'Hankook' ? '한국타이어' : key === 'Michelin' ? '미쉐린' : key === 'Continental' ? '콘티넨탈' : '브리지스톤';
      const isMatched = (matchedBrand === key);
      const rowStyle = isMatched ? `style="background: rgba(249, 115, 22, 0.08); border: 2px solid var(--accent-orange); font-weight: 700;"` : '';
      const starIcon = isMatched ? `<i class="fa-solid fa-star" style="color: var(--accent-orange); margin-right: 4px;"></i>` : '';
      
      return `
        <tr ${rowStyle}>
          <td><strong>${starIcon}${koName} (${key})</strong></td>
          <td>${info.treadModel}</td>
          <td style="color: var(--accent-orange); font-weight: 800;">${info.silicaRate}</td>
          <td>${info.hardness}</td>
          <td>${info.wearIndex}</td>
          <td style="color: var(--accent-green); font-weight: 800;">${info.wetGrip}</td>
        </tr>
      `;
    }).join('');

    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        🧪 Compd BM 트레드 컴파운드 물성 빅데이터 분석
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        질문하신 컴파운드 원료 및 타이어 물성 데이터 결과입니다. 4대 제조사의 트레드 고배합 실리카 적용 비율 및 경도 지표를 추출해 비교 분석했습니다. (총 1,240건의 컴파운드 물성 결과 보유)
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th>제조사명 (Brand)</th>
              <th>대표 제품명</th>
              <th>실리카 함량</th>
              <th>경도 (Hardness)</th>
              <th>마모 수명 인덱스</th>
              <th>Wet Grip 등급</th>
            </tr>
          </thead>
          <tbody>
            ${specificRow}
          </tbody>
        </table>
        <p style="margin: 12px 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; font-weight: 600;">
          💡 <strong>물성 분석 요약:</strong> 친환경 고성능 실리카 적용량 기준 1위는 <strong>미쉐린 PS5 (85%)</strong>이며, 타이어 회전저항(연비)과 젖은 노면 제동력을 모두 극대화하기 위해 나노 실리카 분산 기술이 핵심적으로 적용되어 있습니다. 자사인 한국타이어의 Ventus S1 evo3 역시 78%의 실리카율을 기록하여 탁월한 성능 믹스를 보입니다.
        </p>
      </div>
      
      <!-- 출처 링크 버튼 영역 -->
      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
        <div class="source-links-row">
          <a href="../Compd BM/index.html#tab-explorer" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-flask-vial"></i> Comp'd BM 물성 탐색기 이동
          </a>
          <a href="../Compd BM/index.html#tab-pattern-compare" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-code-compare"></i> 메이커 상품 정밀 비교 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 6: Tire BM Module Logic (PLC Timeline Matrix)
  const isTireBmQuery = query.includes('타이어') || query.includes('plc') || query.includes('타임라인') || query.includes('출시') || query.includes('신제품') || query.includes('suv') || query.includes('van') || query.includes('밴') || query.includes('라인업') || query.includes('여름') || query.includes('겨울') || query.includes('여름용');
  if (isTireBmQuery) {
    const listHtml = TIRE_BM_KNOWLEDGE.map(item => {
      const isMatched = (matchedBrand && matchedBrand.toUpperCase() === item.brand);
      const rowStyle = isMatched ? `style="background: rgba(15, 118, 110, 0.06); font-weight: 700; border: 2px solid var(--primary);"` : '';
      const starIcon = isMatched ? `<i class="fa-solid fa-star" style="color: var(--primary); margin-right: 4px;"></i>` : '';
      
      return `
        <tr ${rowStyle}>
          <td><strong>${starIcon}${item.brand}</strong></td>
          <td style="color: var(--text-main); font-weight: 600;">${item.summer}</td>
          <td>${item.winter}</td>
          <td>${item.allSeason}</td>
          <td style="color: var(--primary); font-weight: 800;">${item.evSpec}</td>
        </tr>
      `;
    }).join('');

    return `
      <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
        🛞 Tire BM Product Life Cycle (PLC) 라인업 분석
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        글로벌 4대 메이커의 시즌별 및 EV 세그먼트별 핵심 타이어 모델 포지셔닝 매트릭스 맵 데이터입니다.
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th>제조사명 (Brand)</th>
              <th>대표 고성능 Summer</th>
              <th>대표 고성능 Winter</th>
              <th>대표 사계절 All Season</th>
              <th>EV 친환경 특화 스펙</th>
            </tr>
          </thead>
          <tbody>
            ${listHtml}
          </tbody>
        </table>
        <p style="margin: 12px 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; font-weight: 600;">
          💡 <strong>PLC 동향 요약:</strong> 최근 타이어 업계의 가장 가파른 PLC 트렌드는 <strong>EV 전용 타이어(iON evo / PS EV)</strong>의 통합과 기후 변화에 대응한 북미/유럽형 올시즌 세그먼트 경쟁력 고도화입니다.
        </p>
      </div>

      <!-- 출처 링크 버튼 영역 -->
      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
        <div class="source-links-row">
          <a href="../Tire_BM_UI_FINAL/index.html#tab-timeline" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-timeline"></i> PLC Timeline Map 이동
          </a>
          <a href="../Tire_BM_UI_FINAL/index.html#tab-ev" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-leaf"></i> EV 친환경 대시보드 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 7: 시장/상품전략 Module Logic
  const isStrategyQuery = query.includes('전략') || query.includes('r&d') || query.includes('기술') || query.includes('특허') || query.includes('로드맵') || query.includes('평점') || query.includes('벤치마크') || query.includes('경쟁력') || query.includes('순위') || query.includes('포지션') || query.includes('방향');
  if (isStrategyQuery) {
    let rows = '';
    rows = Object.keys(STRATEGY_BM_KNOWLEDGE).map(k => {
      const s = STRATEGY_BM_KNOWLEDGE[k];
      const name = k === 'Hankook' ? '한국타이어' : k === 'Michelin' ? '미쉐린' : k === 'Continental' ? '콘티넨탈' : '브리지스톤';
      const isMatched = (matchedBrand === k);
      const rowStyle = isMatched ? `style="background: rgba(249, 115, 22, 0.08); font-weight: 700; border: 2px solid var(--accent-orange);"` : '';
      const starIcon = isMatched ? `<i class="fa-solid fa-star" style="color: var(--accent-orange); margin-right: 4px;"></i>` : '';
      
      return `
        <tr ${rowStyle}>
          <td><strong>${starIcon}${name}</strong></td>
          <td style="color: var(--accent-orange); font-weight: 700;">${s.priority}</td>
          <td>${s.score}</td>
          <td>${s.patents}</td>
          <td>${s.status}</td>
        </tr>
      `;
    }).join('');

    return `
      <p style="margin: 0 0 10px 0; color: var(--accent-orange); font-weight: 800; font-size: 1.05rem;">
        📈 글로벌 경쟁사 R&D 기술 전략 비교 분석
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        글로벌 탑티어 4개 제조사의 중장기 R&D 테마, 북미/유럽 평점 기준 종합 기술 경쟁력 점수 및 누적 등록 특허 현황 분석입니다.
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th>제조사명 (Brand)</th>
              <th>중장기 최우선 R&D 테마</th>
              <th>종합 평점</th>
              <th>관련 특허 보유수</th>
              <th>글로벌 시장 포지셔닝</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin: 12px 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; font-weight: 600;">
          💡 <strong>전략 브리핑 요약:</strong> 자사인 <strong>한국타이어</strong>는 최신 세그먼트 제품들에서 하드웨어 성능 격차를 벤치마크 1위(미쉐린) 대비 98% 이상 좁히는데 성공했으나, 글로벌 친환경 원료 배합 특허망의 추가 확보가 최우선 로드맵 과제로 파악됩니다.
        </p>
      </div>

      <!-- 출처 링크 버튼 영역 -->
      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
        <div class="source-links-row">
          <a href="../Market_Strategy/index.html#tab-competitiveness" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-layer-group"></i> 기술 경쟁력 Overview 이동
          </a>
          <a href="../Market_Strategy/index.html#tab-tech-strategy" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-compass"></i> 경쟁사 R&D 세부전략 이동
          </a>
        </div>
      </div>
    `;
  }

  // CASE 8: IR General Revenue / Financial Queries (Fallback for IR)
  if (isIrQuery || matchedBrand || matchedYear) {
    if (matchedBrand && matchedYear) {
      // Handled above, but in case it fallbacks here:
      const brandData = AI_IR_DATA[matchedBrand];
      const revenue = brandData.globalRevenue[matchedYear];
      const sales = brandData.globalSales[matchedYear];
      return `
        <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
          📊 ${matchedYear}년 ${brandData.nameKo} (${brandData.badge}) 공식 실적 분석
        </p>
        <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
          요청하신 연도 및 제조사 기준 IR 경영 공시 통계 데이터를 가공하여 시각화했습니다.
        </p>
        <div class="ai-answer-card">
          <table class="ai-table">
            <thead>
              <tr>
                <th>구분 지표</th>
                <th>실적 데이터 수치</th>
                <th>환산 기준 정보</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: rgba(249, 115, 22, 0.03);">
                <td><strong>글로벌 총 매출액</strong></td>
                <td style="color: var(--accent-orange); font-weight: 800;">$${revenue.toFixed(1)} Billion USD</td>
                <td>약 ${(revenue * 10).toFixed(0)}억 달러 (한화 약 ${(revenue * 1.35).toFixed(1)}조 원)</td>
              </tr>
              <tr>
                <td><strong>글로벌 총 판매량</strong></td>
                <td style="color: var(--text-dark); font-weight: 800;">${(sales / 100).toFixed(0)}백만 본</td>
                <td>연간 타이어 누적 총 출하 기준 (${(sales * 10000).toLocaleString()}본)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ai-sources-wrapper">
          <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
          <div class="source-links-row">
            <a href="../index.html" class="ai-source-btn" target="_blank">
              <i class="fa-solid fa-earth-americas"></i> Global Top4 비교 메인 대시보드 이동
            </a>
          </div>
        </div>
      `;
    }

    if (matchedBrand) {
      const brandData = AI_IR_DATA[matchedBrand];
      return `
        <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
          📈 ${brandData.nameKo} (${brandData.badge}) 다년도 누적 경영 지표
        </p>
        <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
          특정 연도가 검출되지 않아 <strong>${brandData.nameKo}</strong>의 가용한 6개년도 누적 경영 실적 및 전망치를 정밀 로드했습니다.
        </p>
        <div class="ai-answer-card">
          <table class="ai-table">
            <thead>
              <tr>
                <th>분석 연도</th>
                <th>글로벌 총 매출액 (USD)</th>
                <th>글로벌 총 판매량 (본)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(brandData.globalRevenue).map(yr => `
                <tr>
                  <td><strong>${yr}년${parseInt(yr) >= 2025 ? '(E)' : ''}</strong></td>
                  <td style="color: var(--accent-orange); font-weight: 700;">$${brandData.globalRevenue[yr].toFixed(1)}B USD</td>
                  <td style="color: var(--text-main);">${(brandData.globalSales[yr] / 100).toFixed(0)}백만 본</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="ai-sources-wrapper">
          <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
          <div class="source-links-row">
            <a href="../index.html" class="ai-source-btn" target="_blank">
              <i class="fa-solid fa-earth-americas"></i> Global Top4 비교 메인 대시보드 이동
            </a>
          </div>
        </div>
      `;
    }

    // 전체 다자간 실적 비교 (Default Year 2024)
    const targetYr = matchedYear || "2024";
    return `
      <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
        ⚔️ ${targetYr}년 글로벌 Top4 브랜드 경영 실적 비교 분석
      </p>
      <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500;">
        4대 제조사의 공시 매출액 및 글로벌 판매 본수를 동일 환율 기준으로 통합 대조한 종합 보고서입니다.
      </p>
      <div class="ai-answer-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th>제조사명 (Brand)</th>
              <th>글로벌 매출액 (USD)</th>
              <th>글로벌 판매 본수 (본)</th>
              <th>핵심 주도 시장</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(AI_IR_DATA).map(bKey => {
              const b = AI_IR_DATA[bKey];
              const isBrandMatched = (matchedBrand === bKey);
              const rowStyle = isBrandMatched ? `style="background: rgba(249,115,22,0.06); font-weight: 700; border: 2px solid var(--accent-orange);"` : '';
              return `
                <tr ${rowStyle}>
                  <td><strong>${b.nameKo} (${b.badge})</strong></td>
                  <td style="color: var(--accent-orange); font-weight: 700;">$${b.globalRevenue[targetYr].toFixed(1)}B USD</td>
                  <td style="color: var(--text-dark); font-weight: 700;">${(b.globalSales[targetYr] / 100).toFixed(0)}백만 본</td>
                  <td>${bKey === 'Hankook' ? '한국 / 아시아' : bKey === 'Michelin' ? '유럽 / 북미' : bKey === 'Continental' ? '유럽' : '북미 / 일본'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="ai-sources-wrapper">
        <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 데이터 분석 출처 바로가기:</span>
        <div class="source-links-row">
          <a href="../index.html" class="ai-source-btn" target="_blank">
            <i class="fa-solid fa-earth-americas"></i> Global Top4 비교 메인 대시보드 이동
          </a>
        </div>
      </div>
    `;
  }

  // --- CASE 9: Default Fallback with Recommendation Buttons (Dynamic NLP Assistant feel) ---
  // If the query didn't match any of the strict intents, try to analyze nouns and recommend dynamic queries
  let suggestedKeywords = [];
  if (query.includes('미쉐린') || query.includes('michelin')) {
    suggestedKeywords.push({ q: "미쉐린 2024년 매출액 알려줘", label: "미쉐린 '24년 매출액" });
    suggestedKeywords.push({ q: "미쉐린 ps5 경쟁 세그먼트 분석해줘", label: "미쉐린 PS5 경쟁 세그먼트" });
  }
  if (query.includes('컴파운드') || query.includes('물성') || query.includes('결과')) {
    suggestedKeywords.push({ q: "UHP 세그먼트 컴파운드 결과 몇건이야?", label: "UHP 컴파운드 검출 건수" });
    suggestedKeywords.push({ q: "4대 메이커 컴파운드 물성 알려줘", label: "제조사별 컴파운드 물성 비교" });
  }
  if (query.includes('보고서') || query.includes('리포트') || query.includes('아레나') || query.includes('vpr')) {
    suggestedKeywords.push({ q: "VPR-2025-11 보고서 내용이 뭐야?", label: "VPR-2025-11 보고서 요약" });
    suggestedKeywords.push({ q: "Tire BM 아레나 보고서 목록 보여줘", label: "아레나 연계 보고서 목록" });
  }

  // If no recommendations guessed, use standard high-frequency queries
  if (suggestedKeywords.length === 0) {
    suggestedKeywords = [
      { q: "UHP 세그먼트 컴파운드 결과 몇건이야?", label: "📊 UHP 컴파운드 건수" },
      { q: "미쉐린 2024년 매출액 알려줘", label: "💰 미쉐린 '24년 매출" },
      { q: "VPR-2025-11 보고서 내용이 뭐야?", label: "📂 EV 대조표 보고서 요약" },
      { q: "한국타이어 기술 전략 및 특허수 알려줘", label: "📈 자사 기술 전략 및 특허" }
    ];
  }

  const suggestedChips = suggestedKeywords.map(chip => `
    <button class="ai-suggested-chip" onclick="applySuggestedQuery('${escapeHtml(chip.q)}')">
      ${chip.label} <i class="fa-solid fa-chevron-right" style="font-size: 0.65rem; margin-left: 4px; opacity: 0.7;"></i>
    </button>
  `).join('');

  return `
    <p style="margin: 0 0 10px 0; color: var(--primary); font-weight: 800; font-size: 1.05rem;">
      💡 AI Insight Agent 인텔리전트 가이드
    </p>
    <p style="margin: 0 0 12px 0; color: var(--text-main); font-weight: 500; line-height: 1.6;">
      입력하신 질문 <strong>"${escapeHtml(rawQuery)}"</strong>에서 일부 매핑 키워드를 분석했으나, 정확한 연산 범위를 확정하기 어렵습니다. 
      아래의 <strong>AI 지식 매핑 추천 질문</strong>을 클릭하시거나, 가이드를 참고하여 구체적인 키워드를 입력해 주시면 감사하겠습니다.
    </p>
    
    <div class="ai-answer-card" style="background: rgba(249, 115, 22, 0.02); border: 1px solid rgba(249, 115, 22, 0.1);">
      <p style="margin: 0 0 10px 0; color: var(--text-dark); font-weight: 700; font-size: 0.85rem;">
        <i class="fa-solid fa-compass" style="color: var(--accent-orange); margin-right: 5px;"></i> 입력 질문 기반 맞춤 추천 쿼리:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
        ${suggestedChips}
      </div>

      <p style="margin: 0 0 8px 0; color: var(--text-dark); font-weight: 700; font-size: 0.85rem;">
        <i class="fa-solid fa-lightbulb" style="color: var(--primary);"></i> 도메인별 대표 질문 포맷:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: var(--text-muted); line-height: 1.6; font-size: 0.82rem; font-weight: 600;">
        <li><strong style="color: var(--text-dark);">📂 Arena 보고서 & 기안:</strong> "VPR-2025-11 보고서내용 알려줘", "기안서 목록 보여줘"</li>
        <li><strong style="color: var(--text-dark);">🛞 경쟁 세그먼트 & 모델:</strong> "미쉐린 PS5 경쟁 모델", "EV 전용 타이어 비교"</li>
        <li><strong style="color: var(--text-dark);">🧪 컴파운드 검출 건수 & 물성:</strong> "UHP 컴파운드 결과 몇건이야?", "실리카 배합률 알려줘"</li>
        <li><strong style="color: var(--text-dark);">📊 IR 공시 실적:</strong> "미쉐린 2024년 매출액", "24년 제조사별 매출액 비교"</li>
      </ul>
    </div>

    <!-- 모든 하위 시스템으로의 통합 출처 링크 버튼 장착 -->
    <div class="ai-sources-wrapper">
      <span class="source-label"><i class="fa-solid fa-circle-nodes"></i> 전체 지식 모듈 바로가기 단독 링크:</span>
      <div class="source-links-row">
        <a href="../Compd BM/index.html" class="ai-source-btn" target="_blank">
          <i class="fa-solid fa-flask-vial"></i> Comp'd BM 분석 시스템
        </a>
        <a href="../Tire_BM_UI_FINAL/index.html" class="ai-source-btn" target="_blank">
          <i class="fa-solid fa-timeline"></i> Tire BM Matrix 시스템
        </a>
        <a href="../Market_Strategy/index.html" class="ai-source-btn" target="_blank">
          <i class="fa-solid fa-compass"></i> 시장/상품전략 시스템
        </a>
      </div>
    </div>
  `;
}

// Global script helper to execute suggested query clicks in chat
window.applySuggestedQuery = function(queryText) {
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = queryText;
    const sendBtn = document.getElementById('chat-send-btn');
    if (sendBtn) sendBtn.click();
  }
};

// Helper: Scroll Chat Viewport to Bottom
function scrollToBottom() {
  const chatHistory = document.getElementById('chat-history');
  if (chatHistory) {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

// Helper: Protect UI from XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

