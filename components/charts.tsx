'use client'

type Pt = { label: string; value: number }

export function LineChart({ data, color = '#F59E0B', height = 240 }: { data: Pt[]; color?: string; height?: number }) {
  const w = 720, h = height, padL = 56, padR = 16, padT = 16, padB = 34
  const max = Math.max(...data.map(d => d.value), 1)
  const min = 0
  const niceMax = Math.ceil(max / 100) * 100 || 100
  const x = (i: number) => padL + (i * (w - padL - padR)) / Math.max(data.length - 1, 1)
  const y = (v: number) => padT + (h - padT - padB) * (1 - (v - min) / (niceMax - min))
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
  const gridVals = Array.from({ length: 5 }, (_, i) => Math.round((niceMax / 4) * i))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {gridVals.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y(g)} y2={y(g)} stroke="#F0EEEA" strokeWidth="1" />
          <text x={padL - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#A1A1AA">€{g}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r="3.5" fill={color} />)}
      {data.map((d, i) => <text key={i} x={x(i)} y={h - 12} textAnchor="middle" fontSize="11" fill="#A1A1AA">{d.label}</text>)}
    </svg>
  )
}

export function Sparkline({ data, color = '#16A34A' }: { data: Pt[]; color?: string }) {
  const w = 300, h = 56
  const max = Math.max(...data.map(d => d.value), 1)
  const x = (i: number) => (i * w) / Math.max(data.length - 1, 1)
  const y = (v: number) => h - 6 - (h - 12) * (v / max)
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
  const area = `${line} L ${w} ${h} L 0 ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 56 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
