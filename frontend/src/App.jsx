import { useEffect, useState } from 'react'

import { useNavigate, useLocation } from 'react-router-dom'

import api from './api/api'

function App() {

  const navigate = useNavigate()

  const location = useLocation()

  const [dashboard, setDashboard] = useState(null)

  const [insight, setInsight] = useState(null)

  const [applications, setApplications] = useState([])

  const [interviews, setInterviews] = useState([])

  const [assessments, setAssessments] = useState([])

  const [currentTime, setCurrentTime] = useState(new Date())

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Update the greeting automatically as time changes.

  useEffect(() => {

    const updateTime = () => setCurrentTime(new Date())

    const timer = setInterval(updateTime, 60000)

    return () => clearInterval(timer)

  }, [])

  const hour = currentTime.getHours()

  const greeting =

    hour >= 5 && hour < 12

      ? 'Good Morning'

      : hour >= 12 && hour < 17

        ? 'Good Afternoon'

        : 'Good Evening'

  const navigation = [

    { label: 'Dashboard', path: '/dashboard' },

    { label: 'Applications', path: '/applications' },

    { label: 'Interviews', path: '/interviews' },

    { label: 'Assessments', path: '/assessments' },

    { label: 'Tasks', path: '/tasks' },

    { label: 'Insights', path: '/insights' },

    { label: 'Resume Matcher', path: '/resume-matching' },

  ]

  useEffect(() => {

    let cancelled = false

    const fetchDashboardData = async () => {

      try {

        setLoading(true)

        setError('')

        const [

          dashboardResponse,

          insightResponse,

          applicationsResponse,

        ] = await Promise.all([

          api.get('/dashboard'),

          api.get('/insights'),

          api.get('/applications'),

        ])

        if (cancelled) return

        const applicationList = Array.isArray(applicationsResponse.data)

          ? applicationsResponse.data

          : []

        setDashboard(dashboardResponse.data)

        setInsight(insightResponse.data)

        setApplications(applicationList)

        // Load interviews and assessments for each application.

        const results = await Promise.all(

          applicationList.map(async (application) => {

            const [interviewResult, assessmentResult] =

              await Promise.all([

                api.get(

                  `/applications/${application.id}/interviews`

                ).catch((err) => {

                  console.error(

                    `Could not load interviews for application ${application.id}`,

                    err

                  )

                  return { data: [] }

                }),

                api.get(

                  `/applications/${application.id}/assessments`

                ).catch((err) => {

                  console.error(

                    `Could not load assessments for application ${application.id}`,

                    err

                  )

                  return { data: [] }

                }),

              ])

            const applicationDetails = {

              applicationId: application.id,

              jobTitle: application.jobTitle,

              companyName: application.companyName,

            }

            return {

              interviews: (

                Array.isArray(interviewResult.data)

                  ? interviewResult.data

                  : []

              ).map((item) => ({

                ...item,

                ...applicationDetails,

              })),

              assessments: (

                Array.isArray(assessmentResult.data)

                  ? assessmentResult.data

                  : []

              ).map((item) => ({

                ...item,

                ...applicationDetails,

              })),

            }

          })

        )

        if (cancelled) return

        setInterviews(results.flatMap((item) => item.interviews))

        setAssessments(results.flatMap((item) => item.assessments))

      } catch (err) {

        console.error(err)

        if (!cancelled) {

          if (

            err.response?.status === 401 ||

            err.response?.status === 403

          ) {

            setError(

              'Your session has expired. Please login again.'

            )

          } else {

            setError('Unable to load dashboard data.')

          }

        }

      } finally {

        if (!cancelled) setLoading(false)

      }

    }

    fetchDashboardData()

    return () => {

      cancelled = true

    }

  }, [])

  const getStatusClass = (status) => {

    switch (status) {

      case 'SAVED':

        return 'bg-slate-500/10 text-slate-400'

      case 'APPLIED':

        return 'bg-blue-500/10 text-blue-400'

      case 'SCREENING':

        return 'bg-yellow-500/10 text-yellow-400'

      case 'ASSESSMENT':

        return 'bg-orange-500/10 text-orange-400'

      case 'TECHNICAL_INTERVIEW':

        return 'bg-purple-500/10 text-purple-400'

      case 'HR_INTERVIEW':

        return 'bg-pink-500/10 text-pink-400'

      case 'OFFER':

        return 'bg-green-500/10 text-green-400'

      case 'REJECTED':

        return 'bg-red-500/10 text-red-400'

      case 'WITHDRAWN':

        return 'bg-gray-500/10 text-gray-400'

      default:

        return 'bg-slate-500/10 text-slate-400'

    }

  }

  const formatStatus = (status) => {

    if (!status) return 'Unknown'

    return status

      .replaceAll('_', ' ')

      .toLowerCase()

      .replace(/\b\w/g, (letter) => letter.toUpperCase())

  }

  const formatDate = (date) => {

    if (!date) return 'Not specified'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return date

    return parsedDate.toLocaleDateString('en-IN', {

      day: 'numeric',

      month: 'short',

      year: 'numeric',

    })

  }

  const formatDateTime = (date) => {

    if (!date) return 'Not scheduled'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return date

    return parsedDate.toLocaleString('en-IN', {

      day: 'numeric',

      month: 'short',

      year: 'numeric',

      hour: 'numeric',

      minute: '2-digit',

    })

  }

  const now = currentTime.getTime()

  const nextSevenDays = now + 7 * 24 * 60 * 60 * 1000

  const upcomingInterviews = interviews

    .filter((interview) => {

      if (

        !interview.scheduledAt ||

        !['SCHEDULED', 'RESCHEDULED'].includes(interview.status)

      ) {

        return false

      }

      const date = new Date(interview.scheduledAt).getTime()

      return (

        Number.isFinite(date) &&

        date >= now &&

        date <= nextSevenDays

      )

    })

    .sort(

      (a, b) =>

        new Date(a.scheduledAt).getTime() -

        new Date(b.scheduledAt).getTime()

    )

    .slice(0, 5)

  const overdueAssessments = assessments

    .filter((assessment) => {

      if (

        !assessment.deadline ||

        ['COMPLETED', 'CANCELLED'].includes(assessment.status)

      ) {

        return false

      }

      const deadline = new Date(assessment.deadline).getTime()

      return Number.isFinite(deadline) && deadline < now

    })

    .sort(

      (a, b) =>

        new Date(a.deadline).getTime() -

        new Date(b.deadline).getTime()

    )

    .slice(0, 5)

  const upcomingAssessments = assessments

    .filter((assessment) => {

      if (

        !assessment.deadline ||

        ['COMPLETED', 'CANCELLED'].includes(assessment.status)

      ) {

        return false

      }

      const deadline = new Date(assessment.deadline).getTime()

      return (

        Number.isFinite(deadline) &&

        deadline >= now &&

        deadline <= nextSevenDays

      )

    })

    .sort(

      (a, b) =>

        new Date(a.deadline).getTime() -

        new Date(b.deadline).getTime()

    )

    .slice(0, 5)

  const stats = [

    {

      label: 'Total Applications',

      value: dashboard?.totalApplications ?? 0,

    },

    {

      label: 'Interviews',

      value: dashboard?.interviews ?? 0,

    },

    {

      label: 'Assessments',

      value: assessments.length,

    },

    {

      label: 'Offers',

      value: dashboard?.offers ?? 0,

    },

  ]

  const pipeline = [

    {

      label: 'Saved',

      value: dashboard?.saved ?? 0,

      status: 'SAVED',

      bar: 'bg-slate-500',

    },

    {

      label: 'Applied',

      value: dashboard?.applied ?? 0,

      status: 'APPLIED',

      bar: 'bg-blue-500',

    },

    {

      label: 'Screening',

      value: dashboard?.screening ?? 0,

      status: 'SCREENING',

      bar: 'bg-yellow-500',

    },

    {

      label: 'Assessment',

      value: dashboard?.assessment ?? 0,

      status: 'ASSESSMENT',

      bar: 'bg-orange-500',

    },

    {

      label: 'Technical Interview',

      value: dashboard?.technicalInterview ?? 0,

      status: 'TECHNICAL_INTERVIEW',

      bar: 'bg-purple-500',

    },

    {

      label: 'HR Interview',

      value: dashboard?.hrInterview ?? 0,

      status: 'HR_INTERVIEW',

      bar: 'bg-pink-500',

    },

    {

      label: 'Offer',

      value: dashboard?.offers ?? 0,

      status: 'OFFER',

      bar: 'bg-green-500',

    },

    {

      label: 'Rejected',

      value: dashboard?.rejected ?? 0,

      status: 'REJECTED',

      bar: 'bg-red-500',

    },

    {

      label: 'Withdrawn',

      value: dashboard?.withdrawn ?? 0,

      status: 'WITHDRAWN',

      bar: 'bg-gray-500',

    },

  ]

  const activeApplications =

    (dashboard?.totalApplications ?? 0) -

    (dashboard?.rejected ?? 0) -

    (dashboard?.withdrawn ?? 0)

  const interviewRate =

    dashboard?.totalApplications > 0

      ? Math.round(

          (dashboard.interviews / dashboard.totalApplications) * 100

        )

      : 0

  const offerRate =

    dashboard?.totalApplications > 0

      ? Math.round(

          (dashboard.offers / dashboard.totalApplications) * 100

        )

      : 0

  const hasReminders =

    upcomingInterviews.length > 0 ||

    upcomingAssessments.length > 0 ||

    overdueAssessments.length > 0

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="relative flex min-h-screen">

        {/* Sidebar */}

        <aside className={`${mobileMenuOpen ? "fixed inset-x-0 top-[88px] z-20 block border-b border-slate-800" : "hidden"} bg-slate-900 p-6 md:relative md:inset-auto md:top-auto md:z-auto md:block md:w-64 md:shrink-0 md:border-b-0 md:border-r`}>

          <div className="mb-10">

            <h1 className="text-2xl font-bold tracking-tight">

              Apply<span className="text-blue-500">Track</span>

            </h1>

            <p className="mt-1 text-xs text-slate-400">

              Intelligent Job Management

            </p>

          </div>

          <nav className="space-y-2">

            {navigation.map((item) => {

              const isActive =

                location.pathname === item.path ||

                (

                  item.path === '/applications' &&

                  location.pathname.startsWith('/applications/')

                )

              return (

                <button

                  key={item.path}

                  onClick={() => { navigate(item.path); setMobileMenuOpen(false) }}

                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${

                    isActive

                      ? 'bg-blue-600 text-white'

                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'

                  }`}

                >

                  {item.label}

                </button>

              )

            })}

          </nav>

        </aside>

        {/* Main Content */}

        <main className="flex-1">

          {/* Header */}

          <header className="border-b border-slate-800 bg-slate-950 px-6 py-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation menu"
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 md:hidden"
                >
                  {mobileMenuOpen ? "Close" : "Menu"}
                </button>
                <div>
                  <h2 className="text-xl font-semibold">Dashboard</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Manage your job search intelligently.
                  </p>
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">

                NK

              </div>

            </div>

          </header>

          {/* Dashboard */}

          <section className="p-6">

            <div className="mb-6">

              <h3 className="text-2xl font-bold">

                {greeting}, Narinder 👋

              </h3>

              <p className="mt-1 text-slate-400">

                Here's what's happening with your job search.

              </p>

              <p className="mt-2 text-xs text-slate-500">

                {currentTime.toLocaleDateString('en-IN', {

                  weekday: 'long',

                  day: 'numeric',

                  month: 'long',

                  year: 'numeric',

                })}

                {' · '}

                {currentTime.toLocaleTimeString('en-IN', {

                  hour: '2-digit',

                  minute: '2-digit',

                })}

              </p>

            </div>

            {/* Loading */}

            {loading && (

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">

                Loading your dashboard and reminders...

              </div>

            )}

            {/* Error */}

            {error && !loading && (

              <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-400">

                {error}

              </div>

            )}

            {!loading && !error && (

              <>

                {/* Stats */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {stats.map((stat) => (

                    <div

                      key={stat.label}

                      className="rounded-xl border border-slate-800 bg-slate-900 p-5"

                    >

                      <p className="text-sm text-slate-400">

                        {stat.label}

                      </p>

                      <p className="mt-2 text-3xl font-bold">

                        {stat.value}

                      </p>

                    </div>

                  ))}

                </div>

                {/* Analytics Overview */}

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                    <p className="text-sm text-slate-400">

                      Active Applications

                    </p>

                    <p className="mt-2 text-3xl font-bold">

                      {Math.max(activeApplications, 0)}

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Applications still in progress

                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                    <p className="text-sm text-slate-400">

                      Interview Rate

                    </p>

                    <p className="mt-2 text-3xl font-bold">

                      {interviewRate}%

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Interviews per application

                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                    <p className="text-sm text-slate-400">

                      Offer Rate

                    </p>

                    <p className="mt-2 text-3xl font-bold">

                      {offerRate}%

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Offers per application

                    </p>

                  </div>

                </div>

                {/* Reminders */}

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-semibold">

                        Reminders & Upcoming Events

                      </h3>

                      <p className="mt-1 text-sm text-slate-400">

                        Your next seven days, plus any overdue assessments.

                      </p>

                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">

                      {upcomingInterviews.length +

                        upcomingAssessments.length +

                        overdueAssessments.length} reminders

                    </span>

                  </div>

                  {!hasReminders ? (

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">

                      <p className="text-2xl">🎉</p>

                      <p className="mt-2 font-medium">

                        You're all caught up!

                      </p>

                      <p className="mt-1 text-sm text-slate-400">

                        No upcoming interviews or assessment deadlines in the next seven days.

                      </p>

                    </div>

                  ) : (

                    <div className="space-y-6">

                      {/* Overdue assessments */}

                      {overdueAssessments.length > 0 && (

                        <div>

                          <h4 className="mb-3 text-sm font-semibold text-red-400">

                            ⚠️ Overdue Assessments

                          </h4>

                          <div className="space-y-3">

                            {overdueAssessments.map((assessment) => (

                              <button

                                key={`${assessment.applicationId}-${assessment.id}`}

                                onClick={() => navigate('/assessments')}

                                className="w-full rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-left transition hover:bg-red-950/40"

                              >

                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                                  <div>

                                    <p className="font-medium">

                                      {assessment.assessmentName}

                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">

                                      {assessment.companyName} · {assessment.jobTitle}

                                    </p>

                                  </div>

                                  <div className="sm:text-right">

                                    <p className="text-sm text-red-400">

                                      Deadline passed

                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">

                                      {formatDateTime(assessment.deadline)}

                                    </p>

                                  </div>

                                </div>

                              </button>

                            ))}

                          </div>

                        </div>

                      )}

                      {/* Upcoming interviews */}

                      {upcomingInterviews.length > 0 && (

                        <div>

                          <h4 className="mb-3 text-sm font-semibold text-purple-400">

                            🎯 Upcoming Interviews

                          </h4>

                          <div className="space-y-3">

                            {upcomingInterviews.map((interview) => (

                              <button

                                key={`${interview.applicationId}-${interview.id}`}

                                onClick={() => navigate('/interviews')}

                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-purple-800"

                              >

                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                                  <div>

                                    <p className="font-medium">

                                      {interview.roundName}

                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">

                                      {interview.companyName} · {interview.jobTitle}

                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">

                                      {interview.mode || 'Mode not specified'}

                                    </p>

                                  </div>

                                  <p className="text-sm text-purple-300 sm:text-right">

                                    {formatDateTime(interview.scheduledAt)}

                                  </p>

                                </div>

                              </button>

                            ))}

                          </div>

                        </div>

                      )}

                      {/* Upcoming assessments */}

                      {upcomingAssessments.length > 0 && (

                        <div>

                          <h4 className="mb-3 text-sm font-semibold text-orange-400">

                            📝 Upcoming Assessment Deadlines

                          </h4>

                          <div className="space-y-3">

                            {upcomingAssessments.map((assessment) => (

                              <button

                                key={`${assessment.applicationId}-${assessment.id}`}

                                onClick={() => navigate('/assessments')}

                                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-orange-800"

                              >

                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                                  <div>

                                    <p className="font-medium">

                                      {assessment.assessmentName}

                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">

                                      {assessment.companyName} · {assessment.jobTitle}

                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">

                                      Status: {formatStatus(assessment.status)}

                                    </p>

                                  </div>

                                  <p className="text-sm text-orange-300 sm:text-right">

                                    {formatDateTime(assessment.deadline)}

                                  </p>

                                </div>

                              </button>

                            ))}

                          </div>

                        </div>

                      )}

                    </div>

                  )}

                  <div className="mt-5 flex flex-wrap gap-3">

                    <button

                      onClick={() => navigate('/interviews')}

                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"

                    >

                      View Interviews

                    </button>

                    <button

                      onClick={() => navigate('/assessments')}

                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"

                    >

                      View Assessments

                    </button>

                  </div>

                </div>

                {/* Application Pipeline */}

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

                  <div className="mb-6">

                    <h3 className="text-lg font-semibold">

                      Application Pipeline

                    </h3>

                    <p className="mt-1 text-sm text-slate-400">

                      Track how your applications are progressing.

                    </p>

                  </div>

                  <div className="space-y-5">

                    {pipeline.map((stage) => {

                      const total = dashboard?.totalApplications ?? 0

                      const percentage =

                        total > 0

                          ? Math.round((stage.value / total) * 100)

                          : 0

                      return (

                        <div key={stage.status}>

                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                              <span

                                className={`h-2.5 w-2.5 rounded-full ${stage.bar}`}

                              />

                              <span className="text-sm font-medium text-slate-300">

                                {stage.label}

                              </span>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className="text-sm font-semibold text-white">

                                {stage.value}

                              </span>

                              <span className="text-xs text-slate-500">

                                {percentage}%

                              </span>

                            </div>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                            <div

                              className={`h-full rounded-full transition-all duration-500 ${stage.bar}`}

                              style={{ width: `${percentage}%` }}

                            />

                          </div>

                        </div>

                      )

                    })}

                  </div>

                </div>

                {/* Smart Insight */}

                <div className="mt-6 rounded-xl border border-blue-900/50 bg-blue-950/30 p-6">

                  <div className="flex items-start gap-4">

                    <div className="text-2xl">💡</div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">

                        Smart Insight

                      </p>

                      <h4 className="mt-1 text-lg font-semibold">

                        {insight?.recommendation ||

                          'No new recommendations right now.'}

                      </h4>

                      <p className="mt-2 text-sm text-slate-400">

                        Priority: {insight?.priority || 'NORMAL'}

                      </p>

                      <button

                        onClick={() => navigate('/insights')}

                        className="mt-4 rounded-lg border border-blue-800 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-900/30"

                      >

                        View All Insights

                      </button>

                    </div>

                  </div>

                </div>

                {/* Current Applications */}

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900">

                  <div className="flex items-center justify-between border-b border-slate-800 p-5">

                    <div>

                      <h3 className="font-semibold">

                        Current Applications

                      </h3>

                      <p className="mt-1 text-sm text-slate-400">

                        Your latest job applications.

                      </p>

                    </div>

                    <button

                      onClick={() => navigate('/applications')}

                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"

                    >

                      + Add Application

                    </button>

                  </div>

                  <div className="p-5">

                    {applications.length === 0 ? (

                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-8 text-center">

                        <p className="text-slate-400">

                          No applications yet.

                        </p>

                        <button

                          onClick={() => navigate('/applications')}

                          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"

                        >

                          Add Your First Application

                        </button>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {applications.map((application) => (

                          <button

                            key={application.id}

                            onClick={() =>

                              navigate(`/applications/${application.id}`)

                            }

                            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"

                          >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                              <div>

                                <h4 className="font-semibold">

                                  {application.jobTitle}

                                </h4>

                                <p className="mt-1 text-sm text-slate-400">

                                  {application.companyName}

                                  {' · '}

                                  {application.applicationSource ||

                                    'Unknown Source'}

                                </p>

                                <p className="mt-2 text-xs text-slate-500">

                                  Applied: {formatDate(application.appliedAt)}

                                </p>

                              </div>

                              <span

                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(

                                  application.status

                                )}`}

                              >

                                {formatStatus(application.status)}

                              </span>

                            </div>

                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                </div>

              </>

            )}

          </section>

        </main>

      </div>

    </div>

  )

}

export default App
