import { runNet, type IntroNet } from './introNet'

let net: IntroNet | null = null

self.onmessage = ({ data }: MessageEvent) => {
  if (data.canvas) {
    net = runNet(data.canvas, data)
    if (!net) self.postMessage('no graphics')
  } else if (data.type === 'resize') net?.resize(data)
  else if (data.type === 'look') net?.look(data.x, data.y)
  else net?.[data.type as 'welcome' | 'open' | 'ripple']()
}
