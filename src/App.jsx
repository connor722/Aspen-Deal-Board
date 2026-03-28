import { useState, useEffect } from “react”;

const CONTRACT_TYPES = {
ATM:  { label: “ATM”,  color: “#22c55e”, bg: “rgba(34,197,94,0.15)”,   border: “#16a34a”, count: 65 },
AIR:  { label: “AIR”,  color: “#f97316”, bg: “rgba(249,115,22,0.15)”,  border: “#ea580c”, count: 10 },
PAY:  { label: “PAY”,  color: “#3b82f6”, bg: “rgba(59,130,246,0.15)”,  border: “#2563eb”, count: 10 },
CLAW: { label: “CLAW”, color: “#ec4899”, bg: “rgba(236,72,153,0.15)”,  border: “#db2777”, count: 15 },
};

const DEFAULT_REPS = [“Rep 1”, “Rep 2”, “Rep 3”, “Rep 4”, “Rep 5”];
const SLOTS = Array.from({ length: 100 }, (_, i) => {
const n = i + 1;
if (n <= 65) return “ATM”;
if (n <= 75) return “AIR”;
if (n <= 85) return “PAY”;
return “CLAW”;
});

const STORAGE_KEY = “deal-board-v2”;
const REPS_KEY = “deal-board-reps-v2”;

export default function App() {
const [slots, setSlots] = useState(() => {
try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
return SLOTS.map(type => ({ type, status: “open”, name: “”, rep: “” }));
});
const [reps, setReps] = useState(() => {
try { const r = localStorage.getItem(REPS_KEY); if (r) return JSON.parse(r); } catch {}
return DEFAULT_REPS;
});
const [editing, setEditing] = useState(null);
const [inputName, setInputName] = useState(””);
const [inputRep, setInputRep] = useState(””);
const [filter, setFilter] = useState(“ALL”);
const [repFilter, setRepFilter] = useState(“ALL”);
const [editingReps, setEditingReps] = useState(false);
const [repDraft, setRepDraft] = useState([…DEFAULT_REPS]);

useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slots)); } catch {} }, [slots]);
useEffect(() => { try { localStorage.setItem(REPS_KEY, JSON.stringify(reps)); } catch {} }, [reps]);

const closed = slots.filter(s => s.status === “closed”).length;
const inprogress = slots.filter(s => s.status === “inprogress”).length;
const pct = Math.round((closed / 100) * 100);

const handleSlotClick = (i) => {
const s = slots[i];
if (s.status === “open”) { setEditing(i); setInputName(””); setInputRep(””); }
else if (s.status === “inprogress”) { const u = […slots]; u[i] = { …s, status: “closed” }; setSlots(u); }
else { const u = […slots]; u[i] = { …s, status: “open”, name: “”, rep: “” }; setSlots(u); }
};

const confirmEdit = () => {
if (!inputName.trim()) return;
const u = […slots];
u[editing] = { …slots[editing], status: “inprogress”, name: inputName.trim(), rep: inputRep };
setSlots(u);
setEditing(null);
};

const saveReps = () => {
const cleaned = repDraft.map(r => r.trim()).filter(Boolean);
setReps(cleaned);
setEditingReps(false);
setRepFilter(“ALL”);
};

const resetAll = () => { if (confirm(“Reset all 100 slots?”)) setSlots(SLOTS.map(t => ({ type: t, status: “open”, name: “”, rep: “” }))); };

const repColor = (rep) => {
const colors = [”#f472b6”,”#60a5fa”,”#34d399”,”#fbbf24”,”#c084fc”,”#fb923c”];
const idx = reps.indexOf(rep);
return colors[idx % colors.length] || “#9ca3af”;
};

const visibleSlots = slots
.map((s, i) => ({ …s, i }))
.filter(s => (filter === “ALL” || s.type === filter) && (repFilter === “ALL” || s.rep === repFilter));

// Rep leaderboard
const repStats = reps.map(r => ({
name: r,
closed: slots.filter(s => s.rep === r && s.status === “closed”).length,
inprogress: slots.filter(s => s.rep === r && s.status === “inprogress”).length,
total: slots.filter(s => s.rep === r).length,
})).sort((a, b) => b.closed - a.closed);

return (
<div style={{ background: “#0a0a12”, minHeight: “100vh”, padding: “20px 16px 60px”, fontFamily: “‘Segoe UI’, sans-serif”, color: “white” }}>
<div style={{ maxWidth: 880, margin: “0 auto” }}>

```
    {/* Header */}
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>30-Day Sprint</div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>100 Contract <span style={{ color: "#a78bfa" }}>Deal Board</span></h1>
      <p style={{ fontSize: 12, color: "#6b7280" }}>Click open slot → assign deal + rep → click again to close ✓</p>
    </div>

    {/* Progress */}
    <div style={{ background: "#13101f", border: "1px solid #1f1a35", borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>{closed}<span style={{ fontSize: 16, color: "#6b7280", fontWeight: 400 }}>/100</span></div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Contracts Closed</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24" }}>{pct}%</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Complete</div>
        </div>
      </div>
      <div style={{ background: "#1f1a35", borderRadius: 999, height: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#7c3aed,#ec4899)", width: `${pct}%`, transition: "width 0.4s" }} />
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {[["Open", 100 - closed - inprogress, "#4b5563"], ["In Progress", inprogress, "#fbbf24"], ["Closed", closed, "#22c55e"]].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{l}: <strong style={{ color: "white" }}>{v}</strong></span>
          </div>
        ))}
      </div>
    </div>

    {/* Product type cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
      {Object.entries(CONTRACT_TYPES).map(([key, t]) => {
        const total = slots.filter(s => s.type === key).length;
        const done = slots.filter(s => s.type === key && s.status === "closed").length;
        return (
          <div key={key} onClick={() => setFilter(filter === key ? "ALL" : key)}
            style={{ background: filter === key ? t.bg : "#13101f", border: `1px solid ${filter === key ? t.border : "#1f1a35"}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{done}<span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>/{total}</span></div>
            <div style={{ background: "#1f1a35", borderRadius: 999, height: 4, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: t.color, width: `${Math.round((done/total)*100)}%`, transition: "width 0.4s" }} />
            </div>
          </div>
        );
      })}
    </div>

    {/* Rep Leaderboard */}
    <div style={{ background: "#13101f", border: "1px solid #1f1a35", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>🏆 Rep Leaderboard</div>
        <div style={{ display: "flex", gap: 8 }}>
          {repFilter !== "ALL" && (
            <button onClick={() => setRepFilter("ALL")} style={{ fontSize: 11, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Show all</button>
          )}
          <button onClick={() => { setRepDraft([...reps]); setEditingReps(true); }}
            style={{ fontSize: 11, background: "#1f1a35", border: "1px solid #2d2a45", borderRadius: 8, padding: "4px 10px", color: "#9ca3af", cursor: "pointer" }}>
            Edit Reps
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {repStats.map((r, idx) => (
          <div key={r.name} onClick={() => setRepFilter(repFilter === r.name ? "ALL" : r.name)}
            style={{ display: "flex", alignItems: "center", gap: 12, background: repFilter === r.name ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${repFilter === r.name ? "#7c3aed" : "transparent"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: idx === 0 && r.closed > 0 ? "#fbbf24" : "#4b5563", width: 20, textAlign: "center" }}>
              {idx === 0 && r.closed > 0 ? "🥇" : `${idx + 1}`}
            </div>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: repColor(r.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>
              {r.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 3 }}>{r.name}</div>
              <div style={{ background: "#1f1a35", borderRadius: 999, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: repColor(r.name), width: `${Math.round((r.closed / 20) * 100)}%`, transition: "width 0.4s" }} />
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: repColor(r.name) }}>{r.closed}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>closed</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>{r.inprogress}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>active</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Active filters */}
    {(filter !== "ALL" || repFilter !== "ALL") && (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Showing:</span>
        {filter !== "ALL" && <span style={{ fontSize: 12, background: CONTRACT_TYPES[filter].bg, color: CONTRACT_TYPES[filter].color, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{filter}</span>}
        {repFilter !== "ALL" && <span style={{ fontSize: 12, background: "rgba(124,58,237,0.15)", color: "#a78bfa", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{repFilter}</span>}
        <button onClick={() => { setFilter("ALL"); setRepFilter("ALL"); }} style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear filters</button>
      </div>
    )}

    {/* Grid */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 6 }}>
      {visibleSlots.map(({ i, type, status, name, rep }) => {
        const t = CONTRACT_TYPES[type];
        const isClosed = status === "closed";
        const isIP = status === "inprogress";
        const rc = rep ? repColor(rep) : null;
        return (
          <div key={i} onClick={() => handleSlotClick(i)}
            title={`${type} #${i+1}${name ? ` — ${name}` : ""}${rep ? ` (${rep})` : ""}`}
            style={{ aspectRatio: "1", borderRadius: 8, border: `1.5px solid ${isClosed ? t.border : isIP ? t.color : "#1f1a35"}`, background: isClosed ? t.bg : isIP ? "rgba(255,255,255,0.05)" : "#13101f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "all 0.15s" }}>
            {isClosed ? (
              <>
                <div style={{ fontSize: 14, color: t.color }}>✓</div>
                {rc && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: rc }} />}
              </>
            ) : (
              <>
                <div style={{ fontSize: 8, fontWeight: 700, color: isIP ? t.color : "#4b5563", letterSpacing: 0.5 }}>{type}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>{i + 1}</div>
                {isIP && rc && <div style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: rc }} />}
              </>
            )}
          </div>
        );
      })}
    </div>

    {/* Legend */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {reps.map(r => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: repColor(r) }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{r}</span>
          </div>
        ))}
      </div>
      <button onClick={resetAll} style={{ background: "none", border: "1px solid #2d2a45", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#6b7280", cursor: "pointer" }}>Reset Board</button>
    </div>

    {/* Deal modal */}
    {editing !== null && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
        <div style={{ background: "#13101f", border: "1px solid #1f1a35", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 11, color: CONTRACT_TYPES[slots[editing].type].color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            {CONTRACT_TYPES[slots[editing].type].label} — Slot #{editing + 1}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 18 }}>Assign Deal</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Business Name *</div>
          <input autoFocus value={inputName} onChange={e => setInputName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirmEdit()}
            placeholder="e.g. Mike's Liquor Store"
            style={{ width: "100%", background: "#0a0a12", border: "1px solid #2d2a45", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "white", outline: "none", marginBottom: 14 }} />
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Assign Rep</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {reps.map(r => (
              <button key={r} onClick={() => setInputRep(inputRep === r ? "" : r)}
                style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${inputRep === r ? repColor(r) : "#2d2a45"}`, background: inputRep === r ? `${repColor(r)}22` : "transparent", color: inputRep === r ? repColor(r) : "#9ca3af", transition: "all 0.15s" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={confirmEdit}
              style={{ flex: 1, background: CONTRACT_TYPES[slots[editing].type].color, border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>
              Mark In Progress
            </button>
            <button onClick={() => setEditing(null)}
              style={{ background: "#1f1a35", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#9ca3af", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit reps modal */}
    {editingReps && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
        <div style={{ background: "#13101f", border: "1px solid #1f1a35", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 18 }}>✏️ Edit Rep Names</div>
          {repDraft.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: repColor(r), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>{r.charAt(0).toUpperCase()}</div>
              <input value={r} onChange={e => { const d = [...repDraft]; d[i] = e.target.value; setRepDraft(d); }}
                style={{ flex: 1, background: "#0a0a12", border: "1px solid #2d2a45", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "white", outline: "none" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={saveReps}
              style={{ flex: 1, background: "#7c3aed", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>
              Save Names
            </button>
            <button onClick={() => setEditingReps(false)}
              style={{ background: "#1f1a35", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#9ca3af", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
</div>
```

);
}
