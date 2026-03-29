const { useState, useEffect, useRef } = React;

// 🔴 YOUR CREDENTIALS (FILL THESE IN!) 🔴
const GEMINI_API_KEY = "AIzaSyAgzyZbmRywx7gzuE2ziWqNES-80gdcJ2w"; 
const ADMIN_EMAIL = "suryansh7suryansh@gmail.com"; // The email that gets Admin powers!

// 🔴 YOUR FIREBASE CONNECTION 🔴
const firebaseConfig = {
  apiKey: "AIzaSyBzXUSJAUBoQHgV4-9SIfP2Xro4eZQdFiM",
  authDomain: "studyflow-eee43.firebaseapp.com",
  projectId: "studyflow-eee43",
  storageBucket: "studyflow-eee43.firebasestorage.app",
  messagingSenderId: "871015131293",
  appId: "1:871015131293:web:c8b7c642345fddc5d60c74",
  measurementId: "G-7TZWRX7JE4"
};

// Initialize Firebase (Checking if it exists first so it doesn't double-load)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();


// ── AI question generation (Powered by Gemini) ─────────────────────
async function generateQuestions(material, count = 12) {
  if (GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("API Key Missing! Please add your key to the top of the code.");
  }
  const promptText = `You are a teacher creating exam questions. Generate exactly ${count} questions from the material below.\nSTRICT RULES:\n1. Return ONLY raw JSON — no markdown formatting, no explanation, no backticks\n2. Mix types: mcq, truefalse, fillblank, shortanswer (roughly equal split)\n3. Mix difficulties: easy, medium, hard\n4. For fillblank: use a single blank ___ in the question; answer should be 1-3 words\n5. For mcq: provide exactly 4 options, answer is the index (0-3) of the correct one\n\nJSON FORMAT (follow exactly):\n{"questions":[\n{"type":"mcq","difficulty":"easy","question":"...?","options":["A","B","C","D"],"answer":0},\n{"type":"truefalse","difficulty":"medium","question":"...?","answer":true},\n{"type":"fillblank","difficulty":"medium","question":"The ___ is...","answer":"word"},\n{"type":"shortanswer","difficulty":"hard","question":"Explain...","answer":"detailed model answer here"}\n]}\n\nMATERIAL TO USE:\n${material}`;

 const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { response_mime_type: "application/json" } })
  });
  if (!res.ok) throw new Error("API Error: Check your key and internet connection.");
  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text;
  const cleanText = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleanText);
  return parsed.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
}

// ── Global CSS injection ───────────────────────────────────────────
function injectCSS(dark) {
  let el = document.getElementById("sf-css");
  if (!el) { el = document.createElement("style"); el.id = "sf-css"; document.head.appendChild(el); }
  const acc = dark ? "#4FFFB0" : "#6366F1";
  const bg = dark ? "#06090F" : "#EEF0FF";
  const txt = dark ? "#E8EAF6" : "#1E1F3B";
  const surf = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.62)";
  const brd = dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.14)";

  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:${bg};color:${txt};overflow-x:hidden;transition:background .4s,color .4s}
    .sf-syne{font-family:'Syne',sans-serif}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${brd};border-radius:3px}
    @keyframes sf-b1{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(45px,-40px)scale(1.12)}}
    @keyframes sf-b2{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(-38px,35px)scale(0.88)}}
    @keyframes sf-b3{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(28px,38px)scale(1.07)}}
    @keyframes sf-b4{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(-20px,-25px)scale(0.95)}}
    @keyframes sf-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes sf-in{from{opacity:0}to{opacity:1}}
    @keyframes sf-spin{to{transform:rotate(360deg)}}
    @keyframes sf-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .sf-up{animation:sf-up .5s ease both}
    .sf-in{animation:sf-in .35s ease both}
    .sf-glass{background:${surf};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${brd};border-radius:20px;transition:all .3s ease}
    .sf-card{background:${surf};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${brd};border-radius:16px;padding:20px;transition:all .25s ease;cursor:pointer}
    .sf-card:hover{background:${dark?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.92)"};border-color:${acc};transform:translateY(-3px);box-shadow:0 16px 44px ${dark?"rgba(79,255,176,0.08)":"rgba(99,102,241,0.14)"}}
    .sf-inp{background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.72)"};border:1px solid ${brd};color:${txt};font-family:'DM Sans',sans-serif;font-size:.95rem;padding:13px 16px;border-radius:14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
    .sf-inp:focus{border-color:${acc};box-shadow:0 0 0 3px ${dark?"rgba(79,255,176,0.1)":"rgba(99,102,241,0.1)"}}
    .sf-inp::placeholder{color:${dark?"rgba(232,234,246,0.28)":"rgba(30,31,59,0.32)"}}
    textarea.sf-inp{resize:vertical;min-height:130px}
    select.sf-inp option{background:${dark?"#0D1117":"#fff"}}
    .sf-btn{display:inline-flex;align-items:center;gap:8px;font-family:'Syne',sans-serif;font-weight:700;font-size:.84rem;letter-spacing:.04em;padding:12px 26px;border:none;border-radius:50px;cursor:pointer;transition:all .2s}
    .sf-btn-p{background:${acc};color:${dark?"#06090F":"#fff"}}
    .sf-btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 28px ${dark?"rgba(79,255,176,0.28)":"rgba(99,102,241,0.32)"}}
    .sf-btn-p:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
    .sf-btn-g{background:${dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.72)"};color:${txt};border:1px solid ${brd};font-family:'DM Sans',sans-serif;font-weight:500}
    .sf-btn-g:hover{border-color:${acc};background:${dark?"rgba(255,255,255,0.1)":"rgba(255,255,255,.96)"}}
    .sf-btn-d{background:rgba(255,92,122,.1);color:#FF5C7A;border:1px solid rgba(255,92,122,.25);font-family:'DM Sans',sans-serif;font-weight:500}
    .sf-btn-d:hover{background:rgba(255,92,122,.2)}
    .sf-badge{display:inline-flex;align-items:center;font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.06em;padding:3px 9px;border-radius:50px;text-transform:uppercase}
    .sf-easy{background:rgba(79,255,176,.12);color:#4FFFB0}
    .sf-medium{background:rgba(251,191,36,.14);color:#FBB924}
    .sf-hard{background:rgba(255,92,122,.12);color:#FF5C7A}
    .sf-mcq{background:rgba(167,139,250,.15);color:#A78BFA}
    .sf-truefalse{background:rgba(45,212,191,.14);color:#2DD4BF}
    .sf-fillblank{background:rgba(251,146,60,.14);color:#FB923C}
    .sf-shortanswer{background:rgba(248,113,113,.14);color:#F87171}
    .sf-tab{padding:8px 18px;border-radius:50px;cursor:pointer;font-size:.875rem;font-weight:500;transition:all .2s;border:none;background:transparent;color:${dark?"rgba(232,234,246,0.45)":"rgba(30,31,59,0.45)"};font-family:'DM Sans',sans-serif}
    .sf-tab.sf-active{background:${dark?"rgba(79,255,176,0.1)":"rgba(99,102,241,0.12)"};color:${acc};font-weight:600}
    .sf-si{padding:9px 13px;border-radius:11px;cursor:pointer;font-size:.875rem;transition:all .2s}
    .sf-si:hover{background:${dark?"rgba(255,255,255,0.06)":"rgba(99,102,241,0.07)"}}
    .sf-si.sf-active{background:${dark?"rgba(79,255,176,0.1)":"rgba(99,102,241,0.12)"};color:${acc};font-weight:600}
    .sf-qopt{padding:13px 17px;border-radius:13px;border:1px solid ${brd};cursor:pointer;transition:all .2s;background:${dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,.5)"};font-size:.95rem;text-align:left;width:100%;color:${txt};font-family:'DM Sans',sans-serif}
    .sf-qopt:hover:not(:disabled){border-color:${acc};background:${dark?"rgba(79,255,176,0.07)":"rgba(99,102,241,0.07)"}}
    .sf-qopt.sf-sel{border-color:${acc};background:${dark?"rgba(79,255,176,0.1)":"rgba(99,102,241,0.1)"}}
    .sf-qopt.sf-correct{border-color:#4FFFB0!important;background:rgba(79,255,176,0.12)!important;color:#4FFFB0}
    .sf-qopt.sf-wrong{border-color:#FF5C7A!important;background:rgba(255,92,122,0.1)!important;color:#FF5C7A}
    .sf-spin{width:18px;height:18px;border:2px solid transparent;border-top-color:currentColor;border-radius:50%;animation:sf-spin .7s linear infinite}
    .sf-warn{animation:sf-pulse 1s ease infinite}
    .sf-prog{height:4px;background:${brd};border-radius:2px;overflow:hidden}
    .sf-fill{height:100%;background:${acc};border-radius:2px;transition:width .4s ease}
    input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:${brd};outline:none}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${acc};cursor:pointer}
    .sf-act-btn{background:none; border:none; color:inherit; opacity:0.3; cursor:pointer; font-size:12px; padding:2px; transition:opacity 0.2s;}
    .sf-act-btn:hover{opacity:1;}
  `;
}

// ── Background blobs ───────────────────────────────────────────────
function Blobs({ dark }) {
  const blobs = dark
    ? [{ c: "#4FFFB0", top: "5%",  left: "60%", s: 500, a: "sf-b1", d: 13 },
       { c: "#A78BFA", top: "55%", left: "5%",  s: 420, a: "sf-b2", d: 16 },
       { c: "#2DD4BF", top: "25%", left: "28%", s: 350, a: "sf-b3", d: 19 },
       { c: "#6366F1", top: "70%", left: "70%", s: 300, a: "sf-b4", d: 14 }]
    : [{ c: "#6366F1", top: "8%",  left: "58%", s: 500, a: "sf-b1", d: 13 },
       { c: "#A78BFA", top: "52%", left: "4%",  s: 420, a: "sf-b2", d: 16 },
       { c: "#2DD4BF", top: "22%", left: "30%", s: 350, a: "sf-b3", d: 19 },
       { c: "#818CF8", top: "72%", left: "68%", s: 280, a: "sf-b4", d: 14 }];
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: "absolute", width: b.s, height: b.s, borderRadius: "50%",
          background: b.c, filter: "blur(90px)", opacity: dark ? 0.13 : 0.17,
          animation: `${b.a} ${b.d}s ease-in-out infinite`,
          top: b.top, left: b.left, transform: "translate(-50%,-50%)"
        }} />
      ))}
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar({ user, dark, onToggle, onLogout }) {
  const acc = dark ? "#4FFFB0" : "#6366F1";
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 64, padding: "0 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: dark ? "rgba(6,9,15,0.82)" : "rgba(238,240,255,0.82)",
      backdropFilter: "blur(20px)", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.13)"}`
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: dark ? "rgba(79,255,176,0.13)" : "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📚</div>
        <span className="sf-syne" style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-.02em" }}>StudyFlow</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && <span style={{ fontSize: ".84rem", opacity: .55 }}>{user.name} · <span style={{ color: acc }}>{user.role}</span></span>}
        <button onClick={onToggle} style={{
          width: 40, height: 40, borderRadius: 12, fontSize: 17,
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.1)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s"
        }}>{dark ? "☀️" : "🌙"}</button>
        {user && <button className="sf-btn sf-btn-g" onClick={onLogout} style={{ padding: "8px 18px", fontSize: ".8rem" }}>Sign out</button>}
      </div>
    </nav>
  );
}

// ── Login Component (NOW POWERED BY FIREBASE) ──────────────────────
function Login({ dark }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);

  const handleAuth = async (action) => {
    setLoad(true); setErr("");
    try {
      if (action === "login") {
        await auth.signInWithEmailAndPassword(email, pw);
      } else if (action === "signup") {
        await auth.createUserWithEmailAndPassword(email, pw);
      } else if (action === "google") {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
      }
    } catch (error) {
      setErr(error.message.replace("Firebase: ", ""));
    }
    setLoad(false);
  };

  const acc = dark ? "#4FFFB0" : "#6366F1";
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
      <div className="sf-glass sf-up" style={{ width: "100%", maxWidth: 420, padding: "52px 44px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 52, marginBottom: 18 }}>📚</div>
          <h1 className="sf-syne" style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-.03em", marginBottom: 8 }}>StudyFlow</h1>
          <p style={{ opacity: .5, fontSize: ".9rem" }}>Your intelligent study companion</p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="sf-syne" style={{ display: "block", fontSize: ".75rem", fontWeight: 700, opacity: .5, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 7 }}>Email Address</label>
            <input className="sf-inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="sf-syne" style={{ display: "block", fontSize: ".75rem", fontWeight: 700, opacity: .5, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 7 }}>Password</label>
            <input className="sf-inp" type="password" placeholder="Min 6 characters" value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          
          {err && <p style={{ color: "#FF5C7A", fontSize: ".86rem", textAlign: "center", marginTop: 4 }}>{err}</p>}
          
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="sf-btn sf-btn-g" onClick={() => handleAuth("signup")} disabled={load || !email || !pw} style={{ flex: 1, justifyContent: "center", fontSize: ".9rem" }}>
              Sign Up
            </button>
            <button className="sf-btn sf-btn-p" onClick={() => handleAuth("login")} disabled={load || !email || !pw} style={{ flex: 1, justifyContent: "center", fontSize: ".9rem" }}>
              Log In →
            </button>
          </div>
          
          <div style={{ position: "relative", margin: "16px 0", textAlign: "center" }}>
            <hr style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
            <span className="sf-syne" style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: dark ? "#06090F" : "#EEF0FF", padding: "0 10px", fontSize: ".75rem", fontWeight: 700, opacity: 0.5, letterSpacing: ".05em" }}>OR</span>
          </div>

          <button className="sf-btn sf-btn-g" onClick={() => handleAuth("google")} disabled={load} style={{ width: "100%", justifyContent: "center", padding: "14px 28px" }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, marginRight: 8 }} />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ────────────────────────────────────────────────
function Admin({ subjects, setSubjects, dark, onQuiz }) {
  const [tab, setTab] = useState("subjects");
  const [selSub, setSelSub] = useState(null);
  const [selUnit, setSelUnit] = useState(null);
  const [selTopic, setSelTopic] = useState(null);
  const [addMode, setAddMode] = useState(null);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📖");
  const [matText, setMatText] = useState("");
  const [gen, setGen] = useState(false);
  const [genCount, setGenCount] = useState(12);
  const [genMsg, setGenMsg] = useState("");

  const acc = dark ? "#4FFFB0" : "#6366F1";

  const syncedTopic = selTopic && selSub && selUnit
    ? subjects.find(s => s.id === selSub.id)?.units.find(u => u.id === selUnit.id)?.topics.find(t => t.id === selTopic.id)
    : null;

  useEffect(() => { if (selTopic) setMatText(selTopic.material || ""); }, [selTopic?.id]);

  // CRUD Functions
  const addSubject = () => {
    if (!newName.trim()) return;
    const palette = ["#4FFFB0","#FBB924","#FB923C","#A78BFA","#2DD4BF","#F87171"];
    setSubjects(p => [...p, { id: Date.now(), name: newName, icon: newIcon, color: palette[p.length % palette.length], units: [] }]);
    setNewName(""); setNewIcon("📖"); setAddMode(null);
  };

  const editSubject = (sub) => {
    const n = prompt("Edit Subject Name:", sub.name);
    if(n) setSubjects(p => p.map(s => s.id === sub.id ? { ...s, name: n } : s));
  };

  const deleteSubject = (id) => {
    if(confirm("Are you sure you want to delete this subject and all its units?")) {
      setSubjects(p => p.filter(s => s.id !== id));
      if(selSub?.id === id) { setSelSub(null); setSelUnit(null); setSelTopic(null); }
    }
  };

  const addUnit = () => {
    if (!newName.trim() || !selSub) return;
    setSubjects(p => p.map(s => s.id === selSub.id ? { ...s, units: [...s.units, { id: Date.now(), name: newName, topics: [] }] } : s));
    setNewName(""); setAddMode(null);
  };

  const editUnit = (subId, unit) => {
    const n = prompt("Edit Unit Name:", unit.name);
    if(n) setSubjects(p => p.map(s => s.id === subId ? { ...s, units: s.units.map(u => u.id === unit.id ? { ...u, name: n } : u) } : s));
  };

  const deleteUnit = (subId, unitId) => {
    if(confirm("Are you sure you want to delete this unit?")) {
      setSubjects(p => p.map(s => s.id === subId ? { ...s, units: s.units.filter(u => u.id !== unitId) } : s));
      if(selUnit?.id === unitId) { setSelUnit(null); setSelTopic(null); }
    }
  };

  const addTopic = (sub, unit) => {
    if (!newName.trim()) return;
    setSubjects(p => p.map(s => s.id === sub.id ? { ...s, units: s.units.map(u => u.id === unit.id ? { ...u, topics: [...u.topics, { id: Date.now(), name: newName, material: "", questions: [] }] } : u) } : s));
    setNewName(""); setAddMode(null);
  };

  const editTopic = (subId, unitId, topic) => {
    const n = prompt("Edit Topic Name:", topic.name);
    if(n) setSubjects(p => p.map(s => s.id === subId ? { ...s, units: s.units.map(u => u.id === unitId ? { ...u, topics: u.topics.map(t => t.id === topic.id ? { ...t, name: n } : t) } : u) } : s));
  };

  const deleteTopic = (subId, unitId, topicId) => {
    if(confirm("Are you sure you want to delete this topic?")) {
      setSubjects(p => p.map(s => s.id === subId ? { ...s, units: s.units.map(u => u.id === unitId ? { ...u, topics: u.topics.filter(t => t.id !== topicId) } : u) } : s));
      if(selTopic?.id === topicId) setSelTopic(null);
    }
  };

  const saveMat = () => {
    if (!selTopic) return;
    setSubjects(p => p.map(s => s.id === selSub.id ? { ...s, units: s.units.map(u => u.id === selUnit.id ? { ...u, topics: u.topics.map(t => t.id === selTopic.id ? { ...t, material: matText } : t) } : u) } : s));
    setGenMsg("✓ Material saved!"); setTimeout(() => setGenMsg(""), 2500);
  };

  const doGenerate = async () => {
    if (!matText.trim()) { setGenMsg("⚠ Paste study material first."); return; }
    setGen(true); setGenMsg("AI is generating questions…");
    try {
      const qs = await generateQuestions(matText, genCount);
      setSubjects(p => p.map(s => s.id === selSub.id ? { ...s, units: s.units.map(u => u.id === selUnit.id ? { ...u, topics: u.topics.map(t => t.id === selTopic.id ? { ...t, material: matText, questions: [...t.questions, ...qs] } : t) } : u) } : s));
      setGenMsg(`✓ ${qs.length} questions generated!`);
    } catch (e) { 
        console.error(e);
        setGenMsg("✗ Error — Check your API key at the top of the code."); 
    }
    setGen(false); setTimeout(() => setGenMsg(""), 4000);
  };

  const clearQs = () => {
    if (!selTopic) return;
    setSubjects(p => p.map(s => s.id === selSub.id ? { ...s, units: s.units.map(u => u.id === selUnit.id ? { ...u, topics: u.topics.map(t => t.id === selTopic.id ? { ...t, questions: [] } : t) } : u) } : s));
  };

  const msgColor = genMsg.startsWith("✓") ? "#4FFFB0" : genMsg.startsWith("✗") ? "#FF5C7A" : "#FBB924";
  const msgBg = genMsg.startsWith("✓") ? "rgba(79,255,176,0.1)" : genMsg.startsWith("✗") ? "rgba(255,92,122,0.1)" : "rgba(251,185,36,0.1)";

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.12)"}`, padding: "0 28px", display: "flex", gap: 2, background: dark ? "rgba(6,9,15,0.6)" : "rgba(238,240,255,0.6)", backdropFilter: "blur(10px)" }}>
        {[["subjects","📚 Subjects"],["upload","⚡ Upload & Generate"]].map(([k,v]) => (
          <button key={k} className={`sf-tab ${tab===k?"sf-active":""}`} onClick={() => setTab(k)} style={{ padding: "14px 22px" }}>{v}</button>
        ))}
      </div>

      <div style={{ padding: "32px 32px 48px", maxWidth: 1100, margin: "0 auto" }}>
        {/* SUBJECTS */}
        {tab === "subjects" && (
          <div className="sf-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 className="sf-syne" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Subjects</h2>
                <p style={{ opacity: .5, fontSize: ".9rem", marginTop: 4 }}>Build your subject tree: Subject → Unit → Topic</p>
              </div>
              <button className="sf-btn sf-btn-p" onClick={() => setAddMode("subject")}>+ Add Subject</button>
            </div>

            {addMode === "subject" && (
              <div className="sf-glass sf-up" style={{ padding: "18px 20px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                <input className="sf-inp" style={{ maxWidth: 60 }} placeholder="🧬" value={newIcon} onChange={e => setNewIcon(e.target.value)} />
                <input className="sf-inp" placeholder="Subject name…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubject()} autoFocus />
                <button className="sf-btn sf-btn-p" onClick={addSubject} style={{ whiteSpace: "nowrap" }}>Add</button>
                <button className="sf-btn sf-btn-g" onClick={() => setAddMode(null)}>Cancel</button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
              {subjects.map(sub => (
                <div key={sub.id} className="sf-glass" style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 30 }}>{sub.icon}</span>
                      <div>
                        <h3 className="sf-syne" style={{ fontWeight: 700 }}>{sub.name}</h3>
                        <p style={{ fontSize: ".8rem", opacity: .5 }}>{sub.units.length} units · {sub.units.reduce((a,u)=>a+u.topics.length,0)} topics</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="sf-act-btn" onClick={() => editSubject(sub)}>✏️</button>
                      <button className="sf-act-btn" onClick={() => deleteSubject(sub.id)}>🗑️</button>
                    </div>
                  </div>

                  {sub.units.map(unit => (
                    <div key={unit.id} style={{ marginBottom: 10 }}>
                      <div style={{ padding: "9px 12px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.06)", marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontWeight: 600, fontSize: ".875rem" }}>{unit.name}</p>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="sf-act-btn" onClick={() => editUnit(sub.id, unit)}>✏️</button>
                          <button className="sf-act-btn" onClick={() => deleteUnit(sub.id, unit.id)}>🗑️</button>
                        </div>
                      </div>
                      
                      {unit.topics.map(topic => (
                        <div key={topic.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px 7px 22px", borderRadius: 8, transition: "background .15s" }}
                          onMouseOver={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
                          onMouseOut={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div onClick={() => { setSelSub(sub); setSelUnit(unit); setSelTopic(topic); setTab("upload"); }} style={{ cursor: "pointer", flex: 1, fontSize: ".84rem", opacity: .75 }}>
                            <span>→ {topic.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="sf-badge sf-mcq" style={{ fontSize: ".62rem" }}>{topic.questions.length}Q</span>
                            <button className="sf-act-btn" onClick={() => editTopic(sub.id, unit.id, topic)}>✏️</button>
                            <button className="sf-act-btn" onClick={() => deleteTopic(sub.id, unit.id, topic.id)}>🗑️</button>
                          </div>
                        </div>
                      ))}

                      {addMode === `tp-${unit.id}` ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 6, paddingLeft: 12 }}>
                          <input className="sf-inp" placeholder="Topic name…" value={newName} onChange={e => setNewName(e.target.value)} style={{ fontSize: ".85rem", padding: "8px 12px" }} autoFocus onKeyDown={e => e.key === "Enter" && addTopic(sub, unit)} />
                          <button className="sf-btn sf-btn-p" style={{ padding: "8px 14px" }} onClick={() => addTopic(sub, unit)}>+</button>
                          <button className="sf-btn sf-btn-g" style={{ padding: "8px 12px" }} onClick={() => setAddMode(null)}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAddMode(`tp-${unit.id}`); setNewName(""); }} style={{ marginTop: 5, paddingLeft: 22, fontSize: ".8rem", opacity: .38, background: "none", border: "none", cursor: "pointer", color: "inherit", transition: "opacity .2s" }}
                          onMouseOver={e => e.currentTarget.style.opacity = "1"} onMouseOut={e => e.currentTarget.style.opacity = ".38"}>+ Add topic</button>
                      )}
                    </div>
                  ))}

                  {addMode === `un-${sub.id}` ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <input className="sf-inp" placeholder="Unit name…" value={newName} onChange={e => setNewName(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && (setSelSub(sub), addUnit())} />
                      <button className="sf-btn sf-btn-p" style={{ padding: "10px 16px" }} onClick={() => { setSelSub(sub); addUnit(); }}>+</button>
                      <button className="sf-btn sf-btn-g" style={{ padding: "10px 14px" }} onClick={() => setAddMode(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="sf-btn sf-btn-g" onClick={() => { setSelSub(sub); setAddMode(`un-${sub.id}`); setNewName(""); }} style={{ width: "100%", justifyContent: "center", marginTop: 14, fontSize: ".85rem" }}>+ Add Unit</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD & GENERATE */}
        {tab === "upload" && (
          <div className="sf-in">
            <h2 className="sf-syne" style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Upload & Generate</h2>
            <p style={{ opacity: .5, fontSize: ".9rem", marginBottom: 28 }}>Paste your material and let AI build the questions for you</p>

            <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 22 }}>
              {/* Topic sidebar */}
              <div className="sf-glass" style={{ padding: 20, height: "fit-content", maxHeight: "80vh", overflowY: "auto" }}>
                <p className="sf-syne" style={{ fontSize: ".72rem", fontWeight: 700, opacity: .45, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 12 }}>Select Topic</p>
                {subjects.map(sub => (
                  <div key={sub.id} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 600, fontSize: ".875rem", padding: "5px 4px", display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 15 }}>{sub.icon}</span>{sub.name}
                    </p>
                    {sub.units.map(unit => (
                      <div key={unit.id} style={{ paddingLeft: 10 }}>
                        <p style={{ fontSize: ".78rem", opacity: .45, padding: "3px 6px", fontWeight: 600 }}>{unit.name}</p>
                        {unit.topics.map(topic => (
                          <div key={topic.id}
                            className={`sf-si ${selTopic?.id === topic.id ? "sf-active" : ""}`}
                            onClick={() => { setSelSub(sub); setSelUnit(unit); setSelTopic(topic); setMatText(topic.material || ""); }}
                            style={{ paddingLeft: 16, marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          >
                            <span>{topic.name}</span>
                            <span className="sf-badge sf-mcq" style={{ fontSize: ".6rem", marginLeft: 6 }}>{topic.questions.length}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Main work area */}
              {!selTopic ? (
                <div className="sf-glass" style={{ padding: 60, textAlign: "center", opacity: .4 }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>👈</div>
                  <p className="sf-syne" style={{ fontWeight: 600 }}>Pick a topic from the sidebar</p>
                  <p style={{ fontSize: ".9rem", marginTop: 8, opacity: .7 }}>Then paste your notes, textbook extract, or any study material</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Topic header */}
                  <div className="sf-glass" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 className="sf-syne" style={{ fontWeight: 700 }}>{selTopic.name}</h3>
                      <p style={{ fontSize: ".84rem", opacity: .5, marginTop: 3 }}>{selSub?.name} → {selUnit?.name}</p>
                    </div>
                    <span className="sf-badge sf-mcq">{syncedTopic?.questions.length || 0} questions</span>
                  </div>

                  {/* Material input */}
                  <div className="sf-glass" style={{ padding: "22px 24px" }}>
                    <label className="sf-syne" style={{ display: "block", fontSize: ".72rem", fontWeight: 700, opacity: .45, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 10 }}>Study Material</label>
                    <textarea className="sf-inp" value={matText} onChange={e => setMatText(e.target.value)}
                      placeholder={`Paste your study material here — textbook text, notes, or any content.\n\nSupports: typed text, content copied from PDFs or Word docs.\n\nTip: Longer and more detailed material = better and more varied questions.`}
                      style={{ minHeight: 190 }} />
                    <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                      <button className="sf-btn sf-btn-g" onClick={saveMat}>💾 Save Material</button>
                      <span style={{ fontSize: ".82rem", opacity: .4 }}>{matText.length} characters</span>
                    </div>
                  </div>

                  {/* Generate */}
                  <div className="sf-glass" style={{ padding: "22px 24px" }}>
                    <h3 className="sf-syne" style={{ fontWeight: 700, marginBottom: 6 }}>⚡ Generate Questions with AI</h3>
                    <p style={{ fontSize: ".86rem", opacity: .5, marginBottom: 18 }}>Creates MCQ, True/False, Fill in Blank, and Short Answer questions</p>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <label className="sf-syne" style={{ fontSize: ".8rem", fontWeight: 600, opacity: .55, whiteSpace: "nowrap" }}>Questions: {genCount}</label>
                      <input type="range" min={4} max={24} step={4} value={genCount} onChange={e => setGenCount(+e.target.value)} style={{ flex: 1 }} />
                      <span className="sf-syne" style={{ fontSize: ".8rem", opacity: .5, minWidth: 28 }}>{genCount}</span>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <button className="sf-btn sf-btn-p" onClick={doGenerate} disabled={gen || !matText.trim()} style={{ flex: 1, justifyContent: "center", minWidth: 180 }}>
                        {gen ? <><div className="sf-spin" />Generating…</> : "⚡ Generate Now"}
                      </button>
                      {syncedTopic && syncedTopic.questions.length > 0 && (
                        <button className="sf-btn sf-btn-d" onClick={clearQs} style={{ whiteSpace: "nowrap" }}>🗑 Clear All</button>
                      )}
                    </div>

                    {genMsg && (
                      <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: msgBg, color: msgColor, fontSize: ".875rem" }}>{genMsg}</div>
                    )}
                  </div>

                  {/* Question preview */}
                  {syncedTopic && syncedTopic.questions.length > 0 && (
                    <div className="sf-glass" style={{ padding: "22px 24px" }}>
                      <h3 className="sf-syne" style={{ fontWeight: 700, marginBottom: 14 }}>Preview — {syncedTopic.questions.length} Questions</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxHeight: 320, overflowY: "auto" }}>
                        {syncedTopic.questions.map((q, i) => (
                          <div key={q.id} style={{ padding: "11px 14px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.1)"}` }}>
                            <div style={{ display: "flex", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
                              <span className={`sf-badge sf-${q.type}`}>{q.type === "truefalse" ? "T/F" : q.type === "fillblank" ? "Fill" : q.type === "shortanswer" ? "Short" : "MCQ"}</span>
                              <span className={`sf-badge sf-${q.difficulty}`}>{q.difficulty}</span>
                            </div>
                            <p style={{ fontSize: ".875rem" }}>Q{i+1}. {q.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Student Dashboard ──────────────────────────────────────────────
function Student({ subjects, user, dark, onQuiz }) {
  const [selSub, setSelSub] = useState(null);
  const [selUnit, setSelUnit] = useState(null);
  const [selTopic, setSelTopic] = useState(null);
  const [diff, setDiff] = useState("all");
  const acc = dark ? "#4FFFB0" : "#6366F1";
  const scores = user.scores || [];
  const avg = scores.length ? Math.round(scores.reduce((a,s)=>a+s.pct,0)/scores.length) : 0;

  if (selTopic) {
    const filtered = diff === "all" ? selTopic.questions : selTopic.questions.filter(q => q.difficulty === diff);
    return (
      <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1, padding: "80px 28px 36px" }}>
        <button className="sf-btn sf-btn-g" onClick={() => setSelTopic(null)} style={{ marginBottom: 20 }}>← Back</button>
        <div className="sf-glass sf-up" style={{ padding: 30, maxWidth: 700 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <h2 className="sf-syne" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{selTopic.name}</h2>
              <p style={{ opacity: .5, fontSize: ".875rem", marginTop: 4 }}>{selSub.name} → {selUnit.name}</p>
            </div>
            <span className="sf-badge sf-mcq">{selTopic.questions.length}Q</span>
          </div>

          {selTopic.questions.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", opacity: .4 }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
              <p className="sf-syne" style={{ fontWeight: 600 }}>No questions yet</p>
              <p style={{ fontSize: ".875rem", marginTop: 8 }}>Ask your teacher to upload material and generate questions</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                {["all","easy","medium","hard"].map(d => (
                  <button key={d} className={`sf-tab ${diff===d?"sf-active":""}`} onClick={() => setDiff(d)} style={{ textTransform: "capitalize" }}>
                    {d === "all" ? "All" : d} {d !== "all" && `(${selTopic.questions.filter(q=>q.difficulty===d).length})`}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                {["mcq","truefalse","fillblank","shortanswer"].map(t => {
                  const n = filtered.filter(q=>q.type===t).length;
                  return n > 0 ? (
                    <span key={t} style={{ fontSize: ".84rem", opacity: .7 }}>
                      <span className={`sf-badge sf-${t}`}>{t==="truefalse"?"T/F":t==="fillblank"?"Fill":t==="shortanswer"?"Short":"MCQ"}</span>
                      <span style={{ marginLeft: 6 }}>{n}</span>
                    </span>
                  ) : null;
                })}
              </div>
              <p style={{ opacity: .5, fontSize: ".875rem", marginBottom: 22 }}>{filtered.length} questions with this filter</p>
              <button className="sf-btn sf-btn-p" style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: 15 }}
                onClick={() => onQuiz({ topic: selTopic, subject: selSub, unit: selUnit, questions: filtered })}>
                Start Quiz →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ padding: "32px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 className="sf-syne sf-up" style={{ fontSize: "2.1rem", fontWeight: 800, letterSpacing: "-.03em" }}>Hello, {user.name.split(" ")[0]} 👋</h1>
            <p style={{ opacity: .5, marginTop: 7 }}>What are you studying today?</p>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[{l:"Quizzes",v:scores.length},{l:"Avg Score",v:scores.length?`${avg}%`:"—"}].map(s => (
              <div key={s.l} className="sf-glass" style={{ padding: "14px 20px", textAlign: "center", minWidth: 90 }}>
                <p className="sf-syne" style={{ fontSize: "1.4rem", fontWeight: 800, color: acc }}>{s.v}</p>
                <p style={{ fontSize: ".75rem", opacity: .5 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {scores.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p className="sf-syne" style={{ fontSize: ".72rem", fontWeight: 700, opacity: .38, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 10 }}>Recent Quizzes</p>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {scores.slice(-5).reverse().map((s,i) => (
                <div key={i} className="sf-glass" style={{ padding: "12px 16px", minWidth: 155, flexShrink: 0 }}>
                  <p style={{ fontSize: ".78rem", opacity: .55, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.topic}</p>
                  <p className="sf-syne" style={{ fontWeight: 800, fontSize: "1.25rem", color: s.pct >= 70 ? "#4FFFB0" : s.pct >= 50 ? "#FBB924" : "#FF5C7A" }}>{s.pct}%</p>
                  <p style={{ fontSize: ".72rem", opacity: .4 }}>{s.correct}/{s.total} correct</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 28px 36px" }}>
        <p className="sf-syne" style={{ fontSize: ".72rem", fontWeight: 700, opacity: .38, letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 14 }}>Subjects</p>
        {subjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, opacity: .35 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p className="sf-syne" style={{ fontWeight: 600 }}>No subjects yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {subjects.map(sub => (
              <div key={sub.id} className="sf-card">
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>{sub.icon}</span>
                  <div>
                    <h3 className="sf-syne" style={{ fontWeight: 700 }}>{sub.name}</h3>
                    <p style={{ fontSize: ".8rem", opacity: .45 }}>{sub.units.reduce((a,u)=>a+u.topics.length,0)} topics</p>
                  </div>
                </div>
                {sub.units.map(unit => (
                  <div key={unit.id} style={{ marginBottom: 10 }}>
                    <p className="sf-syne" style={{ fontSize: ".72rem", fontWeight: 700, opacity: .38, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 7 }}>{unit.name}</p>
                    {unit.topics.map(topic => (
                      <div key={topic.id}
                        onClick={() => { setSelSub(sub); setSelUnit(unit); setSelTopic(topic); }}
                        style={{ padding: "9px 12px", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)", transition: "all .2s" }}
                        onMouseOver={e => { e.currentTarget.style.background = dark ? "rgba(79,255,176,0.07)" : "rgba(99,102,241,0.08)"; e.currentTarget.style.paddingLeft = "16px"; }}
                        onMouseOut={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)"; e.currentTarget.style.paddingLeft = "12px"; }}
                      >
                        <span style={{ fontSize: ".875rem" }}>{topic.name}</span>
                        <span style={{ fontSize: ".75rem", opacity: .45 }}>{topic.questions.length}Q →</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quiz Interface ─────────────────────────────────────────────────
function Quiz({ quiz, dark, onFinish }) {
  const { questions, topic, subject } = quiz;
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(questions.length * 45);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const timerRef = useRef(null);
  const acc = dark ? "#4FFFB0" : "#6366F1";
  const q = questions[cur];

  const finish = () => { setDone(true); clearInterval(timerRef.current); };

  useEffect(() => {
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); finish(); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const answer = (val) => {
    setAnswers(p => ({ ...p, [q.id]: val }));
    if (q.type === "mcq" || q.type === "truefalse") setRevealed(p => ({ ...p, [q.id]: true }));
  };

  const next = () => {
    if (cur < questions.length - 1) { setCur(c => c + 1); setText(""); }
    else finish();
  };

  if (done) {
    let correct = 0;
    questions.forEach(q => {
      const a = answers[q.id];
      if (q.type === "mcq") { if (a === q.answer) correct++; }
      else if (q.type === "truefalse") { if (a === q.answer) correct++; }
      else if (q.type === "fillblank") { if (typeof a === "string" && a.trim().toLowerCase() === q.answer.toLowerCase()) correct++; }
      else if (q.type === "shortanswer") { if (typeof a === "string" && a.trim().length > 5) correct += 0.5; }
    });
    correct = Math.round(correct);
    const pct = Math.round((correct / questions.length) * 100);
    return <Results correct={correct} total={questions.length} pct={pct} questions={questions} answers={answers} topic={topic} subject={subject} dark={dark} onFinish={() => onFinish({ correct, total: questions.length, pct, topic: topic.name })} />;
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const warn = timeLeft < 60;
  const rev = revealed[q.id];
  const isAnswered = answers[q.id] !== undefined;

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px 36px" }}>
      <div style={{ width: "100%", maxWidth: 680, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: ".8rem", opacity: .5 }}>{subject.name} → {topic.name}</p>
            <p className="sf-syne" style={{ fontWeight: 700, marginTop: 2 }}>Question {cur + 1} of {questions.length}</p>
          </div>
          <div className={warn ? "sf-warn" : ""} style={{ padding: "8px 16px", borderRadius: 50, background: warn ? "rgba(255,92,122,0.12)" : dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)", border: `1px solid ${warn ? "rgba(255,92,122,0.3)" : dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}` }}>
            <span className="sf-syne" style={{ fontWeight: 700, color: warn ? "#FF5C7A" : "inherit" }}>⏱ {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</span>
          </div>
        </div>
        <div className="sf-prog"><div className="sf-fill" style={{ width: `${((cur+1)/questions.length)*100}%` }} /></div>
      </div>

      <div className="sf-glass sf-up" style={{ width: "100%", maxWidth: 680, padding: 32 }} key={q.id}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span className={`sf-badge sf-${q.type}`}>{q.type==="truefalse"?"True / False":q.type==="fillblank"?"Fill in Blank":q.type==="shortanswer"?"Short Answer":"MCQ"}</span>
          <span className={`sf-badge sf-${q.difficulty}`}>{q.difficulty}</span>
        </div>

        <p style={{ fontSize: "1.15rem", fontWeight: 500, lineHeight: 1.65, marginBottom: 24 }}>{q.question}</p>

        {q.type === "mcq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              let cls = "sf-qopt";
              if (rev) { if (i === q.answer) cls += " sf-correct"; else if (answers[q.id] === i && i !== q.answer) cls += " sf-wrong"; }
              else if (answers[q.id] === i) cls += " sf-sel";
              return <button key={i} className={cls} disabled={rev} onClick={() => answer(i)}><span style={{ opacity: .45, marginRight: 10, fontWeight: 700 }}>{String.fromCharCode(65+i)}.</span>{opt}</button>;
            })}
          </div>
        )}

        {q.type === "truefalse" && (
          <div style={{ display: "flex", gap: 12 }}>
            {[true, false].map(val => {
              let cls = "sf-qopt";
              if (rev) { if (val === q.answer) cls += " sf-correct"; else if (answers[q.id] === val && val !== q.answer) cls += " sf-wrong"; }
              else if (answers[q.id] === val) cls += " sf-sel";
              return <button key={String(val)} className={cls} disabled={rev} onClick={() => answer(val)} style={{ flex: 1, justifyContent: "center", padding: 18, fontWeight: 600, fontSize: "1rem" }}>{val ? "✓ True" : "✗ False"}</button>;
            })}
          </div>
        )}

        {q.type === "fillblank" && (
          <div>
            <input className="sf-inp" placeholder="Type your answer here…" value={text} onChange={e => setText(e.target.value)} disabled={rev} onKeyDown={e => { if (e.key==="Enter"&&text.trim()&&!rev) { answer(text); setRevealed(p=>({...p,[q.id]:true})); }}} />
            {rev && (
              <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: text.trim().toLowerCase()===q.answer.toLowerCase() ? "rgba(79,255,176,0.1)" : "rgba(255,92,122,0.1)" }}>
                <p style={{ fontWeight: 600, fontSize: ".875rem", color: text.trim().toLowerCase()===q.answer.toLowerCase() ? "#4FFFB0" : "#FF5C7A" }}>
                  {text.trim().toLowerCase()===q.answer.toLowerCase() ? "✓ Correct!" : `✗ Answer: ${q.answer}`}
                </p>
              </div>
            )}
            {!rev && <button className="sf-btn sf-btn-p" style={{ marginTop: 12 }} onClick={() => { answer(text); setRevealed(p=>({...p,[q.id]:true})); }} disabled={!text.trim()}>Check Answer</button>}
          </div>
        )}

        {q.type === "shortanswer" && (
          <div>
            <textarea className="sf-inp" placeholder="Write your answer here…" value={text} onChange={e => setText(e.target.value)} disabled={rev} style={{ minHeight: 100 }} />
            {rev && (
              <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(251,185,36,0.08)", border: "1px solid rgba(251,185,36,0.2)" }}>
                <p className="sf-syne" style={{ fontSize: ".75rem", fontWeight: 700, color: "#FBB924", marginBottom: 6, letterSpacing: ".06em" }}>MODEL ANSWER</p>
                <p style={{ fontSize: ".875rem", opacity: .8 }}>{q.answer}</p>
              </div>
            )}
            {!rev && <button className="sf-btn sf-btn-p" style={{ marginTop: 12 }} onClick={() => { answer(text); setRevealed(p=>({...p,[q.id]:true})); }} disabled={!text.trim()}>Submit & See Answer</button>}
          </div>
        )}

        {rev && (
          <button className="sf-btn sf-btn-p sf-in" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={next}>
            {cur < questions.length - 1 ? "Next Question →" : "See Results →"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {!rev && <button className="sf-btn sf-btn-g" onClick={() => { if (q.type==="mcq"||q.type==="truefalse") setRevealed(p=>({...p,[q.id]:true})); else next(); }}>
          {q.type==="mcq"||q.type==="truefalse" ? "Skip (reveal answer)" : "Skip →"}
        </button>}
        <button className="sf-btn sf-btn-g" onClick={finish} style={{ opacity: .45 }}>End Quiz</button>
      </div>
    </div>
  );
}

// ── Results ────────────────────────────────────────────────────────
function Results({ correct, total, pct, questions, answers, topic, subject, dark, onFinish }) {
  const acc = dark ? "#4FFFB0" : "#6366F1";
  const circ = 2 * Math.PI * 46;
  const offset = circ - (pct / 100) * circ;
  const grade = pct >= 90 ? "Excellent!" : pct >= 75 ? "Great job!" : pct >= 60 ? "Good work!" : pct >= 40 ? "Keep going!" : "More practice needed";
  const emoji = pct >= 90 ? "🏆" : pct >= 75 ? "🌟" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px 48px" }}>
      <div style={{ width: "100%", maxWidth: 680 }}>
        <div className="sf-glass sf-up" style={{ padding: "40px 36px", textAlign: "center", marginBottom: 18 }}>
          <svg width="124" height="124" style={{ margin: "0 auto 20px", display: "block" }}>
            <circle cx="62" cy="62" r="46" fill="none" stroke={dark?"rgba(255,255,255,0.07)":"rgba(99,102,241,0.1)"} strokeWidth="8" />
            <circle cx="62" cy="62" r="46" fill="none" stroke={acc} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 62 62)"
              style={{ transition: "stroke-dashoffset 1.2s ease" }} />
            <text x="62" y="57" textAnchor="middle" fontSize="22" fontWeight="800" fill={acc} fontFamily="Syne,sans-serif">{pct}%</text>
            <text x="62" y="75" textAnchor="middle" fontSize="11" fill={dark?"rgba(232,234,246,0.4)":"rgba(30,31,59,0.4)"} fontFamily="DM Sans,sans-serif">{correct}/{total}</text>
          </svg>
          <h2 className="sf-syne" style={{ fontSize: "1.8rem", fontWeight: 800 }}>{emoji} {grade}</h2>
          <p style={{ opacity: .5, marginTop: 7 }}>{topic.name} · {subject.name}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 24 }}>
            {[{l:"Correct",v:correct,c:"#4FFFB0"},{l:"Wrong",v:total-correct,c:"#FF5C7A"},{l:"Total",v:total,c:acc}].map(s => (
              <div key={s.l} style={{ padding: "12px 20px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)" }}>
                <p className="sf-syne" style={{ fontWeight: 800, fontSize: "1.4rem", color: s.c }}>{s.v}</p>
                <p style={{ fontSize: ".75rem", opacity: .5 }}>{s.l}</p>
              </div>
            ))}
          </div>
          <button className="sf-btn sf-btn-p" style={{ marginTop: 28, justifyContent: "center" }} onClick={onFinish}>Back to Dashboard →</button>
        </div>

        <div className="sf-glass" style={{ padding: "22px 24px" }}>
          <h3 className="sf-syne" style={{ fontWeight: 700, marginBottom: 16 }}>Answer Review</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {questions.map((q, i) => {
              const a = answers[q.id];
              let ok = false;
              if (q.type==="mcq") ok = a===q.answer;
              else if (q.type==="truefalse") ok = a===q.answer;
              else if (q.type==="fillblank") ok = typeof a==="string"&&a.trim().toLowerCase()===q.answer.toLowerCase();
              else if (q.type==="shortanswer") ok = typeof a==="string"&&a.trim().length>5;

              return (
                <div key={q.id} style={{ padding: "13px 15px", borderRadius: 12, background: dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.5)", border: `1px solid ${ok?"rgba(79,255,176,0.2)":a?"rgba(255,92,122,0.2)":dark?"rgba(255,255,255,0.06)":"rgba(99,102,241,0.1)"}` }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: ".85rem", color: ok?"#4FFFB0":a?"#FF5C7A":"#FBB924" }}>{ok?"✓":a?"✗":"—"}</span>
                    <span className={`sf-badge sf-${q.type}`}>{q.type==="truefalse"?"T/F":q.type==="fillblank"?"Fill":q.type==="shortanswer"?"Short":"MCQ"}</span>
                    <span className={`sf-badge sf-${q.difficulty}`}>{q.difficulty}</span>
                  </div>
                  <p style={{ fontSize: ".875rem", marginBottom: 5 }}>Q{i+1}. {q.question}</p>
                  {!ok && a!==undefined && q.type!=="shortanswer" && (
                    <p style={{ fontSize: ".8rem", color: "#FF5C7A", opacity: .8 }}>Your answer: {q.type==="mcq"?q.options[a]:String(a)}</p>
                  )}
                  {q.type!=="shortanswer" && (
                    <p style={{ fontSize: ".8rem", color: "#4FFFB0", opacity: .8 }}>Correct: {q.type==="mcq"?q.options[q.answer]:String(q.answer)}</p>
                  )}
                  {q.type==="shortanswer" && (
                    <p style={{ fontSize: ".8rem", opacity: .55, marginTop: 4 }}>Model answer: {q.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────
function App() {
  const [dark, setDark] = useState(() => JSON.parse(localStorage.getItem("sf_dark")) ?? true);
  const [subjects, setSubjects] = useState(() => JSON.parse(localStorage.getItem("sf_subjects")) || []);
  const [user, setUser] = useState(null);
  const [authInit, setAuthInit] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // Save data to Local Storage whenever it changes
  useEffect(() => { localStorage.setItem("sf_dark", JSON.stringify(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem("sf_subjects", JSON.stringify(subjects)); }, [subjects]);

  // Listen for Firebase Login Status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // Automatically make them Admin if it matches your email!
        const isAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role: isAdmin ? "admin" : "student",
          scores: JSON.parse(localStorage.getItem(`sf_scores_${firebaseUser.uid}`)) || []
        });
      } else {
        setUser(null);
      }
      setAuthInit(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { injectCSS(dark); }, [dark]);

  const logout = () => { auth.signOut(); setQuiz(null); };

  const finishQuiz = (result) => {
    const newScores = [...(user.scores||[]), result];
    localStorage.setItem(`sf_scores_${user.id}`, JSON.stringify(newScores));
    setUser(p => ({ ...p, scores: newScores }));
    setQuiz(null);
  };

  if (!authInit) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: dark ? "#fff" : "#000", fontFamily: "'Syne', sans-serif", fontSize: "1.2rem" }}><div className="sf-spin" style={{ marginRight: 10 }}></div> Loading StudyFlow...</div>;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Blobs dark={dark} />
      <Navbar user={user} dark={dark} onToggle={() => setDark(d => !d)} onLogout={logout} />
      
      {!user && <Login dark={dark} />}
      {user && !quiz && user.role === "admin" && <Admin subjects={subjects} setSubjects={setSubjects} dark={dark} onQuiz={setQuiz} />}
      {user && !quiz && user.role === "student" && <Student subjects={subjects} user={user} dark={dark} onQuiz={setQuiz} />}
      {user && quiz && <Quiz quiz={quiz} dark={dark} onFinish={finishQuiz} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
