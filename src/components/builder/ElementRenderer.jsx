/**
 * ElementRenderer — renders a single element for the public page.
 * Also used inside the canvas for non-editing display.
 * NO admin controls here.
 */
import React, { useState } from 'react'
import { sanitizeHtml } from './builderUtils.js'
import { FileDown, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Info, CheckCircle, Star } from 'lucide-react'

// ── Heading ───────────────────────────────────────────────────────────────────
const HeadingEl = ({ el }) => {
      const tag = el.content?.level || 'h2'
      const style = {
            fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : undefined,
            fontWeight: el.style?.fontWeight,
            color: el.style?.color,
            textAlign: el.style?.textAlign,
            marginTop: el.style?.marginTop ? `${el.style.marginTop}px` : undefined,
            marginBottom: el.style?.marginBottom ? `${el.style.marginBottom}px` : undefined,
      }
      return React.createElement(tag, { style, className: 'leading-tight' }, el.content?.text || 'Heading')
}

// ── Paragraph / Rich Text ─────────────────────────────────────────────────────
const ParagraphEl = ({ el }) => {
      const style = {
            fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : undefined,
            color: el.style?.color,
            lineHeight: el.style?.lineHeight,
            textAlign: el.style?.textAlign,
      }
      const html = sanitizeHtml(el.content?.html || '<p></p>')
      return (
            <div
                  style={style}
                  className="prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: html }}
            />
      )
}

// ── Image ─────────────────────────────────────────────────────────────────────
const ImageEl = ({ el }) => {
      if (!el.content?.url) return (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
                  No image selected
            </div>
      )
      return (
            <figure className="m-0">
                  <img
                        src={el.content.url}
                        alt={el.content.alt || ''}
                        style={{
                              width: el.style?.width || '100%',
                              maxWidth: el.style?.maxWidth || '100%',
                              objectFit: el.style?.objectFit || 'cover',
                              borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : undefined,
                        }}
                        className="block"
                        loading="lazy"
                  />
                  {el.content.caption && (
                        <figcaption className="text-xs text-gray-500 text-center mt-2 italic">{el.content.caption}</figcaption>
                  )}
            </figure>
      )
}

// ── Table ─────────────────────────────────────────────────────────────────────
const TableEl = ({ el }) => {
      const cols = el.content?.columns || []
      const rows = el.content?.rows || []
      const hasHeader = el.content?.hasHeader !== false

      return (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: el.style?.borderColor || '#e5e7eb' }}>
                  <table className="w-full text-sm">
                        {hasHeader && cols.length > 0 && (
                              <thead>
                                    <tr style={{ backgroundColor: el.style?.headerBg || '#f9fafb' }}>
                                          {cols.map((col, i) => (
                                                <th key={i} className="px-4 py-3 text-left font-semibold border-b"
                                                      style={{ color: el.style?.headerColor || '#111827', borderColor: el.style?.borderColor || '#e5e7eb' }}>
                                                      {col}
                                                </th>
                                          ))}
                                    </tr>
                              </thead>
                        )}
                        <tbody>
                              {rows.map((row, ri) => (
                                    <tr key={ri} className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                          style={{ borderColor: el.style?.borderColor || '#e5e7eb' }}>
                                          {row.map((cell, ci) => (
                                                <td key={ci} className="px-4 py-3 text-gray-700" style={{ fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : undefined }}>
                                                      {cell}
                                                </td>
                                          ))}
                                    </tr>
                              ))}
                        </tbody>
                  </table>
            </div>
      )
}

// ── Button ────────────────────────────────────────────────────────────────────
const ButtonEl = ({ el }) => {
      const style = {
            backgroundColor: el.style?.backgroundColor || '#2563eb',
            color: el.style?.color || '#ffffff',
            fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : '14px',
            fontWeight: el.style?.fontWeight || 600,
            borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : '8px',
            padding: `${el.style?.paddingY || 10}px ${el.style?.paddingX || 20}px`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            cursor: 'pointer',
            border: 'none',
      }

      const content = (
            <>
                  {el.content?.text || 'Button'}
                  {el.content?.url && <ExternalLink size={13} />}
            </>
      )

      if (el.content?.url) {
            return (
                  <a href={el.content.url} target={el.content.target || '_blank'} rel="noopener noreferrer" style={style}>
                        {content}
                  </a>
            )
      }
      return <button style={style} type="button">{content}</button>
}

// ── Divider ───────────────────────────────────────────────────────────────────
const DividerEl = ({ el }) => (
      <hr style={{
            borderColor: el.style?.borderColor || '#e5e7eb',
            borderWidth: `${el.style?.borderWidth || 1}px 0 0`,
            marginTop: el.style?.marginY ? `${el.style.marginY}px` : '16px',
            marginBottom: el.style?.marginY ? `${el.style.marginY}px` : '16px',
      }} />
)

// ── Spacer ────────────────────────────────────────────────────────────────────
const SpacerEl = ({ el }) => (
      <div style={{ height: `${el.content?.height || 40}px` }} />
)

// ── Notice/Warning/Highlight ──────────────────────────────────────────────────
const NOTICE_STYLES = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500', titleColor: 'text-blue-800', textColor: 'text-blue-700' },
      warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', titleColor: 'text-amber-800', textColor: 'text-amber-700' },
      success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500', titleColor: 'text-green-800', textColor: 'text-green-700' },
      error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', titleColor: 'text-red-800', textColor: 'text-red-700' },
}

const NoticeEl = ({ el }) => {
      const variant = el.content?.variant || 'info'
      const ns = NOTICE_STYLES[variant] || NOTICE_STYLES.info
      const Icon = ns.icon
      return (
            <div className={`flex gap-3 p-4 rounded-xl border ${ns.bg} ${ns.border}`}>
                  <Icon size={18} className={`${ns.iconColor} flex-shrink-0 mt-0.5`} />
                  <div>
                        {el.content?.title && <p className={`font-semibold text-sm ${ns.titleColor} mb-0.5`}>{el.content.title}</p>}
                        {el.content?.text && <p className={`text-sm ${ns.textColor}`}>{el.content.text}</p>}
                  </div>
            </div>
      )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FaqEl = ({ el }) => {
      const [open, setOpen] = useState(null)
      const items = el.content?.items || []

      return (
            <div className="space-y-2">
                  {items.map((item, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                    type="button"
                                    onClick={() => setOpen(open === i ? null : i)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-gray-800 text-sm hover:bg-gray-50 transition-colors"
                              >
                                    <span>{item.question}</span>
                                    {open === i ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                              </button>
                              {open === i && (
                                    <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                                          {item.answer}
                                    </div>
                              )}
                        </div>
                  ))}
            </div>
      )
}

// ── PDF ───────────────────────────────────────────────────────────────────────
const PdfEl = ({ el }) => (
      <a
            href={el.content?.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors"
            style={{ backgroundColor: el.style?.backgroundColor || '#f0f9ff', color: el.style?.color || '#1e40af', borderColor: '#bfdbfe' }}
      >
            <FileDown size={16} />
            {el.content?.label || 'Download PDF'}
      </a>
)

// ── Blank / Custom ────────────────────────────────────────────────────────────
const BlankEl = ({ el }) => {
      const html = sanitizeHtml(el.content?.html || '')
      if (!html) return (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-xs">
                  Empty block
            </div>
      )
      return (
            <div
                  style={{ padding: el.style?.padding ? `${el.style.padding}px` : undefined, minHeight: el.style?.minHeight }}
                  dangerouslySetInnerHTML={{ __html: html }}
            />
      )
}

// ── Container / Columns ───────────────────────────────────────────────────────
const ContainerEl = ({ el, renderChildren }) => (
      <div style={{
            backgroundColor: el.style?.backgroundColor || 'transparent',
            padding: el.style?.padding ? `${el.style.padding}px` : undefined,
            borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : undefined,
      }}>
            {renderChildren && renderChildren(el.children || [])}
      </div>
)

const ColumnsEl = ({ el, renderChildren }) => {
      const count = el.content?.count || 2
      return (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: el.style?.gap ? `${el.style.gap}px` : '16px' }}>
                  {(el.children || []).map((child) => (
                        <div key={child.id}>
                              {renderChildren && renderChildren([child])}
                        </div>
                  ))}
            </div>
      )
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
const ElementRenderer = ({ el, renderChildren }) => {
      if (!el) return null

      switch (el.type) {
            case 'heading':
            case 'subheading':
                  return <HeadingEl el={el} />
            case 'paragraph':
            case 'richtext':
                  return <ParagraphEl el={el} />
            case 'image': return <ImageEl el={el} />
            case 'table': return <TableEl el={el} />
            case 'button':
            case 'applybutton':
                  return <ButtonEl el={el} />
            case 'divider': return <DividerEl el={el} />
            case 'spacer': return <SpacerEl el={el} />
            case 'notice':
            case 'warning':
            case 'highlight':
                  return <NoticeEl el={el} />
            case 'faq': return <FaqEl el={el} />
            case 'pdf': return <PdfEl el={el} />
            case 'blank': return <BlankEl el={el} />
            case 'container': return <ContainerEl el={el} renderChildren={renderChildren} />
            case 'columns': return <ColumnsEl el={el} renderChildren={renderChildren} />
            default:
                  return <div className="text-xs text-gray-400 p-2">Unknown element: {el.type}</div>
      }
}

export default ElementRenderer
