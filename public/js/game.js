// ============================================================
// game.js — Game loop, agent movement, HUMAN BEHAVIOR ENGINE
// ============================================================

'use strict';

// ── Human Behavior States ─────────────────────────────────────
const HB = {
  NORMAL:      'normal',
  WORKING:     'working',
  SOCIALIZING: 'socializing',
  DISTRACTED:  'distracted',
  UNWELL:      'unwell',
  PTO:         'pto',
  COFFEE:      'coffee',
  CELEBRATING: 'celebrating',
  STRESSED:    'stressed',
  TIRED:       'tired',
  ARRIVING:    'arriving'
};

// State duration ranges [min, max] seconds
const HB_DURATION = {
  normal:      [4,  10],
  working:     [10, 25],
  socializing: [6,  18],
  distracted:  [5,  14],
  unwell:      [15, 35],
  pto:         [40, 120],
  coffee:      [8,  18],
  celebrating: [3,  7],
  stressed:    [10, 22],
  tired:       [12, 28],
  arriving:    [2,  4]
};

// Transition weights: from → [[toState, weight], ...]
const HB_TRANSITIONS = {
  normal:      [['working',25],['socializing',15],['distracted',12],['coffee',10],['tired',8],['stressed',5],['normal',25]],
  working:     [['normal',30],['coffee',15],['socializing',10],['stressed',12],['tired',8],['working',25]],
  socializing: [['normal',50],['working',30],['coffee',20]],
  distracted:  [['normal',50],['working',30],['socializing',20]],
  coffee:      [['normal',40],['socializing',30],['working',20],['distracted',10]],
  tired:       [['normal',40],['working',20],['distracted',20],['unwell',12],['tired',8]],
  stressed:    [['normal',30],['working',30],['celebrating',15],['distracted',15],['unwell',10]],
  celebrating: [['normal',60],['working',40]],
  unwell:      [['normal',25],['tired',20],['pto',20],['unwell',35]],
  pto:         [['normal',70],['tired',20],['arriving',10]],
  arriving:    [['normal',60],['working',40]]
};

// Speed multipliers per behavior state
const HB_SPEED = {
  normal:      1.0,
  working:     0.15,
  socializing: 0.6,
  distracted:  0.0,
  unwell:      0.35,
  pto:         0.0,
  coffee:      0.9,
  celebrating: 1.2,
  stressed:    1.8,
  tired:       0.45,
  arriving:    1.1
};

// Behavior-specific speech lines
const HB_PHRASES = {
  working:     ['In the zone 🎯','Do not disturb 🚫','Deep focus mode','Almost done...','Just 5 more mins...','Running analysis 📊'],
  socializing: ['Did you see that email?','Great work on the deck!','You free for lunch?','Quick sync?','Love that idea 💡','How was the weekend?'],
  distracted:  ['Sorry what?','One sec... 📱','Just checking something','Wait, where was I?','My bad, distracted','Doom-scrolling again 😬'],
  coffee:      ['Anyone want a coffee? ☕','BRB, coffee run','Third cup today... no shame','Espresso time ☕','Coffee is life'],
  unwell:      ["Not feeling great 🤒","Might be coming down with something","Headache won't go away","Pushing through it...","Should've stayed home 🤧"],
  tired:       ['Is it Friday yet? 😴','Need more coffee...','Didn\'t sleep well','*yawn*','5 more minutes...','Counting down to 5pm'],
  stressed:    ['Deadline in 2h!! 😤','No time to talk','So behind on this...','Why is everything on fire?!','Not now please!!'],
  celebrating: ['WE DID IT! 🎉','SHIPPED! 🚀','Best team ever! 🏆','That\'s a wrap! 🎊','Let\'s go!! 🥳','Nailed it! ✨'],
  arriving:    ['Morning everyone! 👋','Sorry I\'m late!','Made it! ☕','Good morning 🌅','Traffic was brutal']
};

const Game = (() => {
  let agents          = [];
  let selectedAgent   = null;
  let gameTime        = 0;
  let lastTimestamp   = 0;
  let speedMultiplier = 1;
  let onAgentClick    = null;
  let onHoverChange   = null;
  let hoveredAgent    = null;
  let socialPairs     = new Map();

  // ── Init ────────────────────────────────────────────────────
  function init(opts = {}) {
    onAgentClick  = opts.onAgentClick  || (() => {});
    onHoverChange = opts.onHoverChange || (() => {});

    const saved = loadSavedAgents();
    agents = [...DEFAULT_AGENTS.map(deepClone), ...saved];

    agents.forEach((ag, i) => {
      const pos = randomRoomPos(ag.department);
      ag.x = ag.targetX = pos.x;
      ag.y = ag.targetY = pos.y;
      ag.bobPhase         = Math.random() * Math.PI * 2;
      ag.waitTime         = Math.random() * 4;
      ag.humanState       = HB.ARRIVING;
      ag.humanStateDur    = randBetween(...HB_DURATION.arriving);
      ag.humanStateTimer  = -(i * 1.5); // stagger arrivals
      ag.socialPartner    = null;
      ag.particles        = [];
      ag.onPTO            = false;
    });

    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click',      onCanvasClick);
    canvas.addEventListener('mousemove',  onCanvasHover);
    canvas.addEventListener('mouseleave', () => {
      hoveredAgent = null;
      onHoverChange(null, 0, 0);
      canvas.style.cursor = 'default';
    });

    scheduleIdleSpeech();
    requestAnimationFrame(loop);
  }

  // ── Game Loop ────────────────────────────────────────────────
  function loop(timestamp) {
    const rawDt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    const dt    = rawDt * speedMultiplier;
    lastTimestamp = timestamp;
    gameTime     += dt;

    agents.forEach(ag => {
      updateHumanBehavior(ag, dt);
      updateMovement(ag, dt);
    });

    Renderer.render(agents, selectedAgent, gameTime, socialPairs);
    requestAnimationFrame(loop);
  }

  // ── Human Behavior State Machine ─────────────────────────────
  function updateHumanBehavior(agent, dt) {
    if (agent.onPTO) return;

    agent.humanStateTimer += dt;

    // Advance particles
    agent.particles = (agent.particles || [])
      .map(p => ({ ...p, life: p.life - dt, x: p.x + p.vx * dt, y: p.y + p.vy * dt }))
      .filter(p => p.life > 0);

    if (agent.humanStateTimer >= (agent.humanStateDur || 8)) {
      transitionHumanState(agent);
    }
  }

  function transitionHumanState(agent) {
    const current = agent.humanState || HB.NORMAL;
    const options = HB_TRANSITIONS[current] || HB_TRANSITIONS.normal;
    const totalW  = options.reduce((s, [, w]) => s + w, 0);
    let   roll    = Math.random() * totalW;
    let   next    = HB.NORMAL;

    for (const [state, weight] of options) {
      roll -= weight;
      if (roll <= 0) { next = state; break; }
    }

    // Gate PTO — only 25% of the time when it comes up
    if (next === HB.PTO && Math.random() > 0.25) next = HB.TIRED;

    // CEO / VIP agents with workingBias strongly prefer staying at the table
    // They can still occasionally socialize, get coffee, or celebrate — just rarely
    if (agent.workingBias && next !== HB.PTO && next !== HB.UNWELL) {
      // 80% chance to override non-working states back to WORKING
      if (next !== HB.WORKING && Math.random() < 0.80) {
        next = HB.WORKING;
      }
    }

    enterHumanState(agent, next);
  }

  function enterHumanState(agent, newState) {
    const old = agent.humanState;
    if (old === HB.SOCIALIZING) breakSocialPair(agent);
    if (old === HB.PTO)         agent.onPTO = false;
    if (old === HB.WORKING)     releaseDesk(agent);

    agent.humanState      = newState;
    agent.humanStateDur   = randBetween(...(HB_DURATION[newState] || [5, 10]));
    agent.humanStateTimer = 0;

    switch (newState) {
      case HB.PTO:
        agent.onPTO = true;
        agent.state = 'idle';
        break;

      case HB.ARRIVING:
        agent.x        = randBetween(100, CW - 100);
        agent.y        = CH + 20;
        agent.onPTO    = false;
        pickNewTarget(agent);
        break;

      case HB.SOCIALIZING:
        formSocialPair(agent);
        break;

      case HB.COFFEE:
        agent.targetX = randBetween(CORRIDOR.x + 10, CORRIDOR.x + CORRIDOR.w - 10);
        agent.targetY = randBetween(CORRIDOR.y + 20, CORRIDOR.y + CORRIDOR.h - 20);
        break;

      case HB.CELEBRATING:
        spawnCelebrationParticles(agent);
        const cel = HB_PHRASES.celebrating;
        agent.speechBubble = { text: cel[Math.floor(Math.random() * cel.length)], age: 0, maxAge: 4 };
        break;

      case HB.STRESSED:
        pickNewTarget(agent);
        break;

      case HB.WORKING: {
        // Try to sit at a real desk
        const desk = claimDesk(agent);
        if (desk) {
          agent.targetX = desk.x;
          agent.targetY = desk.y + 20; // slightly in front of desk
        } else {
          const wb = ROOMS[agent.department]?.walkBounds;
          if (wb) {
            agent.targetX = Math.max(wb.x + 20, Math.min(wb.x + wb.w - 20, agent.x + randBetween(-20, 20)));
            agent.targetY = Math.max(wb.y + 10, Math.min(wb.y + wb.h - 10, agent.y + randBetween(-15, 15)));
          }
        }
        break;
      }
    }
  }

  // ── Social Pairing ────────────────────────────────────────────
  function formSocialPair(agent) {
    const candidates = agents.filter(ag =>
      ag.id !== agent.id &&
      ag.department === agent.department &&
      !ag.onPTO &&
      !socialPairs.has(ag.id) &&
      ag.humanState !== HB.STRESSED &&
      ag.humanState !== HB.DISTRACTED
    );

    if (!candidates.length) { enterHumanState(agent, HB.COFFEE); return; }

    const partner = candidates[Math.floor(Math.random() * candidates.length)];

    socialPairs.set(agent.id,   partner.id);
    socialPairs.set(partner.id, agent.id);
    agent.socialPartner   = partner.id;
    partner.socialPartner = agent.id;

    if (partner.humanState !== HB.SOCIALIZING) {
      partner.humanState      = HB.SOCIALIZING;
      partner.humanStateDur   = agent.humanStateDur;
      partner.humanStateTimer = 0;
    }

    const midX = (agent.x + partner.x) / 2;
    const midY = (agent.y + partner.y) / 2;
    agent.targetX   = midX + randBetween(-18, 18);
    agent.targetY   = midY + randBetween(-12, 12);
    partner.targetX = midX + randBetween(-18, 18);
    partner.targetY = midY + randBetween(-12, 12);
  }

  function breakSocialPair(agent) {
    const pid = socialPairs.get(agent.id);
    if (pid) {
      socialPairs.delete(agent.id);
      socialPairs.delete(pid);
      const p = agents.find(a => a.id === pid);
      if (p) {
        p.socialPartner = null;
        if (p.humanState === HB.SOCIALIZING) enterHumanState(p, HB.NORMAL);
      }
    }
    agent.socialPartner = null;
  }

  // ── Particles ─────────────────────────────────────────────────
  function spawnCelebrationParticles(agent) {
    const colors = ['#FFD700','#FF6B6B','#4ECDC4','#95E1D3','#F38181','#A8E063'];
    agent.particles = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const spd   = 40 + Math.random() * 60;
      agent.particles.push({
        x: agent.x, y: agent.y - 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 30,
        life:  0.6 + Math.random() * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size:  3 + Math.random() * 3
      });
    }
  }

  // ── Movement ──────────────────────────────────────────────────
  function updateMovement(agent, dt) {
    if (agent.onPTO) return;
    if (agent.state === 'thinking') {
      // Make sure agent is at a desk while thinking
      if (!agent._deskKey) {
        const desk = claimDesk(agent);
        if (desk) { agent.targetX = desk.x; agent.targetY = desk.y + 20; }
      }
      agent.bobOffset = Math.sin(gameTime * 3 + agent.bobPhase) * 2;
      return;
    }

    const hState   = agent.humanState || HB.NORMAL;
    const speedMul = HB_SPEED[hState] ?? 1.0;

    if (hState === HB.STRESSED && Math.random() < dt * 0.4) pickNewTarget(agent);
    // Only micro-wander while WORKING if they don't have a claimed desk
    if (hState === HB.WORKING && !agent._deskKey && Math.random() < dt * 0.1) {
      const wb = ROOMS[agent.department]?.walkBounds;
      if (wb) {
        agent.targetX = Math.max(wb.x + 20, Math.min(wb.x + wb.w - 20, agent.x + randBetween(-25, 25)));
        agent.targetY = Math.max(wb.y + 10, Math.min(wb.y + wb.h - 10, agent.y + randBetween(-15, 15)));
      }
    }

    const dx   = agent.targetX - agent.x;
    const dy   = agent.targetY - agent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3 || speedMul === 0) {
      if (dist < 3) { agent.x = agent.targetX; agent.y = agent.targetY; }
      agent.state     = 'idle';
      agent.walkCycle = 0;
      agent.waitTime  = (agent.waitTime || 0) - dt;
      if (agent.waitTime <= 0 && hState !== HB.DISTRACTED) pickNewTarget(agent);
    } else {
      const step  = Math.min((agent.speed || 55) * speedMul * dt, dist);
      agent.x    += (dx / dist) * step;
      agent.y    += (dy / dist) * step;
      agent.state     = 'walking';
      agent.walkCycle = ((agent.walkCycle || 0) + dt * 3.5) % 1;
    }

    // Vertical bob
    if (hState === HB.CELEBRATING) {
      agent.bobOffset = Math.abs(Math.sin(gameTime * 6 + agent.bobPhase)) * -12;
    } else if (agent.state === 'walking') {
      agent.bobOffset = Math.sin((agent.walkCycle || 0) * Math.PI * 2) * -3;
    } else {
      const freq = hState === HB.TIRED ? 0.6 : hState === HB.STRESSED ? 3.5 : 1.8;
      agent.bobOffset = Math.sin(gameTime * freq + agent.bobPhase) * 1.8;
    }

    if (agent.speechBubble) {
      agent.speechBubble.age += dt;
      if (agent.speechBubble.age >= agent.speechBubble.maxAge) agent.speechBubble = null;
    }
  }

  function pickNewTarget(agent) {
    const pos = randomRoomPos(agent.department);
    agent.targetX = pos.x;
    agent.targetY = pos.y;
    agent.waitTime = 2.5 + Math.random() * 5;
    agent.state   = 'walking';
  }

  function randomRoomPos(dept) {
    const room = ROOMS[dept];
    if (!room) return { x: CW / 2, y: CH / 2 };
    const wb = room.walkBounds;
    return {
      x: wb.x + 30 + Math.random() * (wb.w - 60),
      y: wb.y + 20 + Math.random() * (wb.h - 40)
    };
  }

  // ── Idle Speech ───────────────────────────────────────────────
  function scheduleIdleSpeech() {
    function fire() {
      const eligible = agents.filter(ag => !ag.onPTO && ag.state !== 'thinking' && !ag.speechBubble);
      if (eligible.length) {
        const ag   = eligible[Math.floor(Math.random() * eligible.length)];
        const hs   = ag.humanState || HB.NORMAL;
        const bhPh = HB_PHRASES[hs];
        const dpPh = IDLE_PHRASES[ag.department] || IDLE_PHRASES.finance;
        const pool = (bhPh && Math.random() < 0.65) ? bhPh : dpPh;
        ag.speechBubble = { text: pool[Math.floor(Math.random() * pool.length)], age: 0, maxAge: 3.5 };
      }
      setTimeout(fire, 3500 + Math.random() * 5000);
    }
    setTimeout(fire, 2000);
  }

  // ── Input ──────────────────────────────────────────────────────
  function onCanvasClick(e) {
    const rect  = e.target.getBoundingClientRect();
    const agent = Renderer.getAgentAtCanvasPos(e.clientX - rect.left, e.clientY - rect.top, agents);
    if (agent && !agent.onPTO) { selectedAgent = agent; onAgentClick(agent); }
    else { selectedAgent = null; onAgentClick(null); }
  }

  function onCanvasHover(e) {
    const rect  = e.target.getBoundingClientRect();
    const agent = Renderer.getAgentAtCanvasPos(e.clientX - rect.left, e.clientY - rect.top, agents);
    if (agent !== hoveredAgent) {
      hoveredAgent = agent;
      onHoverChange((agent && !agent.onPTO) ? agent : null, e.clientX, e.clientY);
    }
    e.target.style.cursor = (agent && !agent.onPTO) ? 'pointer' : 'default';
  }

  // ── CRUD ──────────────────────────────────────────────────────
  function addAgent(data) {
    const ag = {
      ...data,
      id: data.id || `agent-${Date.now()}`,
      x: 0, y: 0, targetX: 0, targetY: 0,
      state: 'idle', walkCycle: 0,
      bobPhase: Math.random() * Math.PI * 2,
      waitTime: 2, chatHistory: [], speechBubble: null, speed: 55,
      humanState: HB.ARRIVING, humanStateDur: randBetween(2, 5),
      humanStateTimer: 0, socialPartner: null, particles: [], onPTO: false
    };
    const pos = randomRoomPos(ag.department);
    ag.x = ag.targetX = pos.x;
    ag.y = ag.targetY = pos.y;
    agents.push(ag);
    saveCustomAgents();
    return ag;
  }

  function updateAgent(id, changes) {
    const ag = agents.find(a => a.id === id);
    if (!ag) return;
    Object.assign(ag, changes);
    saveCustomAgents();
    return ag;
  }

  function removeAgent(id) {
    const ag = agents.find(a => a.id === id);
    if (ag) breakSocialPair(ag);
    agents = agents.filter(a => a.id !== id);
    if (selectedAgent?.id === id) selectedAgent = null;
    saveCustomAgents();
  }

  function selectAgent(ag)  { selectedAgent = ag;   }
  function deselectAll()    { selectedAgent = null;  }
  function getAgents()      { return agents;          }
  function setSpeed(mult)   { speedMultiplier = mult; }

  // ── Persistence ───────────────────────────────────────────────
  function saveCustomAgents() {
    const custom = agents.filter(ag => !DEFAULT_AGENTS.find(d => d.id === ag.id));
    try {
      localStorage.setItem('ao_custom_agents', JSON.stringify(custom.map(ag => ({
        id: ag.id, name: ag.name, company: ag.company, role: ag.role,
        emoji: ag.emoji, color: ag.color, department: ag.department,
        description: ag.description, apiConfig: ag.apiConfig
      }))));
    } catch (_) {}
  }

  function loadSavedAgents() {
    try {
      const raw = localStorage.getItem('ao_custom_agents');
      if (!raw) return [];
      return JSON.parse(raw).map(ag => ({
        ...ag,
        x: 0, y: 0, targetX: 0, targetY: 0,
        state: 'idle', walkCycle: 0,
        bobPhase: Math.random() * Math.PI * 2,
        waitTime: 2, chatHistory: [], speechBubble: null, speed: 55,
        humanState: HB.ARRIVING, humanStateDur: randBetween(2, 5),
        humanStateTimer: 0, socialPartner: null, particles: [], onPTO: false
      }));
    } catch (_) { return []; }
  }

  function deepClone(obj)       { return JSON.parse(JSON.stringify(obj)); }
  function randBetween(a, b)    { return a + Math.random() * (b - a); }

  return { init, addAgent, updateAgent, removeAgent, selectAgent, deselectAll, getAgents, setSpeed, HB };
})();
