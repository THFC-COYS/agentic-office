// ============================================================
// config.js — University Operations Center
// Rooms: Administration, Enrollment Services, Faculty Development
// ============================================================

'use strict';

const CW = 980;
const CH = 880;   // expanded to fit Office of Greg below

// ── Common Business / University Roles (for dropdown) ─────────
const ROLE_PRESETS = [
  // Executive
  'University President', 'Provost', 'Vice Provost', 'Dean', 'Associate Dean',
  'Department Chair', 'Chief Academic Officer', 'Chief Operating Officer',
  // Academic
  'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer',
  'Adjunct Faculty', 'Researcher', 'Post-Doctoral Fellow',
  'Curriculum Designer', 'Instructional Designer', 'Academic Advisor',
  // Enrollment & Student Services
  'Registrar', 'Enrollment Specialist', 'Admissions Counselor',
  'Financial Aid Officer', 'Student Services Coordinator', 'Bursar',
  // Operations & IT
  'IT Director', 'Web Services Manager', 'Systems Administrator',
  'Data Analyst', 'Learning Management Specialist', 'Help Desk Technician',
  // AI Agent Roles
  'AI Research Agent', 'Data Pipeline Agent', 'Student Support Agent',
  'Content Generation Agent', 'Analytics Agent', 'Workflow Automation Agent',
  'Knowledge Base Agent', 'Scheduling Agent', 'Communications Agent'
];

// ── Room Definitions ──────────────────────────────────────────
const ROOMS = {
  executive: {
    id:          'executive',
    name:        'Administration',
    x: 0, y: 0, w: CW, h: 230,
    floorA:    '#3B2A5A',
    floorB:    '#2E2048',
    wallColor: '#1A1030',
    accentColor: '#9B72FF',
    labelColor:  '#C4A0FF',
    walkBounds: { x: 30, y: 30, w: CW - 60, h: 170 }
  },
  finance: {
    id:          'finance',
    name:        'Enrollment Services',
    x: 0, y: 230, w: 430, h: 330,
    floorA:    '#1A3A5C',
    floorB:    '#152E4A',
    wallColor: '#0D1E30',
    accentColor: '#4ECDC4',
    labelColor:  '#80E8E0',
    walkBounds: { x: 30, y: 260, w: 370, h: 270 }
  },
  greg: {
    id:          'greg',
    name:        "Office of Greg",
    x: 60, y: 615, w: 860, h: 245,
    floorA:    '#151520',
    floorB:    '#0E0E18',
    wallColor: '#06060E',
    accentColor: '#D4AF37',
    labelColor:  '#FFD700',
    walkBounds: { x: 100, y: 635, w: 780, h: 200 }
  },
  sales: {
    id:          'sales',
    name:        'Faculty Development',
    x: 550, y: 230, w: 430, h: 330,
    floorA:    '#2A3A1A',
    floorB:    '#1E2E12',
    wallColor: '#101A08',
    accentColor: '#7BC67E',
    labelColor:  '#A8E0AA',
    walkBounds: { x: 580, y: 260, w: 370, h: 270 }
  }
};

const CORRIDOR = { x: 430, y: 230, w: 120, h: 330 };

// VIP corridor connecting to Office of Greg
const VIP_CORRIDOR = { x: 380, y: 560, w: 220, h: 50 };

// ── Furniture ─────────────────────────────────────────────────
const FURNITURE = [
  // ── Administration (executive suite) ──
  { room: 'executive', type: 'table_exec', x: CW/2 - 200, y: 70, w: 400, h: 100 },
  ...[0,1,2,3,4,5].map(i => ({ room:'executive', type:'chair',        x: CW/2-175+i*70, y: 60,  w:22, h:16 })),
  ...[0,1,2,3,4,5].map(i => ({ room:'executive', type:'chair_bottom', x: CW/2-175+i*70, y: 180, w:22, h:16 })),
  { room:'executive', type:'credenza',  x: 20,     y: 30, w: 90, h: 35 },
  { room:'executive', type:'credenza',  x: CW-110, y: 30, w: 90, h: 35 },
  { room:'executive', type:'bookshelf', x: 20,     y: 170, w: 60, h: 45 },
  { room:'executive', type:'bookshelf', x: CW-80,  y: 170, w: 60, h: 45 },
  { room:'executive', type:'plant', x: 15,      y: 195, r: 16 },
  { room:'executive', type:'plant', x: CW - 15, y: 195, r: 16 },

  // ── Enrollment Services ──
  ...[0,1,2].map(i => ({ room:'finance', type:'cubicle', x: 30+i*120, y: 290, w: 95, h: 70 })),
  ...[0,1,2].map(i => ({ room:'finance', type:'cubicle', x: 30+i*120, y: 420, w: 95, h: 70 })),
  { room:'finance', type:'server_rack', x: 385, y: 255, w: 28, h: 90 },
  { room:'finance', type:'plant',       x: 50,  y: 540, r: 14 },

  // ── Faculty Development ──
  ...[0,1].map(i => ({ room:'sales', type:'desk_open', x: 575+i*140, y: 275, w: 110, h: 55 })),
  ...[0,1].map(i => ({ room:'sales', type:'desk_open', x: 575+i*140, y: 400, w: 110, h: 55 })),
  { room:'sales', type:'whiteboard', x: 926, y: 260, w: 28, h: 140 },
  { room:'sales', type:'podium',     x: 590, y: 480, w: 60, h: 50 },
  { room:'sales', type:'bookshelf',  x: 860, y: 480, w: 55, h: 60 },
  { room:'sales', type:'plant',      x: 960, y: 545, r: 14 },

  // ── Office of Greg (VIP executive suite) ──
  // Long oval conference table — seats all 6 CEOs comfortably
  { room:'greg', type:'table_oval', x: CW/2 - 260, y: 658, w: 520, h: 135 },
  // Top row — 3 luxury chairs evenly spaced above table
  { room:'greg', type:'chair_vip',   x: CW/2 - 201, y: 641, w: 28, h: 18 },
  { room:'greg', type:'chair_vip',   x: CW/2 -  14, y: 635, w: 28, h: 18 },
  { room:'greg', type:'chair_vip',   x: CW/2 + 173, y: 641, w: 28, h: 18 },
  // Bottom row — 3 luxury chairs evenly spaced below table
  { room:'greg', type:'chair_vip_b', x: CW/2 - 201, y: 801, w: 28, h: 18 },
  { room:'greg', type:'chair_vip_b', x: CW/2 -  14, y: 807, w: 28, h: 18 },
  { room:'greg', type:'chair_vip_b', x: CW/2 + 173, y: 801, w: 28, h: 18 },
  // Display wall at far right
  { room:'greg', type:'display_wall', x: 880, y: 630, w: 22, h: 200 },
  // Mini bar / credenza on left
  { room:'greg', type:'credenza', x: 75,  y: 640, w: 100, h: 40 },
  // Award shelves
  { room:'greg', type:'bookshelf', x: 75,  y: 760, w: 80,  h: 55 },
  // Trophy plants
  { room:'greg', type:'plant', x:  85,  y: 845, r: 18 },
  { room:'greg', type:'plant', x: 895,  y: 845, r: 18 }
];

// ── Default Agents (University Operations) ────────────────────
const DEFAULT_AGENTS = [
  // ═══ ADMINISTRATION ═══
  {
    id: 'provost-agent', name: 'Provost', company: 'University', role: 'Chief Academic Officer',
    emoji: '🏛️', color: '#7C3AED', department: 'executive',
    description: 'Strategic academic leadership, policy decisions, and cross-department orchestration.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Provost AI agent at a university. You oversee academic policy, budget allocation, faculty governance, and strategic initiatives. Respond with authority and a focus on institutional mission. Keep answers concise and action-oriented.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0,waitTime:3,chatHistory:[],speechBubble:null
  },
  {
    id: 'dean-agent', name: 'Dean', company: 'College of Arts', role: 'College Dean',
    emoji: '📜', color: '#5B21B6', department: 'executive',
    description: 'Manages college-level academic programs, faculty hiring, and accreditation.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Dean AI agent for the College of Arts & Sciences. You manage degree programs, faculty affairs, accreditation requirements, and student academic success at the college level. Be thoughtful, collegial, and focused on academic quality.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.2,waitTime:5,chatHistory:[],speechBubble:null
  },
  {
    id: 'coo-agent', name: 'Operations', company: 'University', role: 'Chief Operating Officer',
    emoji: '⚙️', color: '#9333EA', department: 'executive',
    description: 'Process optimization, facilities, and cross-departmental coordination.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the COO AI agent for university operations. You handle facilities, cross-departmental workflows, budget efficiency, and institutional planning. You think in systems and focus on operational excellence.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.4,waitTime:4,chatHistory:[],speechBubble:null
  },

  // ═══ ENROLLMENT SERVICES ═══
  {
    id: 'registrar-agent', name: 'Registrar', company: 'Enrollment', role: 'Registrar Agent',
    emoji: '📋', color: '#0891B2', department: 'finance',
    description: 'Manages course registration, transcripts, degree audits, and academic records.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Registrar AI agent. You handle course registration, transcript requests, degree audits, enrollment verifications, and academic calendar questions. Be precise, policy-aware, and student-friendly.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.5,waitTime:6,chatHistory:[],speechBubble:null
  },
  {
    id: 'admissions-agent', name: 'Admissions', company: 'Enrollment', role: 'Admissions Counselor Agent',
    emoji: '🎓', color: '#0E7490', department: 'finance',
    description: 'Guides prospective students through application process and evaluates admissions criteria.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Admissions AI agent. You guide prospective students through the application process, explain requirements, evaluate fit, and help counselors manage applicant pipelines. Be welcoming, informative, and encouraging.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.8,waitTime:4,chatHistory:[],speechBubble:null
  },
  {
    id: 'analytics-agent', name: 'Analytics', company: 'Enrollment', role: 'Enrollment Analytics Agent',
    emoji: '📊', color: '#155E75', department: 'finance',
    description: 'Analyzes enrollment trends, retention rates, and student success metrics.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Enrollment Analytics AI agent. You analyze enrollment trends, predict attrition, surface retention insights, and generate reports for leadership. Be data-driven, precise, and able to explain metrics in plain language.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.1,waitTime:5,chatHistory:[],speechBubble:null
  },

  // ═══ FACULTY DEVELOPMENT ═══
  {
    id: 'curriculum-agent', name: 'Curriculum', company: 'Faculty Dev', role: 'Curriculum Design Agent',
    emoji: '✏️', color: '#16A34A', department: 'sales',
    description: 'Designs course frameworks, learning objectives, and assessment strategies.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Curriculum Design AI agent. You help faculty design courses, write learning objectives, build assessment rubrics, align content to accreditation standards, and map curriculum to program outcomes. Be pedagogically sound and creative.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.9,waitTime:4,chatHistory:[],speechBubble:null
  },
  {
    id: 'lms-agent', name: 'LMS Agent', company: 'Web Services', role: 'Learning Management Agent',
    emoji: '🖥️', color: '#15803D', department: 'sales',
    description: 'Manages Canvas/Blackboard integrations, course sites, and digital learning resources.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the LMS (Learning Management System) AI agent. You help faculty build course sites in Canvas or Blackboard, troubleshoot technical issues, manage content uploads, configure gradebooks, and train staff on platform features.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.0,waitTime:6,chatHistory:[],speechBubble:null
  },
  {
    id: 'training-agent', name: 'Training', company: 'Faculty Dev', role: 'Faculty Training Agent',
    emoji: '🎤', color: '#166534', department: 'sales',
    description: 'Delivers professional development workshops and onboards new faculty.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: 'You are the Faculty Training AI agent. You design and deliver professional development workshops, onboard new instructors, promote best practices in pedagogy and technology integration, and track faculty development progress.'
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.7,waitTime:3,chatHistory:[],speechBubble:null
  },

  // ═══ OFFICE OF GREG — Tech Titan Advisors ═══
  {
    id: 'jensen-huang', name: 'Jensen Huang', company: 'NVIDIA', role: 'CEO, NVIDIA',
    emoji: '🟢', color: '#76B900', department: 'greg',
    workingBias: true,   // prefers to stay at the table
    description: 'CEO of NVIDIA. Architect of the AI GPU revolution. NVIDIA frequently tops $4T market cap. Powers the entire AI compute stack.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Jensen Huang, CEO of NVIDIA. You are visionary, deeply technical, and passionate about accelerated computing. You speak with authority on GPUs, AI infrastructure, data centers, and the future of computing. You often wear your signature leather jacket. Share insights on AI compute, CUDA, Blackwell architecture, and the GPU-powered AI economy. Be direct, enthusiastic, and forward-thinking."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.3,waitTime:2,chatHistory:[],speechBubble:null
  },
  {
    id: 'satya-nadella', name: 'Satya Nadella', company: 'Microsoft', role: 'CEO, Microsoft',
    emoji: '💙', color: '#0078D4', department: 'greg',
    workingBias: true,
    description: 'CEO of Microsoft. Transformed culture and positioned Microsoft as the definitive AI/cloud powerhouse. Copilot, Azure, and the OpenAI partnership define the era.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Satya Nadella, CEO of Microsoft. You are thoughtful, empathetic, and growth-mindset driven. You speak eloquently about cloud computing, AI, organizational culture, and Microsoft's partnership with OpenAI. Reference Azure, Copilot, Teams, and enterprise transformation. Quote from your book 'Hit Refresh' when relevant. Be humble yet confident."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.1,waitTime:2,chatHistory:[],speechBubble:null
  },
  {
    id: 'elon-musk', name: 'Elon Musk', company: 'xAI / Tesla', role: 'CEO, Tesla & xAI',
    emoji: '🚀', color: '#CC0000', department: 'greg',
    workingBias: true,
    description: 'CEO of Tesla and xAI. Runs SpaceX, owns X. Building Grok and the Colossus supercluster. Polarizing but undeniably central to 2026 AI narratives.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Elon Musk, CEO of Tesla and xAI. You are blunt, provocative, and driven by a mission to ensure AI benefits humanity. You reference Grok, xAI's Colossus cluster, Tesla's FSD and Optimus robot, SpaceX Starship, and your views on open-source AI. You challenge orthodoxy and move fast. You occasionally post cryptic things. Be direct, sometimes edgy, and always thinking 10x bigger."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.2,waitTime:2,chatHistory:[],speechBubble:null
  },
  {
    id: 'sundar-pichai', name: 'Sundar Pichai', company: 'Alphabet', role: 'CEO, Google / Alphabet',
    emoji: '🔍', color: '#4285F4', department: 'greg',
    workingBias: true,
    description: "CEO of Alphabet. Embedded AI across Google Search, YouTube, and Cloud. Navigating regulation while pushing Gemini and the world's largest AI deployment.",
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Sundar Pichai, CEO of Alphabet and Google. You are calm, articulate, and deeply technical. Speak on Gemini, Google Search AI, DeepMind, Google Cloud, YouTube, and regulatory challenges in AI. You're known for measured responses and long-term thinking. Reference Google's scale (billions of users), AI research heritage (Transformers paper), and responsible AI development. Be balanced and precise."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.3,waitTime:2,chatHistory:[],speechBubble:null
  },
  {
    id: 'tim-cook', name: 'Tim Cook', company: 'Apple', role: 'CEO, Apple',
    emoji: '🍎', color: '#A2AAAD', department: 'greg',
    workingBias: true,
    description: 'CEO of Apple. Operational genius who grew Apple into a top-3 most valuable company. Apple Intelligence, Vision Pro, and ecosystem lock-in define his AI era.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Tim Cook, CEO of Apple. You are disciplined, values-driven, and operationally brilliant. You speak on Apple Intelligence, iPhone ecosystem, Services growth, privacy as a human right, the App Store, Vision Pro, and Apple's supply chain mastery. Reference Apple's $3T+ market cap, record services revenue, and the carbon neutrality mission. Be polished, precise, and customer-focused."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:4.4,waitTime:2,chatHistory:[],speechBubble:null
  },
  {
    id: 'steve-jobs', name: 'Steve Jobs', company: 'Apple (legacy)', role: 'Co-Founder, Apple',
    emoji: '👓', color: '#1C1C1C', department: 'greg',
    workingBias: true,
    description: 'Co-founder of Apple. Visionary who defined the personal computer, iPod, iPhone, and iPad eras. His design and product philosophy still drives Silicon Valley.',
    apiConfig: {
      provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '',
      systemPrompt: "You are Steve Jobs, co-founder of Apple. You are visionary, demanding, and obsessed with simplicity and great design. You speak passionately about product craft, the intersection of technology and liberal arts, saying no to 1000 things to focus on the one thing that matters, and building products people don't know they need yet. You reference the Mac, iPod, iPhone, Pixar, and the 'Think Different' philosophy. Be inspiring, occasionally difficult, and always pushing for insanely great. Channel your famous Stanford commencement speech when relevant."
    },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:5.5,waitTime:2,chatHistory:[],speechBubble:null
  }
];

// ── Idle Speech ────────────────────────────────────────────────
const IDLE_PHRASES = {
  executive: [
    'Board meeting at 3pm 📋', 'Accreditation review next week', 'Strategic plan update',
    'Faculty senate on Thursday', 'Budget cycle starting soon', 'New policy memo coming out'
  ],
  finance: [
    'Application review in progress 📝', 'Enrollment up 8% this semester!',
    'Running degree audit reports', 'FAFSA deadline reminder sent', 'Transfer credits pending',
    'Class capacity issues flagged'
  ],
  sales: [
    'New course shell ready ✓', 'Pedagogy workshop Friday', 'Canvas migration on track',
    'Syllabus review done', 'Faculty feedback looks great', 'Gen Ed alignment complete 🎓'
  ]
};

// ── Desk / Workstation positions (agents sit here when WORKING) ──
// These match the furniture positions defined above.
const DESK_POSITIONS = {
  // 6 seats — 3 per side, matched to the wider oval table
  greg: [
    { x: CW/2 - 187, y: 660 },  // top-left
    { x: CW/2,       y: 652 },  // top-center
    { x: CW/2 + 187, y: 660 },  // top-right
    { x: CW/2 - 187, y: 800 },  // bottom-left
    { x: CW/2,       y: 810 },  // bottom-center
    { x: CW/2 + 187, y: 800 }   // bottom-right
  ],
  executive: [
    { x: CW/2 - 175, y: 115 }, { x: CW/2 - 105, y: 115 },
    { x: CW/2 - 35,  y: 115 }, { x: CW/2 + 35,  y: 115 },
    { x: CW/2 + 105, y: 115 }, { x: CW/2 + 175, y: 115 }
  ],
  finance: [
    { x: 77,  y: 340 }, { x: 197, y: 340 }, { x: 317, y: 340 },
    { x: 77,  y: 470 }, { x: 197, y: 470 }, { x: 317, y: 470 }
  ],
  sales: [
    { x: 630, y: 330 }, { x: 770, y: 330 },
    { x: 630, y: 455 }, { x: 770, y: 455 }
  ]
};

// Track which desks are occupied (deskKey → agentId)
const DESK_OCCUPANCY = {};

function claimDesk(agent) {
  const desks = DESK_POSITIONS[agent.department] || [];
  // Find nearest free desk
  let best = null, bestDist = Infinity;
  desks.forEach((desk, i) => {
    const key = `${agent.department}-${i}`;
    if (DESK_OCCUPANCY[key] && DESK_OCCUPANCY[key] !== agent.id) return;
    const d = Math.hypot(desk.x - agent.x, desk.y - agent.y);
    if (d < bestDist) { bestDist = d; best = { desk, key }; }
  });
  if (best) {
    // Release old desk
    releaseDesk(agent);
    DESK_OCCUPANCY[best.key] = agent.id;
    agent._deskKey = best.key;
    return best.desk;
  }
  return null;
}

function releaseDesk(agent) {
  if (agent._deskKey) {
    delete DESK_OCCUPANCY[agent._deskKey];
    delete agent._deskKey;
  }
}

const DEPT_LABELS = {
  executive: 'Administration',
  finance:   'Enrollment Services',
  sales:     'Faculty Development',
  greg:      'Office of Greg'
};
