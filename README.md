<div align="center">

# hi this is my teritory

**get out**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Mineflayer](https://img.shields.io/badge/Mineflayer-4.37%2B-ff6b35?style=for-the-badge)](https://github.com/PrismarineJS/mineflayer)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

</div>

---

## ✨ What It Does

Aurora is not just an AFK bot that sits still — it **actually doesnt behave like a real player**. It moves around randomly, eats food, responds to greetings, and pathfinds to players on command.

```
[22:36:42] OK    Spawned in as aurora_assistant.
[22:36:43] INFO  Auto-eat deleted.
[22:36:43] OK    Status server running on http://localhost:6767
[22:36:44] CHAT  <Sunil> hi
[22:36:45] CHAT  -> Sunil: Hi
[22:36:52] CHAT  <Sunil> !come
[22:36:52] CHAT  -> Sunil: Coming to you, Sunil!
```

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🏃 **Anti-AFK Movement** | Random walking, looking around, jumping, treading water — looks like a real player |
| 🗺️ **Pathfinding** | `!come`, `!goto x y z`, `!follow` — bot physically walks to locations |
| 🍖 **Auto-Eat** | Automatically eats when hunger drops below a threshold |
| 🔐 **Auto Auth** | Handles `/register` and `/login` on AuthMe-style servers |
| 🔁 **Auto-Reconnect** | Exponential backoff reconnect — survives kicks, restarts, and network blips |
| 📡 **Live Status Page** | Web dashboard at `localhost:8080` showing HP, position, uptime, etc. |
| ⚙️ **Config File** | Everything configurable via `config.json` — no code editing needed |
| 🌍 **Environment Variables** | `.env` override support for cloud/hosting deployments |

---

## 📋 Requirements

- **Node.js 18 or newer** — [Download here](https://nodejs.org)
- A Minecraft Java Edition server (cracked/offline or premium)

> ⚠️ **Version Note:** Mineflayer supports specific Minecraft versions. Check which versions are supported by running `node -e "require('minecraft-data').supportedVersions.pc.slice(-5).forEach(v=>console.log(v))"` after installing. Use a matching server version.
>
> If your server shows a build number like `26.1.2` (PaperMC), that is **not** the Minecraft version. Check your panel for the actual MC version (e.g. `1.21.1`) and use that.

---

## ⚡ Quick Start

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/aurora-afk-bot.git
cd aurora-afk-bot
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure the bot**

Edit `config.json`:
```json
{
  "server": {
    "host": "your-server-ip",
    "port": 25565,
    "version": "1.21.1"
  },
  "bot": {
    "username": "aurora_assistant",
    "auth": "offline"
  }
}
```

**4. Start the bot**
```bash
npm start
```

---

## 💬 Chat Commands

Type these in Minecraft chat (default prefix: `!`):

| Command | What it does |
|---|---|
| `!help` | List all available commands |
| `!ping` | Check bot's latency |
| `!status` | Show HP, food, position, uptime |
| `!players` | List visible online players |
| `!time` | Current in-game time (day/night) |
| `!inv` | Show bot's inventory |
| `!come` | Bot walks to you |
| `!goto <x> <y> <z>` | Bot walks to coordinates |
| `!follow [player]` | Bot continuously follows a player |
| `!stop` | Stop all movement |

The bot also auto-replies to greetings like `hello` or `how are you` in chat.

---

## ⚙️ Full Config Reference

```json
{
  "server": {
    "host": "your-server-ip",     // Server address
    "port": 25565,                 // Server port
    "version": "1.21.1"           // MC version (must match server exactly)
  },
  "bot": {
    "username": "aurora_assistant",
    "auth": "offline",             // "offline", "microsoft", or "mojang"
    "password": ""
  },
  "auth": {
    "autoRegister": true,          // Auto /register on AuthMe servers
    "autoLogin": true,             // Auto /login on AuthMe servers
    "registerLoginPassword": "Bot@12345",
    "autoAcceptTeleport": true
  },
  "antiAfk": {
    "enabled": true,
    "randomMovement": true,
    "randomLook": true,
    "jump": true,
    "swimIfInWater": true,
    "minIntervalMs": 4000,         // Min wait between movements
    "maxIntervalMs": 12000         // Max wait between movements
  },
  "autoEat": {
    "enabled": true,
    "startAt": 18                  // Eat when food drops below this (out of 20)
  },
  "chat": {
    "commandPrefix": "!",
    "respondToGreetings": true,
    "announceOnSpawn": true,
    "ownerName": ""                // Your username — owner gets extra trust
  },
  "reconnect": {
    "enabled": true,
    "delayMs": 5000,               // Initial reconnect delay
    "maxDelayMs": 60000            // Max reconnect delay (exponential backoff)
  },
  "statusServer": {
    "enabled": true,
    "port": 8080                   // Web status page port
  }
}
```

---

## 🌐 Environment Variables

You can override any `config.json` value via environment variables — useful for hosting platforms where you set env vars in a dashboard:

```env
MC_HOST=play.myserver.net
MC_PORT=25565
MC_VERSION=1.21.1
MC_USERNAME=aurora_assistant
MC_AUTH=offline
MC_PASSWORD=
```

Copy `.env.example` to `.env` to get started.

---

## 📡 Status Web Page

While the bot is running, open **http://localhost:8080** in your browser:

```
aurora_assistant
Status:     Connected ✅
Server:     play.myserver.net:25565
Health:     18/20
Food:       20/20
Position:   142, 64, -88
Uptime:     2h 14m 33s
Reconnects: 0
```

JSON endpoint also available at `/status.json`.

---

## 🏗️ Project Structure

```
aurora-afk-bot/
├── index.js              # Entry point — bot lifecycle, plugin wiring
├── config.json           # All settings
├── .env.example          # Environment variable template
├── package.json
├── lib/
│   ├── antiAfk.js        # Randomised idle movement (walk, look, jump, swim)
│   ├── commands.js       # !command handler + pathfinder commands
│   ├── logger.js         # Timestamped coloured console output
│   └── statusServer.js   # HTTP status dashboard
└── README.md
```

---

## 🔧 Running 24/7

To keep the bot online when you close your computer, deploy it somewhere:

| Platform | Notes |
|---|---|
| **Railway** | Free tier available, set env vars in dashboard, deploys from GitHub |
| **Render** | Free tier (spins down after inactivity — use the status page as ping target) |
| **VPS** (DigitalOcean, Contabo, etc.) | Most reliable, use `pm2` to manage the process |
| **Raspberry Pi** | Great for home 24/7 hosting |

**Using PM2 on a VPS:**
```bash
npm install -g pm2
pm2 start index.js --name aurora-bot
pm2 save
pm2 startup
```

---

## ❓ Troubleshooting

**`unsupported protocol version`**
→ Your `config.json` version doesn't match the server. Use the actual Minecraft version string (e.g. `"1.21.1"`), not the software build number. PaperMC shows its own build number (like `26.1.2`) — ignore that and find the actual MC version.

**Bot connects but immediately disconnects**
→ The server may require a valid Minecraft account. Set `"auth": "microsoft"` in config and authenticate via the browser device code shown in console on first run.

**`Cannot find module`**
→ Run `npm install` again inside the bot folder.

**Bot keeps reconnecting in a loop**
→ Check the server is actually online and that the version in `config.json` matches exactly.

---

## 📜 License

ISC License — free to use, modify, and distribute.

---

## ⚠️ Disclaimer

This bot is intended for use on servers where you have permission to run automated clients. Many public servers prohibit bots in their rules. Always check before running. Use responsibly.

---

<div align="center">

Built with [Mineflayer](https://github.com/PrismarineJS/mineflayer) · Made with ❤️

</div>#
