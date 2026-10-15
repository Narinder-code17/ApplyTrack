
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const INITIAL_FORM = {
  roundName: '',
  scheduledAt: '',
  mode: 'ONLINE',
  meetingLink: '',
  notes: '',
  status: 'SCHEDULED',
}

function Interviews() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingInterviewId, setDeletingInterviewId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingInterviewId, setEditingInterviewId] = useState(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState('')
  const [formData, setFormData] = useState({ ...INITIAL_FORM })

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM })
    setSelectedApplicationId('')
    setEditingInterviewId(null)
    setShowForm(false)
  }

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError('')

      const applicationsResponse = await api.get('/applications')
      const applicationList = applicationsResponse.data

      setApplications(applicationList)

      const interviewRequests = applicationList.map(
        async (application) => {
          try {
            const response = await api.get(
              `/applications/${application.id}/interviews`
            )

            return response.data.map((interview) => ({
              ...interview,
              applicationId: application.id,
              jobTitle: application.jobTitle,
              companyName: application.companyName,
            }))
          } catch (err) {
            console.error(
              `Failed to load interviews for application ${application.id}`,
              err
            )

            return []
          }
        }
      )

      const results = await Promise.all(interviewRequests)
      setInterviews(results.flat())
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to load interviews.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleFormToggle = () => {
    if (showForm) {
      resetForm()
      setError('')
      setSuccess('')
      return
    }

    resetForm()
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const buildPayload = () => ({
    roundName: formData.roundName.trim(),
    scheduledAt: formData.scheduledAt
      ? `${formData.scheduledAt}:00`
      : null,
    mode: formData.mode,
    meetingLink: formData.meetingLink.trim() || null,
    notes: formData.notes.trim() || null,
    status: formData.status,
  })

  const handleCreateInterview = async (e) => {
    e.preventDefault()

    if (!selectedApplicationId) {
      setError('Please select an application.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await api.post(
        `/applications/${selectedApplicationId}/interviews`,
        buildPayload()
      )

      resetForm()
      await fetchInterviews()

      setSuccess('Interview created successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to create interview.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEditInterview = (interview) => {
    const scheduledAt = interview.scheduledAt
      ? String(interview.scheduledAt).substring(0, 16)
      : ''

    setSelectedApplicationId(String(interview.applicationId))

    setFormData({
      roundName: interview.roundName || '',
      scheduledAt,
      mode: interview.mode || 'ONLINE',
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || '',
      status: interview.status || 'SCHEDULED',
    })

    setEditingInterviewId(interview.id)
    setShowForm(true)
    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleUpdateInterview = async (e) => {
    e.preventDefault()

    if (!selectedApplicationId || !editingInterviewId) {
      setError('Please select a valid interview.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await api.put(
        `/applications/${selectedApplicationId}/interviews/${editingInterviewId}`,
        buildPayload()
      )

      resetForm()
      await fetchInterviews()

      setSuccess('Interview updated successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to update interview.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleFormSubmit = (e) => {
    if (editingInterviewId) {
      handleUpdateInterview(e)
    } else {
      handleCreateInterview(e)
    }
  }

  const handleDeleteInterview = async (interview) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${interview.roundName}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingInterviewId(interview.id)
      setError('')
      setSuccess('')

      await api.delete(
        `/applications/${interview.applicationId}/interviews/${interview.id}`
      )

      if (editingInterviewId === interview.id) {
        resetForm()
      }

      await fetchInterviews()

      setSuccess(
        `"${interview.roundName}" was deleted successfully.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to delete interview.'
      )
    } finally {
      setDeletingInterviewId(null)
    }
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return 'Not scheduled'
    }

    const date = new Date(dateTime)

    if (Number.isNaN(date.getTime())) {
      return dateTime
    }

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700'

      case 'COMPLETED':
        return 'bg-green-100 text-green-700'

      case 'CANCELLED':
        return 'bg-red-100 text-red-700'

      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-700'

      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status) => {
    if (!status) {
      return 'Unknown'
    }

    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl rounded-xl border bg-white p-10 text-center">
          <p className="text-gray-500">Loading interviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Interviews
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage upcoming and completed interviews.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-8">
        {/* Top actions */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {interviews.length} interview
            {interviews.length !== 1 ? 's' : ''}
          </p>

          <button
            type="button"
            onClick={handleFormToggle}
            disabled={saving || deletingInterviewId !== null}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {showForm ? 'Cancel' : '+ Add Interview'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
          >
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Create / Edit form */}
        {showForm && (
          <div className="mb-6 rounded-xl border bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              {editingInterviewId ? 'Edit Interview' : 'Add Interview'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Application */}
              <div>
                <label
                  htmlFor="applicationId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Application
                </label>

                <select
                  id="applicationId"
                  value={selectedApplicationId}
                  onChange={(e) =>
                    setSelectedApplicationId(e.target.value)
                  }
                  required
                  disabled={Boolean(editingInterviewId) || saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="">Select application</option>

                  {applications.map((application) => (
                    <option
                      key={application.id}
                      value={application.id}
                    >
                      {application.jobTitle} — {application.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interview round */}
              <div>
                <label
                  htmlFor="roundName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Interview Round
                </label>

                <input
                  id="roundName"
                  type="text"
                  name="roundName"
                  value={formData.roundName}
                  onChange={handleInputChange}
                  placeholder="e.g. Technical Interview"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Date and time */}
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Scheduled Date & Time
                </label>

                <input
                  id="scheduledAt"
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Mode */}
              <div>
                <label
                  htmlFor="mode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Interview Mode
                </label>

                <select
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="PHONE">Phone</option>
                </select>
              </div>

              {/* Meeting link */}
              <div>
                <label
                  htmlFor="meetingLink"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Meeting Link
                </label>

                <input
                  id="meetingLink"
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/..."
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Interview preparation notes..."
                  rows="4"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>

              {/* Form actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {saving
                    ? 'Saving...'
                    : editingInterviewId
                      ? 'Update Interview'
                      : 'Save Interview'}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm()
                    setError('')
                    setSuccess('')
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Interview list */}
        {interviews.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <div className="mb-4 text-4xl">🎯</div>

            <h2 className="text-lg font-semibold text-gray-900">
              No interviews yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add an interview to start tracking your interview schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={`${interview.applicationId}-${interview.id}`}
                className="rounded-xl border bg-white p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {interview.roundName}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          interview.status
                        )}`}
                      >
                        {formatStatus(interview.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {interview.jobTitle}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {interview.companyName}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditInterview(interview)}
                      disabled={
                        saving || deletingInterviewId !== null
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteInterview(interview)}
                      disabled={
                        saving || deletingInterviewId !== null
                      }
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingInterviewId === interview.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/applications/${interview.applicationId}`
                        )
                      }
                      disabled={deletingInterviewId !== null}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      View Application
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Date & Time
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDateTime(interview.scheduledAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Mode
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {interview.mode || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Meeting
                    </p>

                    {interview.meetingLink ? (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block break-all text-sm font-medium text-blue-600 hover:underline"
                      >
                        Open Meeting Link
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">
                        No link
                      </p>
                    )}
                  </div>
                </div>

                {interview.notes && (
                  <div className="mt-5 rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {interview.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Interviews
