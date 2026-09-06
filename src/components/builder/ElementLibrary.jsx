import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
      Type, AlignLeft, Image, Table2, MousePointer2, Minus,
      ArrowUpDown, Info, AlertTriangle, Star, HelpCircle,
      FileDown, Layout, Columns, Square, Code, Heading1
} from 'lucide-react'

const CATEGORIES = [
      {
            label: 'Text',
            items: [
                  { type: 'heading', label: 'Heading', icon: Heading1, desc: 'H1–H6 heading' },
                  { type: 'subheading', label: 'Subheading', icon: Type, desc: 'Smaller heading' },
                  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, desc: 'Plain text' },
                  { type: 'richtext', label: 'Rich Text', icon: AlignLeft, desc: 'Formatted text' },
            ]
      },
      {
            label: 'Media',
            items: [
                  { type: 'image', label: 'Image', icon: Image, desc: 'Upload or URL' },
                  { type: 'pdf', label: 'PDF', icon: FileDown, desc: 'Document link' },
            ]
      },
      {
            label: 'Data',
            items: [
                  { type: 'table', label: 'Table', icon: Table2, desc: 'Rows & columns' },
            ]
      },
      {
            label: 'Information',
            items: [
                  { type: 'notice', label: 'Notice', icon: Info, desc: 'Info box' },
                  { type: 'warning', label: 'Warning', icon: AlertTriangle, desc: 'Warning box' },
                  { type: 'highlight', label: 'Highlight', icon: Star, desc: 'Success/highlight' },
                  { type: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Q&A accordion' },
            ]
      },
      {
            label: 'Actions',
            items: [
                  { type: 'button', label: 'Button', icon: MousePointer2, desc: 'Clickable button' },
                  { type: 'applybutton', label: 'Apply Button', icon: MousePointer2, desc: 'Apply now' },
            ]
      },
      {
            label: 'Layout',
            items: [
                  { type: 'container', label: 'Container', icon: Square, desc: 'Wrapper box' },
                  { type: 'columns', label: 'Columns', icon: Columns, desc: '2-column layout' },
                  { type: 'divider', label: 'Divider', icon: Minus, desc: 'Horizontal line' },
                  { type: 'spacer', label: 'Spacer', icon: ArrowUpDown, desc: 'Empty space' },
            ]
      },
      {
            label: 'Custom',
            items: [
                  { type: 'blank', label: 'Blank Block', icon: Code, desc: 'Custom content' },
            ]
      },
]

// A draggable library item
const LibraryItem = ({ item }) => {
      const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
            id: `library-${item.type}`,
            data: { fromLibrary: true, elementType: item.type }
      })
      const Icon = item.icon

      return (
            <div
                  ref={setNodeRef}
                  {...listeners}
                  {...attributes}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all select-none
        ${isDragging ? 'opacity-50 scale-95' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white'}`}
                  title={item.desc}
            >
                  <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </div>
      )
}

const ElementLibrary = () => {
      const [search, setSearch] = useState('')
      const [openCat, setOpenCat] = useState(null)

      const filtered = CATEGORIES.map((cat) => ({
            ...cat,
            items: cat.items.filter((i) =>
                  !search ||
                  i.label.toLowerCase().includes(search.toLowerCase()) ||
                  i.desc.toLowerCase().includes(search.toLowerCase())
            )
      })).filter((cat) => cat.items.length > 0)

      return (
            <div className="flex flex-col h-full">
                  {/* Search */}
                  <div className="p-3 border-b border-gray-200">
                        <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Search elements…"
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                  </div>

                  {/* Categories */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {filtered.map((cat) => (
                              <div key={cat.label}>
                                    <button
                                          onClick={() => setOpenCat(openCat === cat.label ? null : cat.label)}
                                          className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 hover:text-gray-700"
                                    >
                                          <span>{cat.label}</span>
                                          <span className="text-gray-400">{openCat === cat.label ? '−' : '+'}</span>
                                    </button>
                                    {(search || openCat === null || openCat === cat.label) && (
                                          <div className="space-y-1">
                                                {cat.items.map((item) => (
                                                      <LibraryItem key={item.type} item={item} />
                                                ))}
                                          </div>
                                    )}
                              </div>
                        ))}
                  </div>
            </div>
      )
}

export default ElementLibrary
