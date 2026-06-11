const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'stats',
    description: 'Log a gaming session',
    options: [
      {
        name: 'game',
        description: 'Game you played',
        type: 3,
        required: true
      },
      {
        name: 'result',
        description: 'win, loss, or draw',
        type: 3,
        required: true,
        choices: [
          { name: 'Win', value: 'win' },
          { name: 'Loss', value: 'loss' },
          { name: 'Draw', value: 'draw' }
        ]
      }
    ]
  },
  {
    name: 'leaderboard',
    description: 'Show the server win leaderboard'
  },
  {
    name: 'nowplaying',
    description: 'Set what you are currently playing',
    options: [
      {
        name: 'game',
        description: 'Game you are playing right now',
        type: 3,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log('Done! Commands registered.');
  } catch (error) {
    console.error(error);
  }
})();