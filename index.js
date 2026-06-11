const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'stats') {
    const game = interaction.options.getString('game');
    const result = interaction.options.getString('result');

    const { error } = await supabase.from('sessions').insert({
      discord_user_id: interaction.user.id,
      username: interaction.user.username,
      game,
      result,
      played_at: new Date()
    });

    if (error) {
      await interaction.reply('❌ Something went wrong logging your session.');
    } else {
      await interaction.reply(`✅ Logged: **${game}** — ${result}`);
    }
  }

  if (interaction.commandName === 'leaderboard') {
    const { data, error } = await supabase
      .from('sessions')
      .select('username, result')
      .eq('result', 'win');

    if (error || !data.length) {
      await interaction.reply('No wins logged yet. Be the first!');
      return;
    }

    const counts = {};
    data.forEach(s => {
      counts[s.username] = (counts[s.username] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];
    const msg = sorted
      .map(([u, w], i) => `${medals[i] || `${i + 1}.`} **${u}** — ${w} win${w > 1 ? 's' : ''}`)
      .join('\n');

    await interaction.reply(`🏆 **Rankwatch Leaderboard**\n\n${msg}`);
  }

  if (interaction.commandName === 'nowplaying') {
    const game = interaction.options.getString('game');
    await interaction.reply(`🎮 **${interaction.user.username}** is now playing **${game}**`);
  }
});

client.login(process.env.DISCORD_TOKEN);