/**
 * PageBuilder — Full visual job page builder.
 * 3-column layout: Library | Canvas | Properties
 * Uses @dnd-kit for drag-and-drop.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
      DndContext, DragOverlay, closestCenter,
      PointerSensor, useSensor, useSensors,
      MeasuringStrategy
} from '@dnd-kit/core'
import {
      SortableContext, verticalListSortingStrategy,
      useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { adminGetPost, adminCreatePost, adminUpdatePost } from '../../services/api.js'
import ElementLibrary from '../../components/builder/ElementLibrary.jsx'
import PropertiesPanel from '../../components/builder/PropertiesPanel.jsx'
import ElementRenderer from '../../components/builder/ElementRenderer.jsx'
import { uid, defaultElement, defaultSection, deepClone, updateElement, removeElement } from '../../components/builder/builderUtils.js'

import {
      Save, Eye, Send, ArrowLeft, Plus, Trash2, Copy,
      ChevronUp, ChevronDown, GripVertical, Loader2,
      Undo2, Redo2, Monitor, Tablet, Smartphone, MoreHorizontal,
      EyeOff, AlertCircle, CheckCircle
} from 'lucide-react'

// ── Rich text editor (inline contentEditable) ─────────────────────────────────
const InlineRichEditor = ({ value, onChange }) => {
      const ref = useRef(null)
      const exec = (cmd, val = null) => { ref.current?.focus(); document.execCommand(cmd, false, val) }
      const handleInput = () => onChange(ref.current?.innerHTML || '')

      return (
            <div className="border border-blue-300 rounded-lg overflow-hidden">
                  <div className="flex flex-wrap gap-0.5 p-1.5 bg-gray-50 border-b border-gray-200">
                        {[
                              { cmd: 'bold', label: 'B', cls: 'font-bold' },
                              { cmd: 'italic', label: 'I', cls: 'italic' },
                              { cmd: 'underline', label: 'U', cls: 'underline' },
                              { cmd: 'insertUnorderedList', label: '•' },
                              { cmd: 'insertOrderedList', label: '1.' },
                              { cmd: 'justifyLeft', label: '←' },
                              { cmd: 'justifyCenter', label: '↔' },
                              { cmd: 'justifyRight', label: '→' },
                        ].map(({ cmd, label, cls }) => (
                              <button key={cmd} type="button" onMouseDown={(e) => { e.preventDefault(); exec(cmd) }}
                                    className={`px-2 py-1 text-xs rounded hover:bg-gray-200 ${cls || ''}`}>
                                    {label}
                              </button>
                        ))}
                  </div>
                  <div
                        ref={ref}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        dangerouslySetInnerHTML={{ __html: value || '' }}
                        className="p-3 min-h-[80px] text-sm focus:outline-none"
                  />
            </div>
      )
}

// ── Inline element editing ────────────────────────────────────────────────────
const InlineEditor = ({ el, onChange }) => {
      if (el.type === 'heading' || el.type === 'subheading') {
            return (
                  <input
                        type="text"
                        value={el.content?.text || ''}
                        onChange={(e) => onChange({ ...el, content: { ...el.content, text: e.target.value } })}
                        className="w-full bg-transparent border-b-2 border-blue-400 focus:outline-none font-bold text-inherit py-1"
                        style={{ fontSize: 'inherit', color: 'inherit', textAlign: el.style?.textAlign }}
                        onClick={(e) => e.stopPropagation()}
                  />
            )
      }
      if (el.type === 'paragraph' || el.type === 'richtext' || el.type === 'blank') {
            return (
                  <InlineRichEditor
                        value={el.content?.html || ''}
                        onChange={(html) => onChange({ ...el, content: { ...el.content, html } })}
                  />
            )
      }
      return null
}

// ── Sortable Element on Canvas ────────────────────────────────────────────────
const CanvasElement = ({ el, sectionId, selected, onSelect, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, depth = 0 }) => {
      const [editing, setEditing] = useState(false)
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: el.id,
            data: { type: 'element', sectionId, elementId: el.id }
      })

      const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.3 : 1,
      }

      const isSelected = selected === el.id
      const hasChildren = el.children && Array.isArray(el.children)

      const renderInlineChildren = (children) => (
            <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mt-2 pl-2 border-l-2 border-blue-100">
                        {children.map((child, idx) => (
                              <CanvasElement
                                    key={child.id}
                                    el={child}
                                    sectionId={sectionId}
                                    selected={selected}
                                    onSelect={onSelect}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                    onDuplicate={onDuplicate}
                                    onMoveUp={onMoveUp}
                                    onMoveDown={onMoveDown}
                                    isFirst={idx === 0}
                                    isLast={idx === children.length - 1}
                                    depth={depth + 1}
                              />
                        ))}
                  </div>
            </SortableContext>
      )

      return (
            <div ref={setNodeRef} style={style}
                  className={`group relative rounded-lg border-2 transition-all duration-150 ${isSelected ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-blue-200'}`}
                  onClick={(e) => { e.stopPropagation(); onSelect(el.id) }}
            >
                  {/* Element content */}
                  <div className="p-2">
                        {editing ? (
                              <InlineEditor el={el} onChange={(updated) => { onUpdate(el.id, () => updated); setEditing(false) }} />
                        ) : (
                              <ElementRenderer el={el} renderChildren={hasChildren ? renderInlineChildren : undefined} />
                        )}
                  </div>

                  {/* Toolbar — visible on hover/select */}
                  {isSelected && (
                        <div className="absolute -top-8 left-0 z-20 flex items-center gap-0.5 bg-blue-600 text-white rounded-t-lg px-1 py-1 shadow-lg"
                              onClick={(e) => e.stopPropagation()}>
                              {/* Drag handle */}
                              <span {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-blue-500 rounded" title="Drag">
                                    <GripVertical size={13} />
                              </span>
                              <div className="w-px bg-blue-400 h-4" />
                              {/* Edit inline (for text elements) */}
                              {(el.type === 'heading' || el.type === 'subheading' || el.type === 'paragraph' || el.type === 'richtext' || el.type === 'blank') && (
                                    <button onClick={() => setEditing(!editing)} className="p-1 hover:bg-blue-500 rounded text-xs font-medium px-2">
                                          {editing ? 'Done' : 'Edit'}
                                    </button>
                              )}
                              <button onClick={() => onMoveUp(el.id, sectionId)} disabled={isFirst} className="p-1 hover:bg-blue-500 rounded disabled:opacity-30" title="Move up">
                                    <ChevronUp size={13} />
                              </button>
                              <button onClick={() => onMoveDown(el.id, sectionId)} disabled={isLast} className="p-1 hover:bg-blue-500 rounded disabled:opacity-30" title="Move down">
                                    <ChevronDown size={13} />
                              </button>
                              <button onClick={() => onDuplicate(el.id, sectionId)} className="p-1 hover:bg-blue-500 rounded" title="Duplicate">
                                    <Copy size={13} />
                              </button>
                              <button onClick={() => onDelete(el.id, sectionId)} className="p-1 hover:bg-red-500 rounded" title="Delete">
                                    <Trash2 size={13} />
                              </button>
                        </div>
                  )}
            </div>
      )
}

// ── Sortable Section ──────────────────────────────────────────────────────────
const CanvasSection = ({ section, selectedEl, selectedSec, onSelectEl, onSelectSec, onUpdateEl, onDeleteEl, onDuplicateEl, onMoveElUp, onMoveElDown, onDeleteSec, onDuplicateSec, onAddElement, onUpdateSection }) => {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
            id: section.id,
            data: { type: 'section' }
      })
      const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
      const isSelected = selectedSec === section.id

      const secStyle = {
            backgroundColor: section.style?.backgroundColor || '#ffffff',
            paddingTop: section.style?.paddingTop ?? 32,
            paddingRight: section.style?.paddingRight ?? 32,
            paddingBottom: section.style?.paddingBottom ?? 32,
            paddingLeft: section.style?.paddingLeft ?? 32,
            marginTop: section.style?.marginTop ?? 0,
            marginBottom: section.style?.marginBottom ?? 16,
            gap: section.style?.gap ?? 16,
            minHeight: section.style?.minHeight || undefined,
            borderWidth: section.style?.borderWidth,
            borderStyle: section.style?.borderWidth ? 'solid' : undefined,
            borderColor: section.style?.borderColor,
            borderRadius: section.style?.borderRadius,
      }

      if (section.hidden) return null

      return (
            <div ref={setNodeRef} style={style}
                  className={`relative rounded-xl border-2 transition-colors ${isSelected ? 'border-blue-400' : 'border-transparent hover:border-gray-300'}`}
                  onClick={(e) => { e.stopPropagation(); onSelectSec(section.id) }}
            >
                  {/* Section header */}
                  <div className="absolute -top-5 left-2 z-10 flex items-center gap-1">
                        <span {...attributes} {...listeners}
                              className="cursor-grab bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 hover:bg-gray-800">
                              <GripVertical size={11} /> {section.name}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteSec(section.id) }}
                              className="bg-red-500 text-white rounded p-0.5 hover:bg-red-600">
                              <Trash2 size={10} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDuplicateSec(section.id) }}
                              className="bg-gray-500 text-white rounded p-0.5 hover:bg-gray-600">
                              <Copy size={10} />
                        </button>
                  </div>

                  {/* Elements */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: secStyle.gap, ...secStyle }}>
                        <SortableContext items={section.children.map((el) => el.id)} strategy={verticalListSortingStrategy}>
                              {section.children.length === 0 ? (
                                    <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm hover:border-blue-300 hover:text-blue-400 transition-colors cursor-pointer"
                                          onDragOver={(e) => e.preventDefault()}
                                    >
                                          <p className="font-medium">Drag elements here</p>
                                          <p className="text-xs mt-1">or use the + button below</p>
                                    </div>
                              ) : (
                                    section.children.map((el, idx) => (
                                          <CanvasElement
                                                key={el.id}
                                                el={el}
                                                sectionId={section.id}
                                                selected={selectedEl}
                                                onSelect={onSelectEl}
                                                onUpdate={onUpdateEl}
                                                onDelete={onDeleteEl}
                                                onDuplicate={onDuplicateEl}
                                                onMoveUp={onMoveElUp}
                                                onMoveDown={onMoveElDown}
                                                isFirst={idx === 0}
                                                isLast={idx === section.children.length - 1}
                                          />
                                    ))
                              )}
                        </SortableContext>
                  </div>

                  {/* Add element button */}
                  <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative group/addbtn">
                              <button
                                    onClick={() => onAddElement(section.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-colors bg-white"
                              >
                                    <Plus size={12} /> Add Element
                              </button>
                        </div>
                  </div>
            </div>
      )
}

// ── Add Element Modal ─────────────────────────────────────────────────────────
const ADD_TYPES = [
      { type: 'heading', label: 'Heading' }, { type: 'paragraph', label: 'Paragraph' },
      { type: 'richtext', label: 'Rich Text' }, { type: 'image', label: 'Image' },
      { type: 'table', label: 'Table' }, { type: 'button', label: 'Button' },
      { type: 'applybutton', label: 'Apply Button' }, { type: 'notice', label: 'Notice' },
      { type: 'warning', label: 'Warning' }, { type: 'highlight', label: 'Highlight' },
      { type: 'faq', label: 'FAQ' }, { type: 'divider', label: 'Divider' },
      { type: 'spacer', label: 'Spacer' }, { type: 'pdf', label: 'PDF' },
      { type: 'blank', label: 'Blank Block' }, { type: 'container', label: 'Container' },
]

const AddElementModal = ({ sectionId, onAdd, onClose }) => (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900 mb-4">Add Element</h3>
                  <div className="grid grid-cols-3 gap-2">
                        {ADD_TYPES.map(({ type, label }) => (
                              <button key={type} onClick={() => { onAdd(sectionId, type); onClose() }}
                                    className="px-3 py-2.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-left">
                                    {label}
                              </button>
                        ))}
                  </div>
                  <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
      </div>
)

// ── Preview Mode ──────────────────────────────────────────────────────────────
const PreviewMode = ({ sections, viewport, onClose }) => {
      const widths = { desktop: '100%', tablet: '768px', mobile: '375px' }

      const renderTree = (children) => children.map((el) => (
            <div key={el.id} className="mb-2">
                  <ElementRenderer el={el} renderChildren={el.children ? renderTree : undefined} />
            </div>
      ))

      return (
            <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white">
                        <button onClick={onClose} className="flex items-center gap-2 text-sm hover:text-gray-300">
                              <ArrowLeft size={16} /> Back to Editor
                        </button>
                        <p className="text-sm font-medium">Preview</p>
                        <div className="text-xs text-gray-400 capitalize">{viewport}</div>
                  </div>
                  <div className="flex-1 bg-gray-200 overflow-auto p-6 flex justify-center">
                        <div style={{ width: widths[viewport], maxWidth: '100%' }} className="bg-white min-h-full shadow-xl rounded-lg overflow-hidden">
                              {sections.filter((s) => !s.hidden).map((sec) => (
                                    <div key={sec.id} style={{
                                          backgroundColor: sec.style?.backgroundColor || '#fff',
                                          padding: `${sec.style?.paddingTop ?? 32}px ${sec.style?.paddingRight ?? 32}px ${sec.style?.paddingBottom ?? 32}px ${sec.style?.paddingLeft ?? 32}px`,
                                          display: 'flex', flexDirection: 'column', gap: `${sec.style?.gap ?? 16}px`
                                    }}>
                                          {renderTree(sec.children)}
                                    </div>
                              ))}
                        </div>
                  </div>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// PageBuilder — main
// ══════════════════════════════════════════════════════════════════════════════
const MAX_HISTORY = 50

const PageBuilder = () => {
      const { id: jobId } = useParams()
      const navigate = useNavigate()
      const isEdit = !!jobId

      // ── State ────────────────────────────────────────────────────────────────
      const [sections, setSections] = useState([])
      const [jobMeta, setJobMeta] = useState({ title: '', type: 'GOVERNMENT', status: 'DRAFT' })
      const [selectedEl, setSelectedEl] = useState(null)
      const [selectedSec, setSelectedSec] = useState(null)
      const [addModalSec, setAddModalSec] = useState(null)
      const [preview, setPreview] = useState(false)
      const [viewport, setViewport] = useState('desktop')
      const [saving, setSaving] = useState(false)
      const [saveStatus, setSaveStatus] = useState(null) // 'saved' | 'error' | null
      const [loading, setLoading] = useState(isEdit)
      const [loadError, setLoadError] = useState('')
      const [activeId, setActiveId] = useState(null)

      // Undo/Redo
      const history = useRef([])
      const historyIndex = useRef(-1)

      const pushHistory = useCallback((newSections) => {
            const clone = deepClone(newSections)
            // Truncate forward history
            history.current = history.current.slice(0, historyIndex.current + 1)
            history.current.push(clone)
            if (history.current.length > MAX_HISTORY) history.current.shift()
            historyIndex.current = history.current.length - 1
      }, [])

      const undo = () => {
            if (historyIndex.current <= 0) return
            historyIndex.current--
            setSections(deepClone(history.current[historyIndex.current]))
      }

      const redo = () => {
            if (historyIndex.current >= history.current.length - 1) return
            historyIndex.current++
            setSections(deepClone(history.current[historyIndex.current]))
      }

      const update = useCallback((newSecs) => {
            setSections(newSecs)
            pushHistory(newSecs)
      }, [pushHistory])

      // ── Load job ──────────────────────────────────────────────────────────────
      useEffect(() => {
            if (!isEdit) {
                  // Start blank
                  const initial = []
                  setSections(initial)
                  pushHistory(initial)
                  return
            }
            setLoading(true)
            adminGetPost(jobId)
                  .then((res) => {
                        const job = res.data
                        setJobMeta({ title: job.title || '', type: job.type || 'GOVERNMENT', status: job.status || 'DRAFT' })
                        // Parse pageLayout from contentBlocks
                        try {
                              const parsed = JSON.parse(job.contentBlocks || '{"sections":[]}')
                              const secs = parsed.sections || []
                              setSections(secs)
                              pushHistory(secs)
                        } catch {
                              setSections([])
                              pushHistory([])
                        }
                  })
                  .catch(() => setLoadError('Failed to load job. Please try again.'))
                  .finally(() => setLoading(false))
      }, [jobId, isEdit])

      // ── Autosave ──────────────────────────────────────────────────────────────
      const autosaveTimer = useRef(null)
      const triggerAutosave = useCallback((secs, meta) => {
            clearTimeout(autosaveTimer.current)
            autosaveTimer.current = setTimeout(async () => {
                  if (!isEdit) return
                  try {
                        const payload = buildPayload(secs, meta, meta.status)
                        await adminUpdatePost(jobId, payload)
                        setSaveStatus('saved')
                        setTimeout(() => setSaveStatus(null), 3000)
                  } catch {
                        setSaveStatus('error')
                  }
            }, 3000)
      }, [isEdit, jobId])

      useEffect(() => {
            if (sections.length > 0) triggerAutosave(sections, jobMeta)
      }, [sections, jobMeta])

      // ── Keyboard shortcuts ────────────────────────────────────────────────────
      useEffect(() => {
            const handler = (e) => {
                  const ctrl = e.ctrlKey || e.metaKey
                  if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
                  if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
                  if (e.key === 'Escape') { setSelectedEl(null); setSelectedSec(null) }
            }
            window.addEventListener('keydown', handler)
            return () => window.removeEventListener('keydown', handler)
      }, [])

      // ── Build API payload ─────────────────────────────────────────────────────
      const buildPayload = (secs, meta, status) => ({
            title: meta.title || 'Untitled Job',
            type: meta.type || 'GOVERNMENT',
            organization: meta.organization || 'N/A',
            location: meta.location || '',
            qualification: meta.qualification || '',
            status: status || 'DRAFT',
            contentBlocks: JSON.stringify({ sections: secs }),
            isFeatured: meta.isFeatured || false,
      })

      // ── Save ──────────────────────────────────────────────────────────────────
      const save = async (status) => {
            if (!jobMeta.title?.trim()) { alert('Please enter a job title.'); return }
            setSaving(true)
            try {
                  const payload = buildPayload(sections, jobMeta, status)
                  if (isEdit) {
                        await adminUpdatePost(jobId, payload)
                  } else {
                        const res = await adminCreatePost(payload)
                        navigate(`/admin/builder/${res.data.id}/edit`, { replace: true })
                  }
                  setSaveStatus('saved')
                  setTimeout(() => setSaveStatus(null), 3000)
            } catch (err) {
                  setSaveStatus('error')
                  alert(err?.response?.data?.message || 'Save failed.')
            } finally {
                  setSaving(false)
            }
      }

      // ── Section operations ────────────────────────────────────────────────────
      const addSection = () => {
            const sec = defaultSection()
            const newSecs = [...sections, sec]
            update(newSecs)
            setSelectedSec(sec.id)
            setSelectedEl(null)
      }

      const deleteSection = (id) => {
            if (!window.confirm('Delete this section?')) return
            update(sections.filter((s) => s.id !== id))
            if (selectedSec === id) setSelectedSec(null)
      }

      const duplicateSection = (id) => {
            const idx = sections.findIndex((s) => s.id === id)
            if (idx === -1) return
            const clone = deepClone(sections[idx])
            // Re-id everything
            clone.id = uid()
            clone.name = clone.name + ' (copy)'
            const reId = (el) => ({ ...el, id: uid(), children: el.children ? el.children.map(reId) : undefined })
            clone.children = clone.children.map(reId)
            const newSecs = [...sections.slice(0, idx + 1), clone, ...sections.slice(idx + 1)]
            update(newSecs)
      }

      const updateSection = (id, partial) => {
            update(sections.map((s) => s.id === id ? { ...s, ...partial } : s))
      }

      // ── Element operations ────────────────────────────────────────────────────
      const addElement = (sectionId, type) => {
            const el = defaultElement(type)
            update(sections.map((s) =>
                  s.id === sectionId ? { ...s, children: [...s.children, el] } : s
            ))
            setSelectedEl(el.id)
      }

      const updateElInSections = useCallback((elId, updater) => {
            update(sections.map((s) => ({
                  ...s,
                  children: updateElement(s.children, elId, updater)
            })))
      }, [sections, update])

      const deleteElFromSections = (elId) => {
            update(sections.map((s) => {
                  const [newChildren] = removeElement(s.children, elId)
                  return { ...s, children: newChildren }
            }))
            if (selectedEl === elId) setSelectedEl(null)
      }

      const duplicateEl = (elId, sectionId) => {
            const sec = sections.find((s) => s.id === sectionId)
            if (!sec) return
            const reId = (el) => ({ ...deepClone(el), id: uid(), children: el.children ? el.children.map(reId) : undefined })
            const idx = sec.children.findIndex((e) => e.id === elId)
            if (idx === -1) return
            const clone = reId(sec.children[idx])
            const newChildren = [...sec.children.slice(0, idx + 1), clone, ...sec.children.slice(idx + 1)]
            update(sections.map((s) => s.id === sectionId ? { ...s, children: newChildren } : s))
      }

      const moveEl = (elId, sectionId, dir) => {
            const sec = sections.find((s) => s.id === sectionId)
            if (!sec) return
            const idx = sec.children.findIndex((e) => e.id === elId)
            const newIdx = dir === 'up' ? idx - 1 : idx + 1
            if (newIdx < 0 || newIdx >= sec.children.length) return
            const newChildren = arrayMove(sec.children, idx, newIdx)
            update(sections.map((s) => s.id === sectionId ? { ...s, children: newChildren } : s))
      }

      // ── DnD ───────────────────────────────────────────────────────────────────
      const sensors = useSensors(
            useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
      )

      const handleDragStart = ({ active }) => setActiveId(active.id)

      const handleDragEnd = ({ active, over }) => {
            setActiveId(null)
            if (!over || active.id === over.id) return

            const activeData = active.data.current
            const overData = over.data.current

            // From library → section
            if (activeData?.fromLibrary) {
                  const targetSectionId = overData?.sectionId || over.id
                  const sec = sections.find((s) => s.id === targetSectionId)
                  if (sec) addElement(targetSectionId, activeData.elementType)
                  return
            }

            // Section reorder
            if (activeData?.type === 'section' && overData?.type === 'section') {
                  const oldIdx = sections.findIndex((s) => s.id === active.id)
                  const newIdx = sections.findIndex((s) => s.id === over.id)
                  if (oldIdx !== -1 && newIdx !== -1) update(arrayMove(sections, oldIdx, newIdx))
                  return
            }

            // Element reorder within same section
            if (activeData?.type === 'element' && overData?.type === 'element') {
                  const activeSec = activeData.sectionId
                  const overSec = overData.sectionId
                  if (activeSec === overSec) {
                        const sec = sections.find((s) => s.id === activeSec)
                        if (!sec) return
                        const oldIdx = sec.children.findIndex((e) => e.id === active.id)
                        const newIdx = sec.children.findIndex((e) => e.id === over.id)
                        if (oldIdx !== -1 && newIdx !== -1) {
                              update(sections.map((s) => s.id === activeSec ? { ...s, children: arrayMove(s.children, oldIdx, newIdx) } : s))
                        }
                  }
            }
      }

      // ── Render ────────────────────────────────────────────────────────────────
      if (loading) return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
      )

      if (loadError) return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="bg-white rounded-xl p-8 text-center shadow">
                        <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
                        <p className="text-red-600 font-medium">{loadError}</p>
                        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Go back</button>
                  </div>
            </div>
      )

      if (preview) return <PreviewMode sections={sections} viewport={viewport} onClose={() => setPreview(false)} />

      return (
            <DndContext sensors={sensors} collisionDetection={closestCenter}
                  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                  onDragStart={handleDragStart} onDragEnd={handleDragEnd}
            >
                  <div className="min-h-screen bg-gray-100 flex flex-col" onClick={() => { setSelectedEl(null); setSelectedSec(null) }}>

                        {/* ── Top Bar ── */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm z-30 sticky top-0">
                              <div className="flex items-center gap-3">
                                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                                          <ArrowLeft size={18} />
                                    </button>
                                    <input
                                          type="text"
                                          value={jobMeta.title}
                                          onChange={(e) => setJobMeta((m) => ({ ...m, title: e.target.value }))}
                                          placeholder="Job Title…"
                                          className="font-semibold text-gray-900 bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none px-1 py-0.5 text-sm w-64"
                                    />
                              </div>

                              <div className="flex items-center gap-2">
                                    {/* Undo/Redo */}
                                    <button onClick={undo} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                                          <Undo2 size={16} />
                                    </button>
                                    <button onClick={redo} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                                          <Redo2 size={16} />
                                    </button>

                                    <div className="w-px bg-gray-200 h-5" />

                                    {/* Viewport */}
                                    {[
                                          { key: 'desktop', icon: Monitor },
                                          { key: 'tablet', icon: Tablet },
                                          { key: 'mobile', icon: Smartphone },
                                    ].map(({ key, icon: Icon }) => (
                                          <button key={key} onClick={() => setViewport(key)}
                                                className={`p-1.5 rounded-lg transition-colors ${viewport === key ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                                title={key}>
                                                <Icon size={16} />
                                          </button>
                                    ))}

                                    <div className="w-px bg-gray-200 h-5" />

                                    {/* Save status */}
                                    {saveStatus === 'saved' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={13} /> Saved</span>}
                                    {saveStatus === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={13} /> Save failed</span>}
                                    {saving && <span className="text-xs text-gray-500 flex items-center gap-1"><Loader2 size={13} className="animate-spin" /> Saving…</span>}

                                    <button onClick={() => setPreview(true)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                          <Eye size={15} /> Preview
                                    </button>

                                    <button onClick={() => save('DRAFT')} disabled={saving}
                                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                                          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Draft
                                    </button>

                                    <button onClick={() => save('PUBLISHED')} disabled={saving}
                                          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 font-semibold">
                                          {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publish
                                    </button>
                              </div>
                        </div>

                        {/* ── 3-Column Layout ── */}
                        <div className="flex flex-1 overflow-hidden">

                              {/* Left — Element Library */}
                              <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
                                    <div className="px-3 py-2.5 border-b border-gray-100">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Elements</p>
                                    </div>
                                    <ElementLibrary />
                              </div>

                              {/* Center — Canvas */}
                              <div className="flex-1 overflow-auto bg-gray-100 p-6"
                                    onClick={(e) => { e.stopPropagation(); setSelectedEl(null); setSelectedSec(null) }}>

                                    {/* Job type bar */}
                                    <div className="max-w-4xl mx-auto mb-4 flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                                          <select value={jobMeta.type} onChange={(e) => setJobMeta((m) => ({ ...m, type: e.target.value }))}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                                {['GOVERNMENT', 'PRIVATE', 'INTERNSHIP', 'SCHOLARSHIP', 'HACKATHON', 'PLACEMENT_DRIVE', 'COURSE', 'TIME_TABLE', 'RESULT', 'ADMIT_CARD'].map((t) => (
                                                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                                ))}
                                          </select>
                                          <span className="text-xs text-gray-400">|</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${jobMeta.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {jobMeta.status}
                                          </span>
                                    </div>

                                    {/* Canvas area */}
                                    <div className="max-w-4xl mx-auto" style={{
                                          width: viewport === 'tablet' ? '768px' : viewport === 'mobile' ? '375px' : '100%',
                                          maxWidth: '100%'
                                    }}>
                                          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                                {sections.length === 0 ? (
                                                      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-20 text-center shadow-sm">
                                                            <div className="text-5xl mb-4">🏗️</div>
                                                            <h3 className="text-lg font-bold text-gray-700 mb-2">Start Building</h3>
                                                            <p className="text-gray-500 text-sm mb-6">Drag elements from the left panel, or click the button below</p>
                                                            <button onClick={addSection}
                                                                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                                                                  <Plus size={16} /> Add Section
                                                            </button>
                                                      </div>
                                                ) : (
                                                      <div className="space-y-6">
                                                            {sections.map((sec) => (
                                                                  <CanvasSection
                                                                        key={sec.id}
                                                                        section={sec}
                                                                        selectedEl={selectedEl}
                                                                        selectedSec={selectedSec}
                                                                        onSelectEl={(id) => { setSelectedEl(id); setSelectedSec(null) }}
                                                                        onSelectSec={(id) => { setSelectedSec(id); setSelectedEl(null) }}
                                                                        onUpdateEl={updateElInSections}
                                                                        onDeleteEl={deleteElFromSections}
                                                                        onDuplicateEl={duplicateEl}
                                                                        onMoveElUp={(id, sid) => moveEl(id, sid, 'up')}
                                                                        onMoveElDown={(id, sid) => moveEl(id, sid, 'down')}
                                                                        onDeleteSec={deleteSection}
                                                                        onDuplicateSec={duplicateSection}
                                                                        onAddElement={(sid) => setAddModalSec(sid)}
                                                                        onUpdateSection={updateSection}
                                                                  />
                                                            ))}
                                                      </div>
                                                )}
                                          </SortableContext>

                                          {/* Add Section button */}
                                          {sections.length > 0 && (
                                                <button onClick={addSection}
                                                      className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 rounded-xl transition-colors text-sm font-medium bg-white">
                                                      <Plus size={16} /> Add Section
                                                </button>
                                          )}
                                    </div>
                              </div>

                              {/* Right — Properties Panel */}
                              <div className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
                                    <div className="px-3 py-2.5 border-b border-gray-100">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Properties</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                          <PropertiesPanel
                                                selected={selectedEl}
                                                selectedSection={selectedSec}
                                                sections={sections}
                                                onUpdateElement={updateElInSections}
                                                onUpdateSection={updateSection}
                                          />
                                    </div>
                              </div>
                        </div>
                  </div>

                  {/* Add Element Modal */}
                  {addModalSec && (
                        <AddElementModal
                              sectionId={addModalSec}
                              onAdd={addElement}
                              onClose={() => setAddModalSec(null)}
                        />
                  )}

                  {/* Drag Overlay */}
                  <DragOverlay>
                        {activeId ? (
                              <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl text-xs font-medium text-blue-700 opacity-90">
                                    Moving element…
                              </div>
                        ) : null}
                  </DragOverlay>
            </DndContext>
      )
}

export default PageBuilder
