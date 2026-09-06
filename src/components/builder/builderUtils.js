// ── Shared utilities for the Page Builder ────────────────────────────────────

export const uid = () =>
      `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// Sanitize HTML — strip scripts and dangerous attributes
export const sanitizeHtml = (html) => {
      if (!html) return ''
      return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:text\/html/gi, '')
}

// Deep clone
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

// Generate default element for a given type
export const defaultElement = (type) => {
      const base = { id: uid(), type }
      const defaults = {
            heading: {
                  content: { text: 'Heading', level: 'h2' },
                  style: { fontSize: 24, fontWeight: 700, color: '#111827', textAlign: 'left' }
            },
            subheading: {
                  content: { text: 'Subheading', level: 'h3' },
                  style: { fontSize: 18, fontWeight: 600, color: '#374151', textAlign: 'left' }
            },
            paragraph: {
                  content: { html: '<p>Add your text here…</p>' },
                  style: { fontSize: 14, color: '#374151', lineHeight: 1.7 }
            },
            richtext: {
                  content: { html: '<p>Rich text content…</p>' },
                  style: { fontSize: 14, color: '#374151' }
            },
            image: {
                  content: { url: '', alt: '', caption: '' },
                  style: { width: '100%', maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }
            },
            table: {
                  content: {
                        hasHeader: true,
                        columns: ['Field', 'Details'],
                        rows: [['Organization', 'SSC'], ['Vacancies', '5000+'], ['Last Date', '—']]
                  },
                  style: { fontSize: 14, borderColor: '#e5e7eb', headerBg: '#f9fafb', headerColor: '#111827' }
            },
            button: {
                  content: { text: 'Apply Now', url: '', target: '_blank', buttonType: 'primary' },
                  style: {
                        backgroundColor: '#2563eb', color: '#ffffff', fontSize: 14,
                        fontWeight: 600, borderRadius: 8, paddingX: 24, paddingY: 12,
                        width: 'auto', textAlign: 'center'
                  }
            },
            applybutton: {
                  content: { text: 'Apply Now', url: '', target: '_blank' },
                  style: {
                        backgroundColor: '#16a34a', color: '#ffffff', fontSize: 14,
                        fontWeight: 600, borderRadius: 8, paddingX: 24, paddingY: 12
                  }
            },
            divider: {
                  content: {},
                  style: { borderColor: '#e5e7eb', borderWidth: 1, marginY: 16 }
            },
            spacer: {
                  content: { height: 40 },
                  style: {}
            },
            notice: {
                  content: { title: 'Important Notice', text: 'Enter notice content here.', variant: 'info' },
                  style: {}
            },
            warning: {
                  content: { title: 'Warning', text: 'Enter warning content here.', variant: 'warning' },
                  style: {}
            },
            highlight: {
                  content: { title: 'Highlight', text: 'Enter highlighted content here.', variant: 'success' },
                  style: {}
            },
            faq: {
                  content: {
                        items: [
                              { question: 'What is the eligibility?', answer: 'Graduation from a recognized university.' },
                              { question: 'What is the last date?', answer: 'Check the official notification.' }
                        ]
                  },
                  style: { borderColor: '#e5e7eb', headerBg: '#f9fafb' }
            },
            blank: {
                  content: { html: '' },
                  style: { padding: 16, minHeight: 60 }
            },
            pdf: {
                  content: { url: '', label: 'Download Notification PDF', fileName: '' },
                  style: { backgroundColor: '#f0f9ff', color: '#1e40af', borderRadius: 8 }
            },
            container: {
                  content: {},
                  style: { padding: 16, backgroundColor: 'transparent' },
                  children: []
            },
            columns: {
                  content: { count: 2 },
                  style: { gap: 16 },
                  children: [
                        { id: uid(), type: 'blank', content: { html: '' }, style: { minHeight: 60 }, children: [] },
                        { id: uid(), type: 'blank', content: { html: '' }, style: { minHeight: 60 }, children: [] }
                  ]
            },
      }
      return { ...base, ...(defaults[type] || { content: {}, style: {} }), children: defaults[type]?.children || undefined }
}

// Default section
export const defaultSection = () => ({
      id: uid(),
      type: 'section',
      name: 'New Section',
      hidden: false,
      style: {
            backgroundColor: '#ffffff',
            paddingTop: 32, paddingRight: 32, paddingBottom: 32, paddingLeft: 32,
            marginTop: 0, marginBottom: 16,
            maxWidth: '100%', minHeight: 0,
            gap: 16
      },
      children: []
})

// Find element recursively in a tree
export const findElement = (children, id) => {
      for (const el of children) {
            if (el.id === id) return el
            if (el.children) {
                  const found = findElement(el.children, id)
                  if (found) return found
            }
      }
      return null
}

// Remove element by id from tree, return [newChildren, removedEl]
export const removeElement = (children, id) => {
      let removed = null
      const newChildren = children.filter((el) => {
            if (el.id === id) { removed = el; return false }
            return true
      }).map((el) => {
            if (el.children) {
                  const [nc, r] = removeElement(el.children, id)
                  if (r) removed = r
                  return { ...el, children: nc }
            }
            return el
      })
      return [newChildren, removed]
}

// Update element by id in tree
export const updateElement = (children, id, updater) =>
      children.map((el) => {
            if (el.id === id) return typeof updater === 'function' ? updater(el) : { ...el, ...updater }
            if (el.children) return { ...el, children: updateElement(el.children, id, updater) }
            return el
      })
