import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, Legend, Cell, PieChart, Pie } from "recharts";

// ════════════════════════════════════════════════════════════════════
// LOGOS-44 · COSMIC ANALYSIS ENGINE · FULL TROPICAL + SIDEREAL
// Sławomir Grzegorz Gątkowski · 19.02.1983 · 10:53 · Sosnowiec
// ════════════════════════════════════════════════════════════════════

const AYANAMSA = 23.59; // Lahiri for Feb 19, 1983

// Natal tropical positions (absolute ecliptic degrees, 0° = 0° Aries)
const NATAL = {
  Sun:     { deg: 330.18, symbol: "☉", cat: "luminary", color: "#F59E0B", speed: "fast" },
  Moon:    { deg: 43.83,  symbol: "☽", cat: "luminary", color: "#C0C9D6", speed: "fast" },
  Mercury: { deg: 323.45, symbol: "☿", cat: "personal", color: "#6EE7B7", speed: "fast" },
  Venus:   { deg: 355.68, symbol: "♀", cat: "personal", color: "#F472B6", speed: "fast" },
  Mars:    { deg: 355.67, symbol: "♂", cat: "personal", color: "#EF4444", speed: "fast" },
  Jupiter: { deg: 246.82, symbol: "♃", cat: "social", color: "#818CF8", speed: "slow" },
  Saturn:  { deg: 213.47, symbol: "♄", cat: "social", color: "#A8A29E", speed: "slow" },
  Uranus:  { deg: 247.93, symbol: "♅", cat: "trans", color: "#22D3EE", speed: "slow" },
  Neptune: { deg: 268.12, symbol: "♆", cat: "trans", color: "#A78BFA", speed: "slow" },
  Pluto:   { deg: 208.33, symbol: "♇", cat: "trans", color: "#FB923C", speed: "slow" },
  NNode:   { deg: 82.50,  symbol: "☊", cat: "node", color: "#4ADE80", speed: "slow" },
  Chiron:  { deg: 69.75,  symbol: "⚷", cat: "asteroid", color: "#FDA4AF", speed: "slow" },
};

const ANGLES = {
  Asc: { deg: 73.00, symbol: "AC", color: "#34D399" },
  MC:  { deg: 343.00, symbol: "MC", color: "#FBBF24" },
  Dsc: { deg: 253.00, symbol: "DC", color: "#F87171" },
  IC:  { deg: 163.00, symbol: "IC", color: "#60A5FA" },
};

// House cusps (Placidus approximate for 50.29°N, 10:53 local)
const HOUSES = [73, 97, 124, 163, 195, 225, 253, 277, 304, 343, 15, 45];

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGNS_PL = ["Baran","Byk","Bliźnięta","Rak","Lew","Panna","Waga","Skorpion","Strzelec","Koziorożec","Wodnik","Ryby"];
const SIGN_SYM = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ELEMENTS = ["Ogień","Ziemia","Powietrze","Woda","Ogień","Ziemia","Powietrze","Woda","Ogień","Ziemia","Powietrze","Woda"];
const MODALITIES = ["Kardynalny","Stały","Zmienny","Kardynalny","Stały","Zmienny","Kardynalny","Stały","Zmienny","Kardynalny","Stały","Zmienny"];
const EL_COLORS = { Ogień: "#EF4444", Ziemia: "#84CC16", Powietrze: "#38BDF8", Woda: "#818CF8" };
const MOD_COLORS = { Kardynalny: "#F59E0B", Stały: "#10B981", Zmienny: "#A855F7" };

// Planetary dignities (sign rulers, exaltations, detriments, falls)
const RULERS = { 0:"Mars", 1:"Venus", 2:"Mercury", 3:"Moon", 4:"Sun", 5:"Mercury", 6:"Venus", 7:"Mars/Pluto", 8:"Jupiter", 9:"Saturn", 10:"Saturn/Uranus", 11:"Jupiter/Neptune" };
const EXALTATION = { 0:"Sun", 1:"Moon", 2:null, 3:"Jupiter", 4:null, 5:"Mercury", 6:"Saturn", 7:null, 8:null, 9:"Mars", 10:null, 11:"Venus" };
const DETRIMENT = { 0:"Venus", 1:"Mars/Pluto", 2:"Jupiter", 3:"Saturn", 4:"Saturn/Uranus", 5:"Jupiter/Neptune", 6:"Mars", 7:"Venus", 8:"Mercury", 9:"Moon", 10:"Sun", 11:"Mercury" };
const FALL = { 0:"Saturn", 1:null, 2:null, 3:"Mars", 4:null, 5:"Venus", 6:"Sun", 7:"Moon", 8:null, 9:"Jupiter", 10:null, 11:null };

const ASPECTS = [
  { name: "Koniunkcja", angle: 0,   orb: 8, sym: "☌", w: 10, col: "#F59E0B", nature: "fuzja" },
  { name: "Opozycja",   angle: 180, orb: 8, sym: "☍", w: 8, col: "#EF4444", nature: "napięcie" },
  { name: "Trygon",     angle: 120, orb: 7, sym: "△", w: 7, col: "#10B981", nature: "harmonia" },
  { name: "Kwadratura", angle: 90,  orb: 7, sym: "□", w: 6, col: "#F97316", nature: "napięcie" },
  { name: "Sekstyl",    angle: 60,  orb: 5, sym: "⚹", w: 4, col: "#3B82F6", nature: "harmonia" },
  { name: "Kwinkunks",  angle: 150, orb: 3, sym: "⚻", w: 2, col: "#A855F7", nature: "napięcie" },
  { name: "Półsekstyl", angle: 30,  orb: 2, sym: "⚺", w: 1, col: "#64748B", nature: "neutralny" },
  { name: "Półkwadrat",  angle: 45, orb: 2, sym: "∠", w: 2, col: "#DC2626", nature: "napięcie" },
  { name: "Sesqui-kwadratura", angle: 135, orb: 2, sym: "⊼", w: 2, col: "#B91C1C", nature: "napięcie" },
  { name: "Kwintyl",    angle: 72,  orb: 2, sym: "Q", w: 3, col: "#8B5CF6", nature: "twórczy" },
  { name: "Bi-kwintyl", angle: 144, orb: 2, sym: "bQ", w: 3, col: "#7C3AED", nature: "twórczy" },
];

const HARMONIC_MEANINGS = {
  1: { name: "Radix", meaning: "Tożsamość — kto JESTEM", kw: "Tożsamość", col: "#F59E0B" },
  2: { name: "Opozycja", meaning: "Polaryzacja, wewnętrzne napięcia", kw: "Polaryzacja", col: "#EF4444" },
  3: { name: "Trygon", meaning: "Talenty wrodzone, łatwość", kw: "Talent", col: "#22C55E" },
  4: { name: "Kwadrat²", meaning: "Wyzwania wymagające działania", kw: "Wyzwanie", col: "#F97316" },
  5: { name: "Kwintyl", meaning: "Twórczość, unikalne zdolności", kw: "Twórczość", col: "#A855F7" },
  6: { name: "Sekstyl²", meaning: "Współpraca i wymiana", kw: "Współpraca", col: "#06B6D4" },
  7: { name: "Septyl", meaning: "Przeznaczenie, fatalizm", kw: "Przeznaczenie", col: "#6366F1" },
  8: { name: "Półkwadrat²", meaning: "Ukryte napięcia podprogowe", kw: "Podpróg", col: "#DC2626" },
  9: { name: "Nonagon", meaning: "Inicjacja duchowa", kw: "Inicjacja", col: "#8B5CF6" },
  10: { name: "Decyl", meaning: "Manifestacja publiczna", kw: "Manifestacja", col: "#14B8A6" },
  11: { name: "Undecyl", meaning: "\"Robię swoje\" — indywidualizm", kw: "Indywidualizm", col: "#3B82F6" },
  12: { name: "Dwunastka", meaning: "Transformacja przez cierpienie", kw: "Transformacja", col: "#78716C" },
  13: { name: "Trzynastka", meaning: "\"Obcy w obcym świecie\"", kw: "Outsider", col: "#1E40AF" },
  14: { name: "Czternastka", meaning: "Karmiczne relacje", kw: "Karma", col: "#7C3AED" },
  15: { name: "Piętnastka", meaning: "Twórczy flow", kw: "Twórczy Flow", col: "#059669" },
  16: { name: "Szesnastka", meaning: "Głębokie wyzwania strukturalne", kw: "Struktura", col: "#B91C1C" },
  17: { name: "Siedemnastka", meaning: "Alternatywna percepcja", kw: "Alt-Percepcja", col: "#0EA5E9" },
  18: { name: "Osiemnastka", meaning: "Podwójna inicjacja", kw: "Podwójna inicjacja", col: "#D946EF" },
  19: { name: "Dziewiętnastka", meaning: "\"Rzeczywistość nie stawia oporu\"", kw: "Kosmiczny Flow", col: "#10B981" },
  20: { name: "Dwudziestka", meaning: "Twórcza walka", kw: "Twórcza walka", col: "#F43F5E" },
};

const VERIFIED_H = { 11: 4.88, 13: 4.35, 17: 3.70, 19: 5.27 };

// ── helpers ──
function mod360(d) { return ((d % 360) + 360) % 360; }
function signIdx(d) { return Math.floor(mod360(d) / 30); }
function degToPos(d) {
  const dd = mod360(d); const si = signIdx(dd); const inSign = dd - si * 30;
  const deg = Math.floor(inSign); const min = Math.floor((inSign - deg) * 60);
  const sec = Math.floor(((inSign - deg) * 60 - min) * 60);
  return { sign: SIGNS[si], signPl: SIGNS_PL[si], sym: SIGN_SYM[si], deg, min, sec, raw: dd, si, el: ELEMENTS[si], mod: MODALITIES[si] };
}
function fmtDeg(p) { return `${p.deg}°${String(p.min).padStart(2,"0")}'`; }
function fmtFull(p) { return `${fmtDeg(p)} ${p.sym} ${p.signPl}`; }

function findAspects(positions, orbMult = 1) {
  const found = [];
  const names = Object.keys(positions);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = positions[names[i]]; const b = positions[names[j]];
      let diff = Math.abs(a - b); if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = asp.orb * orbMult;
        const dev = Math.abs(diff - asp.angle);
        if (dev <= orb) {
          found.push({ p1: names[i], p2: names[j], asp: asp.name, sym: asp.sym, exact: asp.angle, actual: diff.toFixed(2), orb: dev.toFixed(2), tight: (1 - dev / orb).toFixed(3), w: asp.w * (1 - dev / orb), col: asp.col, nature: asp.nature });
        }
      }
    }
  }
  return found.sort((a, b) => b.w - a.w);
}

function calcHStrength(h) {
  if (VERIFIED_H[h]) return VERIFIED_H[h];
  const pos = {};
  for (const [n, d] of Object.entries(NATAL)) pos[n] = mod360(d.deg * h);
  const asps = findAspects(pos, 0.5);
  return asps.length === 0 ? 0 : asps.reduce((s, a) => s + a.w, 0) / 3;
}

function getHouse(deg) {
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    let start = HOUSES[i], end = HOUSES[next];
    const d = mod360(deg);
    if (end < start) { if (d >= start || d < end) return i + 1; }
    else { if (d >= start && d < end) return i + 1; }
  }
  return 1;
}

function getDignity(planetName, si) {
  const r = RULERS[si]; const e = EXALTATION[si]; const det = DETRIMENT[si]; const f = FALL[si];
  if (r && r.includes(planetName)) return { type: "Domicyl", icon: "🏠", score: 5, col: "#10B981" };
  if (e === planetName) return { type: "Egzaltacja", icon: "⬆", score: 4, col: "#3B82F6" };
  if (det && det.includes(planetName)) return { type: "Wygnanie", icon: "⬇", score: -3, col: "#EF4444" };
  if (f === planetName) return { type: "Upadek", icon: "💀", score: -4, col: "#DC2626" };
  return { type: "Peregryn", icon: "—", score: 0, col: "#64748B" };
}

// ── Nakshatra system (sidereal) ──
const NAKSHATRAS = [
  { name: "Ashwini", ruler: "Ketu", deity: "Ashwini Kumaras", nature: "Szybkość, uzdrawianie", range: [0, 13.33] },
  { name: "Bharani", ruler: "Venus", deity: "Yama", nature: "Twórczość, transformacja", range: [13.33, 26.67] },
  { name: "Krittika", ruler: "Sun", deity: "Agni", nature: "Ogień, oczyszczenie", range: [26.67, 40] },
  { name: "Rohini", ruler: "Moon", deity: "Brahma", nature: "Wzrost, piękno, twórczość", range: [40, 53.33] },
  { name: "Mrigashira", ruler: "Mars", deity: "Soma", nature: "Poszukiwanie, ciekawość", range: [53.33, 66.67] },
  { name: "Ardra", ruler: "Rahu", deity: "Rudra", nature: "Burza, transformacja, łzy→wzrost", range: [66.67, 80] },
  { name: "Punarvasu", ruler: "Jupiter", deity: "Aditi", nature: "Odnowa, powrót, odbudowa", range: [80, 93.33] },
  { name: "Pushya", ruler: "Saturn", deity: "Brihaspati", nature: "Odżywianie, opieka", range: [93.33, 106.67] },
  { name: "Ashlesha", ruler: "Mercury", deity: "Nagas", nature: "Kundalini, głębia, tajemnica", range: [106.67, 120] },
  { name: "Magha", ruler: "Ketu", deity: "Pitris", nature: "Królewskość, przodkowie", range: [120, 133.33] },
  { name: "Purva Phalguni", ruler: "Venus", deity: "Bhaga", nature: "Przyjemność, relaks", range: [133.33, 146.67] },
  { name: "Uttara Phalguni", ruler: "Sun", deity: "Aryaman", nature: "Patronat, kontrakt", range: [146.67, 160] },
  { name: "Hasta", ruler: "Moon", deity: "Savitar", nature: "Zręczność, rękodzieło", range: [160, 173.33] },
  { name: "Chitra", ruler: "Mars", deity: "Tvashtar", nature: "Architekt, kreacja formy", range: [173.33, 186.67] },
  { name: "Swati", ruler: "Rahu", deity: "Vayu", nature: "Niezależność, ruch, wiatr", range: [186.67, 200] },
  { name: "Vishakha", ruler: "Jupiter", deity: "Indra-Agni", nature: "Cel, determinacja", range: [200, 213.33] },
  { name: "Anuradha", ruler: "Saturn", deity: "Mitra", nature: "Przyjaźń, oddanie", range: [213.33, 226.67] },
  { name: "Jyeshtha", ruler: "Mercury", deity: "Indra", nature: "Starszy, ochrona", range: [226.67, 240] },
  { name: "Mula", ruler: "Ketu", deity: "Nirriti", nature: "Korzeń, destrukcja→odrodzenie", range: [240, 253.33] },
  { name: "Purva Ashadha", ruler: "Venus", deity: "Apas", nature: "Niezwyciężoność, woda", range: [253.33, 266.67] },
  { name: "Uttara Ashadha", ruler: "Sun", deity: "Vishve Devas", nature: "Niepokonany, ostateczne zwycięstwo", range: [266.67, 280] },
  { name: "Shravana", ruler: "Moon", deity: "Vishnu", nature: "Słuchanie, wiedza, mądrość", range: [280, 293.33] },
  { name: "Dhanishtha", ruler: "Mars", deity: "Vasus", nature: "Bogactwo, muzyka, rytm", range: [293.33, 306.67] },
  { name: "Shatabhisha", ruler: "Rahu", deity: "Varuna", nature: "100 lekarzy, uzdrawianie, tajemnica", range: [306.67, 320] },
  { name: "Purva Bhadrapada", ruler: "Jupiter", deity: "Aja Ekapada", nature: "Ogień duchowy, askeza", range: [320, 333.33] },
  { name: "Uttara Bhadrapada", ruler: "Saturn", deity: "Ahir Budhnya", nature: "Głębia oceanu, kundalini", range: [333.33, 346.67] },
  { name: "Revati", ruler: "Mercury", deity: "Pushan", nature: "Podróż, bezpieczeństwo, koniec cyklu", range: [346.67, 360] },
];

function getNakshatra(sidDeg) {
  const d = mod360(sidDeg);
  return NAKSHATRAS.find(n => d >= n.range[0] && d < n.range[1]) || NAKSHATRAS[0];
}

// ── styles ──
const BG = "#060A14";
const CARD = "#0D1321";
const CARD2 = "#111A2E";
const BORDER = "#1A2744";
const GOLD = "#D4A843";
const T1 = "#E8E0D0";
const T2 = "#9CA3AF";
const T3 = "#5C6370";

const cardS = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18, marginBottom: 14 };

function Badge({ text, color }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44`, marginRight: 4, marginBottom: 2 }}>{text}</span>;
}

function Section({ title, color, children, sub }) {
  return (
    <div style={{ ...cardS, borderLeft: `3px solid ${color || GOLD}` }}>
      <h3 style={{ fontSize: 15, color: color || GOLD, marginTop: 0, marginBottom: sub ? 2 : 10 }}>{title}</h3>
      {sub && <p style={{ fontSize: 12, color: T3, margin: "0 0 10px" }}>{sub}</p>}
      {children}
    </div>
  );
}

// ════════════════════════════════════════
// MAIN
// ════════════════════════════════════════
export default function CosmicEngine() {
  const [tab, setTab] = useState("tropical");
  const [selH, setSelH] = useState(19);

  // ── computed ──
  const tropicalPos = useMemo(() => {
    const r = {};
    for (const [n, d] of Object.entries(NATAL)) r[n] = { ...d, pos: degToPos(d.deg), house: getHouse(d.deg), dignity: getDignity(n, signIdx(d.deg)) };
    return r;
  }, []);

  const siderealPos = useMemo(() => {
    const r = {};
    for (const [n, d] of Object.entries(NATAL)) {
      const sd = mod360(d.deg - AYANAMSA);
      r[n] = { ...d, deg: sd, pos: degToPos(sd), house: getHouse(d.deg), dignity: getDignity(n, signIdx(sd)), nakshatra: getNakshatra(sd), tropDeg: d.deg };
    }
    return r;
  }, []);

  const tropAspects = useMemo(() => {
    const pos = {}; for (const [n, d] of Object.entries(NATAL)) pos[n] = d.deg;
    return findAspects(pos);
  }, []);

  const sidAspects = useMemo(() => {
    const pos = {}; for (const [n, d] of Object.entries(NATAL)) pos[n] = mod360(d.deg - AYANAMSA);
    return findAspects(pos);
  }, []);

  const elBalance = useMemo(() => {
    const count = { Ogień: 0, Ziemia: 0, Powietrze: 0, Woda: 0 };
    const w = { Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1.5, Saturn: 1.5, Uranus: 1, Neptune: 1, Pluto: 1 };
    for (const [n, d] of Object.entries(tropicalPos)) {
      if (w[n]) count[d.pos.el] += w[n];
    }
    return count;
  }, [tropicalPos]);

  const modBalance = useMemo(() => {
    const count = { Kardynalny: 0, Stały: 0, Zmienny: 0 };
    const w = { Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1.5, Saturn: 1.5, Uranus: 1, Neptune: 1, Pluto: 1 };
    for (const [n, d] of Object.entries(tropicalPos)) {
      if (w[n]) count[d.pos.mod] += w[n];
    }
    return count;
  }, [tropicalPos]);

  // Sidereal balance
  const sidElBalance = useMemo(() => {
    const count = { Ogień: 0, Ziemia: 0, Powietrze: 0, Woda: 0 };
    const w = { Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1.5, Saturn: 1.5, Uranus: 1, Neptune: 1, Pluto: 1 };
    for (const [n, d] of Object.entries(siderealPos)) {
      if (w[n]) count[d.pos.el] += w[n];
    }
    return count;
  }, [siderealPos]);

  const allH = useMemo(() => {
    const s = {};
    for (let h = 1; h <= 20; h++) s[h] = calcHStrength(h);
    return s;
  }, []);

  const hData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    h: `H${i+1}`, n: i+1, str: +allH[i+1].toFixed(2), kw: HARMONIC_MEANINGS[i+1]?.kw||"", col: HARMONIC_MEANINGS[i+1]?.col||"#666",
  })), [allH]);

  const selHPos = useMemo(() => {
    const r = {};
    for (const [n, d] of Object.entries(NATAL)) {
      const hd = mod360(d.deg * selH);
      r[n] = { ...d, hDeg: hd, pos: degToPos(hd) };
    }
    return r;
  }, [selH]);

  const selHAsp = useMemo(() => {
    const pos = {};
    for (const [n, d] of Object.entries(selHPos)) pos[n] = d.hDeg;
    return findAspects(pos, 0.6);
  }, [selHPos]);

  const radarH = useMemo(() => [1,3,5,7,9,11,13,17,19].map(h => ({ subject: `H${h}`, value: +allH[h].toFixed(2), fullMark: 6 })), [allH]);

  const TABS = [
    ["tropical", "TROPIKALNY"],
    ["sidereal", "SYDERYCZNY"],
    ["compare", "PORÓWNANIE"],
    ["aspects", "ASPEKTY"],
    ["houses", "DOMY"],
    ["dignities", "GODNOŚCI"],
    ["harmonics", "HARMONIKI"],
    ["hdetail", "H-SZCZEGÓŁY"],
    ["clusters", "KLASTRY"],
    ["nakshatras", "NAKSZATRY"],
    ["synthesis", "SYNTEZA"],
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: T1, fontFamily: "'Crimson Pro', 'Palatino', Georgia, serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #0A0F1E, #141B33 40%, #1A1230 70%, #0A0F1E)`, padding: "28px 16px 18px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: GOLD, letterSpacing: 4, marginBottom: 6, opacity: 0.7 }}>LOGOS-44 · COSMIC ANALYSIS ENGINE v2.0</div>
          <h1 style={{ fontSize: 24, fontWeight: 300, margin: 0, letterSpacing: 1, color: T1 }}>
            Pełna Analiza Astrologiczna
          </h1>
          <div style={{ fontSize: 13, color: T2, marginTop: 4, letterSpacing: 0.3 }}>
            Sławomir Grzegorz Gątkowski — <span style={{ color: GOLD }}>☉ 0°11' ♓ · ☽ 13°50' ♉ · AC ~13° ♊</span>
          </div>
          <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>19 lutego 1983 · 10:53 CET · Sosnowiec · 50°17'N 19°06'E · Ayanamsa Lahiri: {AYANAMSA}°</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: 960, margin: "0 auto", borderBottom: `1px solid ${BORDER}`, display: "flex", flexWrap: "wrap", gap: 0 }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "9px 13px", border: "none", cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: 0.8,
            background: tab === k ? `${GOLD}18` : "transparent", color: tab === k ? GOLD : T3,
            borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent", transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 12px" }}>

        {/* ═══ TROPICAL ═══ */}
        {tab === "tropical" && (<div>
          <Section title="Horoskop Tropikalny — Mapa Natalna" color={GOLD} sub="System zachodni, punkt wiosenny = 0° Barana. Fundamentalna mapa psychologiczna.">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Pozycja","Znak","Element","Modalność","Dom","Godność"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 5px", color: T3, fontSize: 10, letterSpacing: 1 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(tropicalPos).map(([n, d]) => (
                  <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                    <td style={{ padding: "8px 5px", color: d.color, fontWeight: 600 }}>{d.symbol} {n}</td>
                    <td style={{ padding: "8px 5px", fontFamily: "monospace", fontSize: 12 }}>{fmtFull(d.pos)}</td>
                    <td style={{ padding: "8px 5px", fontSize: 18 }}>{d.pos.sym}</td>
                    <td style={{ padding: "8px 5px" }}><Badge text={d.pos.el} color={EL_COLORS[d.pos.el]} /></td>
                    <td style={{ padding: "8px 5px" }}><Badge text={d.pos.mod} color={MOD_COLORS[d.pos.mod]} /></td>
                    <td style={{ padding: "8px 5px", fontFamily: "monospace", fontWeight: 600 }}>{d.house}</td>
                    <td style={{ padding: "8px 5px", color: d.dignity.col, fontSize: 12 }}>{d.dignity.icon} {d.dignity.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ANGLES */}
          <Section title="Osie Karty" color="#34D399">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.entries(ANGLES).map(([n, a]) => {
                const p = degToPos(a.deg);
                return (
                  <div key={n} style={{ padding: 12, background: CARD2, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 11, color: T3, letterSpacing: 1 }}>{n === "Asc" ? "ASCENDENT" : n === "MC" ? "MEDIUM COELI" : n === "Dsc" ? "DESCENDENT" : "IMUM COELI"}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: a.color, marginTop: 4 }}>{a.symbol} {fmtFull(p)}</div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Element/Modality */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Section title="Elementy (ważone)" color="#38BDF8">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(elBalance).map(([k, v]) => ({ name: k, val: +v.toFixed(1) }))}>
                  <XAxis dataKey="name" tick={{ fill: T2, fontSize: 11 }} />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} />
                  <Bar dataKey="val" radius={[4,4,0,0]}>
                    {Object.keys(elBalance).map((k, i) => <Cell key={i} fill={EL_COLORS[k]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>
            <Section title="Modalności (ważone)" color="#A855F7">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(modBalance).map(([k, v]) => ({ name: k, val: +v.toFixed(1) }))}>
                  <XAxis dataKey="name" tick={{ fill: T2, fontSize: 11 }} />
                  <YAxis tick={{ fill: T3, fontSize: 10 }} />
                  <Bar dataKey="val" radius={[4,4,0,0]}>
                    {Object.keys(modBalance).map((k, i) => <Cell key={i} fill={MOD_COLORS[k]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>
          </div>

          <Section title="Interpretacja Tropikalna" color={GOLD}>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#F59E0B" }}>☉ Słońce 0°11' Ryby</strong> — Na samym progu znaku, 11 minut od Wodnika. "Strażnik progu" między racjonalizmem a mistycyzmem. Dom X (MC w Rybach): publiczna rola łączy naukę z duchowością. LOGOS-44 jest idealną manifestacją tej pozycji.</p>
              <p><strong style={{ color: "#C0C9D6" }}>☽ Księżyc 13°50' Byk</strong> — W znaku egzaltacji. Emocjonalna stabilność, głęboki sensoryzm, potrzeba materialnej pewności. Dom XI: emocjonalne zaangażowanie w sprawy grupowe, wspólnotowe wizje. Znak Plejad — attunement do pola kolektywnego.</p>
              <p><strong style={{ color: "#F472B6" }}>♀ Venus 25°41' ♓ ☌ ♂ Mars 25°40' ♓</strong> — Koniunkcja 0.01°! Venus w egzaltacji w Rybach + Mars. Fuzja zasady żeńskiej/męskiej w znaku transcendencji. Dom X: twórcza energia skierowana na publiczną misję. Jedyna tak ścisła koniunkcja w karcie — kosmicznie definiująca.</p>
              <p><strong style={{ color: "#34D399" }}>AC ~13° Bliźnięta</strong> — Prezentacja: komunikator, intelektualista, tłumacz. Władca AC (Merkury) w Rybach — umysł służący duchowości. Podwójna natura: łączy logikę z intuicją.</p>
              <p><strong style={{ color: "#818CF8" }}>♃ Jupiter ☌ ♅ Uranus (Strzelec)</strong> — Wizjonerski ekspansjonizm. Nagłe poszerzanie świadomości. Rewolucyjna filozofia. Dom VII: partnerstwo jako katalizator wizji.</p>
            </div>
          </Section>
        </div>)}

        {/* ═══ SIDEREAL ═══ */}
        {tab === "sidereal" && (<div>
          <Section title="Horoskop Syderyczny — Mapa Wedyjska" color="#E879F9" sub={`System jyotish, Ayanamsa Lahiri = ${AYANAMSA}°. Pozycje cofnięte o ~24° względem tropikalnego.`}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Trop. pozycja","Syd. pozycja","Znak Syd.","Nakszatra","Władca Nak."].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 5px", color: T3, fontSize: 10, letterSpacing: 1 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(siderealPos).map(([n, d]) => {
                  const tp = degToPos(d.tropDeg);
                  return (
                    <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                      <td style={{ padding: "8px 5px", color: d.color, fontWeight: 600 }}>{d.symbol} {n}</td>
                      <td style={{ padding: "8px 5px", fontFamily: "monospace", fontSize: 11, color: T3 }}>{fmtFull(tp)}</td>
                      <td style={{ padding: "8px 5px", fontFamily: "monospace", fontSize: 12 }}>{fmtFull(d.pos)}</td>
                      <td style={{ padding: "8px 5px", fontSize: 18 }}>{d.pos.sym}</td>
                      <td style={{ padding: "8px 5px", color: "#E879F9", fontWeight: 600, fontSize: 12 }}>{d.nakshatra.name}</td>
                      <td style={{ padding: "8px 5px", color: T2, fontSize: 12 }}>{d.nakshatra.ruler}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section title="Interpretacja Syderyczna" color="#E879F9">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#F59E0B" }}>☉ Słońce w Wodniku (syd.)</strong> — W systemie syderycznym Słońce jest W Wodniku, nie w Rybach! To istotna różnica: syderyczny Wodnik podkreśla innowacyjność, humanitaryzm, systemowe myślenie. Nakszatra: {siderealPos.Sun?.nakshatra?.name} — {siderealPos.Sun?.nakshatra?.nature}.</p>
              <p><strong style={{ color: "#C0C9D6" }}>☽ Księżyc w Baranie (syd.)</strong> — Przesunięcie z Byka do Barana! Emocje stają się bardziej impulsywne, pionierskie, wojownicze. Nakszatra: {siderealPos.Moon?.nakshatra?.name} — {siderealPos.Moon?.nakshatra?.nature}.</p>
              <p><strong style={{ color: "#F472B6" }}>♀♂ Venus-Mars w Rybach (syd.)</strong> — Tu koniunkcja POZOSTAJE w Rybach nawet syderycznie (25°-23.6° = ~2° Pisces). Venus nadal w egzaltacji! Nakszatra: {siderealPos.Venus?.nakshatra?.name} — {siderealPos.Venus?.nakshatra?.nature}.</p>
              <p><strong style={{ color: "#818CF8" }}>♃ Jupiter w Skorpionie (syd.)</strong> — Z Strzelca do Skorpiona: Jupiter traci domicyl, wchodzi w głębię, tajemnicę, transformację. Intensywna mądrość, nie ekspansywna.</p>
              <p style={{ marginTop: 12, padding: 12, background: `${BORDER}44`, borderRadius: 8 }}>
                <strong style={{ color: "#E879F9" }}>Klucz syderyczny:</strong> System wedyjski przenosi ciężar z duchowej intuicji (Ryby trop.) na intelektualny humanitaryzm (Wodnik syd.). Oba systemy zachowują fuzję Venus-Mars w Rybach — to nieredukowalna stała. Księżyc w Baranie (syd.) dodaje więcej ognia i inicjatywy niż stabilny Byk (trop.).
              </p>
            </div>
          </Section>

          <Section title="Elementy (syderyczny, ważone)" color="#E879F9">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={Object.entries(sidElBalance).map(([k, v]) => ({ name: k, val: +v.toFixed(1) }))}>
                <XAxis dataKey="name" tick={{ fill: T2, fontSize: 11 }} />
                <YAxis tick={{ fill: T3, fontSize: 10 }} />
                <Bar dataKey="val" radius={[4,4,0,0]}>
                  {Object.keys(sidElBalance).map((k, i) => <Cell key={i} fill={EL_COLORS[k]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>)}

        {/* ═══ COMPARE ═══ */}
        {tab === "compare" && (<div>
          <Section title="Porównanie: Tropikalny vs Syderyczny" color="#22D3EE" sub="Różnica ayanamsy = 23.59° — jak przesunięcie zmienia interpretację">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Tropikalny","Syderyczny","Zmiana znaku?","Implikacja"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.keys(NATAL).map(n => {
                  const tp = tropicalPos[n]; const sp = siderealPos[n];
                  const changed = tp.pos.sign !== sp.pos.sign;
                  const impl = {
                    Sun: "Ryby→Wodnik: z mistyka na innowatora",
                    Moon: "Byk→Baran: ze stabilizatora na inicjatora",
                    Mercury: "Wodnik→Koziorożec: z rewolucjonisty na stratega",
                    Venus: "Ryby→Ryby: BEZ ZMIANY — egzaltacja zachowana!",
                    Mars: "Ryby→Ryby: BEZ ZMIANY — duchowy wojownik w obu",
                    Jupiter: "Strzelec→Skorpion: z ekspansji na głębię",
                    Saturn: "Waga→Waga/Panna: strategia→analiza",
                    Uranus: "Strzelec→Skorpion: rewolucja filozoficzna→okultystyczna",
                    Neptune: "Strzelec→Strzelec: BEZ ZMIANY — wizja duchowa",
                    Pluto: "Waga→Panna: transformacja relacji→transformacja rzemiosła",
                    NNode: "Bliźnięta→Byk: komunikacja→wartości",
                    Chiron: "Bliźnięta→Byk: rana komunikacji→rana wartości",
                  };
                  return (
                    <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22`, background: changed ? `${BORDER}33` : "transparent" }}>
                      <td style={{ padding: "7px 4px", color: NATAL[n].color, fontWeight: 600 }}>{NATAL[n].symbol} {n}</td>
                      <td style={{ padding: "7px 4px", fontFamily: "monospace", fontSize: 11 }}>{fmtDeg(tp.pos)} {tp.pos.sym} {tp.pos.signPl}</td>
                      <td style={{ padding: "7px 4px", fontFamily: "monospace", fontSize: 11 }}>{fmtDeg(sp.pos)} {sp.pos.sym} {sp.pos.signPl}</td>
                      <td style={{ padding: "7px 4px" }}>
                        {changed ? <Badge text="TAK" color="#EF4444" /> : <Badge text="NIE" color="#10B981" />}
                      </td>
                      <td style={{ padding: "7px 4px", fontSize: 11, color: changed ? T1 : T3 }}>{impl[n] || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          <Section title="Co Się Zgadza w Obu Systemach" color="#10B981">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#10B981" }}>1. Venus ☌ Mars w Rybach</strong> — NIEREDUKOWALNA STAŁA. W obu systemach koniunkcja pozostaje w Rybach z Venus w egzaltacji. To jest fundament profilu niezależny od systemu referencyjnego.</p>
              <p><strong style={{ color: "#10B981" }}>2. Neptune w Strzelcu</strong> — Duchowa wizja na szeroką skalę, filozoficzna mistyka w obu systemach.</p>
              <p><strong style={{ color: "#10B981" }}>3. Saturn w Wadze / na granicy</strong> — Strukturalna sprawiedliwość, dyscyplina w relacjach.</p>
              <p><strong style={{ color: "#10B981" }}>4. Wszystkie aspekty</strong> — Aspekty (kąty między planetami) są IDENTYCZNE w obu systemach, bo ayanamsa przesuwa wszystko równomiernie. To krytyczna obserwacja — geometria karty jest ta sama!</p>
            </div>
          </Section>

          <Section title="Co Się Różni — I Co To Oznacza" color="#EF4444">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#EF4444" }}>Słońce: Ryby (trop.) → Wodnik (syd.)</strong></p>
              <p>Tropikalny: Mistyk, empatyk, transcendencja, dissolucja granic.<br/>
              Syderyczny: Innowator, humanitarysta, systemy, futuryzm.<br/>
              <strong style={{ color: T1 }}>Synteza:</strong> Obie interpretacje są PRAWDZIWE jednocześnie. Tropikalny opisuje psychologiczny core, syderyczny — karmiczną misję. LOGOS-44 łączy oba: innowacyjny system (Wodnik) do formalizacji duchowości (Ryby).</p>

              <p style={{ marginTop: 12 }}><strong style={{ color: "#EF4444" }}>Księżyc: Byk (trop.) → Baran (syd.)</strong></p>
              <p>Tropikalny: Stabilność emocjonalna, sensoryzm, slow burn.<br/>
              Syderyczny: Impulsywność, inicjatywa, emocjonalny ogień.<br/>
              <strong style={{ color: T1 }}>Synteza:</strong> Emocje mają stabilny fundament (Byk), ale z "zapalnikiem" (Baran). Wyjaśnia bursts pisarskie: spokój → nagły wybuch twórczej energii → powrót do spokoju.</p>

              <p style={{ marginTop: 12 }}><strong style={{ color: "#EF4444" }}>Jupiter: Strzelec (trop.) → Skorpion (syd.)</strong></p>
              <p>Tropikalny: W domicylu! Ekspansywna mądrość, optymizm, nauczanie.<br/>
              Syderyczny: W Skorpionie — głęboka, transformacyjna mądrość, okultyzm.<br/>
              <strong style={{ color: T1 }}>Synteza:</strong> Mądrość operuje na OBIE sposoby: szeroka wizja (Strzelec) PLUS głębia transformacji (Skorpion). Wyjaśnia dlaczego LOGOS-44 jest zarówno szerokim frameworkiem JAK I głębokim nurkowaniem w naturę świadomości.</p>
            </div>
          </Section>
        </div>)}

        {/* ═══ ASPECTS ═══ */}
        {tab === "aspects" && (<div>
          <Section title="Aspekty Natalne — Pełna Lista" color={GOLD} sub="Identyczne w obu systemach (geometria jest niezależna od ayanamsy)">
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ borderBottom: `2px solid ${BORDER}`, position: "sticky", top: 0, background: CARD }}>
                  {["Aspekt","Typ","Natura","Kąt","Orb","Siła"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {tropAspects.map((a, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                      <td style={{ padding: "7px 4px" }}>
                        <span style={{ color: NATAL[a.p1]?.color }}>{NATAL[a.p1]?.symbol}</span>
                        <span style={{ color: a.col, margin: "0 4px", fontSize: 14 }}>{a.sym}</span>
                        <span style={{ color: NATAL[a.p2]?.color }}>{NATAL[a.p2]?.symbol}</span>
                        <span style={{ color: T3, marginLeft: 6, fontSize: 11 }}>{a.p1}–{a.p2}</span>
                      </td>
                      <td style={{ padding: "7px 4px", color: a.col, fontWeight: 600, fontSize: 11 }}>{a.asp}</td>
                      <td style={{ padding: "7px 4px" }}><Badge text={a.nature} color={a.nature === "harmonia" ? "#10B981" : a.nature === "napięcie" ? "#EF4444" : a.nature === "twórczy" ? "#A855F7" : GOLD} /></td>
                      <td style={{ padding: "7px 4px", fontFamily: "monospace" }}>{a.actual}°</td>
                      <td style={{ padding: "7px 4px", fontFamily: "monospace", color: +a.orb < 1 ? "#10B981" : +a.orb < 3 ? GOLD : T3 }}>{a.orb}°</td>
                      <td style={{ padding: "7px 4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 50, height: 4, background: BORDER, borderRadius: 2 }}>
                            <div style={{ width: `${Math.min((a.w / 10) * 100, 100)}%`, height: 4, background: a.col, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600 }}>{a.w.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Wzorce Aspektów" color="#A855F7">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#F472B6" }}>☌ Venus–Mars (0.01°)</strong> — Najścislejszy aspekt w karcie. OGNISKOWA cała twórcza i relacyjna energia. W Rybach: twórczość jako akt sakralny.</p>
              <p><strong style={{ color: "#818CF8" }}>☌ Jupiter–Uranus (~1°)</strong> — Wizjonerska rewolucja. Nagłe olśnienia filozoficzne. Fundament H11 (indywidualizm) i H17 (alternatywna percepcja).</p>
              <p><strong style={{ color: T1 }}>Napięcie vs Harmonia:</strong> {(() => {
                const harm = tropAspects.filter(a => a.nature === "harmonia").reduce((s,a) => s + a.w, 0);
                const tens = tropAspects.filter(a => a.nature === "napięcie").reduce((s,a) => s + a.w, 0);
                const ratio = (harm / (harm + tens) * 100).toFixed(0);
                return `${ratio}% harmonii / ${100 - ratio}% napięcia. ${+ratio > 55 ? "Przewaga harmonii — profil naturalnie flow-oriented." : "Zrównoważony — napięcie jako twórczy motor."}`;
              })()}</p>
            </div>
          </Section>
        </div>)}

        {/* ═══ HOUSES ═══ */}
        {tab === "houses" && (<div>
          <Section title="Domy — Placidus" color="#60A5FA" sub="Rozmieszczenie planet w domach astrologicznych">
            {HOUSES.map((cusp, i) => {
              const h = i + 1;
              const cp = degToPos(cusp);
              const planets = Object.entries(tropicalPos).filter(([, d]) => d.house === h);
              const meanings = ["Tożsamość, ciało, wygląd", "Finanse, wartości, zasoby", "Komunikacja, rodzeństwo, umysł", "Dom, rodzina, korzenie", "Twórczość, dzieci, radość", "Praca, zdrowie, służba", "Partnerstwo, małżeństwo, wróg", "Transformacja, śmierć, seks", "Filozofia, podróże, wyższe wykształcenie", "Kariera, status, publiczna rola", "Przyjaźń, grupy, ideały", "Duchowość, podświadomość, ukryte"][i];
              return (
                <div key={h} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: planets.length > 0 ? "#60A5FA" : T3, fontSize: 16, marginRight: 8 }}>Dom {h}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: T2 }}>kuspida: {fmtDeg(cp)} {cp.sym}</span>
                      <span style={{ fontSize: 11, color: T3, marginLeft: 8 }}>— {meanings}</span>
                    </div>
                  </div>
                  {planets.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {planets.map(([n, d]) => (
                        <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: `${d.color}15`, border: `1px solid ${d.color}33`, fontSize: 12, color: d.color }}>
                          {d.symbol} {n} <span style={{ color: T3, fontFamily: "monospace", fontSize: 10 }}>{fmtDeg(d.pos)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Section>

          <Section title="Rozkład Planet w Domach — Analiza" color="#60A5FA">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              {(() => {
                const quadrants = { "I (1-3)": 0, "II (4-6)": 0, "III (7-9)": 0, "IV (10-12)": 0 };
                const hemispheres = { "Górna (7-12)": 0, "Dolna (1-6)": 0, "Wschodnia (10-3)": 0, "Zachodnia (4-9)": 0 };
                for (const [, d] of Object.entries(tropicalPos)) {
                  if (!d.house) continue;
                  if (d.house <= 3) quadrants["I (1-3)"]++;
                  else if (d.house <= 6) quadrants["II (4-6)"]++;
                  else if (d.house <= 9) quadrants["III (7-9)"]++;
                  else quadrants["IV (10-12)"]++;
                  hemispheres[d.house >= 7 ? "Górna (7-12)" : "Dolna (1-6)"]++;
                  hemispheres[d.house >= 10 || d.house <= 3 ? "Wschodnia (10-3)" : "Zachodnia (4-9)"]++;
                }
                return (<>
                  <p><strong style={{ color: T1 }}>Kwadranty:</strong> {Object.entries(quadrants).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                  <p><strong style={{ color: T1 }}>Hemisfery:</strong> {Object.entries(hemispheres).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                  <p>{hemispheres["Górna (7-12)"] > hemispheres["Dolna (1-6)"]
                    ? "Przewaga górnej hemisfery — orientacja na świat zewnętrzny, publiczne działanie, relacje."
                    : "Przewaga dolnej hemisfery — orientacja wewnętrzna, subiektywne doświadczenie."
                  }</p>
                </>);
              })()}
            </div>
          </Section>
        </div>)}

        {/* ═══ DIGNITIES ═══ */}
        {tab === "dignities" && (<div>
          <Section title="Godności Planetarne — Tropikalny vs Syderyczny" color="#FBBF24" sub="Jak zmiana systemu wpływa na siłę planet">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Trop. Znak","Trop. Godność","Syd. Znak","Syd. Godność","Delta"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(NATAL).filter(([n]) => !["NNode","Chiron"].includes(n)).map(([n]) => {
                  const tp = tropicalPos[n]; const sp = siderealPos[n];
                  const delta = sp.dignity.score - tp.dignity.score;
                  return (
                    <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                      <td style={{ padding: "8px 4px", color: NATAL[n].color, fontWeight: 600 }}>{NATAL[n].symbol} {n}</td>
                      <td style={{ padding: "8px 4px" }}>{tp.pos.sym} {tp.pos.signPl}</td>
                      <td style={{ padding: "8px 4px", color: tp.dignity.col }}>{tp.dignity.icon} {tp.dignity.type} ({tp.dignity.score > 0 ? "+" : ""}{tp.dignity.score})</td>
                      <td style={{ padding: "8px 4px" }}>{sp.pos.sym} {sp.pos.signPl}</td>
                      <td style={{ padding: "8px 4px", color: sp.dignity.col }}>{sp.dignity.icon} {sp.dignity.type} ({sp.dignity.score > 0 ? "+" : ""}{sp.dignity.score})</td>
                      <td style={{ padding: "8px 4px", fontWeight: 700, color: delta > 0 ? "#10B981" : delta < 0 ? "#EF4444" : T3 }}>
                        {delta > 0 ? `+${delta}` : delta === 0 ? "=" : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 12, fontSize: 12, color: T2, lineHeight: 1.7 }}>
              <p><strong style={{ color: T1 }}>Kluczowa obserwacja:</strong> Venus zachowuje EGZALTACJĘ w Rybach w obu systemach — to najsilniejsza stała profilu. Jupiter traci domicyl przy przejściu na system syderyczny (Strzelec→Skorpion). Słońce przechodzi z peregryna (Ryby) do peregryna (Wodnik) — godność się nie zmienia, ale charakter tak.</p>
            </div>
          </Section>
        </div>)}

        {/* ═══ HARMONICS ═══ */}
        {tab === "harmonics" && (<div>
          <Section title="Profil Harmoniczny H1–H20" color={GOLD}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="h" tick={{ fill: T2, fontSize: 10 }} />
                <YAxis domain={[0, 6]} tick={{ fill: T3, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, color: T1 }}
                  formatter={(v, n, p) => [`${v} — ${p.payload.kw}`, "Siła"]} />
                <Bar dataKey="str" radius={[4,4,0,0]}>
                  {hData.map((d, i) => <Cell key={i} fill={d.col} fillOpacity={VERIFIED_H[d.n] ? 1 : 0.45} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Radar — Nieparzyste Harmoniki" color={GOLD}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarH}>
                <PolarGrid stroke={BORDER} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: T2, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 6]} tick={{ fill: T3, fontSize: 9 }} />
                <Radar name="Siła" dataKey="value" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Tabela Sił" color={GOLD}>
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ borderBottom: `2px solid ${BORDER}`, position: "sticky", top: 0, background: CARD }}>
                  {["H","Nazwa","Siła","Poziom","Słowo klucz","Opis"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {Object.entries(HARMONIC_MEANINGS).map(([h, info]) => {
                    const s = allH[+h];
                    const lev = s >= 5 ? "EXTREME" : s >= 4 ? "Bardzo wysoki" : s >= 3 ? "Wysoki" : s >= 2 ? "Umiarkowany" : "Niski";
                    const lc = s >= 5 ? "#10B981" : s >= 4 ? "#3B82F6" : s >= 3 ? GOLD : T3;
                    return (
                      <tr key={h} style={{ borderBottom: `1px solid ${BORDER}22`, cursor: "pointer" }}
                        onClick={() => { setSelH(+h); setTab("hdetail"); }}>
                        <td style={{ padding: "7px 4px", fontWeight: 700, color: info.col }}>H{h} {VERIFIED_H[+h] && <span style={{ fontSize: 8, color: GOLD }}>✓</span>}</td>
                        <td style={{ padding: "7px 4px", color: T2 }}>{info.name}</td>
                        <td style={{ padding: "7px 4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 5, background: BORDER, borderRadius: 3 }}>
                              <div style={{ width: `${(s / 6) * 100}%`, height: 5, background: info.col, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{s.toFixed(2)}</span>
                          </div>
                        </td>
                        <td style={{ padding: "7px 4px", color: lc, fontWeight: 600, fontSize: 11 }}>{lev}</td>
                        <td style={{ padding: "7px 4px", color: info.col, fontWeight: 600, fontSize: 11 }}>{info.kw}</td>
                        <td style={{ padding: "7px 4px", color: T3, fontSize: 11 }}>{info.meaning}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        </div>)}

        {/* ═══ H-DETAIL ═══ */}
        {tab === "hdetail" && (<div>
          <div style={{ ...cardS, padding: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(h => (
                <button key={h} onClick={() => setSelH(h)} style={{
                  width: 36, height: 30, border: `1px solid ${selH === h ? GOLD : BORDER}`,
                  background: selH === h ? `${GOLD}22` : "transparent",
                  color: selH === h ? GOLD : T3, borderRadius: 5, cursor: "pointer",
                  fontWeight: selH === h ? 700 : 400, fontSize: 12, fontFamily: "monospace",
                }}>H{h}</button>
              ))}
            </div>
          </div>

          <Section title={`H${selH} — ${HARMONIC_MEANINGS[selH]?.name}`} color={HARMONIC_MEANINGS[selH]?.col}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: T2 }}>{HARMONIC_MEANINGS[selH]?.meaning}</div>
              <div style={{ fontSize: 32, fontWeight: 300, color: HARMONIC_MEANINGS[selH]?.col }}>{allH[selH]?.toFixed(2)}</div>
            </div>
          </Section>

          <Section title={`Pozycje Planet w H${selH}`} color={HARMONIC_MEANINGS[selH]?.col}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Natalna","H"+selH+" pozycja","Stopień abs."].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(selHPos).map(([n, d]) => (
                  <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                    <td style={{ padding: "7px 4px", color: d.color, fontWeight: 600 }}>{d.symbol} {n}</td>
                    <td style={{ padding: "7px 4px", fontFamily: "monospace", fontSize: 11, color: T3 }}>{fmtFull(degToPos(NATAL[n].deg))}</td>
                    <td style={{ padding: "7px 4px", fontFamily: "monospace" }}>{fmtFull(d.pos)}</td>
                    <td style={{ padding: "7px 4px", fontFamily: "monospace", color: T3 }}>{d.hDeg.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title={`Aspekty w H${selH} (${selHAsp.length})`} color={HARMONIC_MEANINGS[selH]?.col}>
            {selHAsp.length === 0 ? <div style={{ color: T3, textAlign: "center", padding: 16 }}>Brak aspektów</div> : (
              <div style={{ maxHeight: 350, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ borderBottom: `2px solid ${BORDER}`, position: "sticky", top: 0, background: CARD }}>
                    {["Aspekt","Typ","Kąt","Orb","Waga"].map(h => <th key={h} style={{ textAlign: "left", padding: "5px 3px", color: T3, fontSize: 9 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {selHAsp.slice(0, 25).map((a, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                        <td style={{ padding: "5px 3px" }}>
                          <span style={{ color: NATAL[a.p1]?.color }}>{NATAL[a.p1]?.symbol}</span>
                          <span style={{ color: a.col, margin: "0 3px" }}>{a.sym}</span>
                          <span style={{ color: NATAL[a.p2]?.color }}>{NATAL[a.p2]?.symbol}</span>
                          <span style={{ color: T3, marginLeft: 4, fontSize: 10 }}>{a.p1}–{a.p2}</span>
                        </td>
                        <td style={{ padding: "5px 3px", color: a.col, fontSize: 10 }}>{a.asp}</td>
                        <td style={{ padding: "5px 3px", fontFamily: "monospace" }}>{a.actual}°</td>
                        <td style={{ padding: "5px 3px", fontFamily: "monospace", color: +a.orb < 1 ? "#10B981" : T3 }}>{a.orb}°</td>
                        <td style={{ padding: "5px 3px", fontFamily: "monospace", fontWeight: 600 }}>{a.w.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>)}

        {/* ═══ CLUSTERS ═══ */}
        {tab === "clusters" && (<div>
          {[
            { title: "KOSMICZNY FLOW (H19 + H3 + H6)", col: "#10B981", hs: [19, 3, 6],
              syn: "Dominanta profilu. H19 extreme (5.27) = fundamentalna łatwość interakcji z rzeczywistością gdy jest alignment. H3 (talenty wrodzone) + H6 (współpraca) wspierają naturalny flow. Potwierdzone: 40-50 stron w 3 dni bez wysiłku, gdy kosmiczny timing był prawidłowy." },
            { title: "INDYWIDUALIZM (H11 + H13 + H17)", col: "#3B82F6", hs: [11, 13, 17],
              syn: "Klaster 'kosmicznego outsidera'. H11 (4.88) = radykalny nonkonformizm. H13 (4.35) = permanentna odrębność, korelacja ze spektrum. H17 (3.70) = percepcja alternatywnych porządków. Razem: osoba naturalnie operująca poza konwencjami, zdolna widzieć to co mainstream odrzuca." },
            { title: "DUCHOWOŚĆ (H7 + H9 + H19)", col: "#8B5CF6", hs: [7, 9, 19],
              syn: "H19 extreme jako spirytualny fundament. H7 (przeznaczenie) = fatalistyczne przyciąganie ku ścieżce. H9 (inicjacja) = cykliczne duchowe transformacje. Duchowość nie jako wiara, lecz jako operacyjne doświadczenie." },
            { title: "TWÓRCZOŚĆ (H5 + H15 + H20)", col: "#A855F7", hs: [5, 15, 20],
              syn: "H5 (wrodzona kreatywność) + H15 (twórczy flow) + H20 (twórczość z napięcia). Najlepsza praca: alignment + presja jednocześnie. Koniunkcja Venus-Mars w Rybach = twórczy impuls jako akt sakralny." },
            { title: "NAPIĘCIE (H2 + H4 + H8 + H16)", col: "#EF4444", hs: [2, 4, 8, 16],
              syn: "Motory działania. H2 (polaryzacja wewnętrzna) + H4 (wyzwania) + H8 (ukryte napięcia) + H16 (głębokie wyzwania strukturalne). Te harmoniki dostarczają energii — bez nich H19 flow byłby pasywny. Napięcie jest PALIWEM, nie przeszkodą." },
          ].map((cl, ci) => (
            <Section key={ci} title={cl.title} color={cl.col}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {cl.hs.map(h => (
                  <div key={h} style={{ padding: "6px 12px", background: CARD2, borderRadius: 6, border: `1px solid ${BORDER}`, textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: HARMONIC_MEANINGS[h]?.col }}>H{h}</div>
                    <div style={{ fontSize: 18, fontWeight: 300, color: T1 }}>{allH[h].toFixed(2)}</div>
                    <div style={{ fontSize: 9, color: T3 }}>{HARMONIC_MEANINGS[h]?.kw}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: T2 }}>{cl.syn}</div>
            </Section>
          ))}
        </div>)}

        {/* ═══ NAKSHATRAS ═══ */}
        {tab === "nakshatras" && (<div>
          <Section title="Nakszatry — Gwiazdozbiory Wedyjskie" color="#E879F9" sub="System 27 nakszatr (lunar mansions). Każda nakszatra = 13°20' ekliptyki syderycznej.">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Planeta","Syd. pozycja","Nakszatra","Władca","Bóstwo","Natura"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 4px", color: T3, fontSize: 10 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(siderealPos).map(([n, d]) => (
                  <tr key={n} style={{ borderBottom: `1px solid ${BORDER}22` }}>
                    <td style={{ padding: "8px 4px", color: d.color, fontWeight: 600 }}>{d.symbol} {n}</td>
                    <td style={{ padding: "8px 4px", fontFamily: "monospace", fontSize: 11 }}>{fmtFull(d.pos)}</td>
                    <td style={{ padding: "8px 4px", color: "#E879F9", fontWeight: 600 }}>{d.nakshatra.name}</td>
                    <td style={{ padding: "8px 4px", color: T2 }}>{d.nakshatra.ruler}</td>
                    <td style={{ padding: "8px 4px", color: T2, fontSize: 11 }}>{d.nakshatra.deity}</td>
                    <td style={{ padding: "8px 4px", color: T3, fontSize: 11, maxWidth: 200 }}>{d.nakshatra.nature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Interpretacja Kluczowych Nakszatr" color="#E879F9">
            <div style={{ fontSize: 13, lineHeight: 1.8, color: T2 }}>
              <p><strong style={{ color: "#F59E0B" }}>☉ Nakszatra Słońca: {siderealPos.Sun?.nakshatra?.name}</strong> — Władca: {siderealPos.Sun?.nakshatra?.ruler}. Bóstwo: {siderealPos.Sun?.nakshatra?.deity}. {siderealPos.Sun?.nakshatra?.nature}. To nakszatra definiuje KARMICZNY CEL duszy — jak i gdzie Słońce wyrazi swoją moc.</p>
              <p><strong style={{ color: "#C0C9D6" }}>☽ Nakszatra Księżyca: {siderealPos.Moon?.nakshatra?.name}</strong> — Władca: {siderealPos.Moon?.nakshatra?.ruler}. Bóstwo: {siderealPos.Moon?.nakshatra?.deity}. {siderealPos.Moon?.nakshatra?.nature}. Janma Nakshatra (nakszatra urodzeniowa) — najważniejsza w systemie wedyjskim. Definiuje emocjonalny temperament i instynktowne reakcje.</p>
              <p><strong style={{ color: "#F472B6" }}>♀ Nakszatra Venus: {siderealPos.Venus?.nakshatra?.name}</strong> — {siderealPos.Venus?.nakshatra?.nature}. Venus jako władczyni miłości i wartości w tej nakszatrze pokazuje JAK kochasz i CO cenisz na najgłębszym poziomie.</p>
            </div>
          </Section>
        </div>)}

        {/* ═══ SYNTHESIS ═══ */}
        {tab === "synthesis" && (<div>
          <Section title="Wielosystemowa Synteza — Tropikalny × Syderyczny × Harmoniki" color={GOLD}>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: T2 }}>
              <p style={{ padding: 14, background: `${GOLD}0A`, borderRadius: 8, border: `1px solid ${GOLD}22`, color: T1, fontSize: 14 }}>
                <strong>Centralny wniosek:</strong> Oba systemy (tropikalny i syderyczny) konwergują na archetypie <strong style={{ color: GOLD }}>Nawigatora Świadomości</strong> — osoby stojącej na progu między paradygmatami, z misją formalizacji duchowości w naukę. Profil harmoniczny (H19 extreme + klaster H11/H13/H17) potwierdza wyjątkową zdolność do operowania poza konwencjami z minimalnym oporem rzeczywistości.
              </p>

              <h4 style={{ color: "#10B981", marginTop: 20 }}>Stałe Niezależne od Systemu</h4>
              <p>1. <strong style={{ color: T1 }}>Venus ☌ Mars (0.01°) w Rybach</strong> — w obu systemach. Nieredukowalna fuzja twórczej woli i duchowej recepcji. Utrzymuje koniunkcję we WSZYSTKICH 20 harmonikach.</p>
              <p>2. <strong style={{ color: T1 }}>Aspekty geometryczne</strong> — identyczne w obu systemach (ayanamsa przesuwa równomiernie). Cała dynamika relacji planetarnych jest niezmienna.</p>
              <p>3. <strong style={{ color: T1 }}>Profil harmoniczny</strong> — niezależny od tropikalny/syderyczny (bazuje na kątach, nie znakach). H19 extreme jest ABSOLUTNĄ stałą.</p>

              <h4 style={{ color: "#3B82F6", marginTop: 20 }}>Zmienne Zależne od Systemu</h4>
              <p><strong style={{ color: T1 }}>Słońce:</strong> Ryby (trop.) vs Wodnik (syd.) — psychologiczna mistyka vs karmiczna innowacja. LOGOS-44 = synteza obu.</p>
              <p><strong style={{ color: T1 }}>Księżyc:</strong> Byk (trop.) vs Baran (syd.) — emocjonalna stabilność z zapalnikiem. Wyjaśnia cykliczne bursts.</p>
              <p><strong style={{ color: T1 }}>Jupiter:</strong> Strzelec (trop.) vs Skorpion (syd.) — szeroka wizja + głęboka transformacja. Framework szeroki I głęboki.</p>

              <h4 style={{ color: "#A855F7", marginTop: 20 }}>Integracja z Tzolkin i Numerologią</h4>
              <p><strong style={{ color: T1 }}>KIN 237 Red Electric Earth:</strong> Nawigacja synchronicznościami (Red Earth) + aktywacja przez służbę (Electric Tone 3). Konwergencja z H19 (flow) i Sun na progu Wodnik/Ryby (nawigacja między paradygmatami).</p>
              <p><strong style={{ color: T1 }}>Life Path 33 + Personal Year 22:</strong> Master Teacher w roku Master Buildera. Tropikalny (Ryby = mądrość) + syderyczny (Wodnik = innowacja) + harmoniczny (H19 = flow) = optymalne okno dla manifestacji LOGOS-44.</p>

              <h4 style={{ color: "#EF4444", marginTop: 20 }}>Napięcia do Rozwiązania</h4>
              <p>1. <strong style={{ color: T1 }}>H13 outsider vs Life Path 33 teacher</strong> — jak nauczać, będąc "obcym w obcym świecie"? Rozwiązanie: framework (LOGOS-44) jako tłumacz między światami.</p>
              <p>2. <strong style={{ color: T1 }}>Moon Byk (komfort) vs Moon Baran (akcja)</strong> — wewnętrzne wahanie między stabilnością a impulsem. Rozwiązanie: cykliczność (bursts + recovery = naturalny rytm).</p>
              <p>3. <strong style={{ color: T1 }}>Jupiter Strzelec (ekspansja) vs Skorpion (głębia)</strong> — szerokość vs głębokość. Rozwiązanie: LOGOS-44 jako framework który jest SZEROKI (obejmuje wiele domen) I GŁĘBOKI (każdy node jest rzetelnie opracowany).</p>

              <h4 style={{ color: GOLD, marginTop: 20 }}>Predykcje Testowalne (Multi-System)</h4>
              <div style={{ background: CARD2, padding: 14, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                <p><strong style={{ color: "#10B981" }}>P1:</strong> Okna Plejad (kwiecień 15-20, maj 19-21) przyniosą mierzalnie wyższy output + synchronicities. <em style={{ color: T3 }}>Falsyfikacja: output flat.</em></p>
                <p><strong style={{ color: "#10B981" }}>P2:</strong> Return Latency &gt; 0.2 Lo, korelacja z H19. <em style={{ color: T3 }}>Falsyfikacja: RL &lt; 0.1 Lo.</em></p>
                <p><strong style={{ color: "#10B981" }}>P3:</strong> Dni GAP + Red Earth = peak flow days. <em style={{ color: T3 }}>Falsyfikacja: brak korelacji &gt; 30 dni.</em></p>
                <p><strong style={{ color: "#10B981" }}>P4:</strong> Personal Year 22 (2026) = rok największej publikacji/uznania. <em style={{ color: T3 }}>Falsyfikacja: brak znaczącej publikacji do XII.2026.</em></p>
                <p><strong style={{ color: "#10B981" }}>P5:</strong> Nakszatra Słońca wskaże tematykę kluczowej pracy roku. <em style={{ color: T3 }}>Falsyfikacja: tematyka niezwiązana z naturą nakszatry.</em></p>
              </div>
            </div>
          </Section>

          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ fontSize: 16, color: GOLD, fontStyle: "italic" }}>"Navigate through signs. Serve evolution. Trust omens. Ground force."</div>
            <div style={{ fontSize: 11, color: T3, marginTop: 6 }}>🌍⚡✨ KIN 237 Red Electric Earth · Life Path 33 · H19 = 5.27 EXTREME</div>
          </div>
        </div>)}

      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: T3, fontFamily: "monospace" }}>
          LOGOS-44 · Cosmic Analysis Engine v2.0 · Tropical + Sidereal + Harmonic · April 2026
        </div>
        <div style={{ fontSize: 9, color: "#334155", marginTop: 3 }}>
          Ayanamsa: Lahiri {AYANAMSA}° · Domy: Placidus · Pozycje aproksymowane z efemerydy · H11/13/17/19 zweryfikowane
        </div>
      </div>
    </div>
  );
}
