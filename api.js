const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: {
      fetch: (...args) => import('node-fetch').then(({ default: f }) => f(...args))
    }
  }
);


app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;

  const { data, error } = await supabase
    .from('sessions')
    .select('game, result, played_at')
    .eq('username', username)
    .order('played_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const summary = {};
  data.forEach(s => {
    if (!summary[s.game]) summary[s.game] = { wins: 0, losses: 0, draws: 0 };
    if (s.result === 'win') summary[s.game].wins++;
    if (s.result === 'loss') summary[s.game].losses++;
    if (s.result === 'draw') summary[s.game].draws++;
  });

  res.json({ username, games: summary, recent: data.slice(0, 10) });
});

app.get('/api/sessions', async (req, res) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('played_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/sessions', async (req, res) => {
  const { username, game, result } = req.body;
  const { data, error } = await supabase
    .from('sessions')
    .insert({ username, game, result, played_at: new Date() })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.get('/api/leaderboard', async (req, res) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('username, result');

  if (error) return res.status(500).json({ error: error.message });

  const counts = {};
  data.forEach(s => {
    if (!counts[s.username]) counts[s.username] = { wins: 0, losses: 0, draws: 0 };
    if (s.result === 'win') counts[s.username].wins++;
    if (s.result === 'loss') counts[s.username].losses++;
    if (s.result === 'draw') counts[s.username].draws++;
  });

  const leaderboard = Object.entries(counts)
    .sort((a, b) => b[1].wins - a[1].wins)
    .map(([username, stats]) => ({ username, ...stats }));

  res.json(leaderboard);
});

app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});