/**
 * ContentBuilder — Simple rich-text document editor.
 * One contenteditable area with a full formatting toolbar.
 * Supports: bold, italic, underline, color, headings,
 * lists, alignment, links (with custom label), and tables.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
      Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
      List, ListOrdered, Link2, Table2, Palette, ChevronDown, X, Check
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const sanitize = (html) => {
      if (!html) return ''
      return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
}

// ── Toolbar button ────────────────────────────────────────────────────────────
const Btn = ({ onClick, title, active, children, className = '' }) => (
      <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            title={title}
            className={`p-1.5 rounded transition-colors text-sm
      ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}
      ${className}`}
      >
            {children}
      </button>
)

const Sep = () => <div className="w-px h-5 bg-gray-300 mx-0.5 self-center" />

// ── Text color picker ─────────────────────────────────────────────────────────
const COLORS = [
      '#000000', '#374151', '#ef4444', '#f97316', '#eab308',
      '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
]

const ColorPicker = ({ onColor }) => {
      const [open, setOpen] = useState(false)
      return (
            <div className="relative">
                  <Btn onClick={() => setOpen(o => !o)} title="Text color">
                        <Palette size={14} />
                  </Btn>
                  {open && (
                        <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                              <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 grid grid-cols-5 gap-1 w-28">
                                    {COLORS.map(c => (
                                          <button
                                                key={c}
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); onColor(c); setOpen(false) }}
                                                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                          />
                                    ))}
                              </div>
                        </>
                  )}
            </div>
      )
}

// ── Link modal ────────────────────────────────────────────────────────────────
const LinkModal = ({ onInsert, onClose }) => {
      const [url, setUrl] = useState('https://')
      const [label, setLabel] = useState('')
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-80 space-y-4">
                        <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-800 text-sm">Insert Link</h3>
                              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
                                    <X size={16} />
                              </button>
                        </div>
                        <div className="space-y-3">
                              <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Button / Link Label</label>
                                    <input
                                          autoFocus
                                          value={label}
                                          onChange={e => setLabel(e.target.value)}
                                          placeholder="e.g. Apply Now"
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                              </div>
                              <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">URL</label>
                                    <input
                                          value={url}
                                          onChange={e => setUrl(e.target.value)}
                                          placeholder="https://example.com"
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                              </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                              <button type="button" onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                                    Cancel
                              </button>
                              <button
                                    type="button"
                                    onClick={() => { if (url) onInsert(url, label || url) }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium"
                              >
                                    <Check size={13} /> Insert
                              </button>
                        </div>
                  </div>
            </div>
      )
}

// ── Table insert dialog ───────────────────────────────────────────────────────
const TableModal = ({ onInsert, onClose }) => {
      const [rows, setRows] = useState(3)
      const [cols, setCols] = useState(2)
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-64 space-y-4">
                        <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-800 text-sm">Insert Table</h3>
                              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
                                    <X size={16} />
                              </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                              <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Rows</label>
                                    <input type="number" min={1} max={20} value={rows}
                                          onChange={e => setRows(Number(e.target.value))}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              </div>
                              <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Columns</label>
                                    <input type="number" min={1} max={10} value={cols}
                                          onChange={e => setCols(Number(e.target.value))}
                                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                              <button type="button" onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                                    Cancel
                              </button>
                              <button type="button"
                                    onClick={() => onInsert(rows, cols)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">
                                    <Check size={13} /> Insert
                              </button>
                        </div>
                  </div>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main ContentBuilder
// ══════════════════════════════════════════════════════════════════════════════
/**
 * Props:
 *   value: string  — raw HTML string
 *   onChange: (html: string) => void
 */
const ContentBuilder = ({ value, onChange }) => {
      const editorRef = useRef(null)
      const [showLink, setShowLink] = useState(false)
      const [showTable, setShowTable] = useState(false)
      // Track saved selection for link/table insert after modal opens
      const savedRange = useRef(null)

      // Sync value → editor on first mount only
      useEffect(() => {
            if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
                  editorRef.current.innerHTML = value || ''
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const exec = useCallback((cmd, val = null) => {
            editorRef.current?.focus()
            document.execCommand(cmd, false, val)
      }, [])

      const handleInput = () => {
            const html = editorRef.current?.innerHTML || ''
            onChange(sanitize(html))
      }

      const saveSelection = () => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
                  savedRange.current = sel.getRangeAt(0).cloneRange()
            }
      }

      const restoreSelection = () => {
            const sel = window.getSelection()
            if (savedRange.current && sel) {
                  sel.removeAllRanges()
                  sel.addRange(savedRange.current)
            }
      }

      const openLinkModal = () => {
            saveSelection()
            setShowLink(true)
      }

      const openTableModal = () => {
            saveSelection()
            setShowTable(true)
      }

      const insertLink = (url, label) => {
            setShowLink(false)
            editorRef.current?.focus()
            restoreSelection()
            const sel = window.getSelection()
            // If text is selected, wrap it; otherwise insert the label
            if (sel && sel.toString().trim()) {
                  document.execCommand('createLink', false, url)
            } else {
                  const a = document.createElement('a')
                  a.href = url
                  a.target = '_blank'
                  a.rel = 'noopener noreferrer'
                  a.textContent = label
                  a.className = 'text-blue-600 underline'
                  const range = sel?.getRangeAt(0)
                  if (range) {
                        range.deleteContents()
                        range.insertNode(a)
                        range.setStartAfter(a)
                        range.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(range)
                  }
            }
            handleInput()
      }

      const insertTable = (rows, cols) => {
            setShowTable(false)
            editorRef.current?.focus()
            restoreSelection()

            // Build table HTML
            const headerCells = Array.from({ length: cols }, (_, i) =>
                  `<th style="border:1px solid #d1d5db;padding:6px 10px;background:#f9fafb;font-weight:600;text-align:left;">Column ${i + 1}</th>`
            ).join('')
            const dataCells = Array.from({ length: cols }, () =>
                  `<td style="border:1px solid #d1d5db;padding:6px 10px;">&nbsp;</td>`
            ).join('')
            const dataRows = Array.from({ length: rows - 1 }, () => `<tr>${dataCells}</tr>`).join('')

            const tableHtml = `
      <table style="border-collapse:collapse;width:100%;margin:8px 0;">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${dataRows || `<tr>${dataCells}</tr>`}</tbody>
      </table>
      <p><br></p>
    `
            document.execCommand('insertHTML', false, tableHtml)
            handleInput()
      }

      return (
            <>
                  {showLink && (
                        <LinkModal
                              onInsert={insertLink}
                              onClose={() => setShowLink(false)}
                        />
                  )}
                  {showTable && (
                        <TableModal
                              onInsert={insertTable}
                              onClose={() => setShowTable(false)}
                        />
                  )}

                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
                              {/* Text style */}
                              <Btn onClick={() => exec('bold')} title="Bold (Ctrl+B)"><Bold size={14} /></Btn>
                              <Btn onClick={() => exec('italic')} title="Italic (Ctrl+I)"><Italic size={14} /></Btn>
                              <Btn onClick={() => exec('underline')} title="Underline (Ctrl+U)"><Underline size={14} /></Btn>
                              <ColorPicker onColor={(c) => exec('foreColor', c)} />

                              <Sep />

                              {/* Headings */}
                              <Btn onClick={() => exec('formatBlock', 'h1')} title="Heading 1">
                                    <span className="text-xs font-bold">H1</span>
                              </Btn>
                              <Btn onClick={() => exec('formatBlock', 'h2')} title="Heading 2">
                                    <span className="text-xs font-bold">H2</span>
                              </Btn>
                              <Btn onClick={() => exec('formatBlock', 'h3')} title="Heading 3">
                                    <span className="text-xs font-bold">H3</span>
                              </Btn>
                              <Btn onClick={() => exec('formatBlock', 'p')} title="Paragraph">
                                    <span className="text-xs">P</span>
                              </Btn>

                              <Sep />

                              {/* Lists */}
                              <Btn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List size={14} /></Btn>
                              <Btn onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered size={14} /></Btn>

                              <Sep />

                              {/* Alignment */}
                              <Btn onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft size={14} /></Btn>
                              <Btn onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter size={14} /></Btn>
                              <Btn onClick={() => exec('justifyRight')} title="Align right"><AlignRight size={14} /></Btn>

                              <Sep />

                              {/* Link */}
                              <Btn onClick={openLinkModal} title="Insert link / button">
                                    <Link2 size={14} />
                              </Btn>

                              {/* Table */}
                              <Btn onClick={openTableModal} title="Insert table">
                                    <Table2 size={14} />
                              </Btn>
                        </div>

                        {/* Editable area */}
                        <div
                              ref={editorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onInput={handleInput}
                              className="min-h-[400px] p-4 text-sm text-gray-800 focus:outline-none"
                              style={{
                                    lineHeight: '1.75',
                                    fontFamily: 'inherit',
                              }}
                              data-placeholder="Start writing your post content here..."
                        />
                  </div>

                  {/* Placeholder CSS */}
                  <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.35rem; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.1rem;  font-weight: 600; margin: 0.4em 0; }
        [contenteditable] ul { list-style: disc;    padding-left: 1.5em; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; }
        [contenteditable] a  { color: #2563eb; text-decoration: underline; }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        [contenteditable] th,
        [contenteditable] td { border: 1px solid #d1d5db; padding: 6px 10px; }
        [contenteditable] th { background: #f9fafb; font-weight: 600; }
      `}</style>
            </>
      )
}

export default ContentBuilder
