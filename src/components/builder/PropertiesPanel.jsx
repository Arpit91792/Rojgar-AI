import React from 'react'

// ── Color input ───────────────────────────────────────────────────────────────
const ColorInput = ({ label, value, onChange }) => (
      <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">{label}</label>
            <div className="flex items-center gap-2">
                  <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
                        className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5 bg-white" />
                  <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
      </div>
)

// ── Number input ──────────────────────────────────────────────────────────────
const NumInput = ({ label, value, onChange, min = 0, max = 999, unit = 'px' }) => (
      <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">{label}</label>
            <div className="flex items-center gap-1">
                  <input type="number" min={min} max={max} value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {unit && <span className="text-[10px] text-gray-400">{unit}</span>}
            </div>
      </div>
)

// ── Text input ────────────────────────────────────────────────────────────────
const TxtInput = ({ label, value, onChange, type = 'text', placeholder }) => (
      <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">{label}</label>
            <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
)

// ── Select ────────────────────────────────────────────────────────────────────
const Sel = ({ label, value, onChange, options }) => (
      <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">{label}</label>
            <select value={value || ''} onChange={(e) => onChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
      </div>
)

// ── Section ──────────────────────────────────────────────────────────────────
const PSection = ({ title, children }) => (
      <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
            <div className="space-y-3">{children}</div>
      </div>
)

// ── Spacing box ───────────────────────────────────────────────────────────────
const SpacingBox = ({ label, value = {}, onChange }) => {
      const sides = [
            { k: 'top', pos: 'top-0 left-1/2 -translate-x-1/2' },
            { k: 'right', pos: 'top-1/2 right-0 -translate-y-1/2' },
            { k: 'bottom', pos: 'bottom-0 left-1/2 -translate-x-1/2' },
            { k: 'left', pos: 'top-1/2 left-0 -translate-y-1/2' },
      ]
      return (
            <div>
                  <label className="block text-[10px] font-medium text-gray-500 uppercase mb-2">{label}</label>
                  <div className="grid grid-cols-4 gap-1">
                        {['top', 'right', 'bottom', 'left'].map((s) => (
                              <div key={s}>
                                    <p className="text-[9px] text-center text-gray-400 mb-0.5 capitalize">{s}</p>
                                    <input type="number" min={0} max={200}
                                          value={value[s] ?? 0}
                                          onChange={(e) => onChange({ ...value, [s]: Number(e.target.value) })}
                                          className="w-full px-1 py-1 text-xs text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              </div>
                        ))}
                  </div>
            </div>
      )
}

// ── Element properties ────────────────────────────────────────────────────────

const HeadingProps = ({ el, onStyle, onContent }) => (
      <>
            <PSection title="Content">
                  <TxtInput label="Text" value={el.content?.text} onChange={(v) => onContent({ ...el.content, text: v })} />
                  <Sel label="Level" value={el.content?.level} onChange={(v) => onContent({ ...el.content, level: v })}
                        options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(v => ({ value: v, label: v.toUpperCase() }))} />
            </PSection>
            <PSection title="Typography">
                  <NumInput label="Font Size" value={el.style?.fontSize} onChange={(v) => onStyle({ fontSize: v })} />
                  <Sel label="Font Weight" value={String(el.style?.fontWeight)}
                        onChange={(v) => onStyle({ fontWeight: Number(v) })}
                        options={[{ value: '400', label: 'Normal' }, { value: '600', label: 'SemiBold' }, { value: '700', label: 'Bold' }, { value: '900', label: 'Black' }]} />
                  <ColorInput label="Color" value={el.style?.color} onChange={(v) => onStyle({ color: v })} />
                  <Sel label="Align" value={el.style?.textAlign}
                        onChange={(v) => onStyle({ textAlign: v })}
                        options={['left', 'center', 'right', 'justify'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
            </PSection>
            <PSection title="Spacing">
                  <NumInput label="Margin Top" value={el.style?.marginTop} onChange={(v) => onStyle({ marginTop: v })} />
                  <NumInput label="Margin Bottom" value={el.style?.marginBottom} onChange={(v) => onStyle({ marginBottom: v })} />
            </PSection>
      </>
)

const ParagraphProps = ({ el, onStyle }) => (
      <>
            <PSection title="Typography">
                  <NumInput label="Font Size" value={el.style?.fontSize} onChange={(v) => onStyle({ fontSize: v })} />
                  <ColorInput label="Color" value={el.style?.color} onChange={(v) => onStyle({ color: v })} />
                  <NumInput label="Line Height" value={el.style?.lineHeight} onChange={(v) => onStyle({ lineHeight: v })} min={1} max={5} unit="×" />
                  <Sel label="Align" value={el.style?.textAlign}
                        onChange={(v) => onStyle({ textAlign: v })}
                        options={['left', 'center', 'right', 'justify'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
            </PSection>
      </>
)

const ImageProps = ({ el, onStyle, onContent }) => (
      <>
            <PSection title="Source">
                  <TxtInput label="Image URL" value={el.content?.url} onChange={(v) => onContent({ ...el.content, url: v })} type="url" placeholder="https://…" />
                  <TxtInput label="Alt Text" value={el.content?.alt} onChange={(v) => onContent({ ...el.content, alt: v })} />
                  <TxtInput label="Caption" value={el.content?.caption} onChange={(v) => onContent({ ...el.content, caption: v })} />
            </PSection>
            <PSection title="Dimensions">
                  <TxtInput label="Width" value={el.style?.width} onChange={(v) => onStyle({ width: v })} placeholder="100%" />
                  <TxtInput label="Max Width" value={el.style?.maxWidth} onChange={(v) => onStyle({ maxWidth: v })} placeholder="100%" />
                  <Sel label="Object Fit" value={el.style?.objectFit}
                        onChange={(v) => onStyle({ objectFit: v })}
                        options={['cover', 'contain', 'fill', 'none'].map(v => ({ value: v, label: v }))} />
            </PSection>
            <PSection title="Border">
                  <NumInput label="Radius" value={el.style?.borderRadius} onChange={(v) => onStyle({ borderRadius: v })} />
            </PSection>
      </>
)

const ButtonProps = ({ el, onStyle, onContent }) => (
      <>
            <PSection title="Content">
                  <TxtInput label="Button Text" value={el.content?.text} onChange={(v) => onContent({ ...el.content, text: v })} />
                  <TxtInput label="URL" value={el.content?.url} onChange={(v) => onContent({ ...el.content, url: v })} type="url" placeholder="https://…" />
                  <Sel label="Open in" value={el.content?.target}
                        onChange={(v) => onContent({ ...el.content, target: v })}
                        options={[{ value: '_blank', label: 'New tab' }, { value: '_self', label: 'Same tab' }]} />
            </PSection>
            <PSection title="Appearance">
                  <ColorInput label="Background" value={el.style?.backgroundColor} onChange={(v) => onStyle({ backgroundColor: v })} />
                  <ColorInput label="Text Color" value={el.style?.color} onChange={(v) => onStyle({ color: v })} />
                  <NumInput label="Font Size" value={el.style?.fontSize} onChange={(v) => onStyle({ fontSize: v })} />
                  <NumInput label="Border Radius" value={el.style?.borderRadius} onChange={(v) => onStyle({ borderRadius: v })} />
                  <NumInput label="Padding X" value={el.style?.paddingX} onChange={(v) => onStyle({ paddingX: v })} />
                  <NumInput label="Padding Y" value={el.style?.paddingY} onChange={(v) => onStyle({ paddingY: v })} />
            </PSection>
      </>
)

const DividerProps = ({ el, onStyle }) => (
      <PSection title="Style">
            <NumInput label="Width" value={el.style?.borderWidth} onChange={(v) => onStyle({ borderWidth: v })} />
            <ColorInput label="Color" value={el.style?.borderColor} onChange={(v) => onStyle({ borderColor: v })} />
            <NumInput label="Margin Y" value={el.style?.marginY} onChange={(v) => onStyle({ marginY: v })} />
      </PSection>
)

const SpacerProps = ({ el, onContent }) => (
      <PSection title="Size">
            <NumInput label="Height" value={el.content?.height} onChange={(v) => onContent({ ...el.content, height: v })} />
      </PSection>
)

const NoticeProps = ({ el, onContent }) => (
      <PSection title="Content">
            <TxtInput label="Title" value={el.content?.title} onChange={(v) => onContent({ ...el.content, title: v })} />
            <div>
                  <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Text</label>
                  <textarea value={el.content?.text || ''} rows={3} onChange={(e) => onContent({ ...el.content, text: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <Sel label="Variant" value={el.content?.variant}
                  onChange={(v) => onContent({ ...el.content, variant: v })}
                  options={['info', 'warning', 'success', 'error'].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
      </PSection>
)

const PdfProps = ({ el, onContent }) => (
      <PSection title="PDF">
            <TxtInput label="PDF URL" value={el.content?.url} onChange={(v) => onContent({ ...el.content, url: v })} type="url" />
            <TxtInput label="Button Label" value={el.content?.label} onChange={(v) => onContent({ ...el.content, label: v })} />
      </PSection>
)

const ContainerProps = ({ el, onStyle }) => (
      <PSection title="Background">
            <ColorInput label="Background" value={el.style?.backgroundColor} onChange={(v) => onStyle({ backgroundColor: v })} />
            <NumInput label="Padding" value={el.style?.padding} onChange={(v) => onStyle({ padding: v })} />
            <NumInput label="Border Radius" value={el.style?.borderRadius} onChange={(v) => onStyle({ borderRadius: v })} />
      </PSection>
)

const SectionPropsPanel = ({ section, onStyleChange }) => {
      const s = section.style || {}
      const upd = (k, v) => onStyleChange({ ...s, [k]: v })

      return (
            <div className="space-y-0">
                  <PSection title="Background">
                        <ColorInput label="Background Color" value={s.backgroundColor} onChange={(v) => upd('backgroundColor', v)} />
                  </PSection>
                  <PSection title="Padding">
                        <div className="grid grid-cols-2 gap-2">
                              <NumInput label="Top" value={s.paddingTop} onChange={(v) => upd('paddingTop', v)} />
                              <NumInput label="Right" value={s.paddingRight} onChange={(v) => upd('paddingRight', v)} />
                              <NumInput label="Bottom" value={s.paddingBottom} onChange={(v) => upd('paddingBottom', v)} />
                              <NumInput label="Left" value={s.paddingLeft} onChange={(v) => upd('paddingLeft', v)} />
                        </div>
                  </PSection>
                  <PSection title="Margin">
                        <div className="grid grid-cols-2 gap-2">
                              <NumInput label="Top" value={s.marginTop} onChange={(v) => upd('marginTop', v)} />
                              <NumInput label="Bottom" value={s.marginBottom} onChange={(v) => upd('marginBottom', v)} />
                        </div>
                  </PSection>
                  <PSection title="Dimensions">
                        <TxtInput label="Max Width" value={s.maxWidth} onChange={(v) => upd('maxWidth', v)} placeholder="100%" />
                        <NumInput label="Min Height" value={s.minHeight} onChange={(v) => upd('minHeight', v)} />
                        <NumInput label="Gap" value={s.gap} onChange={(v) => upd('gap', v)} />
                  </PSection>
                  <PSection title="Border">
                        <NumInput label="Width" value={s.borderWidth} onChange={(v) => upd('borderWidth', v)} />
                        <ColorInput label="Color" value={s.borderColor} onChange={(v) => upd('borderColor', v)} />
                        <NumInput label="Radius" value={s.borderRadius} onChange={(v) => upd('borderRadius', v)} />
                  </PSection>
            </div>
      )
}

// ── Main PropertiesPanel ──────────────────────────────────────────────────────
const PropertiesPanel = ({ selected, selectedSection, sections, onUpdateElement, onUpdateSection }) => {
      if (!selected && !selectedSection) {
            return (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 text-gray-400">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                              <span className="text-2xl">🎨</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Select an element</p>
                        <p className="text-xs mt-1">Click any element on the canvas to edit its properties</p>
                  </div>
            )
      }

      if (selectedSection && !selected) {
            const sec = sections.find((s) => s.id === selectedSection)
            if (!sec) return null
            return (
                  <div className="p-4 overflow-y-auto">
                        <p className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Section: {sec.name}</p>
                        <SectionPropsPanel section={sec} onStyleChange={(style) => onUpdateSection(selectedSection, { style })} />
                  </div>
            )
      }

      // Find element across all sections
      let el = null
      for (const sec of sections) {
            const find = (children) => {
                  for (const c of children) {
                        if (c.id === selected) return c
                        if (c.children) { const f = find(c.children); if (f) return f }
                  }
                  return null
            }
            el = find(sec.children)
            if (el) break
      }
      if (!el) return null

      const onStyle = (partial) => onUpdateElement(el.id, (prev) => ({ ...prev, style: { ...prev.style, ...partial } }))
      const onContent = (content) => onUpdateElement(el.id, (prev) => ({ ...prev, content }))

      const TITLE_MAP = {
            heading: 'Heading', subheading: 'Subheading', paragraph: 'Paragraph',
            richtext: 'Rich Text', image: 'Image', table: 'Table',
            button: 'Button', applybutton: 'Apply Button', divider: 'Divider',
            spacer: 'Spacer', notice: 'Notice', warning: 'Warning',
            highlight: 'Highlight', faq: 'FAQ', blank: 'Blank Block',
            pdf: 'PDF', container: 'Container', columns: 'Columns',
      }

      return (
            <div className="p-4 overflow-y-auto">
                  <p className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">
                        {TITLE_MAP[el.type] || el.type}
                  </p>
                  {(el.type === 'heading' || el.type === 'subheading') && <HeadingProps el={el} onStyle={onStyle} onContent={onContent} />}
                  {(el.type === 'paragraph' || el.type === 'richtext') && <ParagraphProps el={el} onStyle={onStyle} />}
                  {el.type === 'image' && <ImageProps el={el} onStyle={onStyle} onContent={onContent} />}
                  {(el.type === 'button' || el.type === 'applybutton') && <ButtonProps el={el} onStyle={onStyle} onContent={onContent} />}
                  {el.type === 'divider' && <DividerProps el={el} onStyle={onStyle} />}
                  {el.type === 'spacer' && <SpacerProps el={el} onContent={onContent} />}
                  {(el.type === 'notice' || el.type === 'warning' || el.type === 'highlight') && <NoticeProps el={el} onContent={onContent} />}
                  {el.type === 'pdf' && <PdfProps el={el} onContent={onContent} />}
                  {(el.type === 'container' || el.type === 'columns') && <ContainerProps el={el} onStyle={onStyle} />}
            </div>
      )
}

export default PropertiesPanel
