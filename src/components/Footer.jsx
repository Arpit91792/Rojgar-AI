import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Sparkles } from 'lucide-react'
import logo from '../assets/logo.jpeg'

const LINKS = {
      'Explore': [
            { label: 'Government Jobs', to: '/government-jobs' },
            { label: 'Private Jobs', to: '/private-jobs' },
            { label: 'Internships', to: '/internships' },
            { label: 'Results', to: '/results' },
            { label: 'Admit Cards', to: '/admit-cards' },
            { label: 'Time Table', to: '/time-table' },
      ],
      'Resources': [
            { label: 'Career Guidance', href: '#' },
            { label: 'Resume Tips', href: '#' },
            { label: 'Interview Prep', href: '#' },
            { label: 'Previous Year Papers', href: '#' },
            { label: 'Skill Development', href: '#' },
            { label: 'Blog', href: '#' },
      ],
}

const SOCIALS = [
      { icon: Facebook, href: '#', label: 'Facebook' },
      { icon: Twitter, href: '#', label: 'Twitter' },
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Instagram, href: '#', label: 'Instagram' },
]

const Footer = () => (
      <footer className="bg-slate-900 text-white mt-12">
            {/* Top gradient strip */}
            <div className="h-1 gradient-hero" />

            <div className="px-6 lg:px-10 py-14">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Brand */}
                        <div className="lg:col-span-1">
                              <div className="flex items-center gap-3 mb-4">
                                    <img src={logo} alt="Rojgar AI" className="h-11 w-auto object-contain" />
                              </div>
                              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                    India's trusted platform for career opportunities — government jobs, private sector, internships &amp; more. Updated every day.
                              </p>
                              {/* Social icons */}
                              <div className="flex gap-2">
                                    {SOCIALS.map(({ icon: Icon, href, label }) => (
                                          <a
                                                key={label}
                                                href={href}
                                                aria-label={label}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200"
                                          >
                                                <Icon size={16} />
                                          </a>
                                    ))}
                              </div>
                        </div>

                        {/* Link columns */}
                        {Object.entries(LINKS).map(([heading, items]) => (
                              <div key={heading}>
                                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{heading}</h4>
                                    <ul className="space-y-2.5">
                                          {items.map((item) => (
                                                <li key={item.label}>
                                                      {'to' in item ? (
                                                            <Link to={item.to} className="text-slate-400 hover:text-white text-sm transition-colors">
                                                                  {item.label}
                                                            </Link>
                                                      ) : (
                                                            <a href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                                                                  {item.label}
                                                            </a>
                                                      )}
                                                </li>
                                          ))}
                                    </ul>
                              </div>
                        ))}

                        {/* Contact */}
                        <div>
                              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact</h4>
                              <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-slate-400 text-sm">
                                          <MapPin size={15} className="mt-0.5 flex-shrink-0 text-blue-400" />
                                          <span>123 Tech Park, Sector 62, Noida, UP 201301</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-400 text-sm">
                                          <Phone size={15} className="flex-shrink-0 text-blue-400" />
                                          <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-400 text-sm">
                                          <Mail size={15} className="flex-shrink-0 text-blue-400" />
                                          <a href="mailto:support@rojgarai.com" className="hover:text-white transition-colors">support@rojgarai.com</a>
                                    </li>
                              </ul>

                              {/* Newsletter pill */}
                              <div className="mt-6 p-4 rounded-2xl bg-slate-800 border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                          <Sparkles size={13} className="text-yellow-400" />
                                          <p className="text-xs font-bold text-white">Get Job Alerts</p>
                                    </div>
                                    <p className="text-xs text-slate-400">Subscribe for daily job updates in your inbox.</p>
                              </div>
                        </div>

                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-xs">© 2026 Rojgar AI. All rights reserved.</p>
                        <div className="flex gap-5 text-xs text-slate-500">
                              {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map((t) => (
                                    <a key={t} href="#" className="hover:text-white transition-colors">{t}</a>
                              ))}
                        </div>
                  </div>
            </div>
      </footer>
)

export default Footer
