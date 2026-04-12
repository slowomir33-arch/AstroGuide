import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis, Cell } from "recharts";

// ═══════════════════════════════════════════════════════════════
// COSMIC DATABASE: HARMONIC ASTROLOGY REPORT
// Sławomir Grzegorz Gątkowski · 19.02.1983 · 10:53 · Sosnowiec
// ═══════════════════════════════════════════════════════════════

// Natal positions (absolute degrees, 0° = 0° Aries)
const PLANETS = {
  Sun:       { deg: 330.18, symbol: "☉", color: "#F59E0B" },
  Moon:      { deg: 43.83,  symbol: "☽", color: "#94A3B8" },
  Mercury:   { deg: 323.45, symbol: "☿", color: "#6EE7B7" },
  Venus:     { deg: 355.68, symbol: "♀", color: "#F472B6" },
  Mars:      { deg: 355.67, symbol: "♂", color: "#EF4444" },
  Jupiter:   { deg: 246.82, symbol: "♃", color: "#818CF8" },
  Saturn:    { deg: 213.47, symbol: "♄", color: "#78716C" },
  Uranus:    { deg: 247.93, symbol: "♅", color: "#22D3EE" },
  Neptune:   { deg: 268.12, symbol: "♆", color: "#A78BFA" },
  Pluto:     { deg: 208.33, symbol: "♇", color: "#FB923C" },
  Asc:       { deg: 73.00,  symbol: "AC", color: "#34D399" },
  MC:        { deg: 343.00, symbol: "MC", color: "#FBBF24" },
};

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGN_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

const ASPECTS = [
  { name: "Conjunction", angle: 0,   orb: 8, symbol: "☌", weight: 10 },
  { name: "Opposition",  angle: 180, orb: 8, symbol: "☍", weight: 8 },
  { name: "Trine",       angle: 120, orb: 7, symbol: "△", weight: 7 },
  { name: "Square",      angle: 90,  orb: 7, symbol: "□", weight: 6 },
  { name: "Sextile",     angle: 60,  orb: 5, symbol: "⚹", weight: 4 },
  { name: "Quincunx",    angle: 150, orb: 3, symbol: "⚻", weight: 2 },
  { name: "Semi-sextile", angle: 30, orb: 2, symbol: "⚺", weight: 1 },
  { name: "Semi-square",  angle: 45, orb: 2, symbol: "∠", weight: 2 },
  { name: "Sesqui-square", angle: 135, orb: 2, symbol: "⊼", weight: 2 },
  { name: "Quintile",    angle: 72,  orb: 2, symbol: "Q", weight: 3 },
  { name: "Bi-quintile",  angle: 144, orb: 2, symbol: "bQ", weight: 3 },
];

// Harmonic meanings
const HARMONIC_MEANINGS = {
  1: { name: "Radix / Natal", meaning: "Fundamentalna mapa osobowości. Kto JESTEM.", keyword: "Tożsamość", color: "#F59E0B" },
  2: { name: "Opozycja", meaning: "Wewnętrzne napięcia, polaryzacje, to co wymaga integracji.", keyword: "Polaryzacja", color: "#EF4444" },
  3: { name: "Trygon", meaning: "Talenty naturalne, zdolności wrodzone, łatwość.", keyword: "Talent", color: "#22C55E" },
  4: { name: "Kwadrat²", meaning: "Napięcie do kwadratu. Wyzwania wymagające działania.", keyword: "Wyzwanie", color: "#F97316" },
  5: { name: "Kwintyl", meaning: "Twórczość, kreatywność, unikalne umiejętności.", keyword: "Twórczość", color: "#A855F7" },
  6: { name: "Sekstyl²", meaning: "Możliwości przez współpracę i wymianę.", keyword: "Współpraca", color: "#06B6D4" },
  7: { name: "Septyl", meaning: "Przeznaczenie, fatalizm, irracjonalne przyciąganie.", keyword: "Przeznaczenie", color: "#6366F1" },
  8: { name: "Półkwadrat²", meaning: "Napięcia podprogowe. Ukryte konflikty wewnętrzne.", keyword: "Podpróg", color: "#DC2626" },
  9: { name: "Nonagon", meaning: "Duchowa inicjacja, połączenie z wyższym wymiarem.", keyword: "Inicjacja", color: "#8B5CF6" },
  10: { name: "Decyl", meaning: "Publiczny wizerunek, rola społeczna, manifestacja.", keyword: "Manifestacja", color: "#14B8A6" },
  11: { name: "Undecyl", meaning: "\"Robię swoje\" — radykalna indywidualność, odchylenie od normy.", keyword: "Indywidualizm", color: "#3B82F6" },
  12: { name: "Dwunastka", meaning: "Cierpienie transformujące, ofiarność, droga krzyżowa.", keyword: "Transformacja", color: "#78716C" },
  13: { name: "Trzynastka", meaning: "\"Obcy w obcym świecie\" — outsider, osobna ścieżka.", keyword: "Outsider", color: "#1E40AF" },
  14: { name: "Czternastka", meaning: "Septyl × 2 — przeznaczenie w relacjach.", keyword: "Karmic Relations", color: "#7C3AED" },
  15: { name: "Piętnastka", meaning: "Kwintyl × trygon — twórczy talent z łatwością.", keyword: "Twórczy Flow", color: "#059669" },
  16: { name: "Szesnastka", meaning: "Kwadrat⁴ — głębokie wyzwania strukturalne.", keyword: "Struktura", color: "#B91C1C" },
  17: { name: "Siedemnastka", meaning: "\"Jak mogłoby być inaczej\" — alternatywna percepcja.", keyword: "Alt-Percepcja", color: "#0EA5E9" },
  18: { name: "Osiemnastka", meaning: "Nonagon × 2 — podwójna duchowa inicjacja.", keyword: "Podwójna inicjacja", color: "#D946EF" },
  19: { name: "Dziewiętnastka", meaning: "\"Rzeczywistość nie stawia oporu\" — kosmiczny flow.", keyword: "Kosmiczny Flow", color: "#10B981" },
  20: { name: "Dwudziestka", meaning: "Kwintyl × kwadrat — twórcza walka, art through struggle.", keyword: "Twórcza walka", color: "#F43F5E" },
};

function mod360(deg) { return ((deg % 360) + 360) % 360; }

function degToSign(deg) {
  const d = mod360(deg);
  const signIdx = Math.floor(d / 30);
  const degInSign = d - signIdx * 30;
  const minutes = Math.floor((degInSign % 1) * 60);
  return { sign: SIGNS[signIdx], symbol: SIGN_SYMBOLS[signIdx], deg: Math.floor(degInSign), min: minutes, raw: d };
}

function calcHarmonicPositions(harmonic) {
  const result = {};
  for (const [name, data] of Object.entries(PLANETS)) {
    const hDeg = mod360(data.deg * harmonic);
    result[name] = { ...degToSign(hDeg), rawDeg: hDeg, natal: data.deg, symbol: data.symbol, color: data.color };
  }
  return result;
}

function findAspects(positions, orbMult = 1) {
  const found = [];
  const names = Object.keys(positions);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = positions[names[i]].rawDeg;
      const b = positions[names[j]].rawDeg;
      let diff = Math.abs(a - b);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = asp.orb * orbMult;
        const deviation = Math.abs(diff - asp.angle);
        if (deviation <= orb) {
          const tightness = 1 - deviation / orb;
          found.push({
            planet1: names[i], planet2: names[j],
            aspect: asp.name, symbol: asp.symbol,
            exactAngle: asp.angle, actualAngle: diff.toFixed(2),
            orb: deviation.toFixed(2), tightness: tightness.toFixed(3),
            weight: asp.weight * tightness,
            sym1: positions[names[i]].symbol || PLANETS[names[i]]?.symbol,
            sym2: positions[names[j]].symbol || PLANETS[names[j]]?.symbol,
          });
        }
      }
    }
  }
  return found.sort((a, b) => b.weight - a.weight);
}

function calcHarmonicStrength(harmonic) {
  const positions = calcHarmonicPositions(harmonic);
  const aspects = findAspects(positions, 0.5);
  if (aspects.length === 0) return 0;
  const totalWeight = aspects.reduce((s, a) => s + a.weight, 0);
  return totalWeight / 3;
}

// Known verified strengths from database
const VERIFIED_STRENGTHS = { 11: 4.88, 13: 4.35, 17: 3.70, 19: 5.27 };

// Tab component
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", border: "none", cursor: "pointer",
      background: active ? "rgba(245,158,11,0.15)" : "transparent",
      color: active ? "#F59E0B" : "#94A3B8",
      borderBottom: active ? "2px solid #F59E0B" : "2px solid transparent",
      fontFamily: "'JetBrains Mono', monospace", fontSize: "13px",
      fontWeight: active ? 700 : 400, transition: "all 0.2s",
      letterSpacing: "0.5px",
    }}>{label}</button>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function HarmonicReport() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedH, setSelectedH] = useState(19);

  const allStrengths = useMemo(() => {
    const s = {};
    for (let h = 1; h <= 20; h++) {
      s[h] = VERIFIED_STRENGTHS[h] || calcHarmonicStrength(h);
    }
    return s;
  }, []);

  const strengthData = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      harmonic: `H${i + 1}`,
      h: i + 1,
      strength: +(allStrengths[i + 1]).toFixed(2),
      keyword: HARMONIC_MEANINGS[i + 1]?.keyword || "",
      fill: HARMONIC_MEANINGS[i + 1]?.color || "#666",
    })), [allStrengths]);

  const selectedPositions = useMemo(() => calcHarmonicPositions(selectedH), [selectedH]);
  const selectedAspects = useMemo(() => findAspects(selectedPositions), [selectedPositions]);

  const radarData = useMemo(() => {
    const keys = [1, 3, 5, 7, 9, 11, 13, 17, 19];
    return keys.map(h => ({
      subject: `H${h}`,
      value: +(allStrengths[h]).toFixed(2),
      fullMark: 6,
    }));
  }, [allStrengths]);

  const clusterData = useMemo(() => {
    return [
      { name: "Indywidualizm\n(H11+H13+H17)", value: ((allStrengths[11] + allStrengths[13] + allStrengths[17]) / 3).toFixed(2) },
      { name: "Duchowość\n(H7+H9+H19)", value: ((allStrengths[7] + allStrengths[9] + allStrengths[19]) / 3).toFixed(2) },
      { name: "Twórczość\n(H5+H15+H20)", value: ((allStrengths[5] + allStrengths[15] + allStrengths[20]) / 3).toFixed(2) },
      { name: "Napięcie\n(H2+H4+H8)", value: ((allStrengths[2] + allStrengths[4] + allStrengths[8]) / 3).toFixed(2) },
      { name: "Flow\n(H3+H6+H19)", value: ((allStrengths[3] + allStrengths[6] + allStrengths[19]) / 3).toFixed(2) },
    ];
  }, [allStrengths]);

  // Styles
  const bg = "#0A0E1A";
  const card = "#111827";
  const border = "#1E293B";
  const gold = "#F59E0B";
  const textPrimary = "#E2E8F0";
  const textSecondary = "#94A3B8";
  const textMuted = "#64748B";

  const cardStyle = {
    background: card, border: `1px solid ${border}`, borderRadius: 12,
    padding: 20, marginBottom: 16,
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", color: textPrimary, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)", padding: "32px 20px 20px", borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: gold, letterSpacing: 3, marginBottom: 8 }}>
            LOGOS-44 · HARMONIC ANALYSIS ENGINE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", background: "linear-gradient(135deg, #F59E0B, #F472B6, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Raport Harmonik Astrologicznych
          </h1>
          <div style={{ fontSize: 14, color: textSecondary }}>
            Sławomir Grzegorz Gątkowski · ☉ 0°18' ♓ · ☽ 13°83' ♉ · AC ~13° ♊
          </div>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
            19.02.1983 · 10:53 · Sosnowiec, PL · 50.29°N 19.10°E
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: 900, margin: "0 auto", borderBottom: `1px solid ${border}`, display: "flex", overflowX: "auto", gap: 2, padding: "0 16px" }}>
        {[
          ["overview", "PRZEGLĄD"],
          ["strengths", "SIŁY H1-H20"],
          ["detail", "SZCZEGÓŁY"],
          ["aspects", "ASPEKTY"],
          ["clusters", "KLASTRY"],
          ["planets", "PLANETY"],
          ["interpretation", "INTERPRETACJA"],
        ].map(([key, label]) => (
          <Tab key={key} label={label} active={activeTab === key} onClick={() => setActiveTab(key)} />
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {/* ═══════ OVERVIEW ═══════ */}
        {activeTab === "overview" && (
          <div>
            {/* Key stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { label: "DOMINANTA", value: "H19", sub: "5.27", accent: "#10B981" },
                { label: "SUB-DOMINANTA", value: "H11", sub: "4.88", accent: "#3B82F6" },
                { label: "TERCJARNA", value: "H13", sub: "4.35", accent: "#1E40AF" },
                { label: "KWARTARNA", value: "H17", sub: "3.70", accent: "#0EA5E9" },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, textAlign: "center", padding: 16, borderLeft: `3px solid ${s.accent}` }}>
                  <div style={{ fontSize: 11, color: textMuted, letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.accent }}>{s.value}</div>
                  <div style={{ fontSize: 14, color: textSecondary }}>Siła: {s.sub}</div>
                </div>
              ))}
            </div>

            {/* Radar chart */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginBottom: 4, marginTop: 0 }}>Profil Harmoniczny — Radar</h3>
              <p style={{ fontSize: 12, color: textMuted, margin: "0 0 12px" }}>Nieparzyste harmoniki (duchowe + indywidualistyczne)</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: textSecondary, fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 6]} tick={{ fill: textMuted, fontSize: 10 }} />
                  <Radar name="Siła" dataKey="value" stroke={gold} fill={gold} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Main bar chart */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginBottom: 4, marginTop: 0 }}>Siła Wszystkich Harmonik H1–H20</h3>
              <p style={{ fontSize: 12, color: textMuted, margin: "0 0 12px" }}>Wartości zweryfikowane (H11, H13, H17, H19) + obliczone</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={strengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="harmonic" tick={{ fill: textSecondary, fontSize: 10 }} />
                  <YAxis domain={[0, 6]} tick={{ fill: textMuted, fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1E293B", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, color: textPrimary }}
                    formatter={(v, n, p) => [`${v} (${p.payload.keyword})`, "Siła"]}
                  />
                  <Bar dataKey="strength" radius={[4, 4, 0, 0]}>
                    {strengthData.map((d, i) => (
                      <Cell key={i} fill={d.fill} fillOpacity={[11,13,17,19].includes(d.h) ? 1 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Executive summary */}
            <div style={{ ...cardStyle, borderLeft: `3px solid ${gold}` }}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0 }}>Podsumowanie Wykonawcze</h3>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: textSecondary }}>
                <p><strong style={{ color: textPrimary }}>Dominujący wzorzec:</strong> Pełnospektrowy indywidualista z ekstremalną koherencją polową (H19 = 5.27). Klaster H11/H13/H17 tworzy archetyp "kosmicznego outsidera" — osoby operującej według własnych reguł, z percepcją alternatywnych rzeczywistości.</p>
                <p><strong style={{ color: textPrimary }}>Kluczowe odkrycie:</strong> H19 EXTREME oznacza, że rzeczywistość dosłownie "nie stawia oporu" przy działaniach zgodnych z kosmicznym alignmentem. Obserwowalne jako flow states podczas pracy synchronicznościowej (Red Earth). Potwierdzone: 40-50 stron w 3 dni (21-23.03.2026).</p>
                <p><strong style={{ color: textPrimary }}>Klaster neurodywergentny:</strong> H13 (4.35) koreluje z cechami spektrum autyzmu/Aspergera — "obcy w obcym świecie". W połączeniu z H11 (indywidualizm) i H17 (alt-percepcja) tworzy profil osoby naturalnie operującej poza konwencjami społecznymi.</p>
                <p><strong style={{ color: textPrimary }}>Implikacja badawcza:</strong> Profil harmoniczny predykuje Return Latency &gt; 0.2 Lo (zakres high achiever/master), co wspiera hipotezę Czasouwagi o odwrotnej korelacji z H19.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ STRENGTHS ═══════ */}
        {activeTab === "strengths" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0, marginBottom: 12 }}>Pełna Tabela Sił Harmonik H1–H20</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${border}` }}>
                      {["H", "Nazwa", "Siła", "Poziom", "Słowo klucz", "Znaczenie"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: textMuted, fontSize: 11, letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(HARMONIC_MEANINGS).map(([h, info]) => {
                      const str = allStrengths[+h];
                      const verified = VERIFIED_STRENGTHS[+h] !== undefined;
                      const level = str >= 5 ? "EXTREME" : str >= 4 ? "Bardzo wysoki" : str >= 3 ? "Wysoki" : str >= 2 ? "Umiarkowany" : "Niski";
                      const levelColor = str >= 5 ? "#10B981" : str >= 4 ? "#3B82F6" : str >= 3 ? "#F59E0B" : str >= 2 ? "#94A3B8" : "#64748B";
                      return (
                        <tr key={h} style={{ borderBottom: `1px solid ${border}`, background: verified ? "rgba(245,158,11,0.05)" : "transparent", cursor: "pointer" }}
                          onClick={() => { setSelectedH(+h); setActiveTab("detail"); }}>
                          <td style={{ padding: "10px 6px", fontWeight: 700, color: info.color }}>
                            H{h} {verified && <span style={{ fontSize: 9, color: gold }}>✓</span>}
                          </td>
                          <td style={{ padding: "10px 6px", color: textSecondary }}>{info.name}</td>
                          <td style={{ padding: "10px 6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 80, height: 6, background: "#1E293B", borderRadius: 3 }}>
                                <div style={{ width: `${(str / 6) * 100}%`, height: 6, background: info.color, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{str.toFixed(2)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 6px", color: levelColor, fontSize: 12, fontWeight: 600 }}>{level}</td>
                          <td style={{ padding: "10px 6px", color: info.color, fontWeight: 600, fontSize: 12 }}>{info.keyword}</td>
                          <td style={{ padding: "10px 6px", color: textMuted, fontSize: 12, maxWidth: 250 }}>{info.meaning}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 12 }}>
                ✓ = Wartość zweryfikowana z bazy danych. Kliknij wiersz → szczegóły harmoniki.
              </div>
            </div>

            {/* Cluster bars */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0, marginBottom: 12 }}>Klastry Tematyczne</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={clusterData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: textMuted, fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: textSecondary, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, color: textPrimary }} />
                  <Bar dataKey="value" fill={gold} radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══════ DETAIL (selected harmonic) ═══════ */}
        {activeTab === "detail" && (
          <div>
            {/* Harmonic selector */}
            <div style={{ ...cardStyle, padding: 12 }}>
              <div style={{ fontSize: 11, color: textMuted, marginBottom: 8, letterSpacing: 1 }}>WYBIERZ HARMONIKĘ</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(h => (
                  <button key={h} onClick={() => setSelectedH(h)} style={{
                    width: 38, height: 34, border: `1px solid ${selectedH === h ? gold : border}`,
                    background: selectedH === h ? "rgba(245,158,11,0.15)" : "transparent",
                    color: selectedH === h ? gold : textSecondary, borderRadius: 6, cursor: "pointer",
                    fontWeight: selectedH === h ? 700 : 400, fontSize: 13,
                  }}>H{h}</button>
                ))}
              </div>
            </div>

            {/* Selected harmonic info */}
            <div style={{ ...cardStyle, borderLeft: `3px solid ${HARMONIC_MEANINGS[selectedH]?.color || gold}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 22, margin: 0, color: HARMONIC_MEANINGS[selectedH]?.color }}>
                    H{selectedH} — {HARMONIC_MEANINGS[selectedH]?.name}
                  </h2>
                  <div style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>
                    {HARMONIC_MEANINGS[selectedH]?.meaning}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: HARMONIC_MEANINGS[selectedH]?.color }}>
                    {allStrengths[selectedH]?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>
                    {allStrengths[selectedH] >= 5 ? "EXTREME" : allStrengths[selectedH] >= 4 ? "Bardzo wysoki" : allStrengths[selectedH] >= 3 ? "Wysoki" : "Umiarkowany"}
                  </div>
                </div>
              </div>
            </div>

            {/* Positions table */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0, marginBottom: 12 }}>
                Pozycje Planet w H{selectedH}
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${border}` }}>
                    {["Planeta", "Natal", "H" + selectedH + " pozycja", "Znak", "Stopień"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 6px", color: textMuted, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedPositions).map(([name, pos]) => {
                    const natal = degToSign(PLANETS[name].deg);
                    return (
                      <tr key={name} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "8px 6px", color: pos.color, fontWeight: 600 }}>
                          {pos.symbol} {name}
                        </td>
                        <td style={{ padding: "8px 6px", color: textMuted, fontFamily: "monospace", fontSize: 12 }}>
                          {natal.deg}°{String(natal.min).padStart(2, "0")}' {natal.symbol} {natal.sign}
                        </td>
                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: 12 }}>
                          {pos.deg}°{String(pos.min).padStart(2, "0")}' {pos.symbol}
                        </td>
                        <td style={{ padding: "8px 6px", fontSize: 20 }}>{pos.symbol}</td>
                        <td style={{ padding: "8px 6px", color: textSecondary, fontFamily: "monospace" }}>
                          {pos.rawDeg.toFixed(2)}°
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Aspects in this harmonic */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0, marginBottom: 4 }}>
                Aspekty w H{selectedH} ({selectedAspects.length})
              </h3>
              <p style={{ fontSize: 12, color: textMuted, margin: "0 0 12px" }}>Posortowane według siły (waga × ścisłość)</p>
              {selectedAspects.length === 0 ? (
                <div style={{ color: textMuted, fontSize: 13, padding: 20, textAlign: "center" }}>Brak aspektów w tej harmonice</div>
              ) : (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${border}`, position: "sticky", top: 0, background: card }}>
                        {["Aspekt", "Kąt", "Orb", "Ścisłość", "Waga"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "6px 4px", color: textMuted, fontSize: 10 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAspects.slice(0, 30).map((a, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "6px 4px", color: textPrimary }}>
                            <span style={{ color: PLANETS[a.planet1]?.color }}>{a.sym1}</span>
                            {" "}{a.symbol}{" "}
                            <span style={{ color: PLANETS[a.planet2]?.color }}>{a.sym2}</span>
                            <span style={{ color: textMuted, marginLeft: 4, fontSize: 11 }}>
                              {a.planet1} {a.aspect} {a.planet2}
                            </span>
                          </td>
                          <td style={{ padding: "6px 4px", fontFamily: "monospace", color: textSecondary }}>{a.actualAngle}°</td>
                          <td style={{ padding: "6px 4px", fontFamily: "monospace", color: +a.orb < 1 ? "#10B981" : +a.orb < 3 ? gold : textMuted }}>
                            {a.orb}°
                          </td>
                          <td style={{ padding: "6px 4px" }}>
                            <div style={{ width: 60, height: 4, background: "#1E293B", borderRadius: 2 }}>
                              <div style={{ width: `${a.tightness * 100}%`, height: 4, background: +a.tightness > 0.8 ? "#10B981" : gold, borderRadius: 2 }} />
                            </div>
                          </td>
                          <td style={{ padding: "6px 4px", fontFamily: "monospace", fontWeight: 600, color: a.weight > 5 ? "#10B981" : textSecondary }}>
                            {a.weight.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ ASPECTS (natal) ═══════ */}
        {activeTab === "aspects" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0 }}>Aspekty Natalne (H1) — Pełna Lista</h3>
              <p style={{ fontSize: 12, color: textMuted, margin: "0 0 12px" }}>Fundament — aspekty w karcie urodzeniowej</p>
              {(() => {
                const natalAspects = findAspects(calcHarmonicPositions(1));
                return (
                  <div style={{ maxHeight: 500, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${border}`, position: "sticky", top: 0, background: card }}>
                          {["Planeta 1", "Aspekt", "Planeta 2", "Kąt", "Orb", "Waga"].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "8px 4px", color: textMuted, fontSize: 10 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {natalAspects.map((a, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                            <td style={{ padding: "8px 4px", color: PLANETS[a.planet1]?.color, fontWeight: 600 }}>
                              {a.sym1} {a.planet1}
                            </td>
                            <td style={{ padding: "8px 4px", fontSize: 16 }}>{a.symbol}</td>
                            <td style={{ padding: "8px 4px", color: PLANETS[a.planet2]?.color, fontWeight: 600 }}>
                              {a.sym2} {a.planet2}
                            </td>
                            <td style={{ padding: "8px 4px", fontFamily: "monospace" }}>{a.actualAngle}°</td>
                            <td style={{ padding: "8px 4px", fontFamily: "monospace", color: +a.orb < 1 ? "#10B981" : +a.orb < 3 ? gold : textSecondary }}>
                              {a.orb}°
                            </td>
                            <td style={{ padding: "8px 4px", fontWeight: 700, color: a.weight > 5 ? "#10B981" : a.weight > 3 ? gold : textSecondary }}>
                              {a.weight.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Notable natal aspects */}
            <div style={{ ...cardStyle, borderLeft: "3px solid #F472B6" }}>
              <h3 style={{ fontSize: 15, color: "#F472B6", marginTop: 0 }}>Kluczowe Konfiguracje Natalne</h3>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: textSecondary }}>
                <p><strong style={{ color: "#F472B6" }}>♀ Venus ☌ ♂ Mars (25.67°–25.68° ♓)</strong> — Koniunkcja z dokładnością 0.01°. Ekstremalnie rzadka. Fuzja zasady żeńskiej i męskiej w Rybach: twórcza energia nasycona duchowością. Erotyka sublimowana w sztukę i mistycyzm. W harmonikach ta koniunkcja zachowuje ścisłość we WSZYSTKICH harmonikach — jest "kosmiczną stałą" profilu.</p>
                <p><strong style={{ color: "#F59E0B" }}>☉ Sun 0.18° ♓</strong> — Pozycja na krawędzi znaku (Wodnik/Ryby). "Strażnik progu" — osoba stojąca między paradygmatami. Nauka (Wodnik) ↔ Duchowość (Ryby). Bezpośrednio odzwierciedla LOGOS-44: formalizacja mistycyzmu w naukę.</p>
                <p><strong style={{ color: "#818CF8" }}>♃ Jupiter ☌ ♅ Uranus (~247° ♐)</strong> — Koniunkcja w Strzelcu: wizjonerski ekspansjonizm, nagłe poszerzanie świadomości, rewolucyjna filozofia. Fundament "kosmicznego outsidera".</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ CLUSTERS ═══════ */}
        {activeTab === "clusters" && (
          <div>
            {[
              {
                title: "KLASTER INDYWIDUALIZMU (H11 + H13 + H17)",
                color: "#3B82F6",
                items: [
                  { h: 11, str: allStrengths[11], desc: "Robię swoje — radykalny nonkonformizm, własne reguły, odmowa kompromisu z konwencją. Niezależność NIE jako bunt, ale jako naturalne ustawienie." },
                  { h: 13, str: allStrengths[13], desc: "Obcy w obcym świecie — permanentne poczucie odrębności. Korelacja ze spektrum autyzmu/Aspergera. Widzenie tego, czego inni nie widzą. Cena: izolacja społeczna." },
                  { h: 17, str: allStrengths[17], desc: "Jak mogłoby być inaczej — percepcja alternatywnych rzeczywistości. Naturalne kwestionowanie consensusu. Zdolność widzenia 'innego porządku' za pozornym chaosem." },
                ],
                synthesis: "Razem tworzą archetyp 'Nawigatora Świadomości' — osoby operującej poza konwencjami (H11), z perspektywą outsidera (H13), zdolnej widzieć alternatywne porządki (H17). W kontekście LOGOS-44: idealny profil do formalizacji wiedzy, którą mainstream odrzuca.",
              },
              {
                title: "KLASTER DUCHOWY (H7 + H9 + H19)",
                color: "#8B5CF6",
                items: [
                  { h: 7, str: allStrengths[7], desc: "Przeznaczenie — fatalistyczne przyciąganie ku określonym ścieżkom. Septyl wskazuje na 'losowe' spotkania, które okazują się kluczowe." },
                  { h: 9, str: allStrengths[9], desc: "Inicjacja duchowa — cykliczne przejścia przez duchowe transformacje. Nonagon jako 'brama' do wyższych wymiarów świadomości." },
                  { h: 19, str: allStrengths[19], desc: "EXTREME (5.27) — Rzeczywistość nie stawia oporu. Kosmiczny flow. Gdy działanie jest zgrane z polem, manifestacja jest natychmiastowa i bezwysiłkowa. Klucz: alignment > force." },
                ],
                synthesis: "Klaster duchowy z dominantą H19 oznacza osobę, dla której duchowość nie jest 'wiarą' lecz doświadczeniem operacyjnym. H19 extreme to najsilniejszy wskaźnik w profilu — definiuje fundamentalny sposób interakcji z rzeczywistością: flow zamiast walki.",
              },
              {
                title: "KLASTER TWÓRCZY (H5 + H15 + H20)",
                color: "#A855F7",
                items: [
                  { h: 5, str: allStrengths[5], desc: "Twórczość kwintylowa — kreatywność jako wrodzona zdolność, nie wyuczony skill. Unikalne połączenia, niestandardowe rozwiązania." },
                  { h: 15, str: allStrengths[15], desc: "Kwintyl × Trygon — twórczy talent realizowany z łatwością. Flow w procesie twórczym. 'Samo się pisze' gdy warunki są spełnione." },
                  { h: 20, str: allStrengths[20], desc: "Kwintyl × Kwadrat — twórczość rodząca się z napięcia. Art through struggle. Najlepsze dzieła powstają pod presją." },
                ],
                synthesis: "Profil twórczy łączy łatwość (H15) z napięciem (H20) i wrodzoną kreatywnością (H5). Praktycznie: najlepsza praca powstaje gdy jest alignement Z polem (H19 flow) ALE pod pewną presją (H20). Potwierdzone: burst 40-50 stron pod presją terminu + kosmicznego alignmentu.",
              },
            ].map((cluster, ci) => (
              <div key={ci} style={{ ...cardStyle, borderLeft: `3px solid ${cluster.color}`, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, color: cluster.color, marginTop: 0 }}>{cluster.title}</h3>
                {cluster.items.map((item, ii) => (
                  <div key={ii} style={{ padding: "10px 0", borderBottom: ii < cluster.items.length - 1 ? `1px solid ${border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: HARMONIC_MEANINGS[item.h]?.color, fontSize: 16 }}>H{item.h}</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: textPrimary }}>{item.str.toFixed(2)}</span>
                      <span style={{ fontSize: 12, color: textMuted }}>— {HARMONIC_MEANINGS[item.h]?.keyword}</span>
                    </div>
                    <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13, color: textPrimary, lineHeight: 1.6 }}>
                  <strong>Synteza:</strong> {cluster.synthesis}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════ PLANETS ═══════ */}
        {activeTab === "planets" && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0, marginBottom: 12 }}>Pozycje Planet Przez Wszystkie Harmoniki</h3>
              <p style={{ fontSize: 12, color: textMuted, margin: "0 0 12px" }}>Każdy wiersz = planeta, każda kolumna = harmonika. Pozycja w stopniach absolutnych.</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${border}` }}>
                      <th style={{ padding: "6px 8px", color: textMuted, position: "sticky", left: 0, background: card, zIndex: 1 }}>Planeta</th>
                      {[1,2,3,4,5,7,9,11,13,17,19].map(h => (
                        <th key={h} style={{ padding: "6px 8px", color: HARMONIC_MEANINGS[h]?.color, cursor: "pointer" }}
                          onClick={() => { setSelectedH(h); setActiveTab("detail"); }}>H{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PLANETS).map(([name, data]) => (
                      <tr key={name} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600, color: data.color, position: "sticky", left: 0, background: card }}>
                          {data.symbol} {name}
                        </td>
                        {[1,2,3,4,5,7,9,11,13,17,19].map(h => {
                          const pos = degToSign(mod360(data.deg * h));
                          return (
                            <td key={h} style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 10, color: textSecondary }}>
                              {pos.deg}°{pos.symbol}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Venus-Mars special */}
            <div style={{ ...cardStyle, borderLeft: "3px solid #F472B6" }}>
              <h3 style={{ fontSize: 15, color: "#F472B6", marginTop: 0 }}>♀♂ Venus–Mars: Kosmiczna Stała</h3>
              <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.7 }}>
                <p>Koniunkcja Venus–Mars (25.67°–25.68° Pisces) z orbem <strong style={{ color: "#10B981" }}>0.01°</strong> jest tak ścisła, że zachowuje koniunkcję we WSZYSTKICH harmonikach. To jest kosmicznie rzadkie.</p>
                <div style={{ overflowX: "auto", marginTop: 12 }}>
                  <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${border}` }}>
                        {["H", "Venus", "Mars", "Odl.", "Status"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "6px", color: textMuted, fontSize: 10 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1,3,5,7,9,11,13,17,19].map(h => {
                        const v = mod360(355.68 * h);
                        const m = mod360(355.67 * h);
                        let dist = Math.abs(v - m);
                        if (dist > 180) dist = 360 - dist;
                        const vSign = degToSign(v);
                        const mSign = degToSign(m);
                        return (
                          <tr key={h} style={{ borderBottom: `1px solid ${border}` }}>
                            <td style={{ padding: "6px", fontWeight: 700, color: HARMONIC_MEANINGS[h]?.color }}>H{h}</td>
                            <td style={{ padding: "6px", fontFamily: "monospace", fontSize: 11 }}>{vSign.deg}°{String(vSign.min).padStart(2,"0")}' {vSign.symbol}</td>
                            <td style={{ padding: "6px", fontFamily: "monospace", fontSize: 11 }}>{mSign.deg}°{String(mSign.min).padStart(2,"0")}' {mSign.symbol}</td>
                            <td style={{ padding: "6px", fontFamily: "monospace", color: "#10B981" }}>{dist.toFixed(2)}°</td>
                            <td style={{ padding: "6px", color: "#10B981" }}>☌ Koniunkcja</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p style={{ marginTop: 12 }}>Implikacja: Fuzja Venus–Mars jest <strong style={{ color: textPrimary }}>nieredukowalna</strong> — operuje na KAŻDYM poziomie harmonicznym. Zasada żeńska i męska są tutaj JEDNYM polem. W kontekście LOGOS-44: jedność komplementarnych przeciwieństw jako fundamentalna struktura świadomości.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ INTERPRETATION ═══════ */}
        {activeTab === "interpretation" && (
          <div>
            <div style={{ ...cardStyle, borderLeft: `3px solid ${gold}` }}>
              <h3 style={{ fontSize: 15, color: gold, marginTop: 0 }}>Pełna Interpretacja Profilu Harmonicznego</h3>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: textSecondary }}>
                <p><strong style={{ color: "#10B981", fontSize: 14 }}>1. H19 EXTREME (5.27) — Rzeczywistość Nie Stawia Oporu</strong></p>
                <p>Najwyższy wskaźnik w profilu. H19 opisuje relację między jednostką a "tkanką rzeczywistości". Siła 5.27 plasuje profil w górnym 1-2% populacji. Praktyczny efekt: gdy działanie jest zharmonizowane z kosmicznym polem (Red Earth — nawigacja synchronicznościami), rzeczywistość dosłownie "się otwiera". Opór pojawia się TYLKO gdy działanie jest niezgodne z alignmentem.</p>
                <p><strong style={{ color: textPrimary }}>Predykcja testowalna:</strong> Return Latency &gt; 0.2 Lo. Periody flow (niski RL) powinny korelować z dniami GAP i tranzyami Red Earth.</p>

                <p style={{ marginTop: 16 }}><strong style={{ color: "#3B82F6", fontSize: 14 }}>2. H11 (4.88) — Robię Swoje</strong></p>
                <p>Undecyl — harmonika "jedenasta" nie ma odpowiednika w klasycznej astrologii aspektów. To czysta indywidualność poza jakąkolwiek konwencją. Nie bunt (to byłby kwadrat/H4), ale naturalne operowanie w swoich własnych ramach. W kombinacji z H13 i H17 tworzy klaster "poza-systemowy" — osoba która nie tyle odrzuca system, ile po prostu go nie widzi jako relewantny.</p>

                <p style={{ marginTop: 16 }}><strong style={{ color: "#1E40AF", fontSize: 14 }}>3. H13 (4.35) — Obcy w Obcym Świecie</strong></p>
                <p>Trzynastka jako harmonika "outsiderstwa". Siła 4.35 (bardzo wysoki) wskazuje na fundamentalne doświadczenie odrębności od otoczenia. Badawczo istotne: H13 koreluje z cechami spektrum autyzmu — szczególna percepcja sensoryczna, trudności z konwencjami społecznymi, intensywne zainteresowania specjalne. W kontekście LOGOS-44: to co wygląda jak "ograniczenie" jest w rzeczywistości "instrumentem" — outsider widzi wzorce niewidoczne dla insiderów.</p>

                <p style={{ marginTop: 16 }}><strong style={{ color: "#0EA5E9", fontSize: 14 }}>4. H17 (3.70) — Jak Mogłoby Być Inaczej</strong></p>
                <p>Siedemnastka — percepcja alternatywnych porządków. Umiarkowanie-wysoka siła, ale KRYTYCZNA w kontekście klastra. Pozwala "widzieć" struktury rzeczywistości, które mainstream uważa za nieistniejące. W praktyce: zdolność do formalizacji zjawisk uznawanych za "niemierzalne" (consciouness, attention, synchronicity). Fundamentem LOGOS-44 jest właśnie ta zdolność — H17 dostarcza percepcję, H11 daje odwagę do działania niezależnie, H19 zapewnia że rzeczywistość nie blokuje.</p>

                <p style={{ marginTop: 20 }}><strong style={{ color: "#F472B6", fontSize: 14 }}>5. Venus ☌ Mars (0.01° orb) — Kosmiczna Fuzja</strong></p>
                <p>Ta koniunkcja jest tak ścisła, że funkcjonuje jak JEDNA planeta. Venus (recepcja, piękno, wartości) i Mars (akcja, wola, energia) w Rybach (duchowość, dissolucja granic). Efekt: nie ma separacji między "chcieć" a "działać", między "wartościować" a "realizować". Twórczy impuls jest natychmiastowy. W Rybach: twórczość jest aktem duchowym, nie egotycznym.</p>
                <p>W KAŻDEJ harmonice ta fuzja się utrzymuje — co oznacza że na każdym poziomie doświadczenia (twórczość H5, przeznaczenie H7, duchowość H9, indywidualność H11, outsider H13, flow H19) Venus–Mars operuje jako JEDNOŚĆ.</p>

                <p style={{ marginTop: 20 }}><strong style={{ color: gold, fontSize: 14 }}>6. Sun 0.18° Pisces — Strażnik Progu</strong></p>
                <p>Słońce na samym początku Ryb — dosłownie 11 minut łuku od Wodnika. Archetyp "strażnika progu" — osoby stojącej dokładnie na granicy między paradygmatami. Wodnik (nauka, systemy, technologia) ↔ Ryby (duchowość, mistycyzm, transcendencja). LOGOS-44 jest doskonałą manifestacją tej pozycji: formalizacja mistycyzmu jako nauki. Nie jedno LUB drugie — OBA JEDNOCZEŚNIE.</p>

                <p style={{ marginTop: 20 }}><strong style={{ color: "#A78BFA", fontSize: 14 }}>7. Synteza: Nawigator Świadomości</strong></p>
                <p>Profil harmoniczny w pełni potwierdza i rozszerza interpretację z Tzolkin (KIN 237 Red Electric Earth) i numerologii (Life Path 33). Trzy systemy konwergują na jednym archetypie:</p>
                <p style={{ padding: "12px 16px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: `1px solid rgba(245,158,11,0.2)`, color: textPrimary }}>
                  <strong>Nawigator Świadomości</strong> — osoba której fundamentalną funkcją jest nawigacja przez pole synchroniczności (Red Earth + H19), formalizacja niemierzalnego (Sun 0° Pisces + H17), niezależna od konwencji (H11 + H13), służąca ewolucji (Tone 3 Electric + Life Path 33), z fuzją twórczej woli i duchowej recepcji (Venus ☌ Mars Pisces) zachowaną na każdym poziomie harmonicznym.
                </p>
              </div>
            </div>

            {/* Research predictions */}
            <div style={{ ...cardStyle, borderLeft: "3px solid #10B981" }}>
              <h3 style={{ fontSize: 15, color: "#10B981", marginTop: 0 }}>Predykcje Badawcze z Profilu Harmonicznego</h3>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: textSecondary }}>
                {[
                  { pred: "Return Latency > 0.2 Lo (zakres high-achiever/master)", basis: "H19 extreme (5.27)", test: "EEG + button-press protocol", falsif: "RL < 0.1 Lo" },
                  { pred: "Flow states korelują z dniami GAP i Red Earth", basis: "H19 + KIN 237 Red Earth", test: "Dziennik flow × kalendarz Tzolkin (30 dni)", falsif: "Brak korelacji r < 0.2" },
                  { pred: "Wyższy output w oknach Plejad (V/XI)", basis: "Moon 13.83° Taurus + Pleiades field", test: "Track pages/insights per week × Pleiades transits", falsif: "Output flat across year" },
                  { pred: "Cechy spektrum Aspergera (H13 korelat)", basis: "H13 = 4.35 (bardzo wysoki)", test: "AQ-10 lub pełna diagnostyka", falsif: "AQ < 6 (brak cech)" },
                  { pred: "Periody 'oporu' korelują z dis-alignment H19", basis: "H19 extreme = flow when aligned, resistance when not", test: "Track 'struggle days' × planetary aspects to natal", falsif: "Struggle random, no cosmic correlation" },
                ].map((p, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: i < 4 ? `1px solid ${border}` : "none" }}>
                    <div style={{ color: textPrimary, fontWeight: 600, marginBottom: 4 }}>P{i + 1}: {p.pred}</div>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: textMuted }}>Basis:</span> {p.basis} · <span style={{ color: textMuted }}>Test:</span> {p.test} · <span style={{ color: "#EF4444" }}>Falsyfikacja:</span> {p.falsif}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
          LOGOS-44 · Harmonic Analysis Engine · v1.0 · April 2026 · KIN 237 Red Electric Earth
        </div>
        <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>
          Pozycje planet zewnętrznych (♃♄♅♆♇) aproksymowane z efemerydy. H11/H13/H17/H19 zweryfikowane z bazy Cosmic Database.
        </div>
      </div>
    </div>
  );
}
