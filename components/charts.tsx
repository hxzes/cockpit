'use client'

type Pt = { label: string; value: number }

export function LineChart({ data, color = '#0B0B0C', fill = '#9BE870', height = 220 }: { data: Pt[]; color?: string; fill?: string; height?: number }) {
  const w = 720, h = height, padL = 52, padR = 16, padT = 18, padB = 30
  const max = Math.max(...data.map(d => d.value), 1)
  const niceMax = Math.ceil(max / 100) * 100 || 100
  const x = (i: number) => padL + (i * (w - padL - padR)) / Math.max(data.length - 1, 1)
  const y = (v: number) => padT + (h - padT - padB) * (1 - v / niceMax)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
  const area = `${line} L ${x(data.length - 1)} ${h - padB} L ${x(0)} ${h - padB} Z`
  const grid = Array.from({ length: 4 }, (_, i) => Math.round((niceMax / 4) * (i + 1)))
  const gid = 'lc-' + fill.replace('#', '')
  const last = data.length - 1

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={fill === '#9BE870' ? 0.22 : 1} />
          <stop offset="100%" stopColor={fill} stopOpacity={fill === '#9BE870' ? 0 : 1} />
        </linearGradient>
      </defs>
      {grid.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(g)} y2={y(g)} stroke="#F0EFEB" strokeWidth="1" />
          <text x={padL - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#A3A3A8" className="mono">{g}</text>
        </g>
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} className="draw" style={{ ['--len' as string]: 1300 }} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(data[last]?.value || 0)} r="4" fill={color} />
      {fill === '#9BE870' && <circle cx={x(last)} cy={y(data[last]?.value || 0)} r="8" fill="#9BE870" fillOpacity="0.3" />}
      {data.map((d, i) => <text key={i} x={x(i)} y={h - 10} textAnchor="middle" fontSize="11" fill="#A3A3A8" className="mono">{d.label}</text>)}
    </svg>
  )
}

export function Sparkline({ data, color = '#0B0B0C' }: { data: Pt[]; color?: string }) {
  const w = 300, h = 50
  const max = Math.max(...data.map(d => d.value), 1)
  const x = (i: number) => (i * w) / Math.max(data.length - 1, 1)
  const y = (v: number) => h - 6 - (h - 12) * (v / max)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
  const area = `${line} L ${w} ${h} L 0 ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 50 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9BE870" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#9BE870" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path d={line} className="draw" style={{ ['--len' as string]: 700 }} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
