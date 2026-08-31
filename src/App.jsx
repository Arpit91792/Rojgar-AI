import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Error boundary
import ErrorBoundary from './components/ErrorBoundary'

// Auth + Data contexts
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

// Public layout + pages
import Layout from './components/Layout'
import Home from './pages/Home'
import GovernmentJobs from './pages/GovernmentJobs'
import PrivateJobs from './pages/PrivateJobs'
import Internships from './pages/Internships'
import TimeTable from './pages/TimeTable'
import Results from './pages/Results'
import AdmitCards from './pages/AdmitCards'
import PostDetail from './pages/PostDetail'
import SearchPage from './pages/SearchPage'
import NotFound from './pages/NotFound'

// Admin layout + pages
import AdminLayout from './layouts/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNotifications from './pages/admin/AdminNotifications'

import {
      AdminGovernmentJobsList,
      AdminGovernmentJobsAdd,
      AdminGovernmentJobsEdit,
} from './pages/admin/AdminGovernmentJobs'

import {
      AdminPrivateJobsList,
      AdminPrivateJobsAdd,
      AdminPrivateJobsEdit,
} from './pages/admin/AdminPrivateJobs'

import {
      AdminInternshipsList,
      AdminInternshipsAdd,
      AdminInternshipsEdit,
} from './pages/admin/AdminInternships'

import {
      AdminTimeTableList,
      AdminTimeTableAdd,
      AdminTimeTableEdit,
} from './pages/admin/AdminTimeTable'

import {
      AdminResultsList,
      AdminResultsAdd,
      AdminResultsEdit,
} from './pages/admin/AdminResults'

import {
      AdminAdmitCardsList,
      AdminAdmitCardsAdd,
      AdminAdmitCardsEdit,
} from './pages/admin/AdminAdmitCards'

// ── Wrapped protected admin page ─────────────────────────────────────────────
const AdminPage = ({ children }) => (
      <ProtectedAdminRoute>
            <AdminLayout>{children}</AdminLayout>
      </ProtectedAdminRoute>
)

function App() {
      return (
            <ErrorBoundary>
                  {/*
        DataProvider wraps everything so both admin panel and public pages
        share the same in-memory data store during local development.
        When connecting PostgreSQL, DataProvider can be removed and each
        page/component will fetch from the real API instead.
      */}
                  <DataProvider>
                        <AuthProvider>
                              <Router>
                                    <Routes>
                                          {/* ── PUBLIC ROUTES ── */}
                                          <Route path="/" element={<Layout />}>
                                                <Route index element={<Home />} />
                                                <Route path="government-jobs" element={<GovernmentJobs />} />
                                                <Route path="private-jobs" element={<PrivateJobs />} />
                                                <Route path="internships" element={<Internships />} />
                                                <Route path="time-table" element={<TimeTable />} />
                                                <Route path="results" element={<Results />} />
                                                <Route path="admit-cards" element={<AdmitCards />} />
                                                {/* Post detail page — works for all categories */}
                                                <Route path="posts/:slug" element={<PostDetail />} />
                                                <Route path="search" element={<SearchPage />} />
                                                <Route path="*" element={<NotFound />} />
                                          </Route>

                                          {/* ── ADMIN LOGIN ── */}
                                          <Route path="/admin" element={<AdminLogin />} />

                                          {/* ── ADMIN PROTECTED ROUTES ── */}
                                          <Route
                                                path="/admin/dashboard"
                                                element={<AdminPage><AdminDashboard /></AdminPage>}
                                          />

                                          {/* Government Jobs */}
                                          <Route
                                                path="/admin/government-jobs"
                                                element={<AdminPage><AdminGovernmentJobsList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/government-jobs/add"
                                                element={<AdminPage><AdminGovernmentJobsAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/government-jobs/edit/:id"
                                                element={<AdminPage><AdminGovernmentJobsEdit /></AdminPage>}
                                          />

                                          {/* Private Jobs */}
                                          <Route
                                                path="/admin/private-jobs"
                                                element={<AdminPage><AdminPrivateJobsList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/private-jobs/add"
                                                element={<AdminPage><AdminPrivateJobsAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/private-jobs/edit/:id"
                                                element={<AdminPage><AdminPrivateJobsEdit /></AdminPage>}
                                          />

                                          {/* Internships */}
                                          <Route
                                                path="/admin/internships"
                                                element={<AdminPage><AdminInternshipsList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/internships/add"
                                                element={<AdminPage><AdminInternshipsAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/internships/edit/:id"
                                                element={<AdminPage><AdminInternshipsEdit /></AdminPage>}
                                          />

                                          {/* Time Table */}
                                          <Route
                                                path="/admin/time-table"
                                                element={<AdminPage><AdminTimeTableList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/time-table/add"
                                                element={<AdminPage><AdminTimeTableAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/time-table/edit/:id"
                                                element={<AdminPage><AdminTimeTableEdit /></AdminPage>}
                                          />

                                          {/* Results */}
                                          <Route
                                                path="/admin/results"
                                                element={<AdminPage><AdminResultsList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/results/add"
                                                element={<AdminPage><AdminResultsAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/results/edit/:id"
                                                element={<AdminPage><AdminResultsEdit /></AdminPage>}
                                          />

                                          {/* Admit Cards */}
                                          <Route
                                                path="/admin/admit-cards"
                                                element={<AdminPage><AdminAdmitCardsList /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/admit-cards/add"
                                                element={<AdminPage><AdminAdmitCardsAdd /></AdminPage>}
                                          />
                                          <Route
                                                path="/admin/admit-cards/edit/:id"
                                                element={<AdminPage><AdminAdmitCardsEdit /></AdminPage>}
                                          />

                                          {/* Notifications */}
                                          <Route
                                                path="/admin/notifications"
                                                element={<AdminPage><AdminNotifications /></AdminPage>}
                                          />

                                          {/* Catch-all for /admin/* unknown routes */}
                                          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                                    </Routes>
                              </Router>
                        </AuthProvider>
                  </DataProvider>
            </ErrorBoundary>
      )
}

export default App
