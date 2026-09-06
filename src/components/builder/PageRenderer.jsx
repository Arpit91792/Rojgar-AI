/**
 * PageRenderer — Public-facing renderer for PageBuilder JSON.
 * Renders sections[] from contentBlocks JSON.
 * No admin controls. Safe HTML rendering.
 */
import React from 'react'
import ElementRenderer from './ElementRenderer.jsx'

const renderTree = (children) => {
      if (!children || children.length === 0) return null
      return children.map((el) => {
            if (!el || !el.id) return null
            return (
                  <div key={el.id} className="w-full">
                        <ElementRenderer
                              el={el}
                              renderChildren={(kids) => (
                                    <div className="space-y-3">
                                          {renderTree(kids)}
                                    </div>
                              )}
                        />
                  </div>
            )
      })
}

/**
 * Props:
 *   contentBlocks: string — JSON string with { sections: [...] }
 */
const PageRenderer = ({ contentBlocks }) => {
      if (!contentBlocks) return null

      let parsed
      try {
            parsed = JSON.parse(contentBlocks)
      } catch {
            return null
      }

      // Support both new { sections: [] } format and old { blocks: [] } format
      const sections = parsed?.sections
      const blocks = parsed?.blocks

      // New format — sections
      if (sections && sections.length > 0) {
            return (
                  <div className="w-full">
                        {sections
                              .filter((s) => !s.hidden)
                              .map((section) => {
                                    const s = section.style || {}
                                    return (
                                          <div
                                                key={section.id}
                                                style={{
                                                      backgroundColor: s.backgroundColor || undefined,
                                                      paddingTop: s.paddingTop != null ? `${s.paddingTop}px` : undefined,
                                                      paddingRight: s.paddingRight != null ? `${s.paddingRight}px` : undefined,
                                                      paddingBottom: s.paddingBottom != null ? `${s.paddingBottom}px` : undefined,
                                                      paddingLeft: s.paddingLeft != null ? `${s.paddingLeft}px` : undefined,
                                                      marginTop: s.marginTop != null ? `${s.marginTop}px` : undefined,
                                                      marginBottom: s.marginBottom != null ? `${s.marginBottom}px` : undefined,
                                                      maxWidth: s.maxWidth || undefined,
                                                      minHeight: s.minHeight ? `${s.minHeight}px` : undefined,
                                                      borderWidth: s.borderWidth ? `${s.borderWidth}px` : undefined,
                                                      borderStyle: s.borderWidth ? 'solid' : undefined,
                                                      borderColor: s.borderColor || undefined,
                                                      borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                                                }}
                                          >
                                                <div
                                                      style={{ display: 'flex', flexDirection: 'column', gap: s.gap != null ? `${s.gap}px` : '16px' }}
                                                >
                                                      {renderTree(section.children || [])}
                                                </div>
                                          </div>
                                    )
                              })}
                  </div>
            )
      }

      // Old format — blocks (backward compat with ContentRenderer logic)
      if (blocks && blocks.length > 0) {
            // Inline legacy block renderer (same as ContentRenderer)
            return (
                  <div className="space-y-4">
                        {renderTree(blocks)}
                  </div>
            )
      }

      return null
}

export default PageRenderer
