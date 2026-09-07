/**
 * ContentRenderer — Public-facing component.
 * Renders contentBlocks JSON into clean HTML for users.
 * Zero admin controls. Safe HTML rendering.
 */
import React from 'react'

// ── Safe HTML renderer ────────────────────────────────────────────────────────
// Strips dangerous tags/attributes before rendering rich text
const sanitizeHtml = (html) => {
      if (!html) return ''
      return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
}

// ── Block renderers ───────────────────────────────────────────────────────────

const TextBlock = ({ block }) => {
      if (!block.content) return null
      return (
            <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2
        [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2
        [&_h3]:text-lg  [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1
        [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
        [&_li]:mb-0.5 [&_a]:text-blue-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
            />
      )
}

const HeadingBlock = ({ block }) => {
      const lvl = block.level || 2
      const cls = {
            1: 'text-2xl font-bold text-gray-900 mt-6 mb-3',
            2: 'text-xl font-bold text-gray-900 mt-5 mb-2',
            3: 'text-lg font-semibold text-gray-800 mt-4 mb-2',
      }[lvl] || 'text-xl font-bold text-gray-900 mt-5 mb-2'

      if (!block.content) return null
      return React.createElement(`h${lvl}`, { className: cls }, block.content)
}

const TableBlock = ({ block }) => {
      const cols = block.columns || []
      const rows = block.rows || []
      if (cols.length === 0 && rows.length === 0) return null

      return (
            <div className="overflow-x-auto rounded-lg border border-gray-200 my-2">
                  <table className="w-full text-sm">
                        {cols.length > 0 && (
                              <thead>
                                    <tr className="bg-blue-50">
                                          {cols.map((col, i) => (
                                                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-gray-200 whitespace-nowrap">
                                                      {col}
                                                </th>
                                          ))}
                                    </tr>
                              </thead>
                        )}
                        <tbody className="divide-y divide-gray-100">
                              {rows.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-gray-50 transition-colors">
                                          {row.map((cell, ci) => (
                                                <td key={ci} className="px-4 py-2.5 text-gray-700 align-top">
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

const ImageBlock = ({ block }) => {
      if (!block.url) return null
      return (
            <figure className="my-4">
                  <img
                        src={block.url}
                        alt={block.alt || block.caption || ''}
                        className="rounded-xl border border-gray-200 w-full max-h-96 object-contain bg-gray-50"
                        loading="lazy"
                  />
                  {block.caption && (
                        <figcaption className="text-center text-xs text-gray-500 mt-2 italic">
                              {block.caption}
                        </figcaption>
                  )}
            </figure>
      )
}

// ── ContentRenderer ───────────────────────────────────────────────────────────
/**
 * Props:
 *   contentBlocks: string  — JSON string '{"blocks":[...]}' (legacy)
 *                            or '{"rawHtml":"..."}' (new rich-text editor)
 *                            or raw HTML string
 */
const ContentRenderer = ({ contentBlocks }) => {
      if (!contentBlocks) return null

      let parsed
      try {
            parsed = JSON.parse(contentBlocks)
      } catch {
            // Not JSON — treat as raw HTML
            parsed = null
      }

      // New format: { rawHtml: "..." }
      if (parsed?.rawHtml !== undefined) {
            if (!parsed.rawHtml) return null
            return (
                  <div className="overflow-x-auto">
                        <div
                              className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2
                                [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-4 [&_h2]:mb-2
                                [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1
                                [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                                [&_li]:mb-0.5 [&_a]:text-blue-600 [&_a]:underline
                                [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_table]:min-w-[400px]
                                [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-left
                                [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2
                                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsed.rawHtml) }}
                        />
                  </div>
            )
      }

      // Legacy format: { blocks: [...] }
      const blocks = parsed?.blocks || []
      if (blocks.length === 0) return null

      return (
            <div className="space-y-4">
                  {blocks.map((block) => {
                        switch (block.type) {
                              case 'text': return <TextBlock key={block.id} block={block} />
                              case 'heading': return <HeadingBlock key={block.id} block={block} />
                              case 'table': return <TableBlock key={block.id} block={block} />
                              case 'image': return <ImageBlock key={block.id} block={block} />
                              default: return null
                        }
                  })}
            </div>
      )
}

export default ContentRenderer
