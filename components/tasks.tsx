'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Plus, Check, Trash2, X } from 'lucide-react'

const PR: Record<string, string> = { high: 'var(--red)', med: 'var(--amber)', low: 'var(--sub)' }
const PR_LABEL: Record<string, string> = { high: 'vysoká', med: 'stredná', low: 'nízka' }

export function TasksWidget() {
  const { data, addTask, toggleTask, removeTask } = useStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [due, setDue] = useState('')

  const tasks = [...(data.tasks || [])].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const order = { high: 0, med: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
  const open_count = tasks.filter(t => !t.done).length

  const submit = async () => {
    if (!text.trim()) return
    await addTask({ text: text.trim(), priority, due })
    setText(''); setDue(''); setPriority('med'); setOpen(false)
  }

  const overdue = (d: string) => d && new Date(d) < new Date(new Date().toDateString())

  return (
    <div className="bg-[var(--card)] border rounded-[var(--r)] overflow-hidden h-full">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[15px] tracking-tight">Tasks</h2>
          {open_count > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--acc-bg)] text-[var(--acc-text)] font-semibold tabular-nums">{open_count}</span>}
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-[var(--mut)] hover:text-[var(--ink)] flex items-center gap-1 text-[13px] transition-colors">
          {open ? <X className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> Pridať</>}
        </button>
      </div>

      {open && (
        <div className="p-4 border-b bg-[var(--card-2)] pop">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="napr. zavolať Bistru Zelená, poslať faktúru…"
            className="w-full h-10 px-3.5 rounded-[11px] bg-white border text-sm focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[rgba(11,11,12,.06)] mb-2.5 transition-colors" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['low', 'med', 'high'] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`text-[12px] px-2.5 py-1.5 rounded-full border transition-colors ${priority === p ? 'text-white' : 'bg-white text-[var(--mut)] hover:border-[var(--line-2)]'}`}
                  style={priority === p ? { background: PR[p], borderColor: PR[p] } : {}}>{PR_LABEL[p]}</button>
              ))}
            </div>
            <input type="date" value={due} onChange={e => setDue(e.target.value)}
              className="h-8 px-2.5 rounded-[10px] bg-white border text-[12px] text-[var(--mut)] focus:outline-none mono" />
            <button onClick={submit} className="ml-auto h-8 px-4 rounded-full bg-[var(--ink)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity">Pridať</button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="p-8 text-center text-[var(--mut)] text-sm">Žiadne tasky. Pridaj prvý.</div>
      ) : (
        <div>
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b last:border-0 hover:bg-[var(--card-2)] group transition-colors">
              <button onClick={() => toggleTask(t.id, !t.done)}
                className={`w-5 h-5 rounded-[7px] border-2 grid place-items-center shrink-0 transition-colors ${t.done ? 'bg-[var(--acc-text)] border-[var(--acc-text)]' : 'border-[var(--line-2)] hover:border-[var(--ink)]'}`}>
                {t.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] truncate ${t.done ? 'line-through text-[var(--sub)]' : ''}`}>{t.text}</p>
                {t.due && <p className={`text-[11px] mt-0.5 ${overdue(t.due) && !t.done ? 'text-[var(--red)]' : 'text-[var(--sub)]'}`}>
                  {overdue(t.due) && !t.done ? 'po termíne · ' : ''}{new Date(t.due).toLocaleDateString('sk-SK')}
                </p>}
              </div>
              {!t.done && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PR[t.priority] }} title={PR_LABEL[t.priority]} />}
              <button onClick={() => removeTask(t.id)} className="text-[var(--sub)] hover:text-[var(--red)] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
