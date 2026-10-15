import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/api'

function ApplicationDetails() {
  const { applicationId } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedStatus, setSelectedStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const statuses = [
    'SAVED',
    'APPLIED',
    'SCREENING',
    'ASSESSMENT',
    'TECHNICAL_INTERVIEW',
    'HR_INTERVIEW',
    'OFFER',
    'REJECTED',
    'WITHDRAWN',
  ]

  const fetchApplication = async () => {
    try {
      setLoading(true)

      const response = await api.get('/applications')

      const selectedApplication = response.data.find(
        (item) => String(item.id) === String(applicationId)
      )

      if (!selectedApplication) {
        setError('Application not found.')
        return
      }

      setApplication(selectedApplication)
      setSelectedStatus(selectedApplication.status)
      setError('')

      // Fetch application activity/events
      const eventsResponse = await api.get(
        `/applications/${applicationId}/events`
      )

      setEvents([...eventsResponse.data].reverse())
    } catch (err) {
      console.error(err)
      setError('Failed to load application details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplication()
  }, [applicationId])

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application.status) {
      setStatusMessage('Please select a different status.')
      return
    }

    try {
      setUpdatingStatus(true)
      setStatusMessage('')

      await api.patch(
        `/applications/${applicationId}/status`,
        {
          status: selectedStatus,
        }
      )

      setStatusMessage('Status updated successfully.')

      // Reload application and activity
      await fetchApplication()
    } catch (err) {
      console.error(err)

      setStatusMessage(
        err.response?.data?.message ||
        'Failed to update application status.'
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SAVED':
        return 'bg-gray-100 text-gray-700'

      case 'APPLIED':
        return 'bg-blue-100 text-blue-700'

      case 'SCREENING':
        return 'bg-yellow-100 text-yellow-700'

      case 'ASSESSMENT':
        return 'bg-purple-100 text-purple-700'

      case 'TECHNICAL_INTERVIEW':
        return 'bg-orange-100 text-orange-700'

      case 'HR_INTERVIEW':
        return 'bg-pink-100 text-pink-700'

      case 'OFFER':
        return 'bg-green-100 text-green-700'

      case 'REJECTED':
        return 'bg-red-100 text-red-700'

      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-700'

      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status) => {
    return status
      ?.replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  const formatEventDate = (event) => {
    const dateValue = event.eventDate || event.createdAt

    if (!dateValue) {
      return 'Date not available'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return dateValue
    }

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'APPLICATION_CREATED':
        return '✓'

      case 'STATUS_CHANGED':
        return '↗'

      default:
        return '•'
    }
  }

  const getEventStyle = (eventType) => {
    switch (eventType) {
      case 'APPLICATION_CREATED':
        return 'bg-green-100 text-green-700 border-green-200'

      case 'STATUS_CHANGED':
        return 'bg-blue-100 text-blue-700 border-blue-200'

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl rounded-xl border bg-white p-10 text-center">
          <p className="text-gray-500">
            Loading application details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => navigate('/applications')}
            className="mb-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Applications
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">
              {error || 'Application not found.'}
            </p>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <div>
            <p className="text-sm text-gray-500">
              Application #{application.id}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {application.jobTitle}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {application.companyName}
            </p>
          </div>

          <button
            onClick={() => navigate('/applications')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Applications
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8">

        {/* Status Section */}
        <div className="mb-6 rounded-xl border bg-white p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Current Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                    application.status
                  )}`}
                >
                  {formatStatus(application.status)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setStatusMessage('')
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-black"
              >
                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={
                  updatingStatus ||
                  selectedStatus === application.status
                }
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {updatingStatus
                  ? 'Updating...'
                  : 'Change Status'}
              </button>

            </div>

          </div>

          {statusMessage && (
            <p
              className={`mt-4 text-sm ${
                statusMessage.includes('successfully')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {statusMessage}
            </p>
          )}

        </div>

        {/* Application Details */}
        <div className="mb-6 rounded-xl border bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Application Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Company
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {application.companyName || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Application Source
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {application.applicationSource || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Applied Date
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {application.appliedAt || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Deadline
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {application.deadline || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Follow-up Date
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {application.followUpDate || '—'}
              </p>
            </div>

          </div>

        </div>

        {/* Job Description */}
        <div className="mb-6 rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Job Description
          </h2>

          <div className="rounded-lg bg-gray-50 p-5">

            {application.jobDescription ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {application.jobDescription}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                No job description added.
              </p>
            )}

          </div>

        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border bg-white p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Activity Timeline
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track the history of this application.
              </p>
            </div>

            {events.length > 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            )}

          </div>

          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400">
                •
              </div>

              <p className="text-sm font-medium text-gray-600">
                No activity recorded yet.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Status changes and application events will appear here.
              </p>

            </div>
          ) : (
            <div className="relative">

              {/* Vertical timeline line */}
              <div className="absolute bottom-6 left-5 top-6 w-px bg-gray-200" />

              <div className="space-y-7">

                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="relative flex gap-4"
                  >

                    {/* Timeline icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${getEventStyle(
                        event.eventType
                      )}`}
                    >
                      <span className="text-sm font-bold">
                        {getEventIcon(event.eventType)}
                      </span>
                    </div>

                    {/* Event content */}
                    <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {event.eventType === 'STATUS_CHANGED'
                              ? 'Status Changed'
                              : event.eventType === 'APPLICATION_CREATED'
                                ? 'Application Created'
                                : formatStatus(event.eventType)}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {event.description || 'No description available.'}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-medium text-gray-400">
                          {formatEventDate(event)}
                        </span>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

export default ApplicationDetails