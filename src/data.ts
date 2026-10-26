// All portfolio content lives here. Edit this file to update the site.

export type Accent = 'emerald' | 'cyan' | 'violet' | 'rose' | 'amber'

type Link = { label: string; href: string }

export const profile = {
  first: 'SHAILESH',
  last: 'UPADHYAY',
  role: 'AI Backend Engineer',
  focus: ['Python', 'LLMs', 'RAG Systems', 'AI Agents'],
  tagline: "I don't just prototype models; I ship them into production.",
  summary:
    "AI Backend Engineer building conversational AI pipelines, LLM agents, high-concurrency backend services and web apps that don't break at 3 AM. From async FastAPI streaming and query optimization to sub-15ms inference engines, I find the bottleneck that actually slows a system down and fix it. Right now I'm shipping AgentHub with a US engineering team and I own its deployments, at 99.9% uptime. Before that, in contract roles, I shipped production Next.js platforms and dashboard apps.",
  current: 'WebVory',
  location: 'India',
  email: 'shaileshrsupadhyay@gmail.com',
  phone: '+91 97922 63924',
  phoneHref: 'tel:+919792263924',
  whatsapp: 'https://wa.me/919792263924',
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
  { prefix: '', to: 99.9, dec: 1, suffix: '%', label: 'uptime on the deploys I own' },
  { prefix: '', to: 87.1, dec: 1, suffix: '%', label: 'F1 on address-extraction NER' },
]

export const whoami = [
  '$ whoami',
  'shailesh upadhyay · ai backend engineer',
  '$ cat now.txt',
  'shipping AgentHub, an AI-agent workspace @ WebVory (US team)',
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
    note: 'US-based · AI agent platform and backend services',
    period: 'Jun 2026 – Present',
    accent: 'emerald',
    file: 'webvory.log',
    lines: [
      '→ Built AgentHub, where an operations team runs AI agents',
      '  React 19 + TypeScript + FastAPI + SQLite',
      '  scheduled workflows, an approval step before an agent acts',
      '  access by role and department, 48-hour undo on deletes',
      '→ Wrote its RAG assistant (pgvector, OpenAI embeddings)',
      '  answers only from documents the asking user may see',
      '→ Slack app that onboards staff and posts live run progress',
      '→ Async FastAPI streaming for LLM calls, with the US team',
      '  token rate limits + connection pooling · p95 1.2s → 660ms',
      '→ I own deployments: Docker images, production Compose,',
      '  the GitHub Actions pipeline every release goes through · 99.9% uptime',
      '# 251 backend tests',
    ],
    stack: ['FastAPI', 'asyncio', 'React', 'TypeScript', 'SQLite', 'pgvector', 'Slack API', 'Docker', 'GitHub Actions'],
    links: [],
  },
  {
    role: 'Full-Stack AI Developer (Contract)',
    org: 'Contract',
    note: 'Web platforms, dashboard apps and AI prototypes',
    period: 'Jan 2026 – May 2026',
    accent: 'cyan',
    file: 'contract.log',
    lines: [
      '→ Devine Child Development Centre: the public site',
      '  Next.js + React + TypeScript · tuned for Core Web Vitals · devinecdc.in',
      '→ Devine CDC dashboard app for parents, therapists and admins',
      '  Supabase row-level security · on the web and on Android (Capacitor)',
      '→ LÜQ: a prototype for an international company',
      '  reads one of 7 emotions from text and changes its visuals to match',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Capacitor', 'Tailwind'],
    links: [
      { label: 'devinecdc.in', href: 'https://devinecdc.in' },
      { label: 'Dashboard app', href: 'https://app.devinecdc.in/login' },
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
      '→ Trained 4 models: aim LSTM, movement Transformer, tactical MLP, style model',
      '  on 30Hz player telemetry, to copy how players move and fight',
      '→ Labelled 500+ hours of gameplay with an inverse-dynamics model',
      '→ Exported to ONNX and TensorRT (INT8 / FP16)',
      '  inference runs in under 15ms',
    ],
    stack: ['PyTorch', 'LSTM', 'Transformers', 'ONNX', 'TensorRT'],
    links: [],
  },
  {
    role: 'NLP Engineer (Collaboration)',
    org: 'IOTA',
    note: 'Address-extraction NER pipeline and model delivery',
    period: 'Feb 2024 – Apr 2024',
    accent: 'rose',
    file: 'iota.log',
    lines: [
      '→ SpaCy NER pipeline: generate → train → evaluate → infer',
      '  pulls street, city, state and ZIP out of raw address strings',
      '→ Weak-supervision script: 100+ real addresses → 2,500 labelled samples',
      '→ SGD, 50 epochs, 25% dropout',
      '  P 89.2%  R 85.1%  F1 87.1% on held-out test data',
    ],
    stack: ['Python', 'SpaCy', 'NER', 'Weak supervision'],
    links: [],
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
    pitch: 'Collects jobs from 25+ sources every 6 hours, scores each one against my resume and opens the form already filled.',
    accent: 'emerald',
    visual: 'radar',
    file: 'radar/pipeline.ts',
    metrics: [
      { v: '25+', l: 'job sources' },
      { v: '0–100', l: 'match per job' },
      { v: '210', l: 'tests' },
    ],
    lines: [
      '# every 6 hours: discover → collect → verify → match → tailor → track',
      '→ 25+ sources: 12 company ATS feeds + public job boards + JSearch',
      '  Greenhouse, Lever, Ashby, Workday, Eightfold…',
      '→ LinkedIn, Indeed and WTTJ job-alert emails, read from Gmail',
      '→ Finds funded startups on its own',
      '  follows robots.txt, one request every 1.5s, backs off on 429',
      '→ Scores every job 0–100 against my resume',
      '  e5-large embeddings in Pinecone · 60% meaning + 40% skills',
      '→ 80+ goes to the Vault once the apply link checks out',
      '→ 50–79 gets a resume rewrite (Claude, Gemini or Groq)',
      '→ Chrome extension opens the application form already filled',
      '→ Recruiter replies in Gmail move each application forward',
      '# 210 tests',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Pinecone', 'Vercel Cron', 'Gmail API', 'Chrome Extension', 'Anthropic', 'Gemini', 'Groq'],
    links: [
      { label: 'Live site', href: 'https://radar-neon-theta.vercel.app/' },
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
      '→ Failover router: Groq → Gemini → Claude → OpenAI',
      '  exponential backoff on 429 / 529, auto context-slicing',
      '→ 9 tracks: DSA, system design, project deep-dive, behavioural…',
      '→ Humanizer + 7-dimension scoring before any answer is shown',
      '→ Live practice copilot with Deepgram voice over WebSockets',
    ],
    stack: ['Python', 'FastAPI', 'WebSockets', 'Claude', 'Gemini', 'Groq', 'Deepgram'],
    links: [],
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
    links: [],
  },
  {
    name: 'AutoFlow',
    kind: 'GenAI automation',
    text: 'Writes the weekly executive report on its own: Pandas KPIs from Postgres, company goals from ChromaDB, and an LLM that turns both into a summary.',
    stack: ['Python', 'Pandas', 'ChromaDB', 'OpenAI'],
    accent: 'cyan',
    links: [],
  },
  {
    name: 'Finance Dashboard API',
    kind: 'Backend · access control',
    text: 'JWT auth with Admin, Analyst and Viewer roles, soft deletes, filtered pagination and dashboard summary endpoints.',
    stack: ['Flask', 'SQLAlchemy', 'JWT'],
    accent: 'amber',
    links: [],
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
      '→ RAG        LangChain, LangGraph, pgvector, BM25, reranking',
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
      '→ Integrate  Slack API, Gmail API, Chrome extensions',
      '→ Mobile     React Native, Capacitor',
    ],
  },
  {
    title: 'DevOps & databases',
    sub: 'Shipping and keeping it up',
    accent: 'amber',
    file: 'ops.sys',
    lines: [
      '→ Deploy     Docker, Docker Compose, Vercel Cron',
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
