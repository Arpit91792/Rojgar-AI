// PostDetail.jsx — Full detail page for any post type (job, internship, result, etc.)
// Reads from localStorage via postService. No network request.

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as postService from '../services/postService'
import { recordView } from './Home'
import {
      ArrowLeft, Building2, MapPin, Calendar, Clock, Users,
      Briefcase, GraduationCap, ExternalLink,
      AlertCircle, FileText, CheckCircle, IndianRupee, Tag,
      Globe, BookOpen, Award, Info
} from 'lucide-react'

// ── Category meta (icon + color) ─────────────────────────────────────────────
const CAT_META = {
      GOVERNMENT_JOB: { label: 'Government Job', Icon: Building2 },
      PRIVATE_JOB: { label: 'Private Job', Icon: Briefcase },
      INTERNSHIP: { label: 'Internship', Icon: GraduationCap },
      TIME_TABLE: { label: 'Time Table', Icon: Calendar },
      RESULT: { label: 'Result', Icon: FileText },
      ADMIT_CARD: { label: 'Admit Card', Icon: Award },
}

// Single blue color palette used everywhere
const CLR = {
      bg: 'bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
}

// Back path for each category
const CAT_BACK = {
      GOVERNMENT_JOB: '/government-jobs',
      PRIVATE_JOB: '/private-jobs',
      INTERNSHIP: '/internships',
      TIME_TABLE: '/time-table',
      RESULT: '/results',
      ADMIT_CARD: '/admit-cards',
}

const fmt = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

const InfoRow = ({ icon: Icon, label, value, highlight }) => {
      if (!value) return null
      return (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                        <p className={`text-sm font-medium ${highlight || 'text-gray-900'} break-words`}>{value}</p>
                  </div>
            </div>
      )
}

const PostDetail = () => {
      const { slug } = useParams()
      const navigate = useNavigate()
      const [post, setPost] = useState(null)
      const [notFound, setNotFound] = useState(false)

      useEffect(() => {
            try {
                  const found = postService.getPostBySlug(slug)
                  if (!found || found.status !== 'PUBLISHED') {
                        setNotFound(true)
                  } else {
                        setPost(found)
                        // Record this post as recently viewed for the Home page widget
                        recordView(found.id)
                  }
            } catch {
                  setNotFound(true)
            }
      }, [slug])

      // Sync with localStorage changes
      useEffect(() => {
            const refresh = () => {
                  try {
                        const found = postService.getPostBySlug(slug)
                        if (found && found.status === 'PUBLISHED') setPost(found)
                        else setNotFound(true)
                  } catch { setNotFound(true) }
            }
            window.addEventListener('rojgar_storage_updated', refresh)
            window.addEventListener('storage', refresh)
            return () => {
                  window.removeEventListener('rojgar_storage_updated', refresh)
                  window.removeEventListener('storage', refresh)
            }
      }, [slug])

      if (notFound) {
            return (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                              This post may have been removed, unpublished, or the link is incorrect.
                        </p>
                        <button
                              onClick={() => navigate(-1)}
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                              ← Go Back
                        </button>
                  </div>
            )
      }

      if (!post) {
            return (
                  <div className="min-h-[50vh] flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
            )
      }

      const meta = CAT_META[post.category] || CAT_META.GOVERNMENT_JOB
      const clr = CLR
      const back = CAT_BACK[post.category] || '/'
      const Icon = meta.Icon

      return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">

                  {/* ── Breadcrumb ── */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span>/</span>
                        <Link to={back} className="hover:text-blue-600 transition-colors">{meta.label}s</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate">{post.title}</span>
                  </div>

                  {/* ── Hero card ── */}
                  <div className={`rounded-2xl overflow-hidden border ${clr.border}`}>
                        {/* Top banner */}
                        <div className={`${clr.bg} px-6 py-6 text-white`}>
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-start gap-4">
                                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Icon size={28} className="text-white" />
                                          </div>
                                          <div>
                                                <h1 className="text-xl md:text-2xl font-bold leading-tight">{post.title}</h1>
                                                <p className="text-white/80 mt-1 text-sm">{post.organization}</p>
                                                {post.department && <p className="text-white/60 text-xs mt-0.5">{post.department}</p>}
                                          </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                                          {meta.label}
                                    </span>
                              </div>
                        </div>

                        {/* Quick stats row */}
                        <div className={`${clr.light} px-6 py-3 flex flex-wrap gap-4 text-sm border-b ${clr.border}`}>
                              {post.location && (
                                    <div className="flex items-center gap-1.5">
                                          <MapPin size={14} className={clr.text} />
                                          <span className="text-gray-700">{post.location}</span>
                                    </div>
                              )}
                              {post.lastDate && (
                                    <div className="flex items-center gap-1.5">
                                          <Calendar size={14} className="text-red-500" />
                                          <span className="text-gray-700">Last Date: <strong className="text-red-600">{fmt(post.lastDate)}</strong></span>
                                    </div>
                              )}
                              {post.examDate && (
                                    <div className="flex items-center gap-1.5">
                                          <Calendar size={14} className={clr.text} />
                                          <span className="text-gray-700">Exam: <strong>{fmt(post.examDate)}</strong></span>
                                    </div>
                              )}
                              {post.vacancies && (
                                    <div className="flex items-center gap-1.5">
                                          <Users size={14} className={clr.text} />
                                          <span className="text-gray-700"><strong>{post.vacancies}</strong> Vacancies</span>
                                    </div>
                              )}
                              {(post.salary || post.stipend) && (
                                    <div className="flex items-center gap-1.5">
                                          <IndianRupee size={14} className="text-green-600" />
                                          <span className="font-medium text-green-700">{post.salary || post.stipend}</span>
                                    </div>
                              )}
                        </div>

                        {/* ── Action buttons ── */}
                        <div className="px-6 py-4 bg-white flex flex-wrap gap-3">
                              {post.applyLink ? (
                                    <a
                                          href={post.applyLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 px-6 py-3 ${clr.bg} text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity`}
                                    >
                                          Apply Now <ExternalLink size={15} />
                                    </a>
                              ) : (
                                    <button
                                          disabled
                                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed"
                                    >
                                          Application Link Not Available
                                    </button>
                              )}

                              {post.resultLink && (
                                    <a
                                          href={post.resultLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                          <ExternalLink size={15} /> View Result
                                    </a>
                              )}

                              {post.officialWebsite && (
                                    <a
                                          href={post.officialWebsite}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                          <Globe size={15} /> Official Website
                                    </a>
                              )}
                        </div>
                  </div>

                  {/* ── Main grid ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Left: Description + Selection Process ── */}
                        <div className="lg:col-span-2 space-y-6">

                              {/* Description */}
                              {post.description && (
                                    <div className="bg-white rounded-xl border p-6">
                                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Info size={18} className={clr.text} /> About this Post
                                          </h2>
                                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{post.description}</p>
                                    </div>
                              )}

                              {/* Selection Process */}
                              {post.selectionProcess && (
                                    <div className="bg-white rounded-xl border p-6">
                                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <CheckCircle size={18} className={clr.text} /> Selection Process
                                          </h2>
                                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{post.selectionProcess}</p>
                                    </div>
                              )}

                              {/* Skills */}
                              {post.skills && (
                                    <div className="bg-white rounded-xl border p-6">
                                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Tag size={18} className={clr.text} /> Skills Required
                                          </h2>
                                          <div className="flex flex-wrap gap-2">
                                                {post.skills.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean).map((skill) => (
                                                      <span key={skill} className={`px-3 py-1 rounded-full text-xs font-medium ${clr.badge}`}>
                                                            {skill}
                                                      </span>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Important Dates */}
                              {(post.applicationStartDate || post.lastDate || post.examDate || post.resultDate || post.releaseDate) && (
                                    <div className="bg-white rounded-xl border p-6">
                                          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Calendar size={18} className={clr.text} /> Important Dates
                                          </h2>
                                          <div className="space-y-0">
                                                {post.applicationStartDate && (
                                                      <InfoRow icon={Calendar} label="Application Start Date" value={fmt(post.applicationStartDate)} />
                                                )}
                                                {post.lastDate && (
                                                      <InfoRow icon={Calendar} label="Last Date to Apply" value={fmt(post.lastDate)} highlight="text-red-600" />
                                                )}
                                                {post.examDate && (
                                                      <InfoRow icon={Calendar} label="Exam Date" value={fmt(post.examDate)} />
                                                )}
                                                {post.resultDate && (
                                                      <InfoRow icon={Calendar} label="Result Date" value={fmt(post.resultDate)} />
                                                )}
                                                {post.releaseDate && (
                                                      <InfoRow icon={Calendar} label="Admit Card Release Date" value={fmt(post.releaseDate)} />
                                                )}
                                                {post.startTime && (
                                                      <InfoRow icon={Clock} label="Start Time" value={post.startTime + (post.endTime ? ` – ${post.endTime}` : '')} />
                                                )}
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* ── Right: Key Details sidebar ── */}
                        <div className="space-y-6">
                              <div className="bg-white rounded-xl border p-5">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Key Details</h3>
                                    <div className="space-y-0">
                                          <InfoRow icon={Building2} label="Organization" value={post.organization} />
                                          <InfoRow icon={MapPin} label="Location" value={post.location} />
                                          <InfoRow icon={BookOpen} label="Qualification" value={post.qualification || post.eligibility} />
                                          <InfoRow icon={Users} label="Vacancies" value={post.vacancies} />
                                          <InfoRow icon={IndianRupee} label="Salary" value={post.salary} highlight="text-green-700" />
                                          <InfoRow icon={IndianRupee} label="Stipend" value={post.stipend} highlight="text-green-700" />
                                          <InfoRow icon={Briefcase} label="Job Type" value={post.jobType} />
                                          <InfoRow icon={Briefcase} label="Work Mode" value={post.workMode} />
                                          <InfoRow icon={Clock} label="Duration" value={post.duration} />
                                          <InfoRow icon={Calendar} label="Age Limit" value={post.ageLimit} />
                                          <InfoRow icon={BookOpen} label="Experience" value={post.experience} />
                                          <InfoRow icon={GraduationCap} label="Course" value={post.course} />
                                          <InfoRow icon={GraduationCap} label="Subject" value={post.subject} />
                                          <InfoRow icon={GraduationCap} label="Exam Name" value={post.examName} />
                                    </div>
                              </div>

                              {/* Links card */}
                              {(post.applyLink || post.officialWebsite || post.resultLink) && (
                                    <div className="bg-white rounded-xl border p-5">
                                          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Important Links</h3>
                                          <div className="space-y-2">
                                                {post.applyLink && (
                                                      <a href={post.applyLink} target="_blank" rel="noopener noreferrer"
                                                            className={`flex items-center justify-between gap-2 px-3 py-2.5 ${clr.light} ${clr.text} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}>
                                                            <span>Apply Online</span><ExternalLink size={14} />
                                                      </a>
                                                )}
                                                {post.officialWebsite && (
                                                      <a href={post.officialWebsite} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                                            <span>Official Website</span><Globe size={14} />
                                                      </a>
                                                )}
                                                {post.resultLink && (
                                                      <a href={post.resultLink} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                                            <span>View Result</span><ExternalLink size={14} />
                                                      </a>
                                                )}
                                          </div>
                                    </div>
                              )}

                              {/* Published date */}
                              {post.publishedAt && (
                                    <p className="text-xs text-gray-400 text-center">
                                          Published on {fmt(post.publishedAt)}
                                    </p>
                              )}
                        </div>
                  </div>

                  {/* ── Back button ── */}
                  <div>
                        <Link
                              to={back}
                              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                              <ArrowLeft size={16} /> Back to {meta.label}s
                        </Link>
                  </div>
            </div>
      )
}

export default PostDetail
