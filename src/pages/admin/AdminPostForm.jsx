import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { adminGetPost } from '../../services/api.js'
import { parseJobToForm } from '../../services/api.js'
import * as postService from '../../services/postService'
import { AlertCircle, Loader2 } from 'lucide-react'

// ── Field definitions per category ───────────────────────────────────────────
const FIELD_SETS = {
      GOVERNMENT_JOB: [
            'title', 'organization', 'logoUrl', 'department', 'location', 'qualification',
            'ageLimit', 'salary', 'vacancies', 'applicationStartDate', 'lastDate',
            'examDate', 'selectionProcess', 'description',
            'officialWebsite', 'applyLink', 'notificationUrl',
      ],
      PRIVATE_JOB: [
            'title', 'organization', 'logoUrl', 'jobType', 'location', 'workMode',
            'qualification', 'experience', 'salary', 'skills', 'description',
            'lastDate', 'officialWebsite', 'applyLink',
      ],
      INTERNSHIP: [
            'title', 'organization', 'logoUrl', 'location', 'workMode', 'duration',
            'stipend', 'eligibility', 'skills', 'description',
            'applicationStartDate', 'lastDate', 'officialWebsite', 'applyLink',
      ],
      TIME_TABLE: [
            'title', 'organization', 'course', 'semester', 'subject',
            'examDate', 'startTime', 'endTime', 'description', 'notificationUrl',
      ],
      RESULT: [
            'title', 'examName', 'organization', 'resultDate', 'course',
            'description', 'officialWebsite', 'resultLink', 'notificationUrl',
      ],
      ADMIT_CARD: [
            'title', 'organization', 'examDate', 'releaseDate', 'qualification',
            'description', 'officialWebsite', 'downloadLink', 'notificationUrl',
      ],
}

const FIELD_META = {
      logoUrl: { label: 'Company Logo URL', type: 'url', placeholder: 'https://example.com/logo.png' },
      title: { label: 'Title', type: 'text', required: true },
      organization: { label: 'Organization', type: 'text', required: true },
      department: { label: 'Department', type: 'text' },
      location: { label: 'Location', type: 'text' },
      qualification: { label: 'Qualification', type: 'text' },
      ageLimit: { label: 'Age Limit', type: 'text' },
      salary: { label: 'Salary', type: 'text' },
      stipend: { label: 'Stipend', type: 'text' },
      vacancies: { label: 'Vacancies', type: 'text' },
      applicationStartDate: { label: 'Application Start Date', type: 'date' },
      lastDate: { label: 'Last Date', type: 'date' },
      examDate: { label: 'Exam Date', type: 'date' },
      releaseDate: { label: 'Admit Card Release Date', type: 'date' },
      resultDate: { label: 'Result Date', type: 'date' },
      selectionProcess: { label: 'Selection Process', type: 'textarea' },
      description: { label: 'Description', type: 'textarea' },
      officialWebsite: { label: 'Official Website URL', type: 'url' },
      applyLink: { label: 'Apply Link URL', type: 'url' },
      downloadLink: { label: 'Download Link URL', type: 'url' },
      resultLink: { label: 'Result Link URL', type: 'url' },
      notificationUrl: { label: 'Notification PDF URL', type: 'url' },
      jobType: { label: 'Job Type', type: 'text', placeholder: 'Full-time / Part-time / Contract' },
      workMode: { label: 'Work Mode', type: 'text', placeholder: 'On-site / Remote / Hybrid' },
      experience: { label: 'Experience', type: 'text', placeholder: 'e.g. 0-2 years' },
      skills: { label: 'Skills Required', type: 'text', placeholder: 'e.g. React, Node.js, SQL' },
      duration: { label: 'Duration', type: 'text', placeholder: 'e.g. 3 months' },
      eligibility: { label: 'Eligibility', type: 'text' },
      course: { label: 'Course', type: 'text' },
      semester: { label: 'Semester', type: 'text' },
      subject: { label: 'Subject', type: 'text' },
      startTime: { label: 'Start Time', type: 'time' },
      endTime: { label: 'End Time', type: 'time' },
      examName: { label: 'Exam Name', type: 'text' },
}

const SECTION_LABELS = {
      GOVERNMENT_JOB: 'Government Job',
      PRIVATE_JOB: 'Private Job',
      INTERNSHIP: 'Internship',
      TIME_TABLE: 'Time Table',
      RESULT: 'Result',
      ADMIT_CARD: 'Admit Card',
}

const PATH_TO_CATEGORY = {
      'government-jobs': postService.CATEGORIES.GOVERNMENT_JOB,
      'private-jobs': postService.CATEGORIES.PRIVATE_JOB,
      'internships': postService.CATEGORIES.INTERNSHIP,
      'time-table': postService.CATEGORIES.TIME_TABLE,
      'results': postService.CATEGORIES.RESULT,
      'admit-cards': postService.CATEGORIES.ADMIT_CARD,
}

const AdminPostForm = ({ pathSegment, postId }) => {
      const navigate = useNavigate()
      const { createPost, updatePost } = useData()

      const category = PATH_TO_CATEGORY[pathSegment]
      const sectionLabel = SECTION_LABELS[category] || 'Post'
      const fields = FIELD_SETS[category] || []
      const isEdit = !!postId

      const [form, setForm] = useState({})
      const [submitting, setSubmitting] = useState(false)
      const [loadingPost, setLoadingPost] = useState(false)
      const [error, setError] = useState('')

      // Load existing post when editing
      useEffect(() => {
            if (!isEdit) return
            setLoadingPost(true)
            adminGetPost(postId)
                  .then((res) => {
                        const parsed = parseJobToForm(res.data)
                        setForm(parsed)
                  })
                  .catch(() => setError('Post not found or failed to load.'))
                  .finally(() => setLoadingPost(false))
      }, [postId, isEdit])

      const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

      const handleSubmit = async (status) => {
            setError('')

            // Basic required-field check
            if (!form.title?.trim()) { setError('"Title" is required.'); return }
            if (!form.organization?.trim()) { setError('"Organization" is required.'); return }

            setSubmitting(true)
            try {
                  const payload = { ...form, category, status }
                  if (isEdit) {
                        await updatePost(postId, payload)
                  } else {
                        await createPost(payload)
                  }
                  navigate(`/admin/${pathSegment}`)
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
            <div className="max-w-3xl space-y-6">
                  <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                              {isEdit ? `Edit ${sectionLabel}` : `Add ${sectionLabel}`}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                              Saved to the shared database — visible on all devices immediately.
                        </p>
                  </div>

                  {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                              <span>{error}</span>
                        </div>
                  )}

                  <div className="bg-white rounded-xl border p-6 space-y-5">
                        {fields.map((f) => {
                              const meta = FIELD_META[f]
                              if (!meta) return null
                              const val = form[f] ?? ''

                              return (
                                    <div key={f}>
                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                {meta.label}
                                                {meta.required && <span className="text-red-500 ml-1">*</span>}
                                          </label>
                                          {meta.type === 'textarea' ? (
                                                <textarea
                                                      value={val}
                                                      onChange={(e) => set(f, e.target.value)}
                                                      rows={4}
                                                      placeholder={meta.placeholder || ''}
                                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                          ) : (
                                                <input
                                                      type={meta.type}
                                                      value={val}
                                                      onChange={(e) => set(f, e.target.value)}
                                                      placeholder={meta.placeholder || ''}
                                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                          )}
                                    </div>
                              )
                        })}
                  </div>

                  <div className="flex flex-wrap gap-3">
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
                              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                              {submitting && <Loader2 size={15} className="animate-spin" />}
                              {isEdit ? 'Update & Publish' : 'Publish Job'}
                        </button>
                        <button
                              type="button"
                              onClick={() => navigate(`/admin/${pathSegment}`)}
                              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                              Cancel
                        </button>
                  </div>
            </div>
      )
}

export default AdminPostForm
