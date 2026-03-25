# 🏢 Agentic Office

**A 2D interactive office world populated by real AI agents** — built with HTML5 Canvas, Node.js, and live API connections to Claude, GPT, and custom webhooks.

![Agentic Office Preview](https://img.shields.io/badge/status-live-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Node](https://img.shields.io/badge/node-22+-green)

---

## ✨ What It Is

Agentic Office is a Stardew Valley–style top-down office simulation where every "employee" is a real AI agent you can chat with. Agents walk around, socialize, take coffee breaks, go on PTO, celebrate shipped features — and when you click them, you get a live chat window backed by an actual LLM API.

### 🏛️ Rooms

| Room | Purpose |
|------|---------|
| **Administration** | University leadership and strategic agents |
| **Enrollment Services** | Student recruitment and data agents |
| **Faculty Development** | Academic and curriculum agents |
| **⭐ Office of Greg** | VIP executive suite — 6 iconic tech CEOs sit at a private oval conference table |

### 👔 Office of Greg — The Executive Table

Six legendary tech CEOs power this room, each connected to Claude with a persona-accurate system prompt:

- **Steve Jobs** — Apple co-founder, product visionary
- **Elon Musk** — xAI / Tesla / SpaceX
- **Jensen Huang** — NVIDIA CEO
- **Satya Nadella** — Microsoft CEO
- **Sundar Pichai** — Alphabet / Google CEO
- **Tim Cook** — Apple CEO

They spend most of their time seated at the gold-trimmed oval conference table — working, thinking, occasionally celebrating a breakthrough.

---

## 🚀 Getting Started

**Requirements:** Node.js 22+ (uses built-in `fetch` — zero npm dependencies)

```bash
# Clone the repo
git clone https://github.com/THFC-COYS/agentic-office.git
cd agentic-office

# Start the server
node server.js

# Open in browser
open http://localhost:3000
```

Then click **⚙ Settings** and drop in your Anthropic or OpenAI API key — or configure per-agent keys via the ✏️ edit button on any agent card.

---

## 🤖 Human Behavior Engine

Every agent runs a finite state machine with 11 human-like states:

| State | Behavior |
|-------|---------|
| 🎯 Working | Sits at desk, deep focus |
| 💬 Socializing | Walks to a colleague, dotted chat line |
| 📱 Distracted | Freezes, staring at phone |
| 🤒 Unwell | Slow movement, green tint |
| 🏖️ PTO | Ghost placeholder at desk |
| ☕ Coffee | Wanders to the corridor break area |
| 🎉 Celebrating | Bounce animation + confetti particles |
| 😤 Stressed | Rapid pacing, red tint |
| 😴 Tired | Slow bob, blue-grey tint |
| 👋 Arriving | Spawns at room edge on login |
| 🌟 Normal | Default wandering |

---

## 🔌 API Connections

Each agent supports:
- **Claude (Anthropic)** — `claude-sonnet-4-6`, `claude-opus-4-6`, etc.
- **GPT (OpenAI)** — `gpt-4o`, `gpt-4o-mini`, etc.
- **Custom Webhook** — any REST endpoint that accepts `{ messages: [...] }`

Keys are stored in `localStorage` — never sent to our servers.

---

## 🏗️ Architecture

```
agentic-office/
├── server.js          # Zero-dependency Node.js HTTP + API proxy
├── public/
│   ├── index.html     # Main UI (modals, chat panel, canvas)
│   ├── style.css      # Dark theme, panel animations
│   └── js/
│       ├── config.js  # Rooms, furniture, agent presets, desk positions
│       ├── renderer.js # Canvas drawing engine (painter's algorithm)
│       ├── game.js    # Game loop + Human Behavior Engine FSM
│       ├── api.js     # LLM connector (Claude / OpenAI / custom)
│       ├── ui.js      # Panel, chat, modals, agent list
│       └── main.js    # Entry point + wiring
```

**No build step. No bundler. No npm install.** Just `node server.js` and go.

---

## 🛠️ Adding Your Own Agents

Click **＋ Add Agent** in the top bar, fill in:
- Name, emoji, company, role
- Department (including ⭐ Office of Greg)
- API provider + key + system prompt

Your agents persist in `localStorage` across sessions.

---

## 📄 License

MIT — use it, remix it, ship it.

---

*Built with Claude · Part of the [THFC-COYS GitHub portfolio](https://github.com/THFC-COYS)*
