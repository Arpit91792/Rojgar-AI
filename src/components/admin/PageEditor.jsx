/**
 * PageEditor — Blank-page visual editor for RozgarGrid AI admin.
 *
 * Features:
 *  - Blank canvas with click-to-type
 *  - Left sidebar with element palette
 *  - Drag-and-drop reordering via @dnd-kit
 *  - Selection toolbar (floating) for text formatting
 *  - Per-element controls: move up/down, duplicate, delete
 *  - Element types: text, heading, paragraph, image, logo, table,
 *                   apply-button, notice, divider, spacer, columns, blank
 *  - Undo / Redo (20-step history)
 *  - Auto-save debounce (shows "Saving…" / "Saved ✓")
 *  - Live preview panel toggle
 *  - Exact same JSON rendered by PageRenderer on public page
 */

import React, {
      useState, useCallback, useRef, useEffect, useMemo
} from 'react'
import {
      DndContext, closestCenter, PointerSensor, useSensor, useSensors,
      DragOverlay
} from '@dnd-kit/core'
import {
      SortableContext, verticalListSortingStrategy,
      useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
      Type, Heading as HeadingIcon, Image, Table2, AlignLeft,
      Minus, Space, Columns, Square, Plus, Trash2, Copy,
      ChevronUp, ChevronDown, Bold, Italic, Underline,
      Strikethrough, AlignCenter, AlignRight, AlignJustify,
      Link2, Palette, RotateCcw, RotateCw, Eye, EyeOff,
      GripVertical, X, Check, ExternalLink, Info, AlertTriangle,
      Star, MapPin, Calendar, IndianRupee, Users, Briefcase,
      Monitor, Tablet, Smartphone, Settings
} from 'lucide-react'
import PageRenderer from '../PageRenderer.jsx'

// ── Utilities ─────────────────────────────────────────────────────────────────
const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const sanitize = (html = '') =>
      html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

// ── Default element factories ─────────────────────────────────────────────────
const DEFAULTS = {
      text: () => ({ id: uid(), type: 'text', content: '', style: {} }),
      heading: () => ({ id: uid(), type: 'heading', content: '', level: 2, style: { textAlign: 'left' } }),
      paragraph: () => ({ id: uid(), type: 'paragraph', content: '', style: {} }),
      image: () => ({ id: uid(), type: 'image', url: '', alt: '', caption: '', style: { width: '100%', borderRadius: 8 } }),
      logo: () => ({ id: uid(), type: 'logo', url: '', alt: '', style: { width: 120, textAlign: 'left' } }),
      table: () => ({ id: uid(), type: 'table', columns: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], style: {} }),
      applyButton: () => ({ id: uid(), type: 'applyButton', text: 'Apply Now', url: '', style: { backgroundColor: '#2563eb', color: '#ffffff', borderRadius: 8, fontSize: 16, textAlign: 'center', padding: '12px 32px' } }),
      notice: () => ({ id: uid(), type: 'notice', variant: 'info', title: 'Notice', content: '', style: {} }),
      divider: () => ({ id: uid(), type: 'divider', style: { borderColor: '#e5e7eb', marginTop: 16, marginBottom: 16 } }),
      spacer: () => ({ id: uid(), type: 'spacer', height: 32 }),
      columns: () => ({ id: uid(), type: 'columns', count: 2, cols: [{ elements: [] }, { elements: [] }] }),
      blank: () => ({ id: uid(), type: 'blank', elements: [], style: { backgroundColor: '#f9fafb', padding: 24, borderRadius: 8 } }),
}

// ── Sidebar palette groups ────────────────────────────────────────────────────
const PALETTE = [
      {
            label: 'Basic', items: [
                  { type: 'text', icon: Type, label: 'Text' },
                  { type: 'heading', icon: HeadingIcon, label: 'Heading' },
                  { type: 'paragraph', icon: AlignLeft, label: 'Paragraph' },
            ],
      },
      {
            label: 'Media', items: [
                  { type: 'image', icon: Image, label: 'Image' },
                  { type: 'logo', icon: Star, label: 'Logo' },
            ],
      },
      {
            label: 'Job Elements', items: [
                  { type: 'applyButton', icon: ExternalLink, label: 'Apply Button' },
                  { type: 'table', icon: Table2, label: 'Table' },
            ],
      },
      {
            label: 'Content', items: [
                  { type: 'notice', icon: Info, label: 'Notice' },
                  { type: 'divider', icon: Minus, label: 'Divider' },
                  { type: 'spacer', icon: Space, label: 'Spacer' },
            ],
      },
      {
            label: 'Layout', items: [
                  { type: 'columns', icon: Columns, label: 'Columns' },
                  { type: 'blank', icon: Square, label: 'Blank' },
            ],
      },
]

// ══════════════════════════════════════════════════════════════════════════════
// ELEMENT RENDERERS (edit mode)
// ══════════════════════════════════════════════════════════════════════════════

const InlineStyles = (s = {}) => ({
      fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textDecoration: s.textDecoration,
      textAlign: s.textAlign,
      color: s.color,
      backgroundColor: s.backgroundColor,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
      padding: s.padding,
      margin: s.margin,
      borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
      border: s.border,
      width: s.width ? (typeof s.width === 'number' ? `${s.width}px` : s.width) : undefined,
})

/* ── Rich-text contenteditable ── */
const RichEditor = ({ html, onChange, placeholder, style = {}, multiline = true }) => {
      const ref = useRef(null)
      const lastHtml = useRef(html)

      useEffect(() => {
            if (ref.current && html !== lastHtml.current) {
                  ref.current.innerHTML = sanitize(html || '')
                  lastHtml.current = html
            }
      }, [html])

      const handleInput = () => {
            const v = sanitize(ref.current?.innerHTML || '')
            lastHtml.current = v
            onChange(v)
      }

      return (
            <div
                  ref={ref}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  data-placeholder={placeholder || 'Type here…'}
                  style={{ ...InlineStyles(style), minHeight: 24, outline: 'none' }}
                  className={`
        w-full focus:outline-none
        empty:before:content-[attr(data-placeholder)]
        empty:before:text-gray-400 empty:before:pointer-events-none
        ${multiline ? 'whitespace-pre-wrap' : 'whitespace-nowrap overflow-hidden'}
      `}
            />
      )
}

/* ── Text Element ── */
const EditText = ({ el, onChange }) => (
      <div className="p-1">
            <RichEditor
                  html={el.content}
                  onChange={(v) => onChange({ ...el, content: v })}
                  placeholder="Click to type…"
                  style={el.style}
            />
      </div>
)

/* ── Heading Element ── */
const EditHeading = ({ el, onChange }) => {
      const Tag = `h${clamp(el.level || 2, 1, 6)}`
      const sizes = { 1: 36, 2: 28, 3: 22, 4: 18, 5: 16, 6: 14 }
      const baseStyle = { fontSize: sizes[el.level || 2], fontWeight: 700, ...el.style }
      return (
            <div className="p-1">
                  <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5, 6].map(l => (
                              <button key={l} type="button"
                                    onClick={() => onChange({ ...el, level: l })}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors ${el.level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                                    H{l}
                              </button>
                        ))}
                  </div>
                  <RichEditor html={el.content} onChange={(v) => onChange({ ...el, content: v })}
                        placeholder={`Heading ${el.level || 2}…`} style={baseStyle} multiline={false} />
            </div>
      )
}

/* ── Paragraph Element ── */
const EditParagraph = ({ el, onChange }) => (
      <div className="p-1">
            <RichEditor html={el.content} onChange={(v) => onChange({ ...el, content: v })}
                  placeholder="Paragraph text…" style={el.style} />
      </div>
)

/* ── Image Element ── */
const EditImage = ({ el, onChange }) => {
      const fileRef = useRef(null)
      const handleFile = (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            if (!f.type.startsWith('image/')) return alert('Images only.')
            if (f.size > 8 * 1024 * 1024) return alert('Max 8 MB.')
            const r = new FileReader()
            r.onload = (ev) => onChange({ ...el, url: ev.target.result })
            r.readAsDataURL(f)
      }
      const w = el.style?.width || '100%'
      const align = el.style?.textAlign || 'left'
      const justMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      return (
            <div className="p-1 space-y-2">
                  <div style={{ display: 'flex', justifyContent: justMap[align] || 'flex-start' }}>
                        {el.url
                              ? <img src={el.url} alt={el.alt || ''} style={{ width: w, borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : 0, maxWidth: '100%', border: el.style?.border || 'none' }} />
                              : (
                                    <div onClick={() => fileRef.current?.click()}
                                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 w-full transition-colors">
                                          <Image size={24} className="mx-auto text-gray-400 mb-1" />
                                          <p className="text-xs text-gray-500">Click to upload or paste URL below</p>
                                          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                                    </div>
                              )}
                  </div>
                  <input type="url" value={el.url?.startsWith('data:') ? '' : el.url || ''}
                        onChange={(e) => onChange({ ...el, url: e.target.value })}
                        placeholder="Or paste image URL…"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="text" value={el.caption || ''} onChange={(e) => onChange({ ...el, caption: e.target.value })}
                        placeholder="Caption (optional)"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
      )
}

/* ── Logo Element ── */
const EditLogo = ({ el, onChange }) => {
      const fileRef = useRef(null)
      const handleFile = (e) => {
            const f = e.target.files?.[0]
            if (!f || !f.type.startsWith('image/')) return
            const r = new FileReader()
            r.onload = (ev) => onChange({ ...el, url: ev.target.result })
            r.readAsDataURL(f)
      }
      const align = el.style?.textAlign || 'left'
      const justMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      const w = el.style?.width || 120
      return (
            <div className="p-1 space-y-2">
                  <div style={{ display: 'flex', justifyContent: justMap[align] }}>
                        {el.url
                              ? <img src={el.url} alt={el.alt || 'Logo'} style={{ width: typeof w === 'number' ? `${w}px` : w, maxWidth: '100%', borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : 0 }} />
                              : <div onClick={() => fileRef.current?.click()}
                                    className="border-2 border-dashed border-blue-200 rounded p-4 cursor-pointer text-center hover:bg-blue-50 transition-colors" style={{ width: typeof w === 'number' ? `${w}px` : w, minWidth: 80 }}>
                                    <Star size={20} className="mx-auto text-blue-400 mb-1" />
                                    <p className="text-[10px] text-gray-500">Upload Logo</p>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                              </div>}
                  </div>
                  {!el.url && <input type="url" placeholder="Or paste logo URL…"
                        onChange={(e) => onChange({ ...el, url: e.target.value })}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />}
            </div>
      )
}

/* ── Table Element ── */
const EditTable = ({ el, onChange }) => {
      const cols = el.columns || ['Column 1']
      const rows = el.rows || [['']]
      const setCell = (ri, ci, v) => onChange({ ...el, rows: rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? v : c) : r) })
      const setHeader = (ci, v) => onChange({ ...el, columns: cols.map((c, i) => i === ci ? v : c) })
      const addRow = () => onChange({ ...el, rows: [...rows, cols.map(() => '')] })
      const delRow = (ri) => rows.length > 1 && onChange({ ...el, rows: rows.filter((_, i) => i !== ri) })
      const addCol = () => onChange({ ...el, columns: [...cols, `Col ${cols.length + 1}`], rows: rows.map(r => [...r, '']) })
      const delCol = (ci) => cols.length > 1 && onChange({ ...el, columns: cols.filter((_, i) => i !== ci), rows: rows.map(r => r.filter((_, i) => i !== ci)) })
      return (
            <div className="p-1 space-y-2">
                  <div className="overflow-x-auto border border-gray-200 rounded">
                        <table className="w-full text-xs">
                              <thead><tr className="bg-gray-100">
                                    {cols.map((c, ci) => (
                                          <th key={ci} className="border border-gray-200 p-0">
                                                <div className="flex items-center">
                                                      <input value={c} onChange={(e) => setHeader(ci, e.target.value)}
                                                            className="flex-1 px-2 py-1.5 bg-transparent font-semibold text-gray-700 focus:outline-none focus:bg-blue-50" />
                                                      {cols.length > 1 && <button type="button" onClick={() => delCol(ci)} className="px-1 text-gray-400 hover:text-red-500"><X size={10} /></button>}
                                                </div>
                                          </th>
                                    ))}
                                    <th className="border border-gray-200 p-1 w-6">
                                          <button type="button" onClick={addCol} className="text-blue-500 text-xs font-bold">+</button>
                                    </th>
                              </tr></thead>
                              <tbody>{rows.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-gray-50">
                                          {row.map((cell, ci) => (
                                                <td key={ci} className="border border-gray-200 p-0">
                                                      <input value={cell} onChange={(e) => setCell(ri, ci, e.target.value)}
                                                            className="w-full px-2 py-1 bg-transparent text-gray-800 focus:outline-none focus:bg-blue-50" placeholder="…" />
                                                </td>
                                          ))}
                                          <td className="border border-gray-200 p-1 w-6">
                                                {rows.length > 1 && <button type="button" onClick={() => delRow(ri)} className="text-gray-400 hover:text-red-500"><X size={10} /></button>}
                                          </td>
                                    </tr>
                              ))}</tbody>
                        </table>
                  </div>
                  <button type="button" onClick={addRow} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <Plus size={11} /> Add Row
                  </button>
            </div>
      )
}

/* ── Apply Button Element ── */
const EditApplyButton = ({ el, onChange }) => {
      const s = el.style || {}
      return (
            <div className="p-1 space-y-2">
                  <div style={{ textAlign: s.textAlign || 'center' }}>
                        <button type="button" style={{
                              backgroundColor: s.backgroundColor || '#2563eb',
                              color: s.color || '#fff',
                              borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
                              fontSize: s.fontSize || 16,
                              padding: s.padding || '12px 32px',
                              border: s.border || 'none',
                              fontWeight: 600,
                              cursor: 'default',
                              display: 'inline-block',
                        }}>
                              {el.text || 'Apply Now'}
                        </button>
                  </div>
                  <input type="text" value={el.text || ''} onChange={(e) => onChange({ ...el, text: e.target.value })}
                        placeholder="Button text"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="url" value={el.url || ''} onChange={(e) => onChange({ ...el, url: e.target.value })}
                        placeholder="Application URL (https://…)"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
      )
}

/* ── Notice Element ── */
const NOTICE_COLORS = {
      info: { bg: '#eff6ff', border: '#bfdbfe', icon: Info, iconColor: '#3b82f6' },
      warning: { bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, iconColor: '#f59e0b' },
      success: { bg: '#f0fdf4', border: '#bbf7d0', icon: Check, iconColor: '#22c55e' },
      error: { bg: '#fef2f2', border: '#fecaca', icon: X, iconColor: '#ef4444' },
}

const EditNotice = ({ el, onChange }) => {
      const v = el.variant || 'info'
      const NIcon = NOTICE_COLORS[v]?.icon || Info
      return (
            <div className="p-1 space-y-2">
                  <div style={{ backgroundColor: NOTICE_COLORS[v].bg, border: `1px solid ${NOTICE_COLORS[v].border}`, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <NIcon size={16} style={{ color: NOTICE_COLORS[v].iconColor, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                              <div className="font-semibold text-sm text-gray-900 mb-1">{el.title || 'Notice'}</div>
                              <div className="text-xs text-gray-700">{el.content || 'Add notice text below…'}</div>
                        </div>
                  </div>
                  <div className="flex gap-2">
                        {['info', 'warning', 'success', 'error'].map(vv => (
                              <button key={vv} type="button" onClick={() => onChange({ ...el, variant: vv })}
                                    style={{ backgroundColor: NOTICE_COLORS[vv].bg, border: `1px solid ${NOTICE_COLORS[vv].border}` }}
                                    className={`px-2 py-1 rounded text-xs font-medium capitalize transition-all ${v === vv ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}>
                                    {vv}
                              </button>
                        ))}
                  </div>
                  <input value={el.title || ''} onChange={(e) => onChange({ ...el, title: e.target.value })}
                        placeholder="Notice title" className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <textarea value={el.content || ''} onChange={(e) => onChange({ ...el, content: e.target.value })}
                        placeholder="Notice content" rows={2}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            </div>
      )
}

/* ── Divider Element ── */
const EditDivider = ({ el }) => (
      <div className="px-1 py-3">
            <hr style={{ borderColor: el.style?.borderColor || '#e5e7eb', borderWidth: el.style?.borderWidth || 1 }} />
      </div>
)

/* ── Spacer Element ── */
const EditSpacer = ({ el, onChange }) => (
      <div className="p-1">
            <div style={{ height: el.height || 32, backgroundColor: '#f0f9ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-xs text-blue-400 font-medium">Spacer {el.height || 32}px</span>
            </div>
            <input type="range" min={8} max={200} value={el.height || 32}
                  onChange={(e) => onChange({ ...el, height: parseInt(e.target.value) })}
                  className="w-full mt-1 accent-blue-600" />
      </div>
)

/* ── Columns Element ── */
const EditColumns = ({ el, onChange }) => {
      const count = el.count || 2
      const cols = el.cols || Array.from({ length: count }, () => ({ elements: [] }))
      const setCount = (n) => {
            const newCols = Array.from({ length: n }, (_, i) => cols[i] || { elements: [] })
            onChange({ ...el, count: n, cols: newCols })
      }
      const updateColElement = (ci, elements) => {
            const newCols = cols.map((c, i) => i === ci ? { ...c, elements } : c)
            onChange({ ...el, cols: newCols })
      }
      return (
            <div className="p-1 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Columns:</span>
                        {[1, 2, 3, 4].map(n => (
                              <button key={n} type="button" onClick={() => setCount(n)}
                                    className={`w-7 h-7 text-xs font-bold rounded border transition-colors ${count === n ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                    {n}
                              </button>
                        ))}
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
                        {cols.slice(0, count).map((col, ci) => (
                              <div key={ci} className="border border-dashed border-gray-300 rounded-lg p-2 min-h-[60px] bg-gray-50">
                                    <p className="text-[10px] text-gray-400 mb-1 font-medium">Col {ci + 1}</p>
                                    {(col.elements || []).length === 0
                                          ? <p className="text-[10px] text-gray-400 italic">Empty — add elements via sidebar</p>
                                          : <p className="text-[10px] text-gray-500">{col.elements.length} element(s)</p>
                                    }
                              </div>
                        ))}
                  </div>
            </div>
      )
}

/* ── Blank Section Element ── */
const EditBlank = ({ el, onChange }) => (
      <div className="p-1">
            <div style={{ backgroundColor: el.style?.backgroundColor || '#f9fafb', padding: el.style?.padding || 24, borderRadius: el.style?.borderRadius || 8, minHeight: 80, border: '2px dashed #d1d5db' }}>
                  <p className="text-xs text-gray-400 italic text-center">Blank Section — type or drop anything here</p>
                  <RichEditor html={el.content || ''} onChange={(v) => onChange({ ...el, content: v })}
                        placeholder="Type anything in this blank section…" />
            </div>
      </div>
)

// ── Dispatch to correct editor ────────────────────────────────────────────────
const ElementEditor = ({ el, onChange }) => {
      switch (el.type) {
            case 'text': return <EditText el={el} onChange={onChange} />
            case 'heading': return <EditHeading el={el} onChange={onChange} />
            case 'paragraph': return <EditParagraph el={el} onChange={onChange} />
            case 'image': return <EditImage el={el} onChange={onChange} />
            case 'logo': return <EditLogo el={el} onChange={onChange} />
            case 'table': return <EditTable el={el} onChange={onChange} />
            case 'applyButton': return <EditApplyButton el={el} onChange={onChange} />
            case 'notice': return <EditNotice el={el} onChange={onChange} />
            case 'divider': return <EditDivider el={el} />
            case 'spacer': return <EditSpacer el={el} onChange={onChange} />
            case 'columns': return <EditColumns el={el} onChange={onChange} />
            case 'blank': return <EditBlank el={el} onChange={onChange} />
            default: return <div className="p-2 text-xs text-gray-400">Unknown element: {el.type}</div>
      }
}

// ══════════════════════════════════════════════════════════════════════════════
// SORTABLE ELEMENT CARD
// ══════════════════════════════════════════════════════════════════════════════
const SortableElementCard = ({
      el, index, total, isSelected, onSelect,
      onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown,
}) => {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: el.id })
      const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.4 : 1,
            zIndex: isDragging ? 100 : undefined,
      }

      const TYPE_LABEL = {
            text: 'Text', heading: 'Heading', paragraph: 'Paragraph',
            image: 'Image', logo: 'Logo', table: 'Table',
            applyButton: 'Apply Button', notice: 'Notice',
            divider: 'Divider', spacer: 'Spacer', columns: 'Columns', blank: 'Blank',
      }

      return (
            <div ref={setNodeRef} style={style}
                  className={`group relative border rounded-xl transition-all ${isSelected ? 'border-blue-400 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'} bg-white`}
                  onClick={(e) => { e.stopPropagation(); onSelect() }}>

                  {/* Drag handle + type label */}
                  <div className={`flex items-center justify-between px-3 py-1.5 border-b rounded-t-xl transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none">
                                    <GripVertical size={14} />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{TYPE_LABEL[el.type] || el.type}</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp() }} disabled={index === 0}
                                    title="Move up" className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-20"><ChevronUp size={13} /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown() }} disabled={index === total - 1}
                                    title="Move down" className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-20"><ChevronDown size={13} /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate() }}
                                    title="Duplicate" className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Copy size={13} /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }}
                                    title="Delete" className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={13} /></button>
                        </div>
                  </div>

                  {/* Element content */}
                  <div onClick={(e) => e.stopPropagation()}>
                        <ElementEditor el={el} onChange={onUpdate} />
                  </div>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOATING FORMATTING TOOLBAR (shows on text selection)
// ══════════════════════════════════════════════════════════════════════════════
const FloatingToolbar = ({ onFormat }) => {
      const [pos, setPos] = useState(null)

      useEffect(() => {
            const handleSel = () => {
                  const sel = window.getSelection()
                  if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setPos(null); return }
                  const range = sel.getRangeAt(0)
                  const rect = range.getBoundingClientRect()
                  if (rect.width === 0) { setPos(null); return }
                  setPos({ top: rect.top + window.scrollY - 44, left: rect.left + window.scrollX + rect.width / 2 })
            }
            document.addEventListener('selectionchange', handleSel)
            return () => document.removeEventListener('selectionchange', handleSel)
      }, [])

      if (!pos) return null

      const exec = (cmd, val = null) => { document.execCommand(cmd, false, val) }

      return (
            <div style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9999 }}
                  className="bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1.5 flex items-center gap-0.5 text-sm select-none">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold') }} className="p-1.5 rounded hover:bg-gray-700" title="Bold"><Bold size={13} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic') }} className="p-1.5 rounded hover:bg-gray-700" title="Italic"><Italic size={13} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('underline') }} className="p-1.5 rounded hover:bg-gray-700" title="Underline"><Underline size={13} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough') }} className="p-1.5 rounded hover:bg-gray-700" title="Strikethrough"><Strikethrough size={13} /></button>
                  <div className="w-px bg-gray-600 mx-0.5" />
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft') }} className="p-1.5 rounded hover:bg-gray-700"><AlignLeft size={13} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter') }} className="p-1.5 rounded hover:bg-gray-700"><AlignCenter size={13} /></button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyRight') }} className="p-1.5 rounded hover:bg-gray-700"><AlignRight size={13} /></button>
                  <div className="w-px bg-gray-600 mx-0.5" />
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); const url = prompt('URL:'); if (url) exec('createLink', url) }} className="p-1.5 rounded hover:bg-gray-700"><Link2 size={13} /></button>
                  <select onMouseDown={(e) => e.preventDefault()} onChange={(e) => { exec('fontSize', e.target.value); e.target.value = '' }}
                        className="bg-gray-800 text-white text-xs rounded px-1 ml-1 border-0 focus:outline-none" defaultValue="">
                        <option value="" disabled>Size</option>
                        {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTIES PANEL (right sidebar, shown when element selected)
// ══════════════════════════════════════════════════════════════════════════════
const PropertiesPanel = ({ el, onChange, onDeselect }) => {
      if (!el) return (
            <div className="p-4 text-xs text-gray-500">
                  <p className="font-semibold text-gray-700 mb-3">Page Settings</p>
                  <p className="text-gray-400">Click any element to see its settings.</p>
            </div>
      )

      const s = el.style || {}
      const set = (k, v) => onChange({ ...el, style: { ...s, [k]: v } })

      return (
            <div className="p-3 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-700 text-sm capitalize">{el.type} Settings</p>
                        <button type="button" onClick={onDeselect} className="p-1 rounded text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>

                  {/* Typography */}
                  {['text', 'heading', 'paragraph', 'blank'].includes(el.type) && (
                        <div className="space-y-2">
                              <p className="font-medium text-gray-600 uppercase tracking-wide text-[10px]">Typography</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                          <label className="text-[10px] text-gray-500">Font Size</label>
                                          <input type="number" value={s.fontSize || ''} onChange={(e) => set('fontSize', parseInt(e.target.value) || undefined)}
                                                placeholder="16" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Line Height</label>
                                          <input type="number" step="0.1" value={s.lineHeight || ''} onChange={(e) => set('lineHeight', parseFloat(e.target.value) || undefined)}
                                                placeholder="1.6" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Text Color</label>
                                          <input type="color" value={s.color || '#111827'} onChange={(e) => set('color', e.target.value)}
                                                className="w-full h-7 border border-gray-200 rounded cursor-pointer" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Align</label>
                                          <div className="flex border border-gray-200 rounded overflow-hidden">
                                                {['left', 'center', 'right'].map(a => (
                                                      <button key={a} type="button" onClick={() => set('textAlign', a)}
                                                            className={`flex-1 py-1 text-center transition-colors ${s.textAlign === a ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                            {a === 'left' ? <AlignLeft size={11} className="mx-auto" /> : a === 'center' ? <AlignCenter size={11} className="mx-auto" /> : <AlignRight size={11} className="mx-auto" />}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Appearance */}
                  <div className="space-y-2">
                        <p className="font-medium text-gray-600 uppercase tracking-wide text-[10px]">Appearance</p>
                        <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                    <label className="text-[10px] text-gray-500">Background</label>
                                    <input type="color" value={s.backgroundColor || '#ffffff'} onChange={(e) => set('backgroundColor', e.target.value)}
                                          className="w-full h-7 border border-gray-200 rounded cursor-pointer" />
                              </div>
                              <div>
                                    <label className="text-[10px] text-gray-500">Border Radius</label>
                                    <input type="number" value={s.borderRadius || ''} onChange={(e) => set('borderRadius', parseInt(e.target.value) || undefined)}
                                          placeholder="8" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                        </div>
                  </div>

                  {/* Spacing */}
                  <div className="space-y-2">
                        <p className="font-medium text-gray-600 uppercase tracking-wide text-[10px]">Spacing</p>
                        <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                    <label className="text-[10px] text-gray-500">Padding</label>
                                    <input type="text" value={s.padding || ''} onChange={(e) => set('padding', e.target.value)}
                                          placeholder="16px" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                              <div>
                                    <label className="text-[10px] text-gray-500">Margin</label>
                                    <input type="text" value={s.margin || ''} onChange={(e) => set('margin', e.target.value)}
                                          placeholder="0" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                        </div>
                  </div>

                  {/* Image / Logo size */}
                  {['image', 'logo'].includes(el.type) && (
                        <div className="space-y-2">
                              <p className="font-medium text-gray-600 uppercase tracking-wide text-[10px]">Size & Align</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                          <label className="text-[10px] text-gray-500">Width</label>
                                          <input type="text" value={s.width || ''} onChange={(e) => set('width', e.target.value)}
                                                placeholder="100% or 200px" className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Align</label>
                                          <select value={s.textAlign || 'left'} onChange={(e) => set('textAlign', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                          </select>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Button specific */}
                  {el.type === 'applyButton' && (
                        <div className="space-y-2">
                              <p className="font-medium text-gray-600 uppercase tracking-wide text-[10px]">Button Style</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                          <label className="text-[10px] text-gray-500">BG Color</label>
                                          <input type="color" value={s.backgroundColor || '#2563eb'} onChange={(e) => set('backgroundColor', e.target.value)}
                                                className="w-full h-7 border border-gray-200 rounded cursor-pointer" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Text Color</label>
                                          <input type="color" value={s.color || '#ffffff'} onChange={(e) => set('color', e.target.value)}
                                                className="w-full h-7 border border-gray-200 rounded cursor-pointer" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Font Size</label>
                                          <input type="number" value={s.fontSize || 16} onChange={(e) => set('fontSize', parseInt(e.target.value))}
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                          <label className="text-[10px] text-gray-500">Border Radius</label>
                                          <input type="number" value={s.borderRadius || 8} onChange={(e) => set('borderRadius', parseInt(e.target.value))}
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-2">
                                          <label className="text-[10px] text-gray-500">Align</label>
                                          <select value={s.textAlign || 'center'} onChange={(e) => set('textAlign', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                          </select>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PageEditor COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
/**
 * Props:
 *   value       : string  — JSON string '{"version":1,"elements":[...]}'
 *   onChange    : (jsonStr) => void
 *   saveStatus  : 'idle' | 'saving' | 'saved' | 'error'
 */
const PageEditor = ({ value, onChange, saveStatus = 'idle' }) => {
      const parseValue = (v) => {
            try {
                  const p = JSON.parse(v || '{}')
                  return {
                        version: p.version || 1,
                        page: p.page || { background: '#ffffff', padding: 32, maxWidth: 860 },
                        elements: Array.isArray(p.elements) ? p.elements : [],
                  }
            } catch {
                  return { version: 1, page: { background: '#ffffff', padding: 32, maxWidth: 860 }, elements: [] }
            }
      }

      const [doc, setDoc] = useState(() => parseValue(value))
      const [history, setHistory] = useState([])
      const [future, setFuture] = useState([])
      const [selectedId, setSelectedId] = useState(null)
      const [showPreview, setShowPreview] = useState(false)
      const [previewMode, setPreviewMode] = useState('desktop')
      const [activeId, setActiveId] = useState(null)
      const canvasRef = useRef(null)

      const sensors = useSensors(
            useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
      )

      // Sync external value changes (e.g. loading edit post)
      useEffect(() => {
            const p = parseValue(value)
            setDoc(p)
      }, [value])

      const selectedEl = useMemo(
            () => doc.elements.find(e => e.id === selectedId) || null,
            [doc.elements, selectedId]
      )

      // Emit changes
      const emit = useCallback((newDoc) => {
            setDoc(newDoc)
            onChange(JSON.stringify(newDoc))
      }, [onChange])

      // History push
      const pushHistory = useCallback((oldDoc) => {
            setHistory(h => [...h.slice(-19), oldDoc])
            setFuture([])
      }, [])

      const updateDoc = useCallback((newDoc) => {
            pushHistory(doc)
            emit(newDoc)
      }, [doc, pushHistory, emit])

      // Elements helpers
      const elements = doc.elements || []

      const addElement = useCallback((type) => {
            const el = DEFAULTS[type]?.()
            if (!el) return
            const newDoc = { ...doc, elements: [...elements, el] }
            updateDoc(newDoc)
            setSelectedId(el.id)
      }, [doc, elements, updateDoc])

      const updateElement = useCallback((updated) => {
            const newDoc = { ...doc, elements: elements.map(e => e.id === updated.id ? updated : e) }
            // Don't push history for every keystroke — just emit
            emit(newDoc)
      }, [doc, elements, emit])

      const deleteElement = useCallback((id) => {
            updateDoc({ ...doc, elements: elements.filter(e => e.id !== id) })
            if (selectedId === id) setSelectedId(null)
      }, [doc, elements, updateDoc, selectedId])

      const duplicateElement = useCallback((id) => {
            const idx = elements.findIndex(e => e.id === id)
            if (idx === -1) return
            const clone = { ...JSON.parse(JSON.stringify(elements[idx])), id: uid() }
            const newEls = [...elements.slice(0, idx + 1), clone, ...elements.slice(idx + 1)]
            updateDoc({ ...doc, elements: newEls })
            setSelectedId(clone.id)
      }, [doc, elements, updateDoc])

      const moveUp = useCallback((index) => {
            if (index === 0) return
            const newEls = [...elements]
                  ;[newEls[index - 1], newEls[index]] = [newEls[index], newEls[index - 1]]
            updateDoc({ ...doc, elements: newEls })
      }, [doc, elements, updateDoc])

      const moveDown = useCallback((index) => {
            if (index === elements.length - 1) return
            const newEls = [...elements]
                  ;[newEls[index], newEls[index + 1]] = [newEls[index + 1], newEls[index]]
            updateDoc({ ...doc, elements: newEls })
      }, [doc, elements, updateDoc])

      // Drag end
      const handleDragEnd = ({ active, over }) => {
            setActiveId(null)
            if (!over || active.id === over.id) return
            const oldIdx = elements.findIndex(e => e.id === active.id)
            const newIdx = elements.findIndex(e => e.id === over.id)
            if (oldIdx === -1 || newIdx === -1) return
            updateDoc({ ...doc, elements: arrayMove(elements, oldIdx, newIdx) })
      }

      // Undo / Redo
      const undo = useCallback(() => {
            if (!history.length) return
            const prev = history[history.length - 1]
            setFuture(f => [doc, ...f])
            setHistory(h => h.slice(0, -1))
            emit(prev)
      }, [history, doc, emit])

      const redo = useCallback(() => {
            if (!future.length) return
            const next = future[0]
            setHistory(h => [...h, doc])
            setFuture(f => f.slice(1))
            emit(next)
      }, [future, doc, emit])

      // Keyboard shortcuts
      useEffect(() => {
            const handler = (e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
                  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
                  if (e.key === 'Escape') setSelectedId(null)
                  if (e.key === 'Delete' && selectedId && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
                        deleteElement(selectedId)
                  }
            }
            window.addEventListener('keydown', handler)
            return () => window.removeEventListener('keydown', handler)
      }, [undo, redo, selectedId, deleteElement])

      const activeEl = elements.find(e => e.id === activeId)

      const PREVIEW_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' }

      // ── RENDER ──────────────────────────────────────────────────────────────────
      return (
            <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 4rem)' }}>
                  {/* ── Top bar ── */}
                  <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center gap-2">
                              <button type="button" onClick={undo} disabled={!history.length}
                                    title="Undo (Ctrl+Z)" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                    <RotateCcw size={16} />
                              </button>
                              <button type="button" onClick={redo} disabled={!future.length}
                                    title="Redo (Ctrl+Y)" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                    <RotateCw size={16} />
                              </button>
                              <div className="w-px bg-gray-200 mx-1 h-5" />
                              <span className={`text-xs font-medium transition-colors ${saveStatus === 'saving' ? 'text-amber-500' : saveStatus === 'saved' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                                    {saveStatus === 'saving' ? '⏳ Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '✗ Error' : ''}
                              </span>
                        </div>

                        <div className="flex items-center gap-2">
                              {/* Preview mode buttons (only when preview open) */}
                              {showPreview && (
                                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                          {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([m, Icon]) => (
                                                <button key={m} type="button" onClick={() => setPreviewMode(m)}
                                                      className={`px-2 py-1.5 transition-colors ${previewMode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                      <Icon size={14} />
                                                </button>
                                          ))}
                                    </div>
                              )}
                              <button type="button" onClick={() => setShowPreview(p => !p)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${showPreview ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPreview ? 'Hide' : 'Preview'}
                              </button>
                        </div>
                  </div>

                  {/* ── Main layout ── */}
                  <div className="flex flex-1 overflow-hidden">

                        {/* ── LEFT sidebar: element palette ── */}
                        <div className="w-48 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                              <div className="p-3 space-y-4">
                                    {PALETTE.map(group => (
                                          <div key={group.label}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{group.label}</p>
                                                <div className="space-y-0.5">
                                                      {group.items.map(item => (
                                                            <button key={item.type} type="button"
                                                                  onClick={() => addElement(item.type)}
                                                                  draggable={false}
                                                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left group">
                                                                  <item.icon size={14} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                                                  {item.label}
                                                            </button>
                                                      ))}
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </div>

                        {/* ── CENTER: canvas + preview ── */}
                        <div className="flex-1 overflow-auto bg-gray-100 flex gap-4 p-4">

                              {/* Canvas */}
                              <div className={`flex-1 ${showPreview ? 'max-w-[50%]' : 'max-w-3xl mx-auto w-full'}`}>
                                    <div
                                          ref={canvasRef}
                                          style={{
                                                backgroundColor: doc.page?.background || '#ffffff',
                                                padding: `${doc.page?.padding || 32}px`,
                                                minHeight: 600,
                                                borderRadius: 12,
                                                boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                                          }}
                                          onClick={() => setSelectedId(null)}
                                    >
                                          {elements.length === 0 && (
                                                <div className="flex flex-col items-center justify-center min-h-[400px] text-center pointer-events-none">
                                                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                                                            <Type size={28} className="text-blue-400" />
                                                      </div>
                                                      <p className="text-gray-400 text-base font-medium">Click an element from the left panel</p>
                                                      <p className="text-gray-300 text-sm mt-1">or start building your page</p>
                                                </div>
                                          )}

                                          <DndContext sensors={sensors} collisionDetection={closestCenter}
                                                onDragStart={({ active }) => setActiveId(active.id)}
                                                onDragEnd={handleDragEnd}>
                                                <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                                      <div className="space-y-3">
                                                            {elements.map((el, index) => (
                                                                  <SortableElementCard
                                                                        key={el.id}
                                                                        el={el}
                                                                        index={index}
                                                                        total={elements.length}
                                                                        isSelected={selectedId === el.id}
                                                                        onSelect={() => setSelectedId(el.id)}
                                                                        onUpdate={updateElement}
                                                                        onDelete={() => deleteElement(el.id)}
                                                                        onDuplicate={() => duplicateElement(el.id)}
                                                                        onMoveUp={() => moveUp(index)}
                                                                        onMoveDown={() => moveDown(index)}
                                                                  />
                                                            ))}
                                                      </div>
                                                </SortableContext>
                                                <DragOverlay>
                                                      {activeEl ? (
                                                            <div className="bg-white border-2 border-blue-400 rounded-xl shadow-2xl p-3 opacity-90">
                                                                  <p className="text-xs font-medium text-blue-600">{activeEl.type}</p>
                                                            </div>
                                                      ) : null}
                                                </DragOverlay>
                                          </DndContext>

                                          {/* Add block button */}
                                          <div className="mt-4">
                                                <button type="button" onClick={() => addElement('text')}
                                                      className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                                      <Plus size={16} /> Add Text Block
                                                </button>
                                          </div>
                                    </div>
                              </div>

                              {/* Live Preview */}
                              {showPreview && (
                                    <div className="flex-1 max-w-[50%]">
                                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                                      <span className="text-xs text-gray-400 ml-2">Preview — {previewMode}</span>
                                                </div>
                                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                                      <div style={{ width: PREVIEW_WIDTHS[previewMode], margin: '0 auto', transition: 'width 0.3s' }}>
                                                            <PageRenderer pageContent={JSON.stringify(doc)} />
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* ── RIGHT sidebar: properties panel ── */}
                        <div className="w-52 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
                              <PropertiesPanel
                                    el={selectedEl}
                                    onChange={updateElement}
                                    onDeselect={() => setSelectedId(null)}
                              />
                        </div>
                  </div>

                  {/* Floating text toolbar */}
                  <FloatingToolbar />
            </div>
      )
}

export default PageEditor
