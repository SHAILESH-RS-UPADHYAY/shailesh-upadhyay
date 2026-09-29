// All portfolio content lives here. Edit this file to update the site.

export type Accent = 'emerald' | 'cyan' | 'violet' | 'rose' | 'amber'

export const accentHex: Record<Accent, string> = {
  emerald: '#34d399',
  cyan: '#22d3ee',
  violet: '#a78bfa',
  rose: '#fb7185',
  amber: '#fbbf24',
}

export type Link = { label: string; href: string }

export const profile = {
  first: 'SHAILESH',
  last: 'UPADHYAY',
  role: 'AI Backend Engineer',
  focus: ['Python', 'LLMs', 'RAG Systems', 'AI Agents'],
  tagline: "I don't just prototype models; I ship them into production.",
  summary:
    "AI Backend Engineer with hands-on experience building conversational AI pipelines, high-concurrency backend services, and scalable web applications that don't break at 3 AM. From asynchronous FastAPI streaming and database query optimization to deploying sub-15ms inference engines, I build resilient systems that resolve core bottlenecks. Experienced in shipping production Next.js web apps and client dashboards, and collaborating directly with US engineering teams to maintain 99.9% service reliability.",
  current: 'WebVory',
  location: 'India',
  email: 'shaileshrsupadhyay@gmail.com',
  github: 'https://github.com/SHAILESH-RS-UPADHYAY',
  linkedin: 'https://linkedin.com/in/shailesh-upadhyay-6a112624a',
}

// Hero greeting, cycling through languages: "Hi, I'm Shailesh" in each one.
export const greetings: { hi: string; name: string; code: string; lang: string }[] = [
  { hi: "Hi, I'm", name: 'SHAILESH', code: 'EN', lang: 'English' },
  { hi: 'नमस्ते, मैं', name: 'शैलेश', code: 'HI', lang: 'हिन्दी' },
  { hi: 'Hallo, ich bin', name: 'SHAILESH', code: 'DE', lang: 'Deutsch' },
  { hi: 'வணக்கம், நான்', name: 'ஷைலேஷ்', code: 'TA', lang: 'தமிழ்' },
  { hi: 'こんにちは、私は', name: 'シャイレシュ', code: 'JA', lang: '日本語' },
  { hi: 'Hej, jag är', name: 'SHAILESH', code: 'SV', lang: 'Svenska' },
  { hi: 'నమస్కారం, నేను', name: 'శైలేష్', code: 'TE', lang: 'తెలుగు' },
  { hi: 'Привет, я', name: 'ШАЙЛЕШ', code: 'RU', lang: 'Русский' },
  { hi: 'Hei, jeg er', name: 'SHAILESH', code: 'NO', lang: 'Norsk' },
  { hi: 'नमस्ते, अहम्', name: 'शैलेशः', code: 'SA', lang: 'संस्कृतम्' },
  { hi: '안녕하세요, 저는', name: '샤일레시', code: 'KO', lang: '한국어' },
  { hi: 'Moien, ech sinn', name: 'SHAILESH', code: 'LB', lang: 'Lëtzebuergesch' },
  { hi: 'നമസ്കാരം, ഞാൻ', name: 'ശൈലേഷ്', code: 'ML', lang: 'മലയാളം' },
  { hi: 'Grüezi, ich bi', name: 'SHAILESH', code: 'CH', lang: 'Schwiizerdütsch' },
]

export const stats = [
  { prefix: '−', to: 45, dec: 0, suffix: '%', label: 'p95 latency on LLM streaming, 1.2s → 660ms' },
  { prefix: '<', to: 15, dec: 0, suffix: 'ms', label: 'production inference with ONNX + TensorRT' },
  { prefix: '', to: 99.9, dec: 1, suffix: '%', label: 'service uptime behind CI/CD gates' },
  { prefix: '', to: 87.1, dec: 1, suffix: '%', label: 'F1 on address-extraction NER' },
]

export const whoami = [
  '$ whoami',
  'shailesh upadhyay · ai backend engineer',
  '$ cat now.txt',
  'building LLM infrastructure @ WebVory (US team)',
  '$ ls ~/focus',
  'llm-pipelines/  rag/  agents/  async-backends/  inference/',
  '$ echo $MOTTO',
  'ship it, measure it, make it not break at 3 AM',
]

// Terminal line styles: "$ " prompt · "# " comment · "→ " bullet · "  " detail.
export const experience: {
  role: string
  org: string
  note: string
  period: string
  accent: Accent
  file: string
  lines: string[]
  stack: string[]
  links: Link[]
}[] = [
  {
    role: 'AI Backend Engineer',
    org: 'WebVory',
    note: 'US-based · core AI infrastructure and backend systems',
    period: 'Jun 2026 – Present',
    accent: 'emerald',
    file: 'webvory.log',
    lines: [
      '→ Async FastAPI services for concurrent LLM streaming calls',
      '  token rate-limiting + connection pooling',
      '  p95 latency 1.2s → 660ms (−45%)',
      '→ Company-standard telemetry dashboard',
      '  React + TypeScript + FastAPI on PostgreSQL with Redis caching',
      '  median query latency −60%',
      '→ The complete GitHub Actions CI/CD pipeline (deploy.yml)',
      '  test, lint and branch-validation gates · 99.9% uptime',
    ],
    stack: ['FastAPI', 'asyncio', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'GitHub Actions'],
    links: [],
  },
  {
    role: 'Freelance Full-Stack & AI Developer',
    org: 'Client engagements',
    note: 'Web platforms, dashboards and AI prototypes',
    period: 'Jan 2026 – Present',
    accent: 'cyan',
    file: 'clients.log',
    lines: [
      '→ Devine Child Development Centre: production web platform',
      '  Next.js + React + TypeScript · Core Web Vitals tuned · live at devinecdc.in',
      '→ Devine CDC student dashboard: parent, therapist and admin app',
      '  React 19 + Supabase row-level security · shipped to Android with Capacitor',
      '→ LÜQ: emotion-aware interactive prototype for an international client',
      '  7-emotion sentiment engine driving live visual mood reactions',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Capacitor', 'Tailwind'],
    links: [
      { label: 'devinecdc.in', href: 'https://devinecdc.in' },
      { label: 'LÜQ prototype', href: 'https://shailesh-rs-upadhyay.github.io/luq-prototype/' },
    ],
  },
  {
    role: 'ML Engineer (Contract)',
    org: 'FAR Labs / Dizzaract',
    note: 'Player behaviour cloning for game AI',
    period: 'Dec 2025 – Feb 2026',
    accent: 'violet',
    file: 'far-labs.log',
    lines: [
      '→ 4 neural models: Aim LSTM, Movement Transformer, Tactical MLP + style model',
      '  trained on 30Hz player telemetry, float[256] → float[32]',
      '→ Inverse Dynamics model pseudo-labelled 500+ hours of gameplay',
      '→ Exported to ONNX and TensorRT (INT8 / FP16)',
      '  sub-15ms production inference',
    ],
    stack: ['PyTorch', 'LSTM', 'Transformers', 'ONNX', 'TensorRT'],
    links: [],
  },
  {
    role: 'NLP Engineer (Freelance)',
    org: 'IOTA',
    note: 'Address-extraction NER pipeline and model delivery',
    period: 'Feb 2024 – Apr 2024',
    accent: 'rose',
    file: 'iota.log',
    lines: [
      '→ End-to-end SpaCy NER pipeline: generate → train → evaluate → infer',
      '  extracts STREET, CITY, STATE, ZIP from raw address strings',
      '→ Weak-supervision generator: 100+ raw inputs → 2,500 labelled samples',
      '→ SGD, 50 epochs, 25% dropout',
      '  P 89.2%  R 85.1%  F1 87.1% on held-out test data',
    ],
    stack: ['Python', 'SpaCy', 'NER', 'Weak supervision'],
    links: [{ label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/iota-address-parser' }],
  },
]

export type Visual = 'radar' | 'router' | 'wave' | 'gold'

export const projects: {
  name: string
  kind: string
  pitch: string
  accent: Accent
  visual: Visual
  file: string
  metrics: { v: string; l: string }[]
  lines: string[]
  stack: string[]
  links: Link[]
}[] = [
  {
    name: 'RADAR',
    kind: 'AI job-intelligence engine',
    pitch: 'Runs every night and does everything in a job hunt except the final click.',
    accent: 'emerald',
    visual: 'radar',
    file: 'radar/pipeline.ts',
    metrics: [
      { v: '20', l: 'live job sources' },
      { v: '82', l: 'companies tracked' },
      { v: '0–100', l: 'match per job' },
    ],
    lines: [
      '# every night: discover → scrape → verify → match → tailor → track',
      '→ 20 live sources = 11 company ATS feeds + 9 job boards',
      '  Greenhouse, Lever, Ashby, Workday, Amazon Jobs…',
      '  Hacker News, Remote OK, Remotive, Adzuna, Jooble…',
      '→ 82 companies seeded: 54 scraped every run, 28 as dream picks',
      '→ Finds new funded startups politely',
      '  reads robots.txt, one request every 1.5s, backs off on 429',
      '→ Scores every job 0–100 against your resume',
      '  e5-large embeddings in Pinecone · 60% meaning + 40% skills',
      '→ 80+ goes to the Vault, apply link re-checked daily',
      '→ 50–79 gets an honest AI resume rewrite (Claude, Gemini, Grok)',
      '→ Gmail replies move each application forward on its own',
      '→ 3 Vercel crons a night · 105 tests',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Pinecone', 'Vercel Cron', 'Clerk', 'Anthropic', 'Gemini'],
    links: [
      { label: 'Live site', href: 'https://radar-neon-theta.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/radar' },
    ],
  },
  {
    name: 'Vettly',
    kind: 'AI interview-prep studio',
    pitch: 'Turns your resume, GitHub and target job into interview prep grounded in your real work.',
    accent: 'violet',
    visual: 'router',
    file: 'vettly/main.py',
    metrics: [
      { v: '80K', l: 'char RAG context' },
      { v: '4', l: 'LLM providers' },
      { v: '9', l: 'question tracks' },
    ],
    lines: [
      '# resume + repos + JD + STAR stories → one priority-ordered context',
      '→ Parses resumes (.pdf / .docx) and scrapes public repos with httpx',
      '→ Priority RAG context so key specs never get lost mid-window',
      '→ Failover router: Claude → Gemini → OpenAI → Groq',
      '  exponential backoff on 429 / 529, auto context-slicing',
      '→ 9 tracks: DSA, system design, project deep-dive, behavioural…',
      '→ Humanizer + 7-dimension scoring before any answer is shown',
      '→ Live practice copilot with Deepgram voice over WebSockets',
    ],
    stack: ['Python', 'FastAPI', 'WebSockets', 'Claude', 'Gemini', 'Groq', 'Deepgram'],
    links: [{ label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/vettly' }],
  },
  {
    name: 'EVES',
    kind: 'Meeting-intelligence desktop app',
    pitch: 'Records long engineering calls and turns them into build-ready prompts for your coding agent.',
    accent: 'cyan',
    visual: 'wave',
    file: 'eves/core.ts',
    metrics: [
      { v: '2h+', l: 'meetings' },
      { v: '≤5s', l: 'loss on crash' },
      { v: '100%', l: 'local data' },
    ],
    lines: [
      '# record → transcribe → brief → ask → prompt',
      '→ Captures system audio + mic into one Opus file, flushed every 5s',
      '→ Deepgram nova-3 live, diarized, Hindi ↔ English mid-sentence',
      '→ Groq, Gemini or OpenAI digests 2h+ meetings part by part',
      '→ Brief: main goal, decisions, ruled-out options, owners',
      '→ Grounded chat over transcript + repo index + skill vault',
      '→ One-tap prompts for Codex, Claude Code and Cursor',
      '→ Keys, audio and transcripts never leave the machine',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Deepgram', 'Zustand', 'Web Audio'],
    links: [],
  },
  {
    name: 'Simplify Money',
    kind: 'Conversational finance backend',
    pitch: 'Chat with an AI gold advisor that understands buy intent and prices gold live.',
    accent: 'rose',
    visual: 'gold',
    file: 'app/services/chat_service.py',
    metrics: [
      { v: 'Live', l: 'gold + FX pricing' },
      { v: 'CI/CD', l: 'to Render' },
    ],
    lines: [
      '# user → FastAPI → LangChain memory → Gemini → intent → execute',
      '→ Multi-turn advisor with LangChain session memory',
      '→ Gemini flags purchase intent; API returns wants_to_buy',
      '→ Price engine: USD spot × live FX → INR + import duty and GST',
      '→ Retry handlers and graceful fallback when the LLM is rate-limited',
      '→ Dockerised, auto-deployed to Render with GitHub Actions',
    ],
    stack: ['Python', 'FastAPI', 'LangChain', 'Gemini', 'SQLite', 'Docker'],
    links: [
      { label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/simplify-money-backend' },
      { label: 'Live API', href: 'https://simplify-money-backend.onrender.com/docs' },
    ],
  },
]

export const moreBuilds: { name: string; kind: string; text: string; stack: string[]; accent: Accent; links: Link[] }[] = [
  {
    name: 'Inkly',
    kind: 'Mobile app · print on demand',
    text: 'Upload documents from your phone, pick print options with instant pricing, pay by UPI and track delivery. Store managers run orders from a web panel.',
    stack: ['React Native', 'Expo', 'Express', 'MongoDB', 'Razorpay'],
    accent: 'violet',
    links: [],
  },
  {
    name: 'Analytics Engine',
    kind: 'Backend · 1.3M records',
    text: 'Ingests 1.3 million e-commerce records into PostgreSQL and serves every analytics endpoint in under 2 seconds, load-tested with Locust.',
    stack: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Docker Compose'],
    accent: 'emerald',
    links: [{ label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/webvory-scalable-analytics-engine' }],
  },
  {
    name: 'AutoFlow',
    kind: 'GenAI automation',
    text: 'Writes the weekly executive report on its own: Pandas KPIs from Postgres, company goals from ChromaDB, and an LLM that turns both into a summary.',
    stack: ['Python', 'Pandas', 'ChromaDB', 'OpenAI'],
    accent: 'cyan',
    links: [{ label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/autoflow' }],
  },
  {
    name: 'Finance Dashboard API',
    kind: 'Backend · access control',
    text: 'JWT auth with Admin, Analyst and Viewer roles, soft deletes, filtered pagination and dashboard summary endpoints.',
    stack: ['Flask', 'SQLAlchemy', 'JWT'],
    accent: 'amber',
    links: [{ label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/finance-dashboard-backend' }],
  },
]

export const skills: { title: string; sub: string; accent: Accent; file: string; lines: string[] }[] = [
  {
    title: 'AI & LLM systems',
    sub: 'Models, retrieval and agents',
    accent: 'emerald',
    file: 'ai.sys',
    lines: [
      '→ LLMs       OpenAI, Gemini, Claude, Groq',
      '→ RAG        LangChain, LangGraph, BM25, reranking',
      '→ Agents     tool-using agents, Botpress',
      '→ Vector DB  ChromaDB, Pinecone, pgvector',
      '→ Voice AI   Whisper, Deepgram, ElevenLabs, Retell',
    ],
  },
  {
    title: 'Backend & full-stack',
    sub: 'APIs and product surfaces',
    accent: 'cyan',
    file: 'stack.sys',
    lines: [
      '→ Python     asyncio, FastAPI',
      '→ Web        Next.js, React, TypeScript, JavaScript',
      '→ Realtime   REST APIs, WebSockets, streaming',
      '→ Mobile     React Native, Capacitor',
    ],
  },
  {
    title: 'DevOps & databases',
    sub: 'Shipping and keeping it up',
    accent: 'amber',
    file: 'ops.sys',
    lines: [
      '→ Infra      Docker, Docker Compose',
      '→ CI/CD      GitHub Actions',
      '→ Data       PostgreSQL, Redis, SQLite, Supabase',
      '→ Tooling    Git, Linux',
    ],
  },
  {
    title: 'ML & optimization',
    sub: 'Training to fast inference',
    accent: 'rose',
    file: 'ml.sys',
    lines: [
      '→ Training   PyTorch',
      '→ Inference  ONNX, TensorRT (INT8 / FP16)',
      '→ NLP        SpaCy NER, Sentence Transformers',
    ],
  },
]

export const marquee = [
  'Python', 'FastAPI', 'LangChain', 'LangGraph', 'RAG', 'Pinecone', 'pgvector', 'PyTorch', 'TensorRT',
  'Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Supabase', 'Docker', 'GitHub Actions', 'Deepgram',
]

export const education = {
  degree: 'B.E. Computer Science Engineering',
  spec: 'AI / ML specialization',
  school: 'Chandigarh University',
  period: '2022 – 2026',
  coursework: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Machine Learning', 'NLP'],
}
