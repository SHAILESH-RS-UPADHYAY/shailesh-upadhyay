/*
  The opening network: sixty neurons on a ring, each joined to the others by a fine thread. The threads bend around a dark
  centre the way light bends around a black hole, and sink toward it like a well, so the greeting sits in clean black
  inside a lace of light. When it's time, the centre opens and the page is there.

  It runs in a worker with all its motion in shaders, so nothing on the page's main thread, including the page itself
  mounting behind it, can make it stutter.
  Light is added up in linear colour on a floating-point buffer, so thousands of faint crossings build into a smooth sheen
  instead of being lost to rounding, then rolled off like film. Dither at the end removes banding from the glow.
*/

const COMMON = `
uniform vec2 uRes, uCam;
uniform float uScale, uZoom, uRp, uTwist, uSpin, uTime, uPivot, uWeight;

// r = 0 lands on the pupil's edge, r = 1 stays where it is; everything between flows around the centre.
vec3 warp(vec3 p) {
  float r = length(p.xy);
  float rr = sqrt(r * r * (1.0 - uRp * uRp) + uRp * uRp);
  vec2 q = p.xy * rr / max(r, 1e-4);
  float a = uSpin + uTwist * (1.0 - smoothstep(0.2, 2.4, rr));
  float c = cos(a), s = sin(a);
  return vec3(c * q.x - s * q.y, s * q.x + c * q.y, p.z);
}
// The camera turns around the bottom of the well, so the pupil holds still under the words and the ring moves around it.
vec3 cam(vec3 p) {
  float cx = cos(uCam.x), sx = sin(uCam.x), cy = cos(uCam.y), sy = sin(uCam.y);
  p.z -= uPivot;
  vec3 a = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
  vec3 b = vec3(cy * a.x + sy * a.z, a.y, -sy * a.x + cy * a.z);
  b.z += uPivot;
  return b;
}
vec2 project(vec3 p) {
  return p.xy * (3.4 / (3.4 - p.z)) * uScale * uZoom;
}
`

const LINE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aTan;
layout(location=2) in vec2 aMeta;   // side, along
layout(location=3) in vec4 aLine;   // start, duration, width, brightness
layout(location=4) in vec2 aSignal; // phase (< 0: none), speed
${COMMON}
out float vD, vHalf, vAlong, vProg, vR, vBright, vSigPhase, vSigSpeed;
out vec2 vTan;
void main() {
  vec3 a = warp(aPos);
  vec2 sa = project(cam(a));
  vec2 sb = project(cam(warp(aPos + aTan * 0.012)));
  vec2 t = normalize(sb - sa);
  float k = (uTime - aLine.x) / aLine.y;
  vProg = k <= 0.0 ? -1.0 : 1.0 - pow(1.0 - min(k, 1.0), 3.2);
  // Thin where a thread leaves a neuron, fuller mid-route: an inked line, not a uniform hairline.
  float half_ = aLine.z * uWeight * 0.5 * (0.32 + 0.68 * pow(sin(3.14159265 * aMeta.y), 0.7));
  float pad = half_ + 1.7;
  gl_Position = vec4((sa + vec2(-t.y, t.x) * aMeta.x * pad) / (uRes * 0.5), 0.0, 1.0);
  vD = aMeta.x * pad;
  vHalf = half_;
  vAlong = aMeta.y;
  vR = length(a.xy);
  vBright = aLine.w;
  vSigPhase = aSignal.x;
  vSigSpeed = aSignal.y;
  vTan = t;
}`

// One colour family, in linear light: pearl at the pupil's edge, through emerald, into deep teal.
const RAMP = `
vec3 ramp(float x) {
  vec3 pearl = vec3(1.0, 0.97, 0.89);
  vec3 mint = vec3(0.56, 0.96, 0.78);
  vec3 emerald = vec3(0.09, 0.66, 0.45);
  vec3 teal = vec3(0.02, 0.36, 0.33);
  vec3 deep = vec3(0.012, 0.2, 0.24);
  if (x < 0.04) return mix(pearl, mint, x / 0.04);
  if (x < 0.22) return mix(mint, emerald, (x - 0.04) / 0.18);
  if (x < 0.55) return mix(emerald, teal, (x - 0.22) / 0.33);
  return mix(teal, deep, min((x - 0.55) / 0.5, 1.0));
}`

const LINE_FS = `#version 300 es
precision highp float;
in float vD, vHalf, vAlong, vProg, vR, vBright, vSigPhase, vSigSpeed;
in vec2 vTan;
uniform vec2 uLight;
uniform float uTime, uRp, uPx;
uniform vec4 uRip;
out vec4 o;
${RAMP}
const vec3 GOLD = vec3(1.0, 0.62, 0.2);
void main() {
  if (vAlong > vProg + 0.025) discard;
  // Gaussian cross-section. A thread thinner than a pixel keeps its energy instead of flickering.
  float sigma = max(vHalf, 0.52 * uPx);
  float I = exp(-0.5 * vD * vD / (sigma * sigma)) * (vHalf / sigma);
  float grow = smoothstep(vProg + 0.014, vProg - 0.014, vAlong);
  // Silk: a thread catches the light when it runs along it.
  float sheen = pow(abs(dot(vTan, uLight)), 12.0);
  float x = max((vR - uRp) / max(1.0 - uRp, 0.05), 0.0);
  float wave = 0.0;
  for (int i = 0; i < 4; i++) if (uRip[i] > -0.5) wave += exp(-pow((x - uRip[i]) / 0.13, 2.0)) * exp(-uRip[i] * 1.2);
  vec3 col = ramp(x);
  vec3 c = col * vBright * I * grow * (0.42 + 2.4 * sheen + 1.5 * wave);
  // The leading edge of a growing thread runs a little hotter than the thread, and cools before it lands.
  float tip = exp(-pow((vAlong - vProg) / 0.016, 2.0)) * (1.0 - smoothstep(0.8, 1.0, vProg));
  c += mix(col, vec3(1.0, 0.95, 0.84), 0.55) * tip * I * 1.5;
  if (vSigPhase >= 0.0) {
    float at = fract(uTime * vSigSpeed + vSigPhase);
    float d = vAlong - at;
    float glow = exp(-pow(d / 0.009, 2.0)) * 3.4 + (d < 0.0 ? exp(d / 0.034) * 0.7 : 0.0);
    // A signal shows as it nears the centre, so it reads as thought moving, not a stray line at the rim.
    c += GOLD * I * glow * grow * smoothstep(0.95, 0.5, x);
  }
  o = vec4(c, 1.0);
}`

const NODE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
layout(location=1) in vec3 aCenter;
layout(location=2) in vec2 aSize;   // size px, brightness
layout(location=3) in vec3 aTimes;  // appears, fires, a thread lands
${COMMON}
out vec2 vC;
out float vI;
float flare(float at) { float s = uTime - at; return s > 0.0 ? exp(-s * 3.4) : 0.0; }
void main() {
  vec3 p = warp(aCenter);
  float k = smoothstep(aTimes.x, aTimes.x + 0.3, uTime);
  float f = flare(aTimes.y) + flare(aTimes.z);
  float size = aSize.x * (0.4 + 0.6 * k) * (1.0 + f * 1.2) + 1.6;
  gl_Position = vec4((project(cam(p)) + aCorner * size) / (uRes * 0.5), 0.0, 1.0);
  vC = aCorner * size / aSize.x;
  vI = k * aSize.y * (0.8 + f * 3.4);
}`

const NODE_FS = `#version 300 es
precision highp float;
in vec2 vC;
in float vI;
out vec4 o;
void main() {
  o = vec4(vec3(1.0, 0.98, 0.9) * exp(-dot(vC, vC) * 2.4) * vI, 1.0);
}`

const FULL_VS = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
out vec4 o;
void main() {
  vec3 c = texture(uTex, vUv).rgb * 0.2270;
  c += (texture(uTex, vUv + uDir * 1.3846).rgb + texture(uTex, vUv - uDir * 1.3846).rgb) * 0.3162;
  c += (texture(uTex, vUv + uDir * 3.2308).rgb + texture(uTex, vUv - uDir * 3.2308).rgb) * 0.0703;
  o = vec4(c, 1.0);
}`

const FINAL_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene, uBloomA, uBloomB;
uniform vec2 uRes;
uniform float uFade, uPupil, uOpen, uTime;
out vec4 o;
float hash(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main() {
  float r = length((vUv - 0.5) * uRes);
  // A tight corona inside the disc, so the words sit on clean black.
  vec3 bloom = texture(uBloomA, vUv).rgb * 0.5 + texture(uBloomB, vUv).rgb;
  vec3 c = texture(uScene, vUv).rgb + bloom * 0.32 * smoothstep(uPupil * 0.8, uPupil * 1.02, r);
  c = c * uFade + vec3(0.00018, 0.00042, 0.00036);
  c = 1.0 - exp(-c * 1.35);
  c = pow(c, vec3(1.0 / 2.2));
  c += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  // Opening: the pupil becomes a hole, and the page is behind it.
  float a = mix(1.0, smoothstep(uPupil * 0.965, uPupil * 0.995, r), uOpen);
  o = vec4(c * a, a);
}`

type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }
type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number }
type Thread = { from: [number, number]; to: [number, number]; well: number; start: number; width: number; bright: number; sigPhase: number; sigSpeed: number }
type Node = { pos: [number, number]; size: number; bright: number; at: number; fires: number; lands: number }

function program(gl: WebGL2RenderingContext, vs: string, fs: string): Program {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  const u: Program['u'] = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i)!.name
    u[name] = gl.getUniformLocation(p, name)
  }
  return { p, u }
}

const TAU = Math.PI * 2
const WELL = 0.62
const THREAD_S = 0.92
const rnd = (i: number, s: number) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v) }
const polar = (a: number): [number, number] => [Math.sin(a), Math.cos(a)]
const mix = (a: number, b: number, k: number) => a + (b - a) * k
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 4)
const easeIn = (x: number) => Math.pow(clamp01(x), 2.6)
const easeInOut = (x: number) => { const k = clamp01(x); return k * k * k * (k * (6 * k - 15) + 10) }
const RP_REST = 0.5
const RP_WELCOME = 0.86
// The sweep around the ring: unhurried at both ends, so the circle closes gently.
const sweepAt = (i: number, n: number) => { const x = i / n; return 0.06 + mix(x, x * x * (3 - 2 * x), 0.6) * 0.9 }

// Which threads exist. A family joins each neuron to the one `step` places on; the larger the step, the closer its threads
// pass to the centre. [fraction of the ring, brightness, width]. First is the fine hairline that closes the outer edge.
const FAMILIES: [number, number, number][] = [
  [0, 0.34, 0.7], [0.483, 0.5, 0.95], [0.45, 0.42, 0.9], [0.417, 0.36, 0.85], [0.383, 0.32, 0.85], [0.35, 0.27, 0.8],
  [0.317, 0.24, 0.8], [0.283, 0.2, 0.8], [0.25, 0.17, 0.8], [0.217, 0.14, 0.8], [0.183, 0.12, 0.8],
]

function compose(n: number) {
  const threads: Thread[] = []
  const nodes: Node[] = []
  const hourEvery = Math.max(1, Math.round(n / 12))
  FAMILIES.forEach(([frac, bright, width], li) => {
    const step = Math.max(1, Math.round(frac * n))
    const reach = Math.abs(Math.cos((Math.PI * step) / n))
    for (let a = 0; a < n; a++) {
      const signal = li === 1 && a % 6 === 0
      threads.push({
        from: polar((a / n) * TAU), to: polar(((a + step) / n) * TAU), well: -WELL * (1 - reach),
        start: sweepAt(a, n) + li * 0.012, width, bright: bright * (0.78 + 0.22 * rnd(a + li * 61, 3)),
        sigPhase: signal ? rnd(a, 9) : -1, sigSpeed: signal ? 0.3 : 0,
      })
    }
  })
  const longest = Math.round(FAMILIES[1][0] * n)
  for (let a = 0; a < n; a++) {
    const hour = a % hourEvery === 0
    nodes.push({
      pos: polar((a / n) * TAU), size: hour ? 2.7 : 1.5, bright: hour ? 1.5 : 0.8,
      at: sweepAt(a, n) - 0.04, fires: sweepAt(a, n), lands: sweepAt(((a - longest) % n + n) % n, n) + THREAD_S * 0.62,
    })
  }
  return { threads, nodes }
}

const SAMPLES = 54
const FLOATS = 14

function buildThreads(threads: Thread[]) {
  const verts = new Float32Array(threads.length * (SAMPLES + 1) * 2 * FLOATS)
  const index = new Uint32Array(threads.length * SAMPLES * 6)
  let v = 0
  let ix = 0
  let vertex = 0
  for (const t of threads) {
    const dx = t.to[0] - t.from[0]
    const dy = t.to[1] - t.from[1]
    for (let s = 0; s <= SAMPLES; s++) {
      const k = s / SAMPLES
      const z = Math.sin(Math.PI * k) * t.well
      const tz = Math.cos(Math.PI * k) * Math.PI * t.well
      const len = Math.hypot(dx, dy, tz) || 1
      for (const side of [-1, 1]) {
        verts[v++] = t.from[0] + dx * k; verts[v++] = t.from[1] + dy * k; verts[v++] = z
        verts[v++] = dx / len; verts[v++] = dy / len; verts[v++] = tz / len
        verts[v++] = side; verts[v++] = k
        verts[v++] = t.start; verts[v++] = THREAD_S; verts[v++] = t.width; verts[v++] = t.bright
        verts[v++] = t.sigPhase; verts[v++] = t.sigSpeed
      }
      if (s < SAMPLES) {
        index[ix++] = vertex; index[ix++] = vertex + 1; index[ix++] = vertex + 2
        index[ix++] = vertex + 2; index[ix++] = vertex + 1; index[ix++] = vertex + 3
      }
      vertex += 2
    }
  }
  return { verts, index }
}

export type Size = { w: number; h: number; dpr: number }
export type IntroNet = { welcome(): void; open(): void; ripple(): void; resize(s: Size): void; look(x: number, y: number): void }

export function runNet(canvas: OffscreenCanvas, first: Size): IntroNet | null {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
  if (!gl || !(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))) return null

  let size = first
  const small = Math.min(size.w, size.h) < 600
  const { threads, nodes } = compose(small ? 42 : 60)
  const { verts, index } = buildThreads(threads)

  const lines = program(gl, LINE_VS, LINE_FS)
  const dots = program(gl, NODE_VS, NODE_FS)
  const blur = program(gl, FULL_VS, BLUR_FS)
  const final = program(gl, FULL_VS, FINAL_FS)
  if (!gl.getProgramParameter(lines.p, gl.LINK_STATUS) || !gl.getProgramParameter(final.p, gl.LINK_STATUS)) return null

  const attribute = (loc: number, size: number, stride: number, offset: number, divisor = 0) => {
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset)
    gl.vertexAttribDivisor(loc, divisor)
  }
  const lineVao = gl.createVertexArray()
  gl.bindVertexArray(lineVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW)
  const stride = FLOATS * 4
  attribute(0, 3, stride, 0)
  attribute(1, 3, stride, 12)
  attribute(2, 2, stride, 24)
  attribute(3, 4, stride, 32)
  attribute(4, 2, stride, 48)

  const nodeVao = gl.createVertexArray()
  gl.bindVertexArray(nodeVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  attribute(0, 2, 0, 0)
  const nodeData = new Float32Array(nodes.length * 8)
  nodes.forEach((n, i) => nodeData.set([n.pos[0], n.pos[1], 0, n.size, n.bright, n.at, n.fires, n.lands], i * 8))
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, nodeData, gl.STATIC_DRAW)
  attribute(1, 3, 32, 0, 1)
  attribute(2, 2, 32, 12, 1)
  attribute(3, 3, 32, 20, 1)
  const emptyVao = gl.createVertexArray()

  const target = (w: number, h: number): Target => {
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    return { fb, tex, w, h }
  }

  let W = 0
  let H = 0
  let ss = 1
  let reduced = false
  let targets: Target[] = []
  const allocate = () => {
    W = size.w
    H = size.h
    const dpr = Math.min(size.dpr || 1, 2)
    // Drawn larger than the screen on ordinary displays, so fine threads stay smooth instead of crawling.
    ss = reduced ? 1 : Math.min(Math.max(dpr, small ? 1 : 1.5), 3200 / W)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    targets.forEach((t) => { gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex) })
    const sw = Math.round(W * ss)
    const sh = Math.round(H * ss)
    targets = [target(sw, sh), target(sw >> 2, sh >> 2), target(sw >> 2, sh >> 2), target(sw >> 3, sh >> 3), target(sw >> 3, sh >> 3)]
  }
  allocate()

  const started = performance.now()
  let welcomeAt = Infinity
  let openAt = Infinity
  const ripples: number[] = []
  let drawn = threads.length
  let lastT = 0
  let lookX = 0
  let lookY = 0
  let gazeX = 0
  let gazeY = 0

  const into = (dst: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fb : null)
    gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height)
  }
  const blurInto = (src: Target, dst: Target, dx: number, dy: number) => {
    into(dst)
    gl.bindTexture(gl.TEXTURE_2D, src.tex)
    gl.uniform2f(blur.u.uDir, dx / dst.w, dy / dst.h)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const draw = (t: number) => {
    const settle = easeOut(t / 2.1)
    const w = t > welcomeAt ? easeInOut((t - welcomeAt) / 1.05) : 0
    const x = t > openAt ? easeIn((t - openAt) / 0.62) : 0
    // Phones bleed the ring off the sides for scale; everything else keeps the whole circle clear of the corners' text.
    const scale = W > H ? H * 0.42 : W < 600 ? Math.max(W * 0.6, H * 0.285) : W * 0.46
    const pivot = -WELL * 0.95
    const depth = 3.4 / (3.4 - pivot)
    // "Hi, Welcome" needs more room than the greetings: the circle widens until the words fit inside it.
    const words = Math.min(W * 0.085, 80 * Math.max(1, W / 1920)) * 4
    const roomy = Math.max(1.04, words / (RP_WELCOME * scale * depth))
    const rp = mix(mix(mix(0.7, small ? 0.56 : RP_REST, settle) + Math.sin(t * 1.5) * 0.004, RP_WELCOME, w), 0.985, x)
    const twist = mix(mix(mix(1.25, 0.2, settle), 0.34, w), 1.1, x)
    const zoom = mix(mix(1.1, 1, settle), roomy, w) * mix(1, 3.4, x)
    const dt = Math.min(0.05, Math.max(0, t - lastT))
    lastT = t
    gazeX += (lookX - gazeX) * (1 - Math.exp(-dt * 4))
    gazeY += (lookY - gazeY) * (1 - Math.exp(-dt * 4))
    const camX = mix(0.42, 0.075, settle) + Math.sin(t * 0.55) * 0.018 + gazeY * 0.1
    const camY = mix(-0.34, 0.085, settle) + Math.cos(t * 0.43) * 0.022 + gazeX * 0.14
    const light = 0.9 + t * 0.62
    const rip = [-1, -1, -1, -1]
    ripples.slice(-4).forEach((at, i) => { const age = t - at; if (age > 0 && age < 2.2) rip[i] = age * 1.05 })

    const [scene, a0, a1, b0, b1] = targets
    into(scene)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    for (const p of [lines, dots]) {
      gl.useProgram(p.p)
      gl.uniform2f(p.u.uRes, W, H)
      gl.uniform2f(p.u.uCam, camX, camY)
      gl.uniform1f(p.u.uScale, scale)
      gl.uniform1f(p.u.uZoom, zoom)
      gl.uniform1f(p.u.uRp, rp)
      gl.uniform1f(p.u.uTwist, twist)
      gl.uniform1f(p.u.uSpin, t * 0.045)
      gl.uniform1f(p.u.uTime, t)
      gl.uniform1f(p.u.uPivot, pivot)
      gl.uniform1f(p.u.uWeight, Math.max(1, scale / 380))
      if (p === lines) {
        gl.uniform2f(p.u.uLight, Math.cos(light), Math.sin(light))
        gl.uniform1f(p.u.uPx, 1 / ss)
        gl.uniform4f(p.u.uRip, rip[0], rip[1], rip[2], rip[3])
        gl.bindVertexArray(lineVao)
        gl.drawElements(gl.TRIANGLES, drawn * SAMPLES * 6, gl.UNSIGNED_INT, 0)
      } else {
        gl.bindVertexArray(nodeVao)
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nodes.length)
      }
    }
    gl.disable(gl.BLEND)

    gl.bindVertexArray(emptyVao)
    gl.useProgram(blur.p)
    gl.activeTexture(gl.TEXTURE0)
    gl.uniform1i(blur.u.uTex, 0)
    blurInto(scene, a0, 1, 0)
    blurInto(a0, a1, 0, 1)
    blurInto(a1, b0, 1.4, 0)
    blurInto(b0, b1, 0, 1.4)

    into(null)
    gl.useProgram(final.p)
    ;[scene, a1, b1].forEach((tg, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tg.tex) })
    gl.uniform1i(final.u.uScene, 0)
    gl.uniform1i(final.u.uBloomA, 1)
    gl.uniform1i(final.u.uBloomB, 2)
    gl.uniform2f(final.u.uRes, W, H)
    gl.uniform1f(final.u.uFade, easeOut(t / 0.5) * mix(1, 0.8, w) * (1 - x * x * x))
    gl.uniform1f(final.u.uPupil, rp * scale * zoom * depth)
    gl.uniform1f(final.u.uOpen, clamp01((t - openAt) / 0.2))
    gl.uniform1f(final.u.uTime, t)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.activeTexture(gl.TEXTURE0)
  }

  // If the first frames show this machine can't keep up, draw at screen resolution with fewer threads. Once.
  let frames = 0
  let last = 0
  let spent = 0
  const loop = (now: number) => {
    requestAnimationFrame(loop)
    if (last && frames < 24) {
      spent += now - last
      if (++frames === 24 && spent / 24 > 24) {
        reduced = true
        drawn = Math.round(threads.length * 0.7)
        allocate()
      }
    }
    last = now
    draw((now - started) / 1000)
  }
  requestAnimationFrame(loop)

  const clock = () => (performance.now() - started) / 1000
  return {
    welcome() { welcomeAt = clock() },
    open() { openAt = clock() },
    ripple() { ripples.push(clock()) },
    resize(s) { size = s; allocate() },
    look(x, y) { lookX = x; lookY = y },
  }
}
