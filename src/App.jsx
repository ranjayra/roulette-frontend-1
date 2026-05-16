import React, { useState, useEffect, useCallback, useRef } from "react";
import Auth from "./Auth";
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import "./App.css";

// ─── ROULETTE CONFIG ────────────────────────────────────────────────────────
const NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3];
const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

const getSegColor = (n) => {
  if (n === 0) return { fill: '#0d2e1a', stroke: '#1a6e3a', text: '#4dcc80' };
  if (RED_NUMS.includes(n)) return { fill: '#2a0a12', stroke: '#7a1830', text: '#d4607a' };
  return { fill: '#0a0a10', stroke: '#2a2a3a', text: '#9090b8' };
};

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://roulette-app-zov4.onrender.com";

// ─── INLINE STYLES ─────────────────────────────────────────────────────────
const S = {
  app: { minHeight: '100vh', background: '#07090f', color: '#f0e6cc', fontFamily: "'Montserrat', sans-serif", position: 'relative', overflowX: 'hidden' },
  ambientBg: { position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 90% 70% at 50% 0%, #0d1f17 0%, #080c09 55%, #07090f 100%)', pointerEvents: 'none' },
  ambientSpot1: { position: 'fixed', top: '-100px', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  ambientSpot2: { position: 'fixed', bottom: '-50px', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(22,53,38,0.3) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  inner: { position: 'relative', zIndex: 2, maxWidth: '1380px', margin: '0 auto', padding: '0 20px 48px' },
  header: { textAlign: 'center', padding: '8px 0 0' },
  ornamentRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '2px' },
  ornamentLine: { flex: 1, maxWidth: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' },
  ornamentDiamond: { width: '5px', height: '5px', background: '#c9a84c', transform: 'rotate(45deg)', flexShrink: 0 },
  casinoName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(14px,2.5vw,22px)', fontWeight: 700, letterSpacing: '0.2em', color: '#e8c97a', textTransform: 'uppercase' },
  casinoSub: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '10px', color: '#6a5a30', letterSpacing: '0.1em', marginTop: '2px' },
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(201,168,76,0.2)', marginTop: '6px', flexWrap: 'wrap', gap: '8px' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  balChip: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '40px', padding: '4px 12px' },
  balLabel: { fontSize: '8px', letterSpacing: '0.12em', color: '#6a5a30', textTransform: 'uppercase' },
  balAmount: { fontFamily: "'Cinzel', serif", fontSize: '14px', color: '#e8c97a', fontWeight: 600 },
  liveBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4caf7d', border: '1px solid rgba(76,175,101,0.3)', borderRadius: '20px', padding: '3px 8px' },
  liveDot: { width: '4px', height: '4px', background: '#4caf7d', borderRadius: '50%' },
  tableInfo: { fontSize: '9px', color: '#5a4a28', letterSpacing: '0.05em' },
  btn: { fontFamily: "'Montserrat', sans-serif", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid rgba(201,168,76,0.4)', background: 'transparent', color: '#c9a84c', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s' },
  btnAdmin: { fontFamily: "'Montserrat', sans-serif", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid rgba(201,168,76,0.25)', background: 'transparent', color: '#8a7a50', cursor: 'pointer', borderRadius: '2px' },
  btnLogout: { fontFamily: "'Montserrat', sans-serif", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px', border: '1px solid rgba(160,37,64,0.4)', background: 'transparent', color: '#c06080', cursor: 'pointer', borderRadius: '2px' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 460px 270px', gap: '20px', marginTop: '16px', alignItems: 'start' },
  sectionStack: { display: 'flex', flexDirection: 'column', gap: '16px' },
  panel: { background: 'rgba(8,10,14,0.75)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '2px', backdropFilter: 'blur(6px)', overflow: 'hidden' },
  panelDark: { background: 'rgba(6,12,8,0.88)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '2px', backdropFilter: 'blur(6px)', overflow: 'hidden' },
  panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(201,168,76,0.12)', background: 'rgba(201,168,76,0.03)' },
  panelTitle: { fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a08a50' },
  panelBody: { padding: '14px' },
  wheelWrap: { position: 'relative', width: '340px', height: '340px', margin: '0 auto' },
  wheelGlow: { position: 'absolute', inset: '-24px', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' },
  winBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' },
  winLabel: { fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a4a28', marginBottom: '6px' },
  winNum: (n) => { const c = getSegColor(n); return { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, border: '2px solid rgba(201,168,76,0.6)', background: c.fill, color: c.text, boxShadow: '0 0 18px rgba(201,168,76,0.2)' }; },
  winNumEmpty: { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, border: '2px solid rgba(201,168,76,0.2)', background: '#0a0a12', color: '#3a3a50' },
  toast: (type) => ({ padding: '8px 16px', borderRadius: '2px', fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '0.06em', textAlign: 'center', marginTop: '10px', border: '1px solid', ...(type === 'win' ? { background: 'rgba(76,175,101,0.1)', borderColor: 'rgba(76,175,101,0.35)', color: '#6ddf9d' } : { background: 'rgba(160,37,64,0.1)', borderColor: 'rgba(160,37,64,0.35)', color: '#e07090' }) }),
  chipsRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' },
  chip: (color, isActive) => ({ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '7px', fontWeight: 700, cursor: 'pointer', border: `2px ${isActive ? 'solid' : 'dashed'} rgba(255,255,255,0.22)`, transition: 'all 0.15s', flexShrink: 0, ...color, ...(isActive ? { boxShadow: '0 0 12px rgba(201,168,76,0.5)', transform: 'scale(1.08)' } : {}) }),
  betInput: { width: '100%', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '2px', padding: '8px 12px', fontFamily: "'Cinzel', serif", fontSize: '16px', color: '#e8c97a', outline: 'none', textAlign: 'center' },
  quickBets: { display: 'flex', gap: '6px', marginTop: '8px' },
  qbet: { flex: 1, padding: '5px 4px', fontSize: '9px', fontFamily: "'Cinzel', serif", border: '1px solid rgba(201,168,76,0.2)', background: 'transparent', color: '#8a7a50', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.05em' },
  selectedSummary: { background: 'rgba(201,168,76,0.05)', borderRadius: '2px', padding: '8px', marginTop: '8px', marginBottom: '8px', border: '1px solid rgba(201,168,76,0.15)' },
  selectedCount: { fontSize: '10px', color: '#e8c97a', fontFamily: "'Cinzel', serif", marginBottom: '4px' },
  selectedTags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' },
  selectedTag: (n) => { const c = getSegColor(n); return { padding: '2px 8px', borderRadius: '2px', background: c.fill, border: `1px solid ${c.stroke}`, fontSize: '9px', fontFamily: "'Cinzel', serif", color: c.text, fontWeight: 600 }; },
  numGrid: { display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px', marginTop: '4px' },
  numCell: (n, selected) => {
    const c = getSegColor(n);
    return { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '10px', fontWeight: 700, borderRadius: '2px', cursor: 'pointer', border: selected ? '1.5px solid #e8c97a' : `1px solid ${c.stroke}`, background: selected ? 'rgba(201,168,76,0.25)' : c.fill, color: c.text, transition: 'all 0.15s', transform: selected ? 'scale(1.08)' : 'scale(1)', boxShadow: selected ? '0 0 8px rgba(201,168,76,0.6)' : 'none' };
  },
  spinBtn: (spinning) => ({ width: '100%', padding: '12px', fontFamily: "'Cinzel', serif", fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #162519 0%, #0c1810 100%)', border: `1px solid ${spinning ? '#c9a84c' : '#e8c97a'}`, color: '#e8c97a', cursor: spinning ? 'not-allowed' : 'pointer', borderRadius: '2px', marginTop: '12px', opacity: spinning ? 0.65 : 1, transition: 'all 0.2s' }),
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  statCard: { background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '2px', padding: '8px 10px' },
  statVal: { fontFamily: "'Cinzel', serif", fontSize: '16px', color: '#e8c97a' },
  statLabel: { fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a4a28', marginTop: '2px' },
  histItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(201,168,76,0.07)' },
  histNum: (n) => { const c = getSegColor(n); return { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '9px', fontWeight: 700, flexShrink: 0, background: c.fill, color: c.text, border: `1px solid ${c.stroke}` }; },
  histDetails: { flex: 1 },
  histBet: { fontSize: '9px', color: '#5a4a28' },
  histTime: { fontSize: '8px', color: '#3a3020' },
  histWin: (pos) => ({ fontFamily: "'Cinzel', serif", fontSize: '10px', color: pos ? '#6ddf9d' : '#e07090', flexShrink: 0 }),
  decoDivider: { display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' },
  decoLine: { flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' },
  decoCenter: { fontSize: '7px', letterSpacing: '0.15em', color: '#3a3020' },
  secLabel: { fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a4a28', marginBottom: '6px' },
};

function FontLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Cormorant+Garamond:ital,wght@1,300&family=Cinzel:wght@400;600;700&family=Montserrat:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);
  return null;
}

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #07090f !important; }
      @keyframes pulseDot { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(76,175,101,0.4)}50%{opacity:.7;box-shadow:0 0 0 5px transparent} }
      @keyframes toastIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
      @keyframes winPop { 0%,100%{transform:scale(1)}50%{transform:scale(1.22);box-shadow:0 0 18px rgba(201,168,76,0.7)} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 6px rgba(201,168,76,0.25)}50%{box-shadow:0 0 22px rgba(201,168,76,0.55)} }
      @keyframes ballRoll { 0%{transform:scale(1)}100%{transform:scale(1)} }
      .live-dot-anim { animation: pulseDot 1.5s infinite; }
      .spin-glow { animation: glowPulse 1s infinite; }
      .num-win-pop { animation: winPop 0.6s ease; }
      .toast-anim { animation: toastIn 0.3s ease; }
      @media(max-width:1100px){ .main-casino-grid{ grid-template-columns: 1fr 420px !important; } .history-col{ display:none; } }
      @media(max-width:760px){ .main-casino-grid{ grid-template-columns: 1fr !important; } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

// ─── WHEEL COMPONENT - NO POINTER, ONLY BALL ─────────────────────────────────
function RouletteWheel({ rotation, ballPos }) {
  const cx = 170, cy = 170, outerR = 152, innerR = 48;
  const segAngle = 360 / NUMBERS.length;

  const segments = NUMBERS.map((num, i) => {
    const sa = (i * segAngle - 90) * Math.PI / 180;
    const ea = ((i + 1) * segAngle - 90) * Math.PI / 180;
    const x1 = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(sa), iy1 = cy + innerR * Math.sin(sa);
    const ix2 = cx + innerR * Math.cos(ea), iy2 = cy + innerR * Math.sin(ea);
    const ma = ((i + 0.5) * segAngle - 90) * Math.PI / 180;
    const tr = (outerR + innerR) / 2;
    const tx = cx + tr * Math.cos(ma), ty = cy + tr * Math.sin(ma);
    const ta = (i + 0.5) * segAngle;
    const c = getSegColor(num);
    return { num, pathD: `M${ix1},${iy1} L${x1},${y1} A${outerR},${outerR} 0 0,1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 0,0 ${ix1},${iy1}Z`, tx, ty, ta, fill: c.fill, stroke: c.stroke, text: c.text };
  });

  return (
    <svg viewBox="0 0 340 340" width="340" height="340"
      style={{ borderRadius: '50%', transform: `rotate(${rotation}deg)`, transition: 'none', display: 'block' }}>
      <circle cx={cx} cy={cy} r={outerR + 6} fill="#080c08" stroke="#c9a84c" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={outerR + 3} fill="none" stroke="#7a5c1e" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#c9a84c" strokeWidth="1" />

      {segments.map(s => (
        <g key={s.num}>
          <path d={s.pathD} fill={s.fill} stroke="#c9a84c" strokeWidth="0.7" />
          <text x={s.tx} y={s.ty} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${s.ta}, ${s.tx}, ${s.ty})`}
            fill={s.text} fontSize="10" fontWeight="700" fontFamily="Cinzel, serif"
            style={{ pointerEvents: 'none' }}>{s.num}</text>
        </g>
      ))}

      <circle cx={cx} cy={cy} r={innerR + 4} fill="#0a0e0a" stroke="#c9a84c" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR + 1} fill="none" stroke="#7a5c1e" strokeWidth="0.7" />
      <circle cx={cx} cy={cy} r="28" fill="#c9a84c" />
      <circle cx={cx} cy={cy} r="22" fill="#07090f" />
      <circle cx={cx} cy={cy} r="15" fill="#c9a84c" />
      <circle cx={cx} cy={cy} r="9" fill="#07090f" />
      <circle cx={cx} cy={cy} r="4" fill="#c9a84c" />

      {/* ONLY BALL - NO POINTER */}
      {ballPos && (
        <g>
          <circle cx={ballPos.x} cy={ballPos.y} r="9" fill="#f5e4b5" stroke="#c9a84c" strokeWidth="2" />
          <circle cx={ballPos.x - 2.5} cy={ballPos.y - 2.5} r="3" fill="rgba(255,255,255,0.8)" />
          <circle cx={ballPos.x + 1.5} cy={ballPos.y + 1.5} r="1.5" fill="rgba(0,0,0,0.3)" />
        </g>
      )}
    </svg>
  );
}

function NavigationBar({ user, onLogout, onAdminClick }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    navigate('/auth');
  };
  return (
    <div style={S.navbar}>
      <div style={S.navLeft}>
        <div style={S.liveBadge}>
          <div style={S.liveDot} className="live-dot-anim" />
          Live Table
        </div>
        <span style={S.tableInfo}>Table #7 · Min ₹50 · Max ₹50,000</span>
      </div>
      <div style={S.navRight}>
        {user && (
          <>
            <span style={{ fontSize: '10px', color: '#6a5a30', letterSpacing: '0.06em' }}>
              👤 {user.username || user.email?.split('@')[0]}
            </span>
            <div style={S.balChip}>
              <div>
                <div style={S.balLabel}>Balance</div>
                <div style={S.balAmount}>₹{(user.balance || 0).toLocaleString()}</div>
              </div>
            </div>
          </>
        )}
        <button style={S.btnAdmin} onClick={() => { if (onAdminClick) onAdminClick(); navigate('/admin-login'); }}>👑 Admin</button>
        {user && <button style={S.btnLogout} onClick={handleLogout}>Logout</button>}
      </div>
    </div>
  );
}

const CHIPS = [
  { val: 25, label: '₹25', bg: '#0e1e3a', color: '#6090d8' },
  { val: 50, label: '₹50', bg: '#0e2a18', color: '#50c870' },
  { val: 100, label: '₹100', bg: '#2a0e14', color: '#d05070' },
  { val: 500, label: '₹500', bg: '#2a1e04', color: '#d4a030' },
  { val: 1000, label: '₹1K', bg: '#1e0e2a', color: '#b070e0' },
];

function RouletteGame() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [betPerNumber, setBetPerNumber] = useState(100);
  const [chipVal, setChipVal] = useState(100);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState(null);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Waking up casino server…");
  const [rotation, setRotation] = useState(0);
  const [ballPos, setBallPos] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [netPL, setNetPL] = useState(0);
  const [numFreq, setNumFreq] = useState({});
  const rotRef = useRef(0);
  const ballAnimRef = useRef(null);
  const wheelAnimRef = useRef(null);
  const navigate = useNavigate();

  const fetchBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const res = await fetch(`${API_BASE_URL}/api/balance`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); if (d.balance !== undefined) { setBalance(d.balance); return true; } }
    } catch (e) {}
    return false;
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const res = await fetch(`${API_BASE_URL}/api/history`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setHistory(Array.isArray(d) ? d : []); return true; }
    } catch (e) {}
    return false;
  }, []);

  useEffect(() => {
    const loadingMsgs = ["Waking up casino server…", "Connecting to the table…", "🎰 Loading your chips…", "Almost ready…"];
    let idx = 0;
    const iv = setInterval(() => { if (idx < loadingMsgs.length - 1) { idx++; setLoadingText(loadingMsgs[idx]); } }, 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (!token || !savedUser) { navigate('/auth'); setIsLoading(false); return; }
      const userData = JSON.parse(savedUser);
      setUser(userData); setBalance(userData.balance || 1000);
      await Promise.allSettled([fetchBalance(), fetchHistory()]);
      setIsLoading(false);
    };
    init();
  }, [navigate, fetchBalance, fetchHistory]);

  const toggleNumber = (num) => {
    if (spinning) return;
    setSelectedNumbers(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const clearSelection = () => {
    if (spinning) return;
    setSelectedNumbers([]);
  };

  const totalBet = selectedNumbers.length * betPerNumber;

  // ✅ IMPORTANT: Get winning number from ball position
  // const getNumberFromBallPosition = useCallback((ballX, ballY) => {
  //   const cx = 170, cy = 170;
  //   // Calculate angle from center to ball
  //   const dx = ballX - cx;
  //   const dy = ballY - cy;
  //   let angle = Math.atan2(dy, dx) * 180 / Math.PI;
  //   angle = (angle + 90 + 360) % 360;
    
  //   // Adjust for wheel rotation
  //   const adjustedAngle = (angle - rotation + 360) % 360;
  //   const segAngle = 360 / NUMBERS.length;
  //   const segIndex = Math.floor(adjustedAngle / segAngle);
  //   const numberIndex = (segIndex + Math.floor(NUMBERS.length / 2)) % NUMBERS.length;
    
  //   return NUMBERS[numberIndex];
  // }, [rotation]);

  const animateBall = useCallback((duration, finalNumber, onComplete) => {
    const cx = 170, cy = 170, startR = 140, endR = 110;
    const start = performance.now();
    let angle = 0;
    let finalAngle = 0;

    // Calculate final angle for the winning number
    const winIdx = NUMBERS.indexOf(finalNumber);
    const segAngle = 360 / NUMBERS.length;
    finalAngle = ((winIdx + 0.5) * segAngle - 90) * Math.PI / 180;

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      
      // Spiral motion: angle increases, radius decreases
      angle = Math.PI * 2 * 8 * eased; // 8 full rotations
      const rad = (angle - 90) * Math.PI / 180;
      const curR = startR * (1 - eased * 0.3);
      
      let x, y;
      if (t >= 0.95) {
        // Final approach - land exactly on winning number
        x = cx + endR * Math.cos(finalAngle);
        y = cy + endR * Math.sin(finalAngle);
      } else {
        x = cx + curR * Math.cos(rad + (finalAngle - rad) * eased);
        y = cy + curR * Math.sin(rad + (finalAngle - rad) * eased);
      }
      
      setBallPos({ x, y });
      
      if (t < 1) {
        ballAnimRef.current = requestAnimationFrame(frame);
      } else {
        // Animation complete - ball is on winning number
        if (onComplete) onComplete();
      }
    };
    
    if (ballAnimRef.current) cancelAnimationFrame(ballAnimRef.current);
    ballAnimRef.current = requestAnimationFrame(frame);
  }, []);

  const animateWheel = useCallback((totalRot, duration, onDone) => {
    const start = performance.now();
    const startRot = rotRef.current;

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const cur = startRot + totalRot * eased;
      setRotation(cur);
      if (t < 1) {
        wheelAnimRef.current = requestAnimationFrame(frame);
      } else {
        rotRef.current = cur % 360;
        if (onDone) onDone();
      }
    };
    if (wheelAnimRef.current) cancelAnimationFrame(wheelAnimRef.current);
    wheelAnimRef.current = requestAnimationFrame(frame);
  }, []);

  const spinWheel = useCallback(() => {
    if (spinning) return;
    if (selectedNumbers.length === 0) { setMessage({ text: 'Select at least one number first!', type: 'lose' }); return; }
    if (betPerNumber <= 0) { setMessage({ text: 'Enter a valid bet amount.', type: 'lose' }); return; }
    if (totalBet > balance) { setMessage({ text: 'Insufficient balance!', type: 'lose' }); return; }

    setSpinning(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/spin-multiple`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ betPerNumber: betPerNumber, selectedNumbers })
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setMessage({ text: data.error, type: 'lose' }); setSpinning(false); return; }

        const winNum = data.winningNumber;
        const DURATION = 4000;
        const totalRot = 360 * 10 + Math.random() * 360;

        animateWheel(totalRot, DURATION, () => {
          // After wheel stops, ball lands on winning number
          setWinningNumber(winNum);
          setBalance(data.balance);
          setUser(prev => { const u = { ...prev, balance: data.balance }; localStorage.setItem("user", JSON.stringify(u)); return u; });

          setSpinCount(p => p + 1);
          if (data.result === 'win') {
            setWinCount(p => p + 1);
            setNetPL(p => p + data.winAmount - totalBet);
            setMessage({ text: `🎉 You WIN! +₹${data.winAmount.toLocaleString()}`, type: 'win' });
          } else {
            setNetPL(p => p - totalBet);
            setMessage({ text: `Landed on ${winNum} — Try again!`, type: 'lose' });
          }
          setNumFreq(prev => ({ ...prev, [winNum]: (prev[winNum] || 0) + 1 }));
          fetchHistory();
          setSpinning(false);
          setSelectedNumbers([]);
          setTimeout(() => setMessage(null), 3500);
        });

        // Ball animation that lands exactly on winning number
        animateBall(DURATION, winNum);
      })
      .catch(err => {
        console.error(err);
        setMessage({ text: 'Server error — please try again.', type: 'lose' });
        setSpinning(false);
      });
  }, [spinning, selectedNumbers, betPerNumber, totalBet, balance, animateWheel, animateBall, fetchHistory]);

  const addMoney = async () => {
    const amount = prompt("Enter amount to add:", "1000");
    if (!amount || isNaN(amount) || +amount <= 0) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/add-balance`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const data = await res.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
        setUser(prev => { const u = { ...prev, balance: data.balance }; localStorage.setItem("user", JSON.stringify(u)); return u; });
      }
    } catch (e) { alert("Failed to add funds."); }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all spin history?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/history`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
      setHistory([]);
    } catch (e) {}
  };

  const hotCold = (() => {
    const entries = Object.entries(numFreq).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    return { hot: entries.slice(0, 5), cold: entries.slice(-5).reverse() };
  })();

  const winRate = spinCount ? Math.round(winCount / spinCount * 100) : 0;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#07090f', color: '#f0e6cc' }}>
        <FontLoader />
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '48px', marginBottom: '20px' }}>⚑</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '28px', letterSpacing: '0.3em', color: '#e8c97a', marginBottom: '6px' }}>MONACO GRANDE</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '16px', color: '#6a5a30', letterSpacing: '0.1em', marginBottom: '32px' }}>European Roulette · Est. MCMXXIV</div>
        <div style={{ width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', marginBottom: '28px' }} />
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', color: '#6a5a30', letterSpacing: '0.1em', textAlign: 'center', maxWidth: '300px' }}>{loadingText}</div>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#3a3020' }}>Free server cold start — please wait 30–60s</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <FontLoader />
      <GlobalStyles />
      <div style={S.app}>
        <div style={S.ambientBg} />
        <div style={S.ambientSpot1} />
        <div style={S.ambientSpot2} />

        <div style={S.inner}>
          <div style={S.header}>
            <div style={S.ornamentRow}>
              <div style={S.ornamentLine} />
              <div style={S.ornamentDiamond} />
              <div style={S.ornamentLine} />
            </div>
            <div style={S.casinoName}>Monaco Grande Casino</div>
            <div style={S.casinoSub}>European Roulette · Est. MCMXXIV</div>
            <NavigationBar user={{ ...user, balance }} onLogout={() => setUser(null)} />
          </div>

          <div className="main-casino-grid" style={S.mainGrid}>
            <div style={S.sectionStack}>
              <div style={S.panel}>
                <div style={S.panelHeader}>
                  <span style={S.panelTitle}>Place Your Bets</span>
                  <button style={S.btn} onClick={addMoney}>+ Add Funds</button>
                </div>
                <div style={S.panelBody}>
                  <div style={S.secLabel}>Select Chip Value</div>
                  <div style={S.chipsRow}>
                    {CHIPS.map(ch => (
                      <div key={ch.val}
                        style={S.chip({ background: ch.bg, color: ch.color }, chipVal === ch.val)}
                        onClick={() => { setChipVal(ch.val); setBetPerNumber(ch.val); }}>
                        {ch.label}
                      </div>
                    ))}
                  </div>
                  <div style={S.decoDivider}>
                    <div style={S.decoLine} /><div style={S.decoCenter}>◆ Bet Per Number ◆</div><div style={S.decoLine} />
                  </div>
                  <input type="number" style={S.betInput} value={betPerNumber} min="25"
                    onChange={e => setBetPerNumber(Math.max(25, Math.min(+e.target.value || 25, balance)))}
                    disabled={spinning} />
                  <div style={S.quickBets}>
                    {[['½', () => setBetPerNumber(b => Math.max(25, Math.floor(b / 2)))],
                      ['2×', () => setBetPerNumber(b => Math.min(b * 2, balance / (selectedNumbers.length || 1)))],
                      ['MAX', () => setBetPerNumber(Math.floor(balance / (selectedNumbers.length || 1)))],
                      ['CLEAR', () => setBetPerNumber(chipVal)]].map(([lbl, fn]) => (
                      <button key={lbl} style={S.qbet} onClick={fn} disabled={spinning}>{lbl}</button>
                    ))}
                  </div>

                  {selectedNumbers.length > 0 && (
                    <div style={S.selectedSummary}>
                      <div style={S.selectedCount}>📌 {selectedNumbers.length} Number{selectedNumbers.length !== 1 ? 's' : ''} selected</div>
                      <div style={S.selectedCount}>Total Bet: ₹{totalBet.toLocaleString()}</div>
                      <div style={S.selectedTags}>{selectedNumbers.map(n => (<span key={n} style={S.selectedTag(n)}>{n}</span>))}</div>
                      <button style={{ ...S.btn, marginTop: '6px', padding: '2px 8px', fontSize: '8px' }} onClick={clearSelection}>Clear All</button>
                    </div>
                  )}

                  <div style={S.decoDivider}><div style={S.decoLine} /><div style={S.decoCenter}>◆ Choose Numbers ◆</div><div style={S.decoLine} /></div>
                  <div style={S.secLabel}>Click numbers to select/deselect (0–36)</div>
                  <div style={S.numGrid}>
                    {NUMBERS.map(n => (
                      <div key={n} style={S.numCell(n, selectedNumbers.includes(n))} onClick={() => { if (!spinning) toggleNumber(n); }}>{n}</div>
                    ))}
                  </div>

                  <button style={S.spinBtn(spinning)} className={spinning ? 'spin-glow' : ''} onClick={spinWheel} disabled={spinning}>
                    {spinning ? '⟳  Spinning…' : `⚑  Spin (${selectedNumbers.length} nums)`}
                  </button>
                </div>
              </div>

              <div style={S.panel}>
                <div style={S.panelHeader}><span style={S.panelTitle}>Session Statistics</span></div>
                <div style={S.panelBody}>
                  <div style={S.statGrid}>
                    {[['Spins', spinCount, null], ['Wins', winCount, null],
                      ['Net P&L', `${netPL >= 0 ? '+' : ''}₹${Math.abs(netPL).toLocaleString()}`, netPL >= 0 ? '#6ddf9d' : '#e07090'],
                      ['Win Rate', `${winRate}%`, null]].map(([label, val, color]) => (
                      <div key={label} style={S.statCard}>
                        <div style={{ ...S.statVal, ...(color ? { color } : {}) }}>{val}</div>
                        <div style={S.statLabel}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={S.panelDark}>
              <div style={S.panelHeader}>
                <span style={S.panelTitle}>European Roulette — Single Zero</span>
                <span style={S.liveBadge}><span style={S.liveDot} className="live-dot-anim" />Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 16px' }}>
                <div style={S.wheelWrap}>
                  <div style={S.wheelGlow} />
                  {/* ONLY WHEEL WITH BALL - NO POINTER */}
                  <RouletteWheel rotation={rotation} ballPos={ballPos} />
                </div>
                <div style={S.winBadge}>
                  <div style={S.winLabel}>Last Result</div>
                  {winningNumber !== null ? <div style={S.winNum(winningNumber)} className="num-win-pop">{winningNumber}</div> : <div style={S.winNumEmpty}>—</div>}
                </div>
                {message && <div style={S.toast(message.type)} className="toast-anim">{message.text}</div>}
              </div>
            </div>

            <div className="history-col" style={S.sectionStack}>
              <div style={S.panel}>
                <div style={S.panelHeader}>
                  <span style={S.panelTitle}>Spin History</span>
                  <button style={{ ...S.btn, borderColor: 'rgba(160,37,64,0.3)', color: '#c06080', fontSize: '8px', padding: '4px 8px' }} onClick={clearHistory}>Clear</button>
                </div>
                <div style={{ ...S.panelBody, padding: '8px 12px' }}>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {history.length === 0 ? <div style={{ textAlign: 'center', padding: '20px 0', color: '#3a3020', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '12px' }}>No results yet — spin the wheel!</div>
                      : history.slice(0, 30).map((g, i) => {
                          const t = new Date(g.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const won = g.result === 'win';
                          const selectedCount = g.selectedNumbers?.length || 1;
                          return (
                            <div key={i} style={S.histItem}>
                              <div style={S.histNum(g.winningNumber)}>{g.winningNumber}</div>
                              <div style={S.histDetails}>
                                <div style={S.histBet}>₹{g.betPerNumber?.toLocaleString()} × {selectedCount} num{selectedCount !== 1 ? 's' : ''}</div>
                                <div style={S.histTime}>{t}</div>
                              </div>
                              <div style={S.histWin(won)}>{won ? `+₹${g.winAmount?.toLocaleString()}` : `-₹${g.totalBet?.toLocaleString()}`}</div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              </div>

              <div style={S.panel}>
                <div style={S.panelHeader}><span style={S.panelTitle}>Hot &amp; Cold Numbers</span></div>
                <div style={{ ...S.panelBody, padding: '10px 12px' }}>
                  <div style={S.secLabel}>🔥 Hot</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {hotCold.hot.length === 0 ? <span style={{ fontSize: '10px', color: '#3a3020', fontStyle: 'italic' }}>Spin to discover</span>
                      : hotCold.hot.map(([n, f]) => { const c = getSegColor(+n); return (<div key={n} style={{ textAlign: 'center' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.fill, color: c.text, border: `1px solid ${c.stroke}`, fontFamily: "'Cinzel', serif", fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '8px', color: '#5a4a28', marginTop: '2px' }}>{f}×</div></div>); })}
                  </div>
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)', margin: '6px 0 10px' }} />
                  <div style={S.secLabel}>❄️ Cold</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {hotCold.cold.length === 0 ? <span style={{ fontSize: '10px', color: '#3a3020', fontStyle: 'italic' }}>Spin to discover</span>
                      : hotCold.cold.map(([n, f]) => { const c = getSegColor(+n); return (<div key={n} style={{ textAlign: 'center' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.fill, color: c.text, border: `1px solid ${c.stroke}`, fontFamily: "'Cinzel', serif", fontSize: '9px', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '8px', color: '#5a4a28', marginTop: '2px' }}>{f}×</div></div>); })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminLoginWrapper({ onAdminLogin }) {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate('/')} style={{ position: 'fixed', top: '20px', left: '20px', padding: '8px 16px', background: '#c9a84c', color: '#07090f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', zIndex: 1000, fontFamily: "'Cinzel', serif", fontSize: '12px' }}>
        ← Back to Game
      </button>
      <AdminLogin onLogin={(adminData) => { if (onAdminLogin) onAdminLogin(adminData); navigate('/admin'); }} />
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (token && adminData) setAdmin(JSON.parse(adminData));
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RouletteGame />} />
        <Route path="/auth" element={<Auth setIsLoggedIn={() => {}} setUser={() => {}} />} />
        <Route path="/admin-login" element={<AdminLoginWrapper onAdminLogin={setAdmin} />} />
        <Route path="/admin" element={admin ? <AdminPanel admin={admin} onLogout={handleAdminLogout} /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}