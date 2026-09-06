/**
 * AdminPostForm — Modern post creator/editor with ContentBuilder.
 * - Top section: Title, Category, Status, Featured
 * - Middle section: Legacy fields (org, location, dates, links) + ContentBuilder
 * - Right panel: Live preview
 * - Bottom: Save Draft / Publish
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost, parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import ContentBuilder from '../../components/admin/ContentBuilder.jsx'
import ContentRenderer from '../../components/ContentRenderer.jsx'
import {
      AlertCircle, Loader2, Eye, EyeOff, Star, ChevronDown,
      Building2, MapPin, Calendar, Link2, FileText, Layers
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

// Which structured fields to show per category
const CATEGORY_FIELDS = {
      GOVERNMENT_JOB: ['organization', 'department', 'location', 'qualification', 'ageLimit', 'salary', 'vacancies', 'applicationStartDate', 'lastDate', 'examDate', 'officialWebsite', 'applyLink', 'notificationUrl', 'selectionProcess'],
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
      selectionProcess: { label: 'Selection Process', type: 'textarea', icon: FileText },
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

// ── Section collapse ──────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, defaultOpen = true, children }) => {
      const [open, setOpen] = useState(defaultOpen)
      return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                        <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                              {Icon && <Icon size={16} className="text-blue-500" />}
                              {title}
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <div className="px-5 pb-5 pt-2 border-t border-gray-100">{children}</div>}
            </div>
      )
}

// ── Field renderer ────────────────────────────────────────────────────────────
const Field = ({ name, value, onChange }) => {
      const meta = FIELD_META[name]
      if (!meta) return null
      const Icon = meta.icon || FileText

      return (
            <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                        <Icon size={12} className="text-gray-400" /> {meta.label}
                  </label>
                  {meta.type === 'textarea' ? (
                        <textarea
                              value={value || ''}
                              onChange={(e) => onChange(name, e.target.value)}
                              rows={3}
                              placeholder={meta.placeholder || ''}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                  ) : (
                        <input
                              type={meta.type}
                              value={value || ''}
                              onChange={(e) => onChange(name, e.target.value)}
                              placeholder={meta.placeholder || ''}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                  )}
            </div>
      )
}

// ── Live Preview ──────────────────────────────────────────────────────────────
const LivePreview = ({ form, sectionLabel }) => {
      const hasBlocks = (() => {
            try {
                  const p = JSON.parse(form.contentBlocks || '{"blocks":[]}')
                  return (p.blocks || []).length > 0
            } catch { return false }
      })()

      return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Preview header */}
                  <div className="bg-blue-600 px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Layers size={20} className="text-white" />
                              </div>
                              <div>
                                    <h1 className="text-base font-bold leading-tight">{form.title || 'Post Title'}</h1>
                                    <p className="text-white/70 text-xs mt-0.5">{form.organization || 'Organization'}</p>
                              </div>
                        </div>
                  </div>
                  <div className="p-4 space-y-3">
                        {/* Meta pills */}
                        {(form.location || form.lastDate || form.salary) && (
                              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                    {form.location && <span className="bg-gray-100 px-2 py-1 rounded">📍 {form.location}</span>}
                                    {form.lastDate && <span className="bg-red-50 text-red-600 px-2 py-1 rounded">⏰ {form.lastDate}</span>}
                                    {form.salary && <span className="bg-green-50 text-green-700 px-2 py-1 rounded">₹ {form.salary}</span>}
                              </div>
                        )}
                        {/* Content blocks preview */}
                        {hasBlocks ? (
                              <ContentRenderer contentBlocks={form.contentBlocks} />
                        ) : (
                              <p className="text-gray-400 text-xs italic text-center py-6">Add content blocks to see preview…</p>
                        )}
                        {/* Links */}
                        {(form.applyLink || form.officialWebsite) && (
                              <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    {form.applyLink && (
                                          <span className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg">Apply Now</span>
                                    )}
                                    {form.officialWebsite && (
                                          <span className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg">Official Website</span>
                                    )}
                              </div>
                        )}
                  </div>
            </div>
      )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main AdminPostForm
// ══════════════════════════════════════════════════════════════════════════════
const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const initialCategory = PATH_TO_CATEGORY[pathSegment]
      const isEdit = !!postId

      const [form, setForm] = useState({ contentBlocks: '{"blocks":[]}', isFeatured: false })
      const [category, setCategory] = useState(initialCategory || 'GOVERNMENT_JOB')
      const [submitting, setSubmitting] = useState(false)
      const [loadingPost, setLoadingPost] = useState(false)
      const [error, setError] = useState('')
      const [success, setSuccess] = useState('')
      const [showPreview, setShowPreview] = useState(false)

      const sectionLabel = SECTION_LABELS[category] || 'Post'
      const fields = CATEGORY_FIELDS[category] || []

      // Load post when editing
      useEffect(() => {
            if (!isEdit) return
            setLoadingPost(true)
            adminGetPost(postId)
                  .then((res) => {
                        const parsed = parseJobToForm(res.data)
                        setForm(parsed)
                        // Derive category from parsed data
                        if (parsed.category) setCategory(parsed.category)
                  })
                  .catch(() => setError('Post not found or failed to load.'))
                  .finally(() => setLoadingPost(false))
      }, [postId, isEdit])

      const set = useCallback((field, val) => setForm((f) => ({ ...f, [field]: val })), [])

      const handleSubmit = async (status) => {
            setError('')
            setSuccess('')

            if (!form.title?.trim()) { setError('Title is required.'); return }

            setSubmitting(true)
            try {
                  const payload = { ...form, category, status }
                  if (isEdit) {
                        await updatePost(postId, payload)
                  } else {
                        await createPost(payload)
                  }
                  setSuccess(status === 'PUBLISHED' ? 'Post published successfully!' : 'Draft saved successfully!')
                  setTimeout(() => navigate(`/admin/${pathSegment}`), 1200)
            } catch (err) {
                  const msg = err?.response?.data?.message || err?.message || 'Save failed. Please try again.'
                  setError(msg)
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
            <div className="max-w-7xl space-y-6">
                  {/* Page header */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                              <h2 className="text-2xl font-bold text-gray-900">
                                    {isEdit ? `Edit ${sectionLabel}` : `Create ${sectionLabel}`}
                              </h2>
                              <p className="text-sm text-gray-500 mt-0.5">
                                    Saved directly to the database — visible on all devices immediately.
                              </p>
                        </div>
                        <button
                              type="button"
                              onClick={() => setShowPreview((p) => !p)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${showPreview ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                              {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                              {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                  </div>

                  {/* Alerts */}
                  {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> <span>{error}</span>
                        </div>
                  )}
                  {success && (
                        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                              <span>✅ {success}</span>
                        </div>
                  )}

                  {/* Main layout */}
                  <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>

                        {/* ── LEFT / EDITOR COLUMN ── */}
                        <div className="space-y-5">

                              {/* Post Meta */}
                              <Section title="Post Details" icon={FileText} defaultOpen>
                                    <div className="space-y-4 pt-1">
                                          {/* Title */}
                                          <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                      Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                      type="text"
                                                      value={form.title || ''}
                                                      onChange={(e) => set('title', e.target.value)}
                                                      placeholder="e.g. SSC CGL 2026 Notification"
                                                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                                />
                                          </div>

                                          {/* Category + Status row */}
                                          <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                      <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                                                      <select
                                                            value={category}
                                                            onChange={(e) => setCategory(e.target.value)}
                                                            disabled={isEdit}
                                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                                                      >
                                                            {ALL_CATEGORIES.map((c) => (
                                                                  <option key={c.value} value={c.value}>{c.label}</option>
                                                            ))}
                                                      </select>
                                                </div>
                                                <div>
                                                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                      <select
                                                            value={form.status || 'DRAFT'}
                                                            onChange={(e) => set('status', e.target.value)}
                                                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                      >
                                                            <option value="DRAFT">Draft</option>
                                                            <option value="PUBLISHED">Published</option>
                                                            <option value="UNPUBLISHED">Unpublished</option>
                                                      </select>
                                                </div>
                                          </div>

                                          {/* Featured toggle */}
                                          <label className="flex items-center gap-3 cursor-pointer select-none">
                                                <div
                                                      onClick={() => set('isFeatured', !form.isFeatured)}
                                                      className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                >
                                                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span className="flex items-center gap-1.5 text-sm text-gray-700">
                                                      <Star size={14} className={form.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                                                      Featured post
                                                </span>
                                          </label>
                                    </div>
                              </Section>

                              {/* Structured fields */}
                              {fields.length > 0 && (
                                    <Section title="Key Information" icon={Building2} defaultOpen>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                                {fields.map((f) => (
                                                      <div key={f} className={FIELD_META[f]?.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                                            <Field name={f} value={form[f]} onChange={set} />
                                                      </div>
                                                ))}
                                          </div>
                                    </Section>
                              )}

                              {/* Content Builder */}
                              <Section title="Content Blocks" icon={Layers} defaultOpen>
                                    <div className="pt-1">
                                          <p className="text-xs text-gray-500 mb-3">
                                                Build the post content using blocks. Add text, headings, tables, and images in any order.
                                          </p>
                                          <ContentBuilder
                                                value={form.contentBlocks || '{"blocks":[]}'}
                                                onChange={(v) => set('contentBlocks', v)}
                                          />
                                    </div>
                              </Section>

                        </div>

                        {/* ── RIGHT / PREVIEW COLUMN ── */}
                        {showPreview && (
                              <div className="space-y-4">
                                    <div className="sticky top-20">
                                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <Eye size={12} /> Live Preview
                                          </p>
                                          <LivePreview form={{ ...form, category }} sectionLabel={sectionLabel} />
                                    </div>
                              </div>
                        )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200 bg-white rounded-xl p-4">
                        <button
                              type="button"
                              onClick={() => handleSubmit('DRAFT')}
                              disabled={submitting}
                              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                        >
                              {submitting && <Loader2 size={15} className="animate-spin" />}
                              Save Draft
                        </button>
                        <button
                              type="button"
                              onClick={() => handleSubmit('PUBLISHED')}
                              disabled={submitting}
                              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                              {submitting && <Loader2 size={15} className="animate-spin" />}
                              {isEdit ? 'Update & Publish' : 'Publish Post'}
                        </button>
                        <button
                              type="button"
                              onClick={() => navigate(`/admin/${pathSegment}`)}
                              className="px-4 py-2.5 text-gray-500 hover:text-gray-800 text-sm font-medium"
                        >
                              Cancel
                        </button>
                  </div>
            </div>
      )
}

export default AdminPostForm
