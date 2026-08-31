import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
      Briefcase, MapPin, Clock, Share2, Heart,
      Building2, ExternalLink,
      Timer, CalendarDays, IndianRupee
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null

const daysLeft = (deadline) => {
      if (!deadline) return null
      return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

const splitTags = (str, max = 6) => {
      if (!str) return []
      return str.split(/[,|;]/).map((s) => s.trim()).filter(Boolean).slice(0, max)
}

// All badges use blue
const modeBadge = (mode) => {
      if (!mode) return null
      return { label: mode, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
}

const typeBadge = (type) => {
      if (!type) return null
      return { label: type, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
}

// ── Mini pill badge ───────────────────────────────────────────────────────────
const Pill = ({ children }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            {children}
      </span>
)

// ── Company logo / initials ───────────────────────────────────────────────────
const OrgLogo = ({ name, logoUrl }) => {
      if (logoUrl) {
            return (
                  <img
                        src={logoUrl}
                        alt={name}
                        className="w-12 h-12 rounded-xl object-contain border border-slate-100 bg-white p-1 shadow-sm flex-shrink-0"
                  />
            )
      }
      const initials = (name || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
      return (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border border-blue-100 shadow-sm bg-blue-50 text-blue-700">
                  {initials}
            </div>
      )
}

// ── Main JobCard ──────────────────────────────────────────────────────────────
const JobCard = ({ job }) => {
      const [liked, setLiked] = useState(false)
      const [shared, setShared] = useState(false)

      if (!job) return null

      const pay = job.salary || job.stipend || null
      const skillList = splitTags(job.skills, 4)
      const extraSkills = job.skills ? splitTags(job.skills).length - skillList.length : 0
      const tagSource = [job.qualification, job.eligibility, job.department].filter(Boolean).join(', ')
      const tags = splitTags(tagSource, 4)
      const extraTags = splitTags(tagSource).length - tags.length
      const deadline = job.lastDate || null
      const remaining = daysLeft(deadline)
      const wm = modeBadge(job.workMode || job.location)
      const jt = typeBadge(job.jobType || job.duration)
      const exp = job.experience || job.ageLimit || null

      const handleShare = (e) => {
            e.preventDefault()
            if (navigator.share) {
                  navigator.share({ title: job.title, url: window.location.origin + `/posts/${job.slug}` })
            } else {
                  navigator.clipboard?.writeText(window.location.origin + `/posts/${job.slug}`)
                  setShared(true)
                  setTimeout(() => setShared(false), 2000)
            }
      }

      return (
            <Link
                  to={`/posts/${job.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden"
            >
                  {/* ── Top ── */}
                  <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                          {job.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5 truncate">{job.organization}</p>
                              </div>
                              <OrgLogo name={job.organization} logoUrl={job.logoUrl} />
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
                              {exp && (
                                    <span className="flex items-center gap-1.5">
                                          <Briefcase size={13} className="text-slate-400 flex-shrink-0" />
                                          {exp}
                                    </span>
                              )}
                              {jt && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${jt.bg} ${jt.text} ${jt.border}`}>
                                          <Clock size={11} /> {jt.label}
                                    </span>
                              )}
                              {wm && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${wm.bg} ${wm.text} ${wm.border}`}>
                                          <MapPin size={11} /> {wm.label}
                                    </span>
                              )}
                              {!wm && job.location && (
                                    <span className="flex items-center gap-1.5">
                                          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                                          {job.location}
                                    </span>
                              )}
                        </div>

                        {/* Skills row */}
                        {skillList.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-3 text-xs text-slate-500">
                                    {skillList.map((s, i) => (
                                          <React.Fragment key={s}>
                                                {i > 0 && <span className="text-slate-300">•</span>}
                                                <span>{s}</span>
                                          </React.Fragment>
                                    ))}
                                    {extraSkills > 0 && (
                                          <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-blue-500 font-medium">+{extraSkills} more</span>
                                          </>
                                    )}
                              </div>
                        )}
                  </div>

                  <div className="mx-5 border-t border-slate-100" />

                  {/* ── Middle: tags + salary ── */}
                  <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                              {tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}
                              {extraTags > 0 && <Pill>+{extraTags}</Pill>}
                              {tags.length === 0 && job.vacancies && <Pill>{job.vacancies} Vacancies</Pill>}
                        </div>
                        {pay && (
                              <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold whitespace-nowrap">
                                    <IndianRupee size={11} /> {pay}
                              </span>
                        )}
                  </div>

                  <div className="mx-5 border-t border-slate-100" />

                  {/* ── Bottom: dates + actions ── */}
                  <div className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-400">
                              {job.createdAt && (
                                    <span className="flex items-center gap-1">
                                          <CalendarDays size={11} /> Posted {fmtDate(job.createdAt)}
                                    </span>
                              )}
                              {remaining !== null && (
                                    <span className={`flex items-center gap-1 font-medium ${remaining <= 3 ? 'text-red-500' : remaining <= 7 ? 'text-blue-500' : 'text-slate-500'}`}>
                                          <Timer size={11} />
                                          {remaining > 0 ? `${remaining} days left` : remaining === 0 ? 'Last day' : 'Deadline passed'}
                                    </span>
                              )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                              <button
                                    onClick={handleShare}
                                    title={shared ? 'Link copied!' : 'Share'}
                                    className={`p-1.5 rounded-lg transition-colors ${shared ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                              >
                                    <Share2 size={15} />
                              </button>
                              <button
                                    onClick={(e) => { e.preventDefault(); setLiked((l) => !l) }}
                                    title={liked ? 'Saved' : 'Save'}
                                    className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-400 hover:bg-blue-50'}`}
                              >
                                    <Heart size={15} className={liked ? 'fill-blue-600' : ''} />
                              </button>
                              {job.applyLink && (
                                    <a
                                          href={job.applyLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors"
                                    >
                                          Apply <ExternalLink size={11} />
                                    </a>
                              )}
                        </div>
                  </div>
            </Link>
      )
}

export default JobCard
