/**
 * ContentBuilder — Admin-only flexible content editor.
 * Renders a list of blocks (text, heading, table, image).
 * Users NEVER see this component — only ContentRenderer.
 */
import React, { useState, useCallback, useRef } from 'react'
import {
      Plus, Trash2, ChevronUp, ChevronDown, Type,
      Table2, Image, Heading, AlignLeft, Bold, Italic,
      Underline, List, ListOrdered, Link2, AlignCenter,
      AlignRight, X, Check
} from 'lucide-react'

// ── ID generator ──────────────────────────────────────────────────────────────
const uid = () => `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ── DOMPurify-lite: strip script/event handlers from HTML ─────────────────────
const sanitize = (html) => {
      if (!html) return ''
      return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
}

// ══════════════════════════════════════════════════════════════════════════════
// Rich Text Toolbar
// ══════════════════════════════════════════════════════════════════════════════
const ToolbarBtn = ({ onClick, title, active, children }) => (
      <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
            title={title}
            className={`p-1.5 rounded text-sm transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
      >
            {children}
      </button>
)

const RichTextToolbar = ({ editorRef }) => {
      const exec = (cmd, val = null) => {
            editorRef.current?.focus()
            document.execCommand(cmd, false, val)
      }

      const insertLink = () => {
            const url = prompt('Enter URL:')
            if (url) exec('createLink', url)
      }

      return (
            <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <ToolbarBtn onClick={() => exec('bold')} title="Bold"><Bold size={14} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('italic')} title="Italic"><Italic size={14} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('underline')} title="Underline"><Underline size={14} /></ToolbarBtn>
                  <div className="w-px bg-gray-300 mx-1" />
                  <ToolbarBtn onClick={() => exec('formatBlock', 'h1')} title="Heading 1"><span className="text-xs font-bold">H1</span></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('formatBlock', 'h2')} title="Heading 2"><span className="text-xs font-bold">H2</span></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('formatBlock', 'h3')} title="Heading 3"><span className="text-xs font-bold">H3</span></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('formatBlock', 'p')} title="Paragraph"><span className="text-xs">P</span></ToolbarBtn>
                  <div className="w-px bg-gray-300 mx-1" />
                  <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List size={14} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered size={14} /></ToolbarBtn>
                  <div className="w-px bg-gray-300 mx-1" />
                  <ToolbarBtn onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft size={14} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter size={14} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('justifyRight')} title="Align right"><AlignRight size={14} /></ToolbarBtn>
                  <div className="w-px bg-gray-300 mx-1" />
                  <ToolbarBtn onClick={insertLink} title="Insert link"><Link2 size={14} /></ToolbarBtn>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Text Block
// ══════════════════════════════════════════════════════════════════════════════
const TextBlock = ({ block, onChange }) => {
      const editorRef = useRef(null)

      const handleInput = () => {
            const html = editorRef.current?.innerHTML || ''
            onChange({ ...block, content: sanitize(html) })
      }

      return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <RichTextToolbar editorRef={editorRef} />
                  <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        dangerouslySetInnerHTML={{ __html: block.content || '' }}
                        className="min-h-[100px] p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        style={{ lineHeight: '1.6' }}
                  />
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Heading Block
// ══════════════════════════════════════════════════════════════════════════════
const HeadingBlock = ({ block, onChange }) => (
      <div className="space-y-2">
            <div className="flex gap-2">
                  {[1, 2, 3].map((lvl) => (
                        <button
                              key={lvl}
                              type="button"
                              onClick={() => onChange({ ...block, level: lvl })}
                              className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${block.level === lvl ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                              H{lvl}
                        </button>
                  ))}
            </div>
            <input
                  type="text"
                  value={block.content || ''}
                  onChange={(e) => onChange({ ...block, content: e.target.value })}
                  placeholder={`Heading ${block.level || 2} text…`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
      </div>
)

// ══════════════════════════════════════════════════════════════════════════════
// Table Block
// ══════════════════════════════════════════════════════════════════════════════
const TableBlock = ({ block, onChange }) => {
      const cols = block.columns || ['Field', 'Value']
      const rows = block.rows || [['', '']]

      const setCell = (ri, ci, val) => {
            const newRows = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r)
            onChange({ ...block, rows: newRows })
      }
      const setHeader = (ci, val) => {
            const newCols = cols.map((c, i) => i === ci ? val : c)
            onChange({ ...block, columns: newCols })
      }
      const addRow = () => onChange({ ...block, rows: [...rows, cols.map(() => '')] })
      const delRow = (ri) => onChange({ ...block, rows: rows.filter((_, i) => i !== ri) })
      const addCol = () => {
            onChange({ ...block, columns: [...cols, `Col ${cols.length + 1}`], rows: rows.map((r) => [...r, '']) })
      }
      const delCol = (ci) => {
            onChange({ ...block, columns: cols.filter((_, i) => i !== ci), rows: rows.map((r) => r.filter((_, i) => i !== ci)) })
      }

      return (
            <div className="space-y-3">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                              <thead>
                                    <tr className="bg-gray-50">
                                          {cols.map((col, ci) => (
                                                <th key={ci} className="border border-gray-200 p-0">
                                                      <div className="flex items-center">
                                                            <input
                                                                  value={col}
                                                                  onChange={(e) => setHeader(ci, e.target.value)}
                                                                  className="flex-1 px-2 py-1.5 bg-transparent font-semibold text-gray-700 text-xs focus:outline-none focus:bg-blue-50"
                                                                  placeholder={`Column ${ci + 1}`}
                                                            />
                                                            {cols.length > 1 && (
                                                                  <button type="button" onClick={() => delCol(ci)} className="px-1 text-gray-400 hover:text-red-500">
                                                                        <X size={12} />
                                                                  </button>
                                                            )}
                                                      </div>
                                                </th>
                                          ))}
                                          <th className="border border-gray-200 p-1 w-8">
                                                <button type="button" onClick={addCol} title="Add column" className="text-blue-500 hover:text-blue-700 text-xs font-bold">+</button>
                                          </th>
                                    </tr>
                              </thead>
                              <tbody>
                                    {rows.map((row, ri) => (
                                          <tr key={ri} className="hover:bg-gray-50">
                                                {row.map((cell, ci) => (
                                                      <td key={ci} className="border border-gray-200 p-0">
                                                            <input
                                                                  value={cell}
                                                                  onChange={(e) => setCell(ri, ci, e.target.value)}
                                                                  className="w-full px-2 py-1.5 bg-transparent text-gray-800 text-xs focus:outline-none focus:bg-blue-50"
                                                                  placeholder="…"
                                                            />
                                                      </td>
                                                ))}
                                                <td className="border border-gray-200 p-1 w-8">
                                                      {rows.length > 1 && (
                                                            <button type="button" onClick={() => delRow(ri)} className="text-gray-400 hover:text-red-500">
                                                                  <X size={12} />
                                                            </button>
                                                      )}
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
                  <button type="button" onClick={addRow}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <Plus size={13} /> Add Row
                  </button>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Image Block
// ══════════════════════════════════════════════════════════════════════════════
const ImageBlock = ({ block, onChange }) => {
      const fileRef = useRef(null)

      const handleFile = (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            // Validate: image only
            if (!file.type.startsWith('image/')) {
                  alert('Only image files are allowed.')
                  return
            }
            if (file.size > 5 * 1024 * 1024) {
                  alert('Image must be under 5 MB.')
                  return
            }
            const reader = new FileReader()
            reader.onload = (ev) => onChange({ ...block, url: ev.target.result, fileName: file.name })
            reader.readAsDataURL(file)
      }

      return (
            <div className="space-y-3">
                  {block.url ? (
                        <div className="relative">
                              <img src={block.url} alt={block.alt || 'Preview'} className="max-h-56 rounded-lg border border-gray-200 object-contain w-full bg-gray-50" />
                              <button type="button" onClick={() => onChange({ ...block, url: '', fileName: '' })}
                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-red-500 hover:text-red-700">
                                    <X size={14} />
                              </button>
                        </div>
                  ) : (
                        <div
                              onClick={() => fileRef.current?.click()}
                              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                              <Image size={28} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">Click to upload image</p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP — max 5 MB</p>
                              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                        <input
                              type="text"
                              value={block.caption || ''}
                              onChange={(e) => onChange({ ...block, caption: e.target.value })}
                              placeholder="Caption (optional)"
                              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                              type="text"
                              value={block.alt || ''}
                              onChange={(e) => onChange({ ...block, alt: e.target.value })}
                              placeholder="Alt text (optional)"
                              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                  </div>
                  {/* Also allow URL input */}
                  <input
                        type="url"
                        value={block.url?.startsWith('data:') ? '' : (block.url || '')}
                        onChange={(e) => onChange({ ...block, url: e.target.value })}
                        placeholder="Or paste image URL…"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Block Wrapper (card + controls)
// ══════════════════════════════════════════════════════════════════════════════
const BLOCK_ICONS = { text: AlignLeft, heading: Heading, table: Table2, image: Image }
const BLOCK_LABELS = { text: 'Text', heading: 'Heading', table: 'Table', image: 'Image' }

const BlockCard = ({ block, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
      const Icon = BLOCK_ICONS[block.type] || AlignLeft

      return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Block header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Icon size={15} className="text-blue-500" />
                              {BLOCK_LABELS[block.type]}
                        </div>
                        <div className="flex items-center gap-1">
                              <button type="button" onClick={onMoveUp} disabled={index === 0}
                                    title="Move up"
                                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                                    <ChevronUp size={15} />
                              </button>
                              <button type="button" onClick={onMoveDown} disabled={index === total - 1}
                                    title="Move down"
                                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                                    <ChevronDown size={15} />
                              </button>
                              <button type="button" onClick={onDelete}
                                    title="Delete block"
                                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <Trash2 size={15} />
                              </button>
                        </div>
                  </div>
                  {/* Block content */}
                  <div className="p-4">
                        {block.type === 'text' && <TextBlock block={block} onChange={onUpdate} />}
                        {block.type === 'heading' && <HeadingBlock block={block} onChange={onUpdate} />}
                        {block.type === 'table' && <TableBlock block={block} onChange={onUpdate} />}
                        {block.type === 'image' && <ImageBlock block={block} onChange={onUpdate} />}
                  </div>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Add Block Menu
// ══════════════════════════════════════════════════════════════════════════════
const ADD_TYPES = [
      { type: 'text', icon: AlignLeft, label: 'Text', desc: 'Rich paragraph' },
      { type: 'heading', icon: Heading, label: 'Heading', desc: 'H1 / H2 / H3' },
      { type: 'table', icon: Table2, label: 'Table', desc: 'Rows & columns' },
      { type: 'image', icon: Image, label: 'Image', desc: 'Upload or URL' },
]

const AddBlockMenu = ({ onAdd }) => {
      const [open, setOpen] = useState(false)

      const add = (type) => {
            const base = { id: uid(), type }
            const defaults = {
                  text: { content: '' },
                  heading: { content: '', level: 2 },
                  table: { columns: ['Field', 'Details'], rows: [['', ''], ['', '']] },
                  image: { url: '', alt: '', caption: '' },
            }
            onAdd({ ...base, ...defaults[type] })
            setOpen(false)
      }

      return (
            <div className="relative">
                  <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm font-semibold w-full justify-center"
                  >
                        <Plus size={16} /> Add Content Block
                  </button>
                  {open && (
                        <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-20 grid grid-cols-2 gap-2">
                                    {ADD_TYPES.map(({ type, icon: Icon, label, desc }) => (
                                          <button
                                                key={type}
                                                type="button"
                                                onClick={() => add(type)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-left transition-colors"
                                          >
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                      <Icon size={16} className="text-blue-600" />
                                                </div>
                                                <div>
                                                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                                                      <p className="text-xs text-gray-500">{desc}</p>
                                                </div>
                                          </button>
                                    ))}
                              </div>
                        </>
                  )}
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// ContentBuilder — main export
// ══════════════════════════════════════════════════════════════════════════════
/**
 * Props:
 *   value: string  — JSON string like '{"blocks":[...]}'
 *   onChange: (jsonString) => void
 */
const ContentBuilder = ({ value, onChange }) => {
      const parsed = (() => {
            try { return JSON.parse(value || '{"blocks":[]}') } catch { return { blocks: [] } }
      })()
      const blocks = parsed.blocks || []

      const emit = useCallback((newBlocks) => {
            onChange(JSON.stringify({ blocks: newBlocks }))
      }, [onChange])

      const addBlock = (block) => emit([...blocks, block])

      const updateBlock = (id, updated) =>
            emit(blocks.map((b) => b.id === id ? updated : b))

      const deleteBlock = (id) => emit(blocks.filter((b) => b.id !== id))

      const moveUp = (index) => {
            if (index === 0) return
            const nb = [...blocks]
                  ;[nb[index - 1], nb[index]] = [nb[index], nb[index - 1]]
            emit(nb)
      }

      const moveDown = (index) => {
            if (index === blocks.length - 1) return
            const nb = [...blocks]
                  ;[nb[index], nb[index + 1]] = [nb[index + 1], nb[index]]
            emit(nb)
      }

      return (
            <div className="space-y-3">
                  {blocks.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                              No content yet. Click "Add Content Block" below to start.
                        </div>
                  )}
                  {blocks.map((block, index) => (
                        <BlockCard
                              key={block.id}
                              block={block}
                              index={index}
                              total={blocks.length}
                              onUpdate={(updated) => updateBlock(block.id, updated)}
                              onDelete={() => deleteBlock(block.id)}
                              onMoveUp={() => moveUp(index)}
                              onMoveDown={() => moveDown(index)}
                        />
                  ))}
                  <AddBlockMenu onAdd={addBlock} />
            </div>
      )
}

export default ContentBuilder
