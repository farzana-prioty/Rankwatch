import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3001";

export default function App() {
  const [dark, setDark] = useState(() => {
  return localStorage.getItem('theme') === 'dark';
});
  const [leaderboard, setLeaderboard] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", game: "", result: "win" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [formErrors, setFormErrors] = useState({ username: "", game: "" });

  useEffect(() => {
    axios.get(`${API}/api/leaderboard`).then(r => setLeaderboard(r.data));
    axios.get(`${API}/api/sessions`).then(r => {
      setSessions(r.data);
      const counts = {};
      r.data.forEach(s => { counts[s.game] = (counts[s.game] || 0) + 1; });
      setChartData(Object.entries(counts).map(([game, count]) => ({ game, count })));
    });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const t = dark ? "dark" : "light";

//   const logSession = async () => {
//   if (!form.username || !form.game) return;
//   setSubmitting(true);
//   try {
//     await axios.post(`${API}/api/sessions`, form);
//     const [lb, sess] = await Promise.all([
//       axios.get(`${API}/api/leaderboard`),
//       axios.get(`${API}/api/sessions`)
//     ]);
//     setLeaderboard(lb.data);
//     setSessions(sess.data);
//     const counts = {};
//     sess.data.forEach(s => { counts[s.game] = (counts[s.game] || 0) + 1; });
//     setChartData(Object.entries(counts).map(([game, count]) => ({ game, count })));
//     setForm({ username: "", game: "", result: "win" });
//     setShowModal(false);
//     setToast("✅ Session logged!");
//     setTimeout(() => setToast(""), 3000); 
//   } catch (err) {
//     console.error(err);
//   }
//   setSubmitting(false);
// };
const logSession = async () => {
  const errors = { username: "", game: "" };
  if (!form.username.trim()) errors.username = "Please enter a username.";
  if (!form.game.trim()) errors.game = "Please enter a game name.";
  
  if (errors.username || errors.game) {
    setFormErrors(errors);
    return;
  }

  setFormErrors({ username: "", game: "" });
  setSubmitting(true);
  try {
    await axios.post(`${API}/api/sessions`, form);
    const [lb, sess] = await Promise.all([
      axios.get(`${API}/api/leaderboard`),
      axios.get(`${API}/api/sessions`)
    ]);
    setLeaderboard(lb.data);
    setSessions(sess.data);
    const counts = {};
    sess.data.forEach(s => { counts[s.game] = (counts[s.game] || 0) + 1; });
    setChartData(Object.entries(counts).map(([game, count]) => ({ game, count })));
    setForm({ username: "", game: "", result: "win" });
    setShowModal(false);
    setToast("✅ Session logged!");
    setTimeout(() => setToast(""), 3000);
  } catch (err) {
    console.error(err);
  }
  setSubmitting(false);
};

  return (
    <div className={`app ${t}`}>
      <aside className="sidebar">
        <div className="logo">⚔️ Rankwatch</div>
        <span className="nav-section">Menu</span>
        <div className="nav-item active">🏠 Dashboard</div>
        <div className="nav-item">📊 Stats</div>
        <div className="nav-item">👥 Players</div>
        <div className="nav-item">🕐 Sessions</div>
        <span className="nav-section">System</span>
        <div className="nav-item">⚙️ Settings</div>
        {/* <div className="theme-toggle" onClick={() => {
  const next = !dark;
  setDark(next);
  localStorage.setItem('theme', next ? 'dark' : 'light');
}}>
          {dark ? "☀️ Light mode" : "🌙 Dark mode"}
        </div> */}
      </aside>

      <main className="main">
      <div className="topbar">
  <h1>Dashboard</h1>
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <button className="theme-btn" onClick={() => {
      const next = !dark;
      setDark(next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
    }}>
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
    <button className="log-btn" onClick={() => setShowModal(true)}>+ Log session</button>
    <div className="badge"><span className="dot" />Rankwatch online</div>
  </div>
</div>

        <div className="stats-row">
          <div className="stat-card accent">
            <div className="stat-label">🎮 Total sessions</div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-sub">all time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">🏆 Top player</div>
            <div className="stat-value sm">{leaderboard[0]?.username || "—"}</div>
            <div className="stat-sub pink">{leaderboard[0]?.wins} wins</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">🔥 Most played</div>
            <div className="stat-value sm">{chartData[0]?.game || "—"}</div>
            <div className="stat-sub">{chartData[0]?.count} sessions</div>
          </div>
        </div>

        <div className="bottom-row">
          <div className="card">
            <div className="card-title">📊 Sessions by game</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="game" tick={{ fontSize: 12, fontWeight: 600, fill: dark ? "#a89cc8" : "#4b3a7a" }} />
                <YAxis tick={{ fontSize: 11, fill: dark ? "#a89cc8" : "#9b8bb5" }} />
                <Tooltip
                  contentStyle={{
                    background: dark ? "#1a1630" : "#fff",
                    border: "0.5px solid",
                    borderColor: dark ? "#4a3fa0" : "#e8e0f5",
                    borderRadius: 8,
                    color: dark ? "#f0e6ff" : "#2d1f4e"
                  }}
                />
                <Bar dataKey="count" fill={dark ? "#7c3aed" : "#a855f7"} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

         <div className="card">
  <div className="card-title">🏆 Leaderboard</div>
  <table className="table">
    <thead>
      <tr><th>#</th><th>Player</th><th>W</th><th>L</th><th>D</th></tr>
    </thead>
    <tbody>
      {leaderboard.map((p, i) => (
        <tr key={p.username}>
          <td>{medals[i] || i + 1}</td>
          <td>
            <span className="avatar">{p.username[0].toUpperCase()}</span>
            {p.username}
          </td>
          <td className="wins">{p.wins}</td>
          <td className="losses">{p.losses}</td>
          <td className="draws">{p.draws}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">🕐 Recent sessions</div>
          <table className="table">
            <thead>
              <tr><th>Player</th><th>Game</th><th>Result</th><th>Date</th></tr>
            </thead>
            <tbody>
              {sessions.slice(0, 8).map(s => (
                <tr key={s.id}>
                  <td><span className="avatar">{s.username[0].toUpperCase()}</span>{s.username}</td>
                  <td>{s.game}</td>
                  <td><span className={`pill ${s.result}`}>{s.result}</span></td>
                  <td>{new Date(s.played_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className={`modal ${t}`} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-title">Log a session</span>
        <span className="modal-x" onClick={() => setShowModal(false)}>✕</span>
      </div>
      <div className="field">
  <label>Username</label>
  <input
    placeholder="e.g. sienna95"
    value={form.username}
    className={formErrors.username ? "empty" : ""}
    onChange={e => {
      setForm({ ...form, username: e.target.value });
      setFormErrors({ ...formErrors, username: "" });
    }}
  />
  {formErrors.username && <div className="field-error">{formErrors.username}</div>}
</div>

<div className="field">
  <label>Game</label>
  <input
    placeholder="e.g. Valorant"
    value={form.game}
    className={formErrors.game ? "empty" : ""}
    onChange={e => {
      setForm({ ...form, game: e.target.value });
      setFormErrors({ ...formErrors, game: "" });
    }}
  />
  {formErrors.game && <div className="field-error">{formErrors.game}</div>}
</div>
      <div className="field">
        <label>Result</label>
        <select
          value={form.result}
          onChange={e => setForm({ ...form, result: e.target.value })}
        >
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="draw">Draw</option>
        </select>
      </div>
      <button className="modal-btn" onClick={logSession} disabled={submitting}>
        {submitting ? "Logging..." : "Log session"}
      </button>
    </div>
  </div>
)}
{toast && <div className="toast">{toast}</div>}
    </div>
  );
}