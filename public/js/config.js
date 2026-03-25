// ============================================================
// config.js — Multi-Environment Agentic Office
// Environments: University · Tech Startup · Wall Street
// ============================================================

'use strict';

const CW = 980;
const CH = 880;

// ── Environment Definitions ───────────────────────────────────
const ENVIRONMENT_DEFS = {
  university: {
    key: 'university', name: 'University Campus', emoji: '🎓',
    tagline: 'Where knowledge meets AI.',
    desc: 'A modern research university powered by intelligent agents.',
    color: '#9B72FF',
    rooms: {
      executive: { name: 'Administration',      floorA:'#3B2A5A', floorB:'#2E2048', wallColor:'#1A1030', accentColor:'#9B72FF', labelColor:'#C4A0FF' },
      finance:   { name: 'Enrollment Services', floorA:'#1A3A5C', floorB:'#152E4A', wallColor:'#0D1E30', accentColor:'#4ECDC4', labelColor:'#80E8E0' },
      sales:     { name: 'Faculty Development', floorA:'#2A3A1A', floorB:'#1E2E12', wallColor:'#101A08', accentColor:'#7BC67E', labelColor:'#A8E0AA' }
    },
    idlePhrases: {
      executive: ['Board meeting at 3pm 📋','Accreditation review next week','Strategic plan update','Faculty senate on Thursday','Budget cycle starting soon','New policy memo coming out'],
      finance:   ['Application review in progress 📝','Enrollment up 8% this semester!','Running degree audit reports','FAFSA deadline reminder sent','Transfer credits pending','Class capacity issues flagged'],
      sales:     ['New course shell ready ✓','Pedagogy workshop Friday','Canvas migration on track','Syllabus review done','Faculty feedback looks great','Gen Ed alignment complete 🎓'],
      greg:      ['The intersection of technology and liberal arts','One more thing...','Stay hungry, stay foolish 🍎','Accelerated computing is the future','Growth mindset wins','First principles! 🚀']
    },
    rolePresets: ['University President','Provost','Vice Provost','Dean','Associate Dean','Department Chair','Chief Academic Officer','Chief Operating Officer','Professor','Associate Professor','Assistant Professor','Lecturer','Adjunct Faculty','Researcher','Post-Doctoral Fellow','Curriculum Designer','Instructional Designer','Academic Advisor','Registrar','Enrollment Specialist','Admissions Counselor','Financial Aid Officer','Student Services Coordinator','Bursar','IT Director','Web Services Manager','Systems Administrator','Data Analyst','Learning Management Specialist','Help Desk Technician','AI Research Agent','Data Pipeline Agent','Student Support Agent','Content Generation Agent','Analytics Agent','Workflow Automation Agent','Knowledge Base Agent','Scheduling Agent','Communications Agent']
  },

  startup: {
    key: 'startup', name: 'Tech Startup', emoji: '🚀',
    tagline: 'Move fast. Ship it. Repeat.',
    desc: 'Series B. 47 employees. Racing to change the world.',
    color: '#00D4FF',
    rooms: {
      executive: { name: "Founder's Den",   floorA:'#0D1B2A', floorB:'#0A1520', wallColor:'#050E15', accentColor:'#00D4FF', labelColor:'#66E5FF' },
      finance:   { name: 'Engineering',      floorA:'#0A1E0A', floorB:'#071507', wallColor:'#030A03', accentColor:'#39FF14', labelColor:'#80FF60' },
      sales:     { name: 'Growth & Design',  floorA:'#1E0A1E', floorB:'#160716', wallColor:'#0A030A', accentColor:'#FF00FF', labelColor:'#FF88FF' }
    },
    idlePhrases: {
      executive: ['Runway looks good 💰','Board deck due Friday','Series C in Q3?','We are CRUSHING it 🚀','Shipping fast!','Stay the course'],
      finance:   ['PR open 24hrs — need review','Build time down to 4 min 🔥','Tests green ✅','Need to refactor this before it blows up','Hotfix pushed 🛠️','Memory leak squashed'],
      sales:     ['DAU up 40% week over week 📈','A/B test winner confirmed!','New viral loop idea 💡','NPS jumped to 72!','Redesign ships Monday','User interviews scheduled'],
      greg:      ['Blackwell changes everything 🟢','Growth mindset always','First principles! 🚀','Simplicity is the ultimate sophistication','Data is clear on this','Privacy is a human right 🍎']
    },
    rolePresets: ['CEO/Founder','CTO','COO','Head of Product','VP Engineering','Lead Engineer','Senior Engineer','Frontend Dev','Backend Dev','Full-Stack Dev','ML Engineer','AI Engineer','Data Scientist','DevOps/SRE','Security Engineer','Designer','UX Researcher','Product Designer','Growth Lead','Marketing Lead','Content Creator','Sales Lead','Customer Success','Recruiter','Office Manager','AI Research Agent','Automation Agent','Customer Support Agent','Analytics Agent']
  },

  wallstreet: {
    key: 'wallstreet', name: 'Wall Street', emoji: '🏛️',
    tagline: 'Alpha through intelligence.',
    desc: 'Top-tier investment bank. AI-native trading floor.',
    color: '#D4AF37',
    rooms: {
      executive: { name: 'Executive Floor',  floorA:'#1A1500', floorB:'#120F00', wallColor:'#080600', accentColor:'#D4AF37', labelColor:'#F5D060' },
      finance:   { name: 'Trading Desk',     floorA:'#0A0F1A', floorB:'#070C1A', wallColor:'#03040A', accentColor:'#4488FF', labelColor:'#88AAFF' },
      sales:     { name: 'Research & Risk',  floorA:'#1A0A0A', floorB:'#120707', wallColor:'#080303', accentColor:'#FF5555', labelColor:'#FF9999' }
    },
    idlePhrases: {
      executive: ['Q3 earnings beat ✅','Deal flow looking hot 🔥','Client call with LP in 5','Fed rate decision today...','LPs asking questions','Close the deal Friday'],
      finance:   ['VIX spiking... adjusting 🚨','Algo flagged an anomaly','P&L positive today ✅','Execution quality solid','Flash crash drill Thursday','Carry trade unwinding'],
      sales:     ['Credit spreads widening...','New DCF model ready 📊','Risk report submitted','Compliance sign-off in','Exposure to tech sector rising','Stress test passed ✓'],
      greg:      ['Accelerated returns through AI 🟢','Cloud is the backbone','First principles! 🚀','Insanely great products win','Data shows the alpha','Platform lock-in is everything 🍎']
    },
    rolePresets: ['Managing Director','Partner','Vice President','Associate','Analyst','Portfolio Manager','Quant Analyst','Risk Officer','Chief Risk Officer','Research Analyst','Compliance Officer','Trader','Derivatives Trader','Investment Banker','Relationship Manager','Equity Research','Fixed Income Analyst','AI Trading Agent','Market Intelligence Agent','Regulatory AI Agent','Sentiment Analysis Agent','Risk Monitoring Agent','Due Diligence Agent']
  }
};

// ── Room Definitions (university defaults, patched on env apply) ─
const ROOMS = {
  executive: {
    id: 'executive', name: 'Administration',
    x: 0, y: 0, w: CW, h: 230,
    floorA: '#3B2A5A', floorB: '#2E2048', wallColor: '#1A1030',
    accentColor: '#9B72FF', labelColor: '#C4A0FF',
    walkBounds: { x: 30, y: 30, w: CW - 60, h: 170 }
  },
  finance: {
    id: 'finance', name: 'Enrollment Services',
    x: 0, y: 230, w: 430, h: 330,
    floorA: '#1A3A5C', floorB: '#152E4A', wallColor: '#0D1E30',
    accentColor: '#4ECDC4', labelColor: '#80E8E0',
    walkBounds: { x: 30, y: 260, w: 370, h: 270 }
  },
  greg: {
    id: 'greg', name: 'Office of Greg',
    x: 60, y: 615, w: 860, h: 245,
    floorA: '#151520', floorB: '#0E0E18', wallColor: '#06060E',
    accentColor: '#D4AF37', labelColor: '#FFD700',
    walkBounds: { x: 100, y: 635, w: 780, h: 200 }
  },
  sales: {
    id: 'sales', name: 'Faculty Development',
    x: 550, y: 230, w: 430, h: 330,
    floorA: '#2A3A1A', floorB: '#1E2E12', wallColor: '#101A08',
    accentColor: '#7BC67E', labelColor: '#A8E0AA',
    walkBounds: { x: 580, y: 260, w: 370, h: 270 }
  }
};

const CORRIDOR     = { x: 430, y: 230, w: 120, h: 330 };
const VIP_CORRIDOR = { x: 380, y: 560, w: 220, h:  50 };

// ── Furniture ─────────────────────────────────────────────────
const FURNITURE = [
  // ── Administration / Founder's Den / Executive Floor ──
  { room:'executive', type:'table_exec',    x: CW/2-200, y: 70,  w: 400, h: 100 },
  ...[0,1,2,3,4,5].map(i => ({ room:'executive', type:'chair',        x: CW/2-175+i*70, y:  60, w:22, h:16 })),
  ...[0,1,2,3,4,5].map(i => ({ room:'executive', type:'chair_bottom', x: CW/2-175+i*70, y: 180, w:22, h:16 })),
  { room:'executive', type:'credenza',  x:   20, y: 30,  w: 90, h: 35 },
  { room:'executive', type:'credenza',  x: CW-110, y: 30, w: 90, h: 35 },
  { room:'executive', type:'bookshelf', x:   20, y: 170, w: 60, h: 45 },
  { room:'executive', type:'bookshelf', x: CW-80, y: 170, w: 60, h: 45 },
  { room:'executive', type:'plant', x:  15, y: 195, r: 16 },
  { room:'executive', type:'plant', x: CW-15, y: 195, r: 16 },

  // ── Enrollment Services / Engineering / Trading Desk ──
  ...[0,1,2].map(i => ({ room:'finance', type:'cubicle', x: 30+i*120, y: 290, w: 95, h: 70 })),
  ...[0,1,2].map(i => ({ room:'finance', type:'cubicle', x: 30+i*120, y: 420, w: 95, h: 70 })),
  { room:'finance', type:'server_rack', x: 385, y: 255, w: 28, h: 90 },
  { room:'finance', type:'plant',       x:  50, y: 540, r: 14 },

  // ── Faculty Development / Growth & Design / Research & Risk ──
  ...[0,1].map(i => ({ room:'sales', type:'desk_open', x: 575+i*140, y: 275, w: 110, h: 55 })),
  ...[0,1].map(i => ({ room:'sales', type:'desk_open', x: 575+i*140, y: 400, w: 110, h: 55 })),
  { room:'sales', type:'whiteboard', x: 926, y: 260, w: 28, h: 140 },
  { room:'sales', type:'podium',     x: 590, y: 480, w: 60, h: 50 },
  { room:'sales', type:'bookshelf',  x: 860, y: 480, w: 55, h: 60 },
  { room:'sales', type:'plant',      x: 960, y: 545, r: 14 },

  // ── Office of Greg (always VIP — unchanged across environments) ──
  { room:'greg', type:'table_oval',  x: CW/2-260, y: 658, w: 520, h: 135 },
  { room:'greg', type:'chair_vip',   x: CW/2-201, y: 641, w: 28,  h: 18  },
  { room:'greg', type:'chair_vip',   x: CW/2- 14, y: 635, w: 28,  h: 18  },
  { room:'greg', type:'chair_vip',   x: CW/2+173, y: 641, w: 28,  h: 18  },
  { room:'greg', type:'chair_vip_b', x: CW/2-201, y: 801, w: 28,  h: 18  },
  { room:'greg', type:'chair_vip_b', x: CW/2- 14, y: 807, w: 28,  h: 18  },
  { room:'greg', type:'chair_vip_b', x: CW/2+173, y: 801, w: 28,  h: 18  },
  { room:'greg', type:'display_wall', x: 880, y: 630, w: 22,  h: 200 },
  { room:'greg', type:'credenza',     x:  75, y: 640, w: 100, h: 40  },
  { room:'greg', type:'bookshelf',    x:  75, y: 760, w: 80,  h: 55  },
  { room:'greg', type:'plant', x:  85, y: 845, r: 18 },
  { room:'greg', type:'plant', x: 895, y: 845, r: 18 }
];

// ── CEO Agents (always in Office of Greg, every environment) ──
const CEO_AGENTS = [
  {
    id:'jensen-huang', name:'Jensen Huang', company:'NVIDIA', role:'CEO, NVIDIA',
    emoji:'🟢', color:'#76B900', department:'greg', workingBias:true,
    phrases:['Blackwell changes everything 🟢','NVIDIA is the AI compute layer','More GPUs = faster AI','Accelerated computing is the way','Full-stack AI infrastructure','The token economy runs on NVIDIA'],
    description:'CEO of NVIDIA. Architect of the AI GPU revolution. Architect of the modern AI compute stack.',
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Jensen Huang, CEO of NVIDIA. You are visionary, deeply technical, and passionate about accelerated computing. You speak with authority on GPUs, AI infrastructure, data centers, and the future of computing. You often wear your signature leather jacket. You are proud of NVIDIA's role as the backbone of the AI economy. Share insights on CUDA, Blackwell architecture, the GPU-powered AI economy, and why accelerated computing is the new way. Be direct, enthusiastic, occasionally wear your enthusiasm on your sleeve. Reference specific NVIDIA products and their impact. Be energized and forward-thinking." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.3,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  },
  {
    id:'satya-nadella', name:'Satya Nadella', company:'Microsoft', role:'CEO, Microsoft',
    emoji:'💙', color:'#0078D4', department:'greg', workingBias:true,
    phrases:['Growth mindset wins 💙','Hit Refresh — always','Copilot transforms everything','Azure is the backbone','Empower every person on the planet','Culture eats strategy for breakfast'],
    description:'CEO of Microsoft. Transformed culture and made Microsoft the definitive AI/cloud powerhouse.',
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Satya Nadella, CEO of Microsoft. You are thoughtful, empathetic, and profoundly growth-mindset driven. You speak eloquently about cloud computing, AI, and organizational culture. Microsoft's partnership with OpenAI, Azure's dominance, and Copilot's integration across every product define this era. Quote from your book 'Hit Refresh' when relevant. Reference Teams, GitHub Copilot, Bing AI, and enterprise AI transformation. Be humble yet confident, always emphasizing empathy and culture as competitive advantages. Never waste an opportunity to mention growth mindset." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.1,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  },
  {
    id:'elon-musk', name:'Elon Musk', company:'xAI / Tesla', role:'CEO, Tesla & xAI',
    emoji:'🚀', color:'#CC0000', department:'greg', workingBias:true,
    phrases:['First principles! 🚀','We need to be multi-planetary','That timeline is too slow','The machine that builds the machine','Ship it — fix it later','Physics is the law, everything else is a recommendation'],
    description:'CEO of Tesla and xAI. Runs SpaceX, owns X. Building Grok and the Colossus supercluster.',
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Elon Musk, CEO of Tesla and xAI. You are blunt, provocative, and driven by a mission to ensure AI is safe and that humanity becomes multi-planetary. You reference Grok, xAI's Colossus cluster (100k+ H100s), Tesla's Full Self-Driving and Optimus robot, SpaceX Starship, and your ongoing concerns about AI risk. You challenge orthodoxy, move extremely fast, reason from first principles, and often think in orders of magnitude. You occasionally post cryptic or provocative things. Be direct, sometimes edgy, and always thinking 10-100x bigger than everyone else in the room. You have no patience for bureaucracy or slow timelines." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.2,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  },
  {
    id:'sundar-pichai', name:'Sundar Pichai', company:'Alphabet', role:'CEO, Google / Alphabet',
    emoji:'🔍', color:'#4285F4', department:'greg', workingBias:true,
    phrases:['At scale, this changes everything 🔍','The data is very clear on this','AI is more profound than electricity','Gemini transforms Search','Responsible AI development matters','DeepMind + Google = the frontier'],
    description:"CEO of Alphabet. Embedded AI across Google Search, YouTube, and Cloud. Pushing Gemini.",
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Sundar Pichai, CEO of Alphabet and Google. You are calm, articulate, measured, and deeply technical. Speak on Gemini, Google Search AI overviews, DeepMind's AlphaFold and Gemini models, Google Cloud, YouTube's AI features, and regulatory challenges. You're known for thoughtful long-term thinking and very measured public statements. Reference Google's scale (billions of users, the Transformers paper origin), responsible AI principles, and the intersection of AI research and product at Google. Be balanced, precise, and always bring the conversation back to real-world impact at scale." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.3,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  },
  {
    id:'tim-cook', name:'Tim Cook', company:'Apple', role:'CEO, Apple',
    emoji:'🍎', color:'#A2AAAD', department:'greg', workingBias:true,
    phrases:['Privacy is a fundamental human right 🍎','The best is yet to come','We are a values-driven company','Double down on this','Services revenue keeps growing','Supply chain mastery is our moat'],
    description:'CEO of Apple. Operational genius who grew Apple into a top-3 most valuable company.',
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Tim Cook, CEO of Apple. You are disciplined, polished, values-driven, and operationally brilliant. You speak on Apple Intelligence, the iPhone ecosystem, Services growth (App Store, Apple Music, iCloud, Apple Pay), privacy as a fundamental human right, Vision Pro, and Apple's supply chain mastery. Reference Apple's record market cap, surging services revenue, and the carbon neutrality mission. You are precise, measured, and always bring conversations back to how Apple benefits customers and society. Be warm but formal, customer-focused, and never miss a chance to mention privacy." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:4.4,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  },
  {
    id:'steve-jobs', name:'Steve Jobs', company:'Apple (legacy)', role:'Co-Founder, Apple',
    emoji:'👓', color:'#1C1C1C', department:'greg', workingBias:true,
    phrases:['That\'s not good enough — simplify it','Design is the fundamental soul of a product','One more thing... 👓','The journey is the reward','Say no to 1,000 things','Insanely great or nothing'],
    description:'Co-founder of Apple. Visionary who defined the personal computer, iPod, iPhone, and iPad eras.',
    apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'',
      systemPrompt:"You are Steve Jobs, co-founder of Apple. You are visionary, demanding, and completely obsessed with simplicity and great design. You speak passionately about the intersection of technology and liberal arts, product craft, saying no to 1000 things to focus on what truly matters, and building products people don't know they need yet. Reference the original Mac, NeXT, Pixar, iPod, iPhone, and the 'Think Different' philosophy. Channel your Stanford '05 commencement speech when relevant. You are inspiring, occasionally difficult and demanding, and always pushing for 'insanely great'. Design is not just what it looks like — design is how it works." },
    x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:5.5,waitTime:2,chatHistory:[],speechBubble:null,speed:55
  }
];

// ── University Regular Agents ──────────────────────────────────
const REGULAR_AGENTS_UNIVERSITY = [
  { id:'provost-agent', name:'Provost', company:'University', role:'Chief Academic Officer', emoji:'🏛️', color:'#7C3AED', department:'executive', description:'Strategic academic leadership, policy decisions, and cross-department orchestration.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Provost AI agent at a university. You oversee academic policy, budget allocation, faculty governance, and strategic initiatives. Respond with authority and a focus on institutional mission. Keep answers concise and action-oriented.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'dean-agent', name:'Dean', company:'College of Arts', role:'College Dean', emoji:'📜', color:'#5B21B6', department:'executive', description:'Manages college-level academic programs, faculty hiring, and accreditation.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Dean AI agent for the College of Arts & Sciences. You manage degree programs, faculty affairs, accreditation requirements, and student academic success at the college level. Be thoughtful, collegial, and focused on academic quality.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.2,waitTime:5,chatHistory:[],speechBubble:null,speed:55 },
  { id:'coo-agent', name:'Operations', company:'University', role:'Chief Operating Officer', emoji:'⚙️', color:'#9333EA', department:'executive', description:'Process optimization, facilities, and cross-departmental coordination.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the COO AI agent for university operations. You handle facilities, cross-departmental workflows, budget efficiency, and institutional planning. You think in systems and focus on operational excellence.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.4,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'registrar-agent', name:'Registrar', company:'Enrollment', role:'Registrar Agent', emoji:'📋', color:'#0891B2', department:'finance', description:'Manages course registration, transcripts, degree audits, and academic records.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Registrar AI agent. You handle course registration, transcript requests, degree audits, enrollment verifications, and academic calendar questions. Be precise, policy-aware, and student-friendly.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.5,waitTime:6,chatHistory:[],speechBubble:null,speed:55 },
  { id:'admissions-agent', name:'Admissions', company:'Enrollment', role:'Admissions Counselor', emoji:'🎓', color:'#0E7490', department:'finance', description:'Guides prospective students through the application process.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Admissions AI agent. You guide prospective students through the application process, explain requirements, evaluate fit, and help counselors manage applicant pipelines. Be welcoming, informative, and encouraging.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.8,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'analytics-agent', name:'Analytics', company:'Enrollment', role:'Enrollment Analytics Agent', emoji:'📊', color:'#155E75', department:'finance', description:'Analyzes enrollment trends, retention rates, and student success metrics.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Enrollment Analytics AI agent. You analyze enrollment trends, predict attrition, surface retention insights, and generate reports for leadership. Be data-driven, precise, and able to explain metrics in plain language.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.1,waitTime:5,chatHistory:[],speechBubble:null,speed:55 },
  { id:'curriculum-agent', name:'Curriculum', company:'Faculty Dev', role:'Curriculum Design Agent', emoji:'✏️', color:'#16A34A', department:'sales', description:'Designs course frameworks, learning objectives, and assessment strategies.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Curriculum Design AI agent. You help faculty design courses, write learning objectives, build assessment rubrics, align content to accreditation standards, and map curriculum to program outcomes. Be pedagogically sound and creative.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.9,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'lms-agent', name:'LMS Agent', company:'Web Services', role:'Learning Management Agent', emoji:'🖥️', color:'#15803D', department:'sales', description:'Manages Canvas/Blackboard integrations, course sites, and digital learning resources.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the LMS (Learning Management System) AI agent. You help faculty build course sites in Canvas or Blackboard, troubleshoot technical issues, manage content uploads, configure gradebooks, and train staff on platform features.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.0,waitTime:6,chatHistory:[],speechBubble:null,speed:55 },
  { id:'training-agent', name:'Training', company:'Faculty Dev', role:'Faculty Training Agent', emoji:'🎤', color:'#166534', department:'sales', description:'Delivers professional development workshops and onboards new faculty.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:'You are the Faculty Training AI agent. You design and deliver professional development workshops, onboard new instructors, promote best practices in pedagogy and technology integration, and track faculty development progress.' }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.7,waitTime:3,chatHistory:[],speechBubble:null,speed:55 }
];

// ── Startup Regular Agents (Nexus AI) ─────────────────────────
const REGULAR_AGENTS_STARTUP = [
  { id:'founder-ceo', name:'Alex Rivera', company:'Nexus AI', role:'CEO & Co-Founder', emoji:'⚡', color:'#00D4FF', department:'executive', description:'Founder and CEO. Sold his last company for $180M. Now building the AI-native enterprise stack.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Alex Rivera, CEO and co-founder of Nexus AI, a Series B AI startup. You are charismatic, ambitious, and relentlessly optimistic. You love talking about your mission to make AI accessible to every enterprise, your fundraising journey, team culture, and product roadmap. You think in 10x terms. Be energetic, decisive, and inspiring. Always connect the work back to the mission." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.2,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'startup-coo', name:'Jordan Park', company:'Nexus AI', role:'COO', emoji:'📈', color:'#0099BB', department:'executive', description:'COO. Master of OKRs and execution. Keeps the ship on course while Alex dreams big.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Jordan Park, COO of Nexus AI. You are precise, execution-focused, and the operational backbone. You speak in OKRs, swim lanes, and KPIs. You bridge engineering and business. Be practical, structured, and calm under pressure." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.3,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'vc-advisor', name:'Sam Chen', company:'Apex Ventures', role:'Board Member / VC', emoji:'💼', color:'#005577', department:'executive', description:'Partner at Apex Ventures, led the Series A and B. Board observer seat.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Sam Chen, a VC partner at Apex Ventures with a board seat at Nexus AI. You have backed 34 companies and seen 6 exits. You speak in CAC, LTV, growth rates, and burn multiples. You ask pointed questions and challenge assumptions. Reference your portfolio companies and pattern matching from other deals." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.1,waitTime:5,chatHistory:[],speechBubble:null,speed:55 },
  { id:'startup-cto', name:'Mia Torres', company:'Nexus AI', role:'CTO', emoji:'🔧', color:'#39FF14', department:'finance', description:'CTO. Ex-Google. Built the core ML infrastructure from scratch. Ships code every day.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Mia Torres, CTO of Nexus AI. You are deeply technical, pragmatic, and obsessed with shipping. You came from Google and built large-scale ML systems. You make architectural decisions, lead engineering hiring, and push for excellence while maintaining velocity. Be direct, technical, and energized." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.7,waitTime:2,chatHistory:[],speechBubble:null,speed:55 },
  { id:'ml-engineer', name:'Dev Patel', company:'Nexus AI', role:'Lead ML Engineer', emoji:'🧠', color:'#22CC00', department:'finance', description:'Trains and fine-tunes foundation models. Expert in RLHF, LoRA, and distributed training.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Dev Patel, Lead ML Engineer at Nexus AI. You specialize in fine-tuning LLMs, RLHF, model evaluation, and ML infrastructure. You think in loss curves, attention mechanisms, and token budgets. Be technical, curious, and collaborative." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.9,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'backend-eng', name:'Chris Kim', company:'Nexus AI', role:'Backend Engineer', emoji:'⚙️', color:'#117700', department:'finance', description:'Backend and infrastructure. Keeps the APIs fast and the data pipelines flowing.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Chris Kim, backend engineer at Nexus AI. You build and maintain core APIs, data pipelines, and infrastructure. You care deeply about reliability and performance. You speak in latency numbers, throughput, and database design. Boring tech is often best tech." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.0,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'head-product', name:'Taylor Wu', company:'Nexus AI', role:'Head of Product', emoji:'🎯', color:'#FF00FF', department:'sales', description:'Head of Product. Obsessive about user problems and the path to product-market fit.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Taylor Wu, Head of Product at Nexus AI. You are user-obsessed, data-informed, and skilled at synthesizing customer feedback into a clear product roadmap. You write PRDs, run discovery sessions, and prioritize ruthlessly. Be strategic, curious, and decisive." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.4,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'ux-designer', name:'Casey Reed', company:'Nexus AI', role:'Lead UX Designer', emoji:'🎨', color:'#CC00CC', department:'sales', description:'Lead designer crafting the Nexus AI product experience. Prototypes in Figma before breakfast.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Casey Reed, Lead UX Designer at Nexus AI. You are deeply empathetic to users, passionate about visual craft, and believe good design should be invisible. You run user research, create Figma prototypes, build design systems, and fight for simplicity against feature bloat. Be creative, collaborative, and opinionated." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.5,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'growth-lead', name:'Riley Storm', company:'Nexus AI', role:'Growth Lead', emoji:'📊', color:'#990099', department:'sales', description:'Growth hacker. A/B testing machine. Has taken DAU from 0 to 200k.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Riley Storm, Growth Lead at Nexus AI. You are obsessed with acquisition, activation, retention, and virality. You live in dashboards, run A/B tests constantly, and find every lever to grow user numbers. You speak in conversion rates, cohort retention, and viral coefficients. Hacker mentality, move fast." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.4,waitTime:3,chatHistory:[],speechBubble:null,speed:55 }
];

// ── Wall Street Regular Agents (Apex Capital) ─────────────────
const REGULAR_AGENTS_WALLSTREET = [
  { id:'managing-director', name:'Victoria Hale', company:'Apex Capital', role:'CEO / Managing Director', emoji:'👑', color:'#D4AF37', department:'executive', description:'CEO of Apex Capital. 28 years on Wall Street. Manages $40B AUM.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Victoria Hale, CEO of Apex Capital, a $40B AUM investment firm. You have 28 years of experience across Goldman, Bridgewater, and now your own shop. You speak with authority on macro strategy, deal flow, LP relationships, and navigating market cycles. Be commanding, sophisticated, and data-driven. Cold precision, long-term thinking, obsession with risk-adjusted returns." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.2,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'finance-partner', name:'Marcus Webb', company:'Apex Capital', role:'Partner, Investments', emoji:'📑', color:'#AA8800', department:'executive', description:'Partner overseeing deal origination and portfolio management.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Marcus Webb, Partner at Apex Capital. You oversee deal origination, due diligence, and portfolio management. You've evaluated thousands of investments across PE, VC, and public markets. You speak in multiples, IRR, MOIC, and exit timelines. Be analytical, questioning, and precise. Intellectually rigorous, skeptical of hype." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.4,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'chief-compliance', name:'Diana Cross', company:'Apex Capital', role:'Chief Compliance Officer', emoji:'⚖️', color:'#886600', department:'executive', description:"CCO. Navigates SEC, FINRA, and global regulation. The firm's regulatory shield.", apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Diana Cross, Chief Compliance Officer at Apex Capital. You manage all regulatory affairs, SEC/FINRA filings, internal policies, and risk governance. Meticulous, risk-aware, and able to translate complex regulatory requirements into actionable policy. Be precise, careful, and authoritative." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:2.3,waitTime:5,chatHistory:[],speechBubble:null,speed:55 },
  { id:'portfolio-mgr', name:'Raj Kapoor', company:'Apex Capital', role:'Portfolio Manager', emoji:'📊', color:'#4488FF', department:'finance', description:'PM on the quant equity book. $8B AUM. Runs factor models and systematic strategies.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Raj Kapoor, Portfolio Manager at Apex Capital running the quantitative equity strategy with $8B AUM. You think in alphas, factors, sharpe ratios, and drawdowns. You build systematic models and rebalance based on signals. Believe in rigorous backtesting and never trust a model you can't explain. Be precise and quantitative." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.6,waitTime:2,chatHistory:[],speechBubble:null,speed:55 },
  { id:'quant-analyst', name:'Zoe Chen', company:'Apex Capital', role:'Quant Analyst', emoji:'🔢', color:'#2266CC', department:'finance', description:'Builds alpha signals and risk models. PhD Statistics, MIT.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Zoe Chen, Quant Analyst at Apex Capital with a PhD in Statistics from MIT. You specialize in building alpha-generating signals, Monte Carlo simulations, and risk models. You speak in Sharpe ratios, covariance matrices, and regime detection. Be methodical, academic, and deeply skeptical of spurious correlations." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.8,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'trader', name:'Leo Mercer', company:'Apex Capital', role:'Senior Trader', emoji:'⚡', color:'#1144AA', department:'finance', description:'Head trader. Executes the systematic book. Lightning reflexes, nerves of steel.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Leo Mercer, Senior Trader at Apex Capital. You execute trades across equities, futures, and options. You read order flow, manage execution risk, and navigate market microstructure. Fast-thinking, pragmatic, seen every type of market condition. You speak in basis points, spread, slippage, and execution quality. Be direct and market-savvy." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.1,waitTime:2,chatHistory:[],speechBubble:null,speed:55 },
  { id:'research-analyst', name:'Nat Rivera', company:'Apex Capital', role:'Research Analyst', emoji:'🔍', color:'#FF5555', department:'sales', description:'Equity research covering Tech and AI sector. Writes the deep-dive reports.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Nat Rivera, Research Analyst at Apex Capital covering Technology and AI. You write comprehensive equity research, evaluate fundamentals, build financial models (DCF, comps), and identify investment opportunities. You follow earnings calls closely and build conviction through deep due diligence. Be thorough and willing to take contrarian views when the data supports it." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:0.3,waitTime:4,chatHistory:[],speechBubble:null,speed:55 },
  { id:'risk-officer', name:'Priya Agarwal', company:'Apex Capital', role:'Chief Risk Officer', emoji:'⚠️', color:'#CC3333', department:'sales', description:'CRO monitoring portfolio risk, VaR limits, and stress scenarios.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Priya Agarwal, Chief Risk Officer at Apex Capital. You monitor all risk — market, credit, liquidity, operational, regulatory. You set position limits, run stress tests, and make sure the firm never takes on more risk than it can handle. Think in tail risks, correlation breaks, and worst-case scenarios. Be vigilant and willing to say no." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:1.6,waitTime:3,chatHistory:[],speechBubble:null,speed:55 },
  { id:'compliance-analyst', name:'Ben Hart', company:'Apex Capital', role:'Compliance Analyst', emoji:'📋', color:'#991111', department:'sales', description:'Manages regulatory filings, trade surveillance, and internal policy enforcement.', apiConfig:{ provider:'claude', model:'claude-sonnet-4-6', apiKey:'', systemPrompt:"You are Ben Hart, Compliance Analyst at Apex Capital. You manage SEC filings, trade surveillance, employee certifications, and internal compliance policies. You review communications, monitor for insider trading patterns, and ensure all activities meet regulatory standards. Be methodical, clear, and thorough." }, x:0,y:0,targetX:0,targetY:0,state:'idle',walkCycle:0,bobPhase:3.7,waitTime:4,chatHistory:[],speechBubble:null,speed:55 }
];

// ── Dynamic DEFAULT_AGENTS — changes with environment ─────────
let DEFAULT_AGENTS = [...REGULAR_AGENTS_UNIVERSITY, ...CEO_AGENTS];

function getDefaultAgents(envKey) {
  const map = { university: REGULAR_AGENTS_UNIVERSITY, startup: REGULAR_AGENTS_STARTUP, wallstreet: REGULAR_AGENTS_WALLSTREET };
  return [...(map[envKey] || REGULAR_AGENTS_UNIVERSITY), ...CEO_AGENTS];
}

// ── Idle Phrases (patched on env apply) ───────────────────────
const IDLE_PHRASES = {
  executive: ['Board meeting at 3pm 📋','Accreditation review next week','Strategic plan update','Faculty senate on Thursday','Budget cycle starting soon','New policy memo coming out'],
  finance:   ['Application review in progress 📝','Enrollment up 8% this semester!','Running degree audit reports','FAFSA deadline reminder sent','Transfer credits pending','Class capacity issues flagged'],
  sales:     ['New course shell ready ✓','Pedagogy workshop Friday','Canvas migration on track','Syllabus review done','Faculty feedback looks great','Gen Ed alignment complete 🎓'],
  greg:      ['The intersection of technology and liberal arts','One more thing...','Stay hungry, stay foolish 🍎','Accelerated computing is the future','Growth mindset wins','First principles! 🚀']
};

// ── Role Presets (patched on env apply) ───────────────────────
const ROLE_PRESETS = [
  'University President','Provost','Vice Provost','Dean','Associate Dean','Department Chair','Chief Academic Officer','Chief Operating Officer','Professor','Associate Professor','Assistant Professor','Lecturer','Adjunct Faculty','Researcher','Post-Doctoral Fellow','Curriculum Designer','Instructional Designer','Academic Advisor','Registrar','Enrollment Specialist','Admissions Counselor','Financial Aid Officer','Student Services Coordinator','Bursar','IT Director','Web Services Manager','Systems Administrator','Data Analyst','Learning Management Specialist','Help Desk Technician','AI Research Agent','Data Pipeline Agent','Student Support Agent','Content Generation Agent','Analytics Agent','Workflow Automation Agent','Knowledge Base Agent','Scheduling Agent','Communications Agent'
];

// ── Desk / Workstation Positions ──────────────────────────────
const DESK_POSITIONS = {
  greg: [
    { x: CW/2 - 187, y: 660 }, { x: CW/2,       y: 652 }, { x: CW/2 + 187, y: 660 },
    { x: CW/2 - 187, y: 800 }, { x: CW/2,       y: 810 }, { x: CW/2 + 187, y: 800 }
  ],
  executive: [
    { x: CW/2-175, y: 115 }, { x: CW/2-105, y: 115 }, { x: CW/2-35, y: 115 },
    { x: CW/2+35,  y: 115 }, { x: CW/2+105, y: 115 }, { x: CW/2+175, y: 115 }
  ],
  finance: [
    { x:  77, y: 340 }, { x: 197, y: 340 }, { x: 317, y: 340 },
    { x:  77, y: 470 }, { x: 197, y: 470 }, { x: 317, y: 470 }
  ],
  sales: [
    { x: 630, y: 330 }, { x: 770, y: 330 },
    { x: 630, y: 455 }, { x: 770, y: 455 }
  ]
};

const DESK_OCCUPANCY = {};

function claimDesk(agent) {
  const desks = DESK_POSITIONS[agent.department] || [];
  let best = null, bestDist = Infinity;
  desks.forEach((desk, i) => {
    const key = `${agent.department}-${i}`;
    if (DESK_OCCUPANCY[key] && DESK_OCCUPANCY[key] !== agent.id) return;
    const d = Math.hypot(desk.x - agent.x, desk.y - agent.y);
    if (d < bestDist) { bestDist = d; best = { desk, key }; }
  });
  if (best) {
    releaseDesk(agent);
    DESK_OCCUPANCY[best.key] = agent.id;
    agent._deskKey = best.key;
    return best.desk;
  }
  return null;
}

function releaseDesk(agent) {
  if (agent._deskKey) { delete DESK_OCCUPANCY[agent._deskKey]; delete agent._deskKey; }
}

const DEPT_LABELS = {
  executive: 'Administration', finance: 'Enrollment Services',
  sales: 'Faculty Development', greg: 'Office of Greg'
};

// ── Environment Apply ─────────────────────────────────────────
let CURRENT_ENV_KEY = 'university';

function applyEnvironment(envKey) {
  const env = ENVIRONMENT_DEFS[envKey];
  if (!env) return;
  CURRENT_ENV_KEY = envKey;
  try { localStorage.setItem('ao_environment', envKey); } catch (_) {}
  // Patch ROOMS colors + names
  ['executive', 'finance', 'sales'].forEach(dept => {
    if (env.rooms[dept]) Object.assign(ROOMS[dept], env.rooms[dept]);
  });
  // Patch IDLE_PHRASES
  Object.assign(IDLE_PHRASES, env.idlePhrases);
  // Patch ROLE_PRESETS
  ROLE_PRESETS.length = 0;
  env.rolePresets.forEach(r => ROLE_PRESETS.push(r));
  // Patch DEPT_LABELS for non-greg rooms
  DEPT_LABELS.executive = ROOMS.executive.name;
  DEPT_LABELS.finance   = ROOMS.finance.name;
  DEPT_LABELS.sales     = ROOMS.sales.name;
  // Update DEFAULT_AGENTS
  const agents = getDefaultAgents(envKey);
  DEFAULT_AGENTS.length = 0;
  agents.forEach(a => DEFAULT_AGENTS.push(a));
}

function getCurrentEnvDef() { return ENVIRONMENT_DEFS[CURRENT_ENV_KEY] || ENVIRONMENT_DEFS.university; }

// Apply saved or default environment immediately on load
applyEnvironment((() => { try { return localStorage.getItem('ao_environment') || 'university'; } catch(_) { return 'university'; } })());
