// ══════════════════════════════════
//  DATA — chỉnh sửa nội dung flashcard tại đây
// ══════════════════════════════════
const allCards = [
  // NOUNS
  { cat: "Nouns", type: "Noun", word: "difficulty", phonetic: "/ˈdɪfɪkəlti/" },
  { cat: "Nouns", type: "Noun", word: "programme", phonetic: "/ˈprəʊɡræm/" },
  { cat: "Nouns", type: "Noun", word: "a virtual tour", phonetic: "/ə ˈvɜːtʃuəl tʊə/" },
  { cat: "Nouns", type: "Noun", word: "educational tools", phonetic: "/ˌedjuˈkeɪʃənl tuːlz/" },
  { cat: "Nouns", type: "Noun", word: "function", phonetic: "/ˈfʌŋkʃən/" },
  { cat: "Nouns", type: "Noun", word: "a variety of", phonetic: "/ə vəˈraɪəti əv/" },
  { cat: "Nouns", type: "Noun", word: "teamwork", phonetic: "/ˈtiːmwɜːk/" },
  { cat: "Nouns", type: "Noun", word: "online meetings", phonetic: "/ˈɒnlaɪn ˈmiːtɪŋz/" },
  { cat: "Nouns", type: "Noun", word: "search engines", phonetic: "/sɜːtʃ ˈendʒɪnz/" },
  { cat: "Nouns", type: "Noun", word: "traditional textbooks", phonetic: "/trəˈdɪʃənl ˈtekstbʊks/" },
  { cat: "Nouns", type: "Noun", word: "the 21st century", phonetic: "/ðə ˌtwenti ˈfɜːst ˈsentʃəri/" },
  { cat: "Nouns", type: "Noun", word: "labour market", phonetic: "/ˈleɪbə ˈmɑːkɪt/" },
  { cat: "Nouns", type: "Noun", word: "syllabus", phonetic: "/ˈsɪləbəs/" },
  { cat: "Nouns", type: "Noun", word: "office", phonetic: "/ˈɒfɪs/" },





  // VERBS


  { cat: "Verbs", type: "Verb", word: "identify", phonetic: "/aɪˈdentɪfaɪ/" },
  { cat: "Verbs", type: "Verb", word: "come up with", phonetic: "/kʌm ʌp wɪð/" },
  { cat: "Verbs", type: "Verb", word: "write down", phonetic: "/raɪt daʊn/" },
  { cat: "Verbs", type: "Verb", word: "review", phonetic: "/rɪˈvjuː/" },
  { cat: "Verbs", type: "Verb", word: "base on", phonetic: "/beɪs ɒn/" },
  { cat: "Verbs", type: "Verb", word: "create", phonetic: "/kriˈeɪt/" },
  { cat: "Verbs", type: "Verb", word: "move forward", phonetic: "/muːv ˈfɔːwəd/" },
  { cat: "Verbs", type: "Verb", word: "carry out", phonetic: "/ˈkæri aʊt/" },
  { cat: "Verbs", type: "Verb", word: "achieve", phonetic: "/əˈtʃiːv/" },




  // ADJECTIVES
  { cat: "Adjectives", type: "Adjective", word: "specific", phonetic: "/spəˈsɪfɪk/" },




  // ADVERBS
  



];

// Danh mục tab — thêm/bớt tùy theo cat trong allCards
const CATS = ["All", "Nouns", "Verbs", "Adjectives", "Adverbs"];

// ══════════════════════════════════
//  STATE
// ══════════════════════════════════
let S = {
  cat: "All", deck: [], idx: 0,
  flipped: false, checked: false,
  known: 0, again: 0, againList: [], done: false, reviewMode: false
};

// ══════════════════════════════════
//  DECK / INIT
// ══════════════════════════════════
function getDeck(cat) {
  const base = cat === "All" ? allCards : allCards.filter(c => c.cat === cat);
  return [...base].sort(() => Math.random() - .5);
}

function init(cat, review) {
  const deck = review ? [...S.againList].sort(() => Math.random() - .5) : getDeck(cat);
  S = { cat, deck, idx: 0, flipped: false, checked: false, known: 0, again: 0, againList: [], done: false, reviewMode: !!review };
  fullRender();
}

// ══════════════════════════════════
//  TTS
// ══════════════════════════════════
let curUtter = null;

function speak(text, btnId) {
  if (!window.speechSynthesis) return;
  if (curUtter && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.speak-btn,.speak-back-btn').forEach(b => b.classList.remove('speaking'));
    if (curUtter._text === text) { curUtter = null; return; }
  }
  const clean = text.replace(/<[^>]+>/g, '').replace(/\(.*?\)/g, '').trim();
  const u = new SpeechSynthesisUtterance(clean);
  u._text = text; u.lang = 'en-GB'; u.rate = 0.88; u.pitch = 1;
  const vs = window.speechSynthesis.getVoices();
  const v = vs.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
    || vs.find(v => v.lang === 'en-GB')
    || vs.find(v => v.lang.startsWith('en'));
  if (v) u.voice = v;
  const btn = document.getElementById(btnId);
  u.onstart = () => { if (btn) btn.classList.add('speaking'); };
  u.onend = u.onerror = () => {
    document.querySelectorAll('.speak-btn,.speak-back-btn').forEach(b => b.classList.remove('speaking'));
    curUtter = null;
  };
  curUtter = u;
  window.speechSynthesis.speak(u);
}

function speakWord() { const c = S.deck[S.idx]; if (c) speak(c.word, 'speakFront'); }
function speakExample() { const c = S.deck[S.idx]; if (c) speak(c.example, 'speakBack'); }

// ══════════════════════════════════
//  LOGIC
// ══════════════════════════════════
function norm(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s\-]/g, '').replace(/\s+/g, ' ');
}

function checkTyped() {
  if (S.checked) return;
  const inp = document.getElementById('typeInput');
  if (!inp || !inp.value.trim()) { speakWord(); return; }
  const card = S.deck[S.idx];
  const ok = norm(inp.value) === norm(card.word);
  S.checked = true;
  inp.disabled = true;
  inp.classList.add(ok ? 'correct' : 'wrong');
  const fb = document.getElementById('typeFeedback');
  if (ok) {
    fb.className = 'type-feedback ok';
    fb.textContent = '✓ Correct!';
  } else {
    fb.className = 'type-feedback bad';
    fb.textContent = '✗  Answer: ' + card.word;
  }
  document.getElementById('rateKnow').disabled = false;
  document.getElementById('rateAgain').disabled = false;
}

function flipCard() {
  // Không còn mặt sau — click card chỉ phát âm nếu chưa check
  if (!S.checked) speakWord();
}

function rate(knew) {
  if (!S.checked) return;
  if (knew) S.known++; else { S.again++; S.againList.push(S.deck[S.idx]); }
  S.idx++;
  if (S.idx >= S.deck.length) { S.done = true; fullRender(); return; }
  S.flipped = false; S.checked = false;
  cardRender(); updateStats();
}

function prev() { if (S.idx <= 0) return; S.idx--; S.flipped = false; S.checked = false; cardRender(); updateStats(); }
function next() { if (S.idx >= S.deck.length - 1) return; S.idx++; S.flipped = false; S.checked = false; cardRender(); updateStats(); }

// ══════════════════════════════════
//  SVG HELPERS
// ══════════════════════════════════
function speakerSVG() { return `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`; }
function rotateSVG() { return `<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6H4a8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/></svg>`; }
function checkSVG() { return `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`; }

// ══════════════════════════════════
//  RENDER
// ══════════════════════════════════
function fullRender() {
  document.getElementById('app').innerHTML = `
    <div class="header">
      <div class="unit-tag">Unit 8 · Paragraph 2</div>
      <div class="title">Becoming Independent</div>
      <div class="subtitle">${S.deck.length} words · ${S.reviewMode ? "Review mode" : "Study mode"}</div>
    </div>
    <div class="cat-row">
      ${CATS.map(c => `<button class="cat-btn ${S.cat === c && !S.reviewMode ? 'active' : ''}" onclick="init('${c}',false)">${c}</button>`).join('')}
    </div>
    <div class="stats-strip">
      <div class="stat-chip"><span>📚</span><span class="val">${S.deck.length}</span><span>cards</span></div>
      <div class="stat-chip"><span>✅</span><span class="val" id="knownCount">${S.known}</span><span>known</span></div>
      <div class="stat-chip"><span>🔁</span><span class="val" id="againCount">${S.again}</span><span>review</span></div>
    </div>
    <div class="progress-row">
      <span class="prog-label">Progress</span>
      <div class="prog-bar"><div class="prog-fill" id="progFill" style="width:${S.deck.length ? S.idx / S.deck.length * 100 : 0}%"></div></div>
      <span class="prog-count" id="progCount">${S.idx}/${S.deck.length}</span>
    </div>
    <div id="cardArea">${S.done ? completeHTML() : gameHTML()}</div>
  `;
  if (!S.done) { focusInput(); bindKeys(); }
}

function cardRender() {
  const area = document.getElementById('cardArea');
  if (area) area.innerHTML = gameHTML();
  focusInput(); bindKeys(); updateStats();
}

function focusInput() { const i = document.getElementById('typeInput'); if (i) setTimeout(() => i.focus(), 50); }

function bindKeys() {
  document.onkeydown = (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'typeInput') return;
    if (e.key === 'Enter') { if (!S.checked) checkTyped(); }
  };
}

function gameHTML() {
  const card = S.deck[S.idx];
  return `
    <div class="card-face card-front-face">
      <div class="card-type-badge">${card.type}</div>
      <div class="card-num">${S.idx + 1} / ${S.deck.length}</div>
      <button class="speak-btn" id="speakFront" onclick="speakWord()" title="Hear word">
        ${speakerSVG()}
      </button>
      ${card.phonetic ? `<div class="card-phonetic">${card.phonetic}</div>` : ''}
      <div class="type-wrap">
        <input class="type-input" id="typeInput" type="text"
          placeholder="Type the word you hear…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          onkeydown="if(event.key==='Enter'){event.preventDefault();checkTyped();}">
        <button class="check-btn" onclick="checkTyped()" title="Check">
          ${checkSVG()}
        </button>
      </div>
      <div class="type-feedback" id="typeFeedback"></div>
    </div>

  <div class="rate-row">
    <button class="rate-btn again" id="rateAgain" onclick="rate(false)" ${!S.checked ? 'disabled' : ''}>🔁 Study again</button>
    <button class="rate-btn know"  id="rateKnow"  onclick="rate(true)"  ${!S.checked ? 'disabled' : ''}>✅ Got it!</button>
  </div>
  <div class="nav-row">
    <button class="nav-btn" onclick="prev()" ${S.idx === 0 ? 'disabled' : ''}>← Prev</button>
    <button class="nav-btn" onclick="next()" ${S.idx >= S.deck.length - 1 ? 'disabled' : ''}>Next →</button>
  </div>`;
}

function completeHTML() {
  const pct = S.deck.length ? Math.round(S.known / S.deck.length * 100) : 0;
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '📖' : '💪';
  const msg = pct >= 90 ? "Outstanding! You nailed all the words!"
    : pct >= 70 ? "Great job! A little more review and you'll nail it!"
      : pct >= 50 ? "Good effort! Review the ones you missed."
        : "Keep going! Practice makes perfect.";
  return `
  <div class="complete-card">
    <span class="complete-icon">${emoji}</span>
    <div class="complete-title">${pct >= 80 ? 'Well done!' : 'Round complete!'}</div>
    <div class="complete-sub">${msg}</div>
    <div class="result-grid">
      <div class="result-box green"><div class="rb-val">${S.known}</div><div class="rb-label">✅ Known</div></div>
      <div class="result-box orange"><div class="rb-val">${S.again}</div><div class="rb-label">🔁 Review</div></div>
    </div>
    <div class="action-row">
      ${S.again > 0 ? `<button class="action-btn primary" onclick="init('${S.cat}',true)">🔁 Review ${S.again} cards</button>` : ''}
      <button class="action-btn secondary" onclick="init('${S.cat}',false)">🔄 Shuffle & restart</button>
      <button class="action-btn secondary" onclick="init('All',false)">📚 All words</button>
    </div>
  </div>`;
}

function updateStats() {
  const pf = document.getElementById('progFill');
  const pc = document.getElementById('progCount');
  const kc = document.getElementById('knownCount');
  const ac = document.getElementById('againCount');
  if (pf) pf.style.width = (S.deck.length ? S.idx / S.deck.length * 100 : 0) + '%';
  if (pc) pc.textContent = `${S.idx}/${S.deck.length}`;
  if (kc) kc.textContent = S.known;
  if (ac) ac.textContent = S.again;
}

// ══════════════════════════════════
//  BOOT
// ══════════════════════════════════
window.speechSynthesis.getVoices();
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
init("All", false);
