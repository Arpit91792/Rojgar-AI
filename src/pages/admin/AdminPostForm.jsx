/**
 * AdminPostForm — Visual page editor for RozgarGrid AI admin.
 * Uses PageEditor (blank-page visual editor) for the content section.
 * Preserves all existing metadata fields (category, status, org, dates, etc.)
 */
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost, parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import PageEditor from '../../components/admin/PageEditor.jsx'
import {
      AlertCircle, Loader2, Star, ChevronDown,
      Building2, MapPin, Calendar, Link2, FileText, Layout,
      Save, Eye
} from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
const PATH_TO_CATEGORY = {
      'government-jobs': postService.CATEGORIES.GOVERNMENT_JOB,
      'private-jobs': postService.CATEGORIES.PRIVATE_JOB,
      'internships': postService.CATEGORIES.INTERNSHIP,
      'time-table': postService.CATEGORIES.TIME_TABLE,
      'results': postService.CATEGORIES.RESULT,
      'admit-cards': postService.CATEGORIES.ADMIT_CARD,
}

const SECTION_LABELS = {
      GOVERNMENT_JOB: 'Government Job',
      PRIVATE_JOB: 'Private Job',
      INTERNSHIP: 'Internship',
      TIME_TABLE: 'Time Table',
      RESULT: 'Result',
      ADMIT_CARD: 'Admit Card',
}

const CATEGORY_FIELDS = {
      GOVERNMENT_JOB: ['organization', 'department', 'location', 'qualification', 'ageLimit', 'salary', 'vacancies', 'applicationStartDate', 'lastDate', 'examDate', 'officialWebsite', 'applyLink', 'notificationUrl'],
      PRIVATE_JOB: ['organization', 'location', 'qualification', 'experience', 'salary', 'jobType', 'workMode', 'skills', 'lastDate', 'officialWebsite', 'applyLink'],
      INTERNSHIP: ['organization', 'location', 'workMode', 'duration', 'stipend', 'eligibility', 'skills', 'applicationStartDate', 'lastDate', 'officialWebsite', 'applyLink'],
      TIME_TABLE: ['organization', 'course', 'semester', 'subject', 'examDate', 'startTime', 'endTime', 'notificationUrl'],
      RESULT: ['organization', 'examName', 'resultDate', 'course', 'officialWebsite', 'resultLink', 'notificationUrl'],
      ADMIT_CARD: ['organization', 'examDate', 'releaseDate', 'qualification', 'officialWebsite', 'downloadLink', 'notificationUrl'],
}

const FIELD_META = {
      organization: { label: 'Organization', type: 'text', icon: Building2 },
      department: { label: 'Department', type: 'text', icon: Building2 },
      location: { label: 'Location', type: 'text', icon: MapPin },
      qualification: { label: 'Qualification', type: 'text', icon: FileText },
      ageLimit: { label: 'Age Limit', type: 'text', icon: FileText },
      salary: { label: 'Salary', type: 'text', icon: FileText },
      stipend: { label: 'Stipend', type: 'text', icon: FileText },
      vacancies: { label: 'Vacancies', type: 'text', icon: FileText },
      applicationStartDate: { label: 'Application Start', type: 'date', icon: Calendar },
      lastDate: { label: 'Last Date', type: 'date', icon: Calendar },
      examDate: { label: 'Exam Date', type: 'date', icon: Calendar },
      resultDate: { label: 'Result Date', type: 'date', icon: Calendar },
      releaseDate: { label: 'Release Date', type: 'date', icon: Calendar },
      officialWebsite: { label: 'Official Website', type: 'url', icon: Link2 },
      applyLink: { label: 'Apply Link', type: 'url', icon: Link2 },
      downloadLink: { label: 'Download Link', type: 'url', icon: Link2 },
      resultLink: { label: 'Result Link', type: 'url', icon: Link2 },
      notificationUrl: { label: 'Notification PDF URL', type: 'url', icon: Link2 },
      jobType: { label: 'Job Type', type: 'text', icon: FileText, placeholder: 'Full-time / Part-time' },
      workMode: { label: 'Work Mode', type: 'text', icon: FileText, placeholder: 'On-site / Remote / Hybrid' },
      experience: { label: 'Experience', type: 'text', icon: FileText, placeholder: 'e.g. 0–2 years' },
      skills: { label: 'Skills Required', type: 'text', icon: FileText, placeholder: 'React, Node.js, SQL…' },
      duration: { label: 'Duration', type: 'text', icon: Calendar, placeholder: 'e.g. 3 months' },
      eligibility: { label: 'Eligibility', type: 'text', icon: FileText },
      course: { label: 'Course', type: 'text', icon: FileText },
      semester: { label: 'Semester', type: 'text', icon: FileText },
      subject: { label: 'Subject', type: 'text', icon: FileText },
      startTime: { label: 'Start Time', type: 'time', icon: Calendar },
      endTime: { label: 'End Time', type: 'time', icon: Calendar },
      examName: { label: 'Exam Name', type: 'text', icon: FileText },
}

const ALL_CATEGORIES = [
      { value: 'GOVERNMENT_JOB', label: 'Government Job' },
      { value: 'PRIVATE_JOB', label: 'Private Job' },
      { value: 'INTERNSHIP', label: 'Internship' },
      { value: 'TIME_TABLE', label: 'Time Table' },
      { value: 'RESULT', label: 'Result' },
      { value: 'ADMIT_CARD', label: 'Admit Card' },
]

// ── Collapsible section ───────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, defaultOpen = true, children }) => {
      const [open, setOpen] = useState(defaultOpen)
      return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button type="button" onClick={() => setOpen(o => !o)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                              {Icon && <Icon size={15} className="text-blue-500" />}
                              {title}
                        </span>
                        <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <div className="px-5 pb-5 pt-2 border-t border-gray-100">{children}</div>}
            </div>
      )
}

// ── Single field ──────────────────────────────────────────────────────────────
const Field = ({ name, value, onChange }) => {
      const meta = FIELD_META[name]
      if (!meta) return null
      const Icon = meta.icon || FileText
      return (
            <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                        <Icon size={11} className="text-gray-400" /> {meta.label}
                  </label>
                  <input
                        type={meta.type}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        placeholder={meta.placeholder || ''}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
            </div>
      )
}

// ── Empty page JSON ───────────────────────────────────────────────────────────
const EMPTY_PAGE = JSON.stringify({ version: 1, page: { background: '#ffffff', padding: 32 }, elements: [] })

// ══════════════════════════════════════════════════════════════════════════════
// Main AdminPostForm
// ══════════════════════════════════════════════════════════════════════════════
const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const initialCategory = PATH_TO_CATEGORY[pathSegment]
      const isEdit = !!postId

      const [form, setForm] = useState({ contentBlocks: EMPTY_PAGE, isFeatured: false })
      const [category, setCategory] = useState(initialCategory || 'GOVERNMENT_JOB')
      const [submitting, setSubmitting] = useState(false)
      const [loadingPost, setLoadingPost] = useState(false)
      const [error, setError] = useState('')
      const [success, setSuccess] = useState('')
      const [saveStatus, setSaveStatus] = useState('idle')  // idle | saving | saved | error
      const [metaOpen, setMetaOpen] = useState(true)

      const autoSaveTimer = useRef(null)

      const sectionLabel = SECTION_LABELS[category] || 'Post'
      const fields = CATEGORY_FIELDS[category] || []

      // Load existing post when editing
      useEffect(() => {
            if (!isEdit) return
            setLoadingPost(true)
            adminGetPost(postId)
                  .then((res) => {
                        const parsed = parseJobToForm(res.data)
                        // Migrate old contentBlocks format if it has old "blocks" key
                        let pageContent = parsed.contentBlocks || EMPTY_PAGE
                        try {
                              const p = JSON.parse(pageContent)
                              // Old format: { blocks: [...] }  →  wrap in new format
                              if (p.blocks && !p.elements) {
                                    pageContent = JSON.stringify({
                                          version: 1, page: { background: '#ffffff', padding: 32 },
                                          elements: (p.blocks || []).map(b => {
                                                const map = { text: 'text', heading: 'heading', table: 'table', image: 'image' }
                                                return { ...b, type: map[b.type] || b.type }
                                          })
                                    })
                              }
                        } catch { }
                        setForm({ ...parsed, contentBlocks: pageContent })
                        if (parsed.category) setCategory(parsed.category)
                  })
                  .catch(() => setError('Post not found or failed to load.'))
                  .finally(() => setLoadingPost(false))
      }, [postId, isEdit])

      const set = useCallback((field, val) => setForm(f => ({ ...f, [field]: val })), [])

      // Autosave debounce — fires 2.5s after last page change
      const scheduleAutoSave = useCallback((pageJson) => {
            if (!isEdit) return  // Only autosave when editing
            clearTimeout(autoSaveTimer.current)
            setSaveStatus('saving')
            autoSaveTimer.current = setTimeout(async () => {
                  try {
                        const payload = { ...form, contentBlocks: pageJson, category }
                        await updatePost(postId, payload)
                        setSaveStatus('saved')
                        setTimeout(() => setSaveStatus('idle'), 3000)
                  } catch {
                        setSaveStatus('error')
                  }
            }, 2500)
      }, [isEdit, form, category, postId, updatePost])

      const handlePageChange = useCallback((pageJson) => {
            set('contentBlocks', pageJson)
            scheduleAutoSave(pageJson)
      }, [set, scheduleAutoSave])

      const handleSubmit = async (status) => {
            setError('')
            setSuccess('')
            if (!form.title?.trim()) { setError('Title is required.'); return }

            setSubmitting(true)
            try {
                  const payload = { ...form, category, status }
                  if (isEdit) await updatePost(postId, payload)
                  else await createPost(payload)
                  setSuccess(status === 'PUBLISHED' ? '✅ Post published!' : '💾 Draft saved!')
                  setTimeout(() => navigate(`/admin/${pathSegment}`), 1200)
            } catch (err) {
                  setError(err?.response?.data?.message || err?.message || 'Save failed.')
            } finally {
                  setSubmitting(false)
            }
      }

      if (loadingPost) {
            return (
                  <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-blue-600" />
                  </div>
            )
      }

      return (
            <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

                  {/* ── Fixed top meta bar ── */}
                  <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                        <div className="max-w-screen-xl mx-auto">
                              {/* Title row */}
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <input
                                          type="text"
                                          value={form.title || ''}
                                          onChange={(e) => set('title', e.target.value)}
                                          placeholder="Post Title (required)"
                                          className="flex-1 min-w-0 px-3 py-2 text-base font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {/* Category */}
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isEdit}
                                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                                          {ALL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    {/* Status */}
                                    <select value={form.status || 'DRAFT'} onChange={(e) => set('status', e.target.value)}
                                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                          <option value="DRAFT">Draft</option>
                                          <option value="PUBLISHED">Published</option>
                                          <option value="UNPUBLISHED">Unpublished</option>
                                    </select>
                                    {/* Featured */}
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                          <div onClick={() => set('isFeatured', !form.isFeatured)}
                                                className={`relative w-9 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                          </div>
                                          <Star size={13} className={form.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                                          <span className="text-xs text-gray-600 hidden sm:inline">Featured</span>
                                    </label>
                              </div>

                              {/* Meta fields toggle + action buttons */}
                              <div className="flex items-center justify-between gap-2">
                                    <button type="button" onClick={() => setMetaOpen(o => !o)}
                                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                          <ChevronDown size={13} className={`transition-transform ${metaOpen ? 'rotate-180' : ''}`} />
                                          {metaOpen ? 'Hide' : 'Show'} metadata fields
                                    </button>

                                    <div className="flex items-center gap-2">
                                          {/* Alerts */}
                                          {error && (
                                                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                                                      <AlertCircle size={12} /> {error}
                                                </span>
                                          )}
                                          {success && <span className="text-xs text-green-600 font-medium">{success}</span>}

                                          <button type="button" onClick={() => handleSubmit('DRAFT')} disabled={submitting}
                                                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                                Save Draft
                                          </button>
                                          <button type="button" onClick={() => handleSubmit('PUBLISHED')} disabled={submitting}
                                                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                                                {isEdit ? 'Update & Publish' : 'Publish'}
                                          </button>
                                          <button type="button" onClick={() => navigate(`/admin/${pathSegment}`)}
                                                className="px-3 py-2 text-gray-500 hover:text-gray-800 text-sm">Cancel</button>
                                    </div>
                              </div>

                              {/* Collapsible meta fields */}
                              {metaOpen && fields.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 pt-3 border-t border-gray-100">
                                          {fields.map(f => (
                                                <Field key={f} name={f} value={form[f]} onChange={set} />
                                          ))}
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* ── Page Editor (fills remaining height) ── */}
                  <div className="flex-1 overflow-hidden">
                        <PageEditor
                              value={form.contentBlocks || EMPTY_PAGE}
                              onChange={handlePageChange}
                              saveStatus={saveStatus}
                        />
                  </div>
            </div>
      )
}

export default AdminPostForm
