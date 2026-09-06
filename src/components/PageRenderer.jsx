/**
 * PageRenderer — Public page renderer.
 * Reads the same JSON produced by PageEditor and renders it for users.
 * ZERO admin controls. Safe HTML only.
 */
import React from 'react'
import { Info, AlertTriangle, Check, X } from 'lucide-react'

// ── HTML sanitizer ────────────────────────────────────────────────────────────
const sanitize = (html = '') =>
      html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')

// ── CSS helper: numeric values → px strings ───────────────────────────────────
const toStyle = (s = {}) => {
      const out = {}
      for (const [k, v] of Object.entries(s)) {
            if (v === undefined || v === null || v === '') continue
            const numericProps = ['fontSize', 'borderRadius', 'letterSpacing', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']
            if (numericProps.includes(k) && typeof v === 'number') out[k] = `${v}px`
            else if (k === 'width' && typeof v === 'number') out[k] = `${v}px`
            else out[k] = v
      }
      return out
}

// ── Element renderers (public, no editing) ────────────────────────────────────

const RenderText = ({ el }) =>
      el.content ? (
            <div style={toStyle(el.style)}
                  className="text-gray-800 leading-relaxed [&_a]:text-blue-600 [&_a]:underline [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitize(el.content) }} />
      ) : null

const RenderHeading = ({ el }) => {
      if (!el.content) return null
      const lvl = el.level || 2
      const sizes = { 1: 'text-4xl', 2: 'text-3xl', 3: 'text-2xl', 4: 'text-xl', 5: 'text-lg', 6: 'text-base' }
      const Tag = `h${lvl}`
      return (
            <Tag style={toStyle(el.style)}
                  className={`${sizes[lvl] || 'text-2xl'} font-bold text-gray-900 leading-tight`}
                  dangerouslySetInnerHTML={{ __html: sanitize(el.content) }} />
      )
}

const RenderParagraph = ({ el }) =>
      el.content ? (
            <p style={toStyle(el.style)}
                  className="text-gray-700 leading-relaxed [&_a]:text-blue-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitize(el.content) }} />
      ) : null

const RenderImage = ({ el }) => {
      if (!el.url) return null
      const s = el.style || {}
      const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      return (
            <figure style={{ display: 'flex', justifyContent: alignMap[s.textAlign] || 'flex-start' }}>
                  <div>
                        <img src={el.url} alt={el.alt || el.caption || ''} loading="lazy"
                              style={{
                                    width: s.width ? (typeof s.width === 'number' ? `${s.width}px` : s.width) : '100%',
                                    maxWidth: '100%',
                                    borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                                    border: s.border || undefined,
                              }} />
                        {el.caption && (
                              <figcaption className="text-center text-xs text-gray-500 mt-1.5 italic">{el.caption}</figcaption>
                        )}
                  </div>
            </figure>
      )
}

const RenderLogo = ({ el }) => {
      if (!el.url) return null
      const s = el.style || {}
      const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      return (
            <div style={{ display: 'flex', justifyContent: alignMap[s.textAlign] || 'flex-start' }}>
                  <img src={el.url} alt={el.alt || 'Logo'} loading="lazy"
                        style={{ width: typeof s.width === 'number' ? `${s.width}px` : (s.width || '120px'), maxWidth: '100%', borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined }} />
            </div>
      )
}

const RenderTable = ({ el }) => {
      const cols = el.columns || []
      const rows = el.rows || []
      if (cols.length === 0 && rows.length === 0) return null
      return (
            <div className="overflow-x-auto rounded-xl border border-gray-200 my-1">
                  <table className="w-full text-sm">
                        {cols.length > 0 && (
                              <thead>
                                    <tr className="bg-blue-50">
                                          {cols.map((c, i) => (
                                                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-gray-200 whitespace-nowrap">{c}</th>
                                          ))}
                                    </tr>
                              </thead>
                        )}
                        <tbody className="divide-y divide-gray-100">
                              {rows.map((row, ri) => (
                                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          {row.map((cell, ci) => (
                                                <td key={ci} className="px-4 py-2.5 text-gray-700">{cell}</td>
                                          ))}
                                    </tr>
                              ))}
                        </tbody>
                  </table>
            </div>
      )
}

const RenderApplyButton = ({ el }) => {
      if (!el.url && !el.text) return null
      const s = el.style || {}
      const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' }
      return (
            <div style={{ display: 'flex', justifyContent: alignMap[s.textAlign] || 'center' }}>
                  {el.url ? (
                        <a href={el.url} target="_blank" rel="noopener noreferrer"
                              style={{
                                    backgroundColor: s.backgroundColor || '#2563eb',
                                    color: s.color || '#ffffff',
                                    borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
                                    fontSize: s.fontSize ? `${s.fontSize}px` : '16px',
                                    padding: s.padding || '12px 32px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    border: s.border || 'none',
                                    transition: 'opacity 0.2s',
                              }}
                              className="hover:opacity-90 transition-opacity">
                              {el.text || 'Apply Now'}
                        </a>
                  ) : (
                        <button disabled style={{
                              backgroundColor: s.backgroundColor || '#2563eb',
                              color: s.color || '#ffffff',
                              borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
                              fontSize: s.fontSize ? `${s.fontSize}px` : '16px',
                              padding: s.padding || '12px 32px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'default',
                              opacity: 0.7,
                        }}>
                              {el.text || 'Apply Now'}
                        </button>
                  )}
            </div>
      )
}

const NOTICE_STYLES = {
      info: { bg: '#eff6ff', border: '#bfdbfe', Icon: Info, iconColor: '#3b82f6' },
      warning: { bg: '#fffbeb', border: '#fde68a', Icon: AlertTriangle, iconColor: '#f59e0b' },
      success: { bg: '#f0fdf4', border: '#bbf7d0', Icon: Check, iconColor: '#22c55e' },
      error: { bg: '#fef2f2', border: '#fecaca', Icon: X, iconColor: '#ef4444' },
}

const RenderNotice = ({ el }) => {
      const v = el.variant || 'info'
      const ns = NOTICE_STYLES[v] || NOTICE_STYLES.info
      const { Icon } = ns
      return (
            <div style={{ backgroundColor: ns.bg, border: `1px solid ${ns.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Icon size={18} style={{ color: ns.iconColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                        {el.title && <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#111827' }}>{el.title}</p>}
                        {el.content && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{el.content}</p>}
                  </div>
            </div>
      )
}

const RenderDivider = ({ el }) => (
      <hr style={{ borderColor: el.style?.borderColor || '#e5e7eb', borderTopWidth: el.style?.borderWidth || 1, marginTop: el.style?.marginTop || 16, marginBottom: el.style?.marginBottom || 16 }} />
)

const RenderSpacer = ({ el }) => (
      <div style={{ height: `${el.height || 32}px` }} />
)

const RenderColumns = ({ el }) => {
      const count = el.count || 2
      const cols = el.cols || []
      return (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
            // Stack on mobile:
            >
                  {cols.slice(0, count).map((col, ci) => (
                        <div key={ci} className="min-w-0">
                              {(col.elements || []).map(child => <RenderElement key={child.id} el={child} />)}
                        </div>
                  ))}
            </div>
      )
}

const RenderBlank = ({ el }) => (
      <div style={{ backgroundColor: el.style?.backgroundColor || 'transparent', padding: el.style?.padding || 0, borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : undefined, ...toStyle(el.style) }}>
            {el.content
                  ? <div className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitize(el.content) }} />
                  : null}
      </div>
)

// ── Central dispatch ──────────────────────────────────────────────────────────
const RenderElement = ({ el }) => {
      if (!el) return null
      switch (el.type) {
            case 'text': return <RenderText el={el} />
            case 'heading': return <RenderHeading el={el} />
            case 'paragraph': return <RenderParagraph el={el} />
            case 'image': return <RenderImage el={el} />
            case 'logo': return <RenderLogo el={el} />
            case 'table': return <RenderTable el={el} />
            case 'applyButton': return <RenderApplyButton el={el} />
            case 'notice': return <RenderNotice el={el} />
            case 'divider': return <RenderDivider el={el} />
            case 'spacer': return <RenderSpacer el={el} />
            case 'columns': return <RenderColumns el={el} />
            case 'blank': return <RenderBlank el={el} />
            default: return null
      }
}

// ── PageRenderer ──────────────────────────────────────────────────────────────
/**
 * Props:
 *   pageContent: string  — JSON string '{"version":1,"page":{...},"elements":[...]}'
 */
const PageRenderer = ({ pageContent }) => {
      if (!pageContent) return null

      let doc
      try {
            doc = JSON.parse(pageContent)
      } catch {
            return null
      }

      const page = doc.page || {}
      const elements = doc.elements || []
      if (elements.length === 0) return null

      return (
            <div style={{
                  backgroundColor: page.background || '#ffffff',
                  padding: typeof page.padding === 'number' ? `${page.padding}px` : page.padding || '32px',
            }}>
                  <div className="space-y-4 sm:space-y-5">
                        {elements.map(el => (
                              <div key={el.id}>
                                    <RenderElement el={el} />
                              </div>
                        ))}
                  </div>

                  {/* Responsive column fix for mobile */}
                  <style>{`
        @media (max-width: 640px) {
          .page-columns-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
            </div>
      )
}

export default PageRenderer
