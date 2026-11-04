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

export type Visual = 'radar' | 'router' | 'wave' | 'gold' | 'sheet'

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
    pitch: 'Collects jobs from 30+ sources every 6 hours, scores each one against my resume and opens the form already filled.',
    accent: 'emerald',
    visual: 'radar',
    file: 'radar/pipeline.ts',
    metrics: [
      { v: '30+', l: 'job sources' },
      { v: '0–100', l: 'match per job' },
      { v: '230+', l: 'tests' },
    ],
    lines: [
      '# every 6 hours: discover → collect → verify → match → tailor → track',
      '→ 30+ sources: 14 company ATS feeds + 16 job boards',
      '  Greenhouse, Lever, Ashby, Workday, Eightfold…',
      '→ LinkedIn, Indeed and WTTJ job-alert emails, read from Gmail',
      '→ Finds funded startups on its own',
      '  follows robots.txt, one request every 1.5s, backs off on 429',
      '→ Scores every job 0–100 against my resume',
      '  1024-d embeddings in Pinecone · 60% meaning + 40% skills',
      '→ 80+ goes to the Vault once the apply link checks out',
      '→ 50–79 gets a resume rewrite, with 4 AI providers to fall back on',
      '→ Chrome extension opens the application form already filled',
      '→ Recruiter replies in Gmail move each application forward',
      '# 230+ tests',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Pinecone', 'Vercel Cron', 'Gmail API', 'Chrome Extension'],
    links: [
      { label: 'Live site', href: 'https://radar-neon-theta.vercel.app/' },
      { label: 'Case study', href: 'https://github.com/SHAILESH-RS-UPADHYAY/SHAILESH-RS-UPADHYAY/blob/main/work/radar.md' },
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
      '→ Failover router across 4 LLM providers',
      '  exponential backoff on 429 / 529, a 14K cap on the last hop',
      '→ 9 tracks: DSA, system design, project deep-dive, behavioural…',
      '→ Humanizer + 7-dimension scoring before any answer is shown',
      '→ Live practice copilot with Deepgram voice over WebSockets',
    ],
    stack: ['Python', 'FastAPI', 'WebSockets', 'Neon', 'Clerk', 'Deepgram'],
    links: [
      { label: 'Live app', href: 'https://vettly-sigma.vercel.app/' },
      { label: 'Case study', href: 'https://github.com/SHAILESH-RS-UPADHYAY/SHAILESH-RS-UPADHYAY/blob/main/work/vettly.md' },
    ],
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
      '→ One-tap prompts for three coding agents',
      '→ Keys, audio and transcripts never leave the machine',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'Deepgram', 'Zustand', 'Web Audio'],
    links: [
      { label: 'Case study', href: 'https://github.com/SHAILESH-RS-UPADHYAY/SHAILESH-RS-UPADHYAY/blob/main/work/eves.md' },
    ],
  },
  {
    name: 'Blueprint.sh',
    kind: 'Codebase architecture drawing',
    pitch: 'Drop a codebase in and get its real architecture drawn. Parsing, layout and rendering all happen in your browser.',
    accent: 'cyan',
    visual: 'sheet',
    file: 'blueprint/src/graph.ts',
    metrics: [
      { v: '3', l: 'languages read' },
      { v: '0', l: 'files uploaded' },
      { v: '4', l: 'export formats' },
    ],
    lines: [
      '# drop → parse → resolve → graph → layout → draw',
      '→ Reads imports properly: import(), require, import type, Vue and Svelte blocks',
      '→ Resolves them like the toolchain: tsconfig paths, index files, @/ aliases',
      '→ Finds cycles with Tarjan, iterative so a 5,000-file chain cannot overflow',
      '→ ELK layered layout in a worker, then a hand-written SVG renderer',
      '→ Falls back to folders when a file-level sheet would be unreadable',
      '→ Exports SVG, 2× PNG, Mermaid and JSON',
    ],
    stack: ['TypeScript', 'ELK', 'Web Workers', 'SVG', 'Vite'],
    links: [
      { label: 'Live', href: 'https://blueprint-sh.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/SHAILESH-RS-UPADHYAY/blueprint-sh' },
    ],
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

export type Status = 'Live' | 'Desktop' | 'Mobile' | 'Runs locally' | 'Backend'

// Every product in one place. `shot` is a real screen in public/products; `deep` points at its deep dive below.
export const products: {
  slug: string
  name: string
  kind: string
  status: Status
  text: string
  accent: Accent
  mark: string
  shot?: string
  host?: string
  deep?: string
  lines?: string[]
  stack: string[]
  links: Link[]
}[] = [
  {
    slug: 'radar', name: 'RADAR', kind: 'AI job-intelligence engine', status: 'Live', accent: 'emerald', mark: 'radar', shot: 'radar', host: 'radar-neon-theta.vercel.app', deep: 'radar',
    text: 'Reads 30+ job feeds around the clock, checks each posting is real, scores it against your resume and opens the application already filled.',
    stack: ['Next.js', 'Supabase', 'Pinecone'],
    links: [{ label: 'Live', href: 'https://radar-neon-theta.vercel.app/' }],
  },
  {
    slug: 'vettly', name: 'Vettly', kind: 'AI interview-prep studio', status: 'Live', accent: 'violet', mark: 'router', shot: 'vettly', host: 'vettly-sigma.vercel.app', deep: 'vettly',
    text: 'Turns your resume, GitHub and target job into interview prep grounded in your real work, then checks every answer for sounding human.',
    stack: ['FastAPI', 'Python', 'Neon'],
    links: [{ label: 'Live', href: 'https://vettly-sigma.vercel.app/' }],
  },
  {
    slug: 'eves', name: 'EVES', kind: 'Meeting-intelligence desktop app', status: 'Desktop', accent: 'cyan', mark: 'wave', deep: 'eves',
    text: 'Records long engineering calls, transcribes them live in Hindi and English, and writes the prompt your coding agent needs. All of it stays on your machine.',
    stack: ['React', 'TypeScript', 'Deepgram'],
    links: [{ label: 'Case study', href: 'https://github.com/SHAILESH-RS-UPADHYAY/SHAILESH-RS-UPADHYAY/blob/main/work/eves.md' }],
  },
  {
    slug: 'blueprint', name: 'Blueprint.sh', kind: 'Codebase architecture drawing', status: 'Live', accent: 'cyan', mark: 'blueprint.svg', shot: 'blueprint', host: 'blueprint-sh.vercel.app', deep: 'blueprint',
    text: 'Drop a codebase in and get its real architecture drawn, cycles marked in red. Nothing leaves your browser.',
    stack: ['TypeScript', 'ELK', 'SVG'],
    links: [{ label: 'Live', href: 'https://blueprint-sh.vercel.app/' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/blueprint-sh' }],
  },
  {
    slug: 'autopsy', name: 'Autopsy', kind: 'Website forensics', status: 'Live', accent: 'rose', mark: 'autopsy.svg', shot: 'autopsy', host: 'autopsy-casefile.vercel.app',
    text: 'Paste a URL, get an evidence-backed teardown of how the site is built and the steps to build your own. Every finding cites its exhibit.',
    lines: [
      '# dns → document → certificate → scripts → signatures → verdict',
      '→ 170 hand-written rules, evidence adds up to Confirmed, Probable or Trace',
      '→ Explains the rendering: SSR, SSG, ISR, CSR or hybrid, with its reasoning',
      '→ A rebuild plan with real commands, each step citing its exhibit',
      '→ SSRF guard: connections pinned to the checked address, redirects re-checked',
      '→ Stages stream to the browser live over Server-Sent Events',
    ],
    stack: ['TypeScript', 'Node.js', 'SSE'],
    links: [{ label: 'Live', href: 'https://autopsy-casefile.vercel.app/' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/autopsy' }],
  },
  {
    slug: 'tether', name: 'Tether', kind: 'Chrome extension', status: 'Live', accent: 'amber', mark: 'tether.svg', shot: 'tether', host: 'tether-capsule.vercel.app',
    text: 'Carries a conversation from one AI assistant to another as one Markdown capsule, so you never re-explain anything.',
    lines: [
      '# pack → board → land',
      '→ Packs the open chat to a budget: about 2k tokens, 6k, or every turn',
      '→ Capsule: goal, rules you set, latest code, the thread, where you left off',
      '→ Deterministic: the same chat always gives the same capsule',
      '→ Types it into the next assistant, and never presses send',
      '→ No network requests, analytics or remote code',
    ],
    stack: ['Manifest V3', 'JavaScript', 'Service worker'],
    links: [{ label: 'Live', href: 'https://tether-capsule.vercel.app/' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/tether' }],
  },
  {
    slug: 'devine', name: 'Devine CDC', kind: 'Client website', status: 'Live', accent: 'rose', mark: 'devine-cdc.webp', shot: 'devine', host: 'devinecdc.in',
    text: 'The public site for a child development centre in Gurugram: programmes, therapies and consultation booking, tuned for Core Web Vitals.',
    stack: ['Next.js', 'React', 'TypeScript'],
    links: [{ label: 'Live', href: 'https://devinecdc.in' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/devine-cdc' }],
  },
  {
    slug: 'portal', name: 'Devine Portal', kind: 'Clinic dashboard, web and Android', status: 'Live', accent: 'violet', mark: 'devine-cdc.webp', shot: 'portal', host: 'app.devinecdc.in',
    text: "Families follow their child's therapy, therapists write daily session reports, and the clinic team runs children, schedules and logins.",
    lines: [
      '# one codebase, on the web and on Android',
      '→ Families: next session, reports, goal journey, home practice',
      '→ Therapists: template-driven session reports with autosaved drafts',
      '→ Admins: import children from Excel, weekly calendar with clash checks',
      '→ Chiku, a clinic helper with voice in and out',
      '→ Supabase row-level security on every table',
    ],
    stack: ['React', 'Supabase', 'Capacitor'],
    links: [{ label: 'Live', href: 'https://app.devinecdc.in/login' }],
  },
  {
    slug: 'foodcart', name: 'Food Cart', kind: 'Campus pre-order app', status: 'Live', accent: 'amber', mark: 'food-cart.webp', shot: 'foodcart', host: 'food-cart-roan.vercel.app',
    text: 'Order from your phone, get told when it is ready, walk up and collect. Built for the lunch rush at Chandigarh University.',
    lines: [
      '# one Expo app, three roles',
      '→ Students: browse stalls, order, track live, collect with a pickup code',
      '→ Stall staff: live order board, sold-out toggles, order caps',
      '→ Admin: every stall at a glance, open or close any of them',
      '→ Live campus rush and ETA per stall',
    ],
    stack: ['Expo', 'React Native', 'Supabase'],
    links: [{ label: 'Live', href: 'https://food-cart-roan.vercel.app/' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/food-cart' }],
  },
  {
    slug: 'barfani', name: 'Barfani Basket', kind: 'E-commerce app and back office', status: 'Live', accent: 'emerald', mark: 'barfani.webp', shot: 'barfani', host: 'barfanibasket.in',
    text: 'A premium dry-fruits store: a customer app, and a back office one owner can run alone, from stock to GST-ready invoices.',
    lines: [
      '# customer app + admin panel + API',
      '→ OTP sign-in, find a product in under 3 taps, Razorpay or cash on delivery',
      '→ Owner: products, restocks, refunds, low-stock warnings, invoices',
      '→ Packers get an order queue with no access to settings or refunds',
      '→ Unpaid online orders cancel after 30 minutes and release their stock',
    ],
    stack: ['Expo', 'FastAPI', 'PostgreSQL', 'React'],
    links: [{ label: 'Live', href: 'https://barfanibasket.in' }],
  },
  {
    slug: 'shiori', name: 'Shiori', kind: 'Personal life OS', status: 'Live', accent: 'rose', mark: 'shiori.webp', shot: 'shiori', host: 'shiori-nu.vercel.app',
    text: 'Type anything and it is kept: money by day and month, debts, people, music and things you learned. Private and local-first.',
    stack: ['React', 'Dexie', 'Supabase', 'Capacitor'],
    links: [{ label: 'Live', href: 'https://shiori-nu.vercel.app/' }],
  },
  {
    slug: 'simplify', name: 'Simplify Money', kind: 'Conversational finance backend', status: 'Live', accent: 'amber', mark: 'gold', shot: 'simplify', host: 'simplify-money-backend.onrender.com', deep: 'simplify',
    text: 'Chat with an AI gold advisor that understands buy intent and prices gold live. The first load wakes the free server, so give it a moment.',
    stack: ['FastAPI', 'LangChain', 'SQLite'],
    links: [{ label: 'Live API', href: 'https://simplify-money-backend.onrender.com/docs' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/simplify-money-backend' }],
  },
  {
    slug: 'echosoul', name: 'EchoSoul', kind: 'Voice conversion studio', status: 'Runs locally', accent: 'rose', mark: 'echosoul.svg', shot: 'echosoul',
    text: 'Upload a song, choose a voice shared with permission, and hear it sung again: same music, new singer. Every output is labelled as AI-made.',
    stack: ['React', 'FastAPI', 'Seed-VC'],
    links: [],
  },
  {
    slug: 'panna', name: 'Panna', kind: 'Local RAG chatbot', status: 'Runs locally', accent: 'cyan', mark: 'panna.svg', shot: 'panna',
    text: 'Add a PDF, ask a question, and read the answer with its source text beside it. If the document does not say it, Panna refuses instead of inventing.',
    lines: [
      '# two guards stop made-up answers',
      '→ Score gate: if no passage is close enough, the model is never called',
      '→ Prompt rule: use only the retrieved passages, or give a fixed refusal',
      '→ FAISS index, llama3.2 through Ollama, works offline after setup',
    ],
    stack: ['Python', 'FAISS', 'Ollama', 'Gradio'],
    links: [{ label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/panna-rag' }],
  },
  {
    slug: 'inkly', name: 'Inkly', kind: 'Print-on-demand mobile app', status: 'Mobile', accent: 'violet', mark: 'inkly.webp', shot: 'inkly',
    text: 'Upload documents from your phone, pick print options with instant pricing, pay by UPI and track delivery. Store managers run orders from a web panel.',
    stack: ['React Native', 'Expo', 'Express', 'MongoDB', 'Razorpay'],
    links: [],
  },
  {
    slug: 'luq', name: 'LÜQ', kind: 'Emotion-aware character', status: 'Live', accent: 'violet', mark: 'luq.svg',
    text: 'A character that responds not with words, but with presence. It reads one of 7 emotions from your text and changes its whole world to match.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    links: [{ label: 'Live', href: 'https://shailesh-rs-upadhyay.github.io/luq-prototype/' }, { label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/luq-prototype' }],
  },
  {
    slug: 'analytics', name: 'Analytics Engine', kind: 'Backend · 1.3M records', status: 'Backend', accent: 'emerald', mark: 'analytics.svg',
    text: 'Ingests 1.3 million e-commerce records into PostgreSQL and serves every analytics endpoint in under 2 seconds, load-tested with Locust.',
    stack: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Docker Compose'],
    links: [{ label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/webvory-scalable-analytics-engine' }],
  },
  {
    slug: 'autoflow', name: 'AutoFlow', kind: 'GenAI automation', status: 'Backend', accent: 'cyan', mark: 'autoflow.svg',
    text: 'Writes the weekly executive report on its own: Pandas KPIs from Postgres, company goals from ChromaDB, and an LLM that turns both into a summary.',
    stack: ['Python', 'Pandas', 'ChromaDB'],
    links: [{ label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/autoflow' }],
  },
  {
    slug: 'finance', name: 'Finance API', kind: 'Backend · access control', status: 'Backend', accent: 'amber', mark: 'finance.svg',
    text: 'JWT auth with Admin, Analyst and Viewer roles, soft deletes, filtered pagination and dashboard summary endpoints.',
    stack: ['Flask', 'SQLAlchemy', 'JWT'],
    links: [{ label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/finance-dashboard-backend' }],
  },
  {
    slug: 'iota', name: 'Iota', kind: 'NLP · address parsing', status: 'Backend', accent: 'rose', mark: 'iota.svg',
    text: 'A SpaCy NER pipeline that pulls street, city, state and ZIP out of raw address strings, at 87.1% F1 on held-out data.',
    stack: ['Python', 'SpaCy', 'NER'],
    links: [{ label: 'Code', href: 'https://github.com/SHAILESH-RS-UPADHYAY/iota-address-parser' }],
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
