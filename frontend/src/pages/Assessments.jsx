
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function Assessments() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [assessments, setAssessments] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingAssessmentId, setDeletingAssessmentId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingAssessmentId, setEditingAssessmentId] = useState(null)

  const [formData, setFormData] = useState({
    applicationId: '',
    assessmentName: '',
    type: 'CODING',
    deadline: '',
    status: 'PENDING',
    score: '',
    assessmentLink: '',
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      applicationId: '',
      assessmentName: '',
      type: 'CODING',
      deadline: '',
      status: 'PENDING',
      score: '',
      assessmentLink: '',
      notes: '',
    })

    setEditingAssessmentId(null)
    setShowForm(false)
  }

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      setError('')

      const applicationsResponse = await api.get('/applications')
      const applicationList = applicationsResponse.data

      setApplications(applicationList)

      const assessmentResults = await Promise.all(
        applicationList.map(async (application) => {
          try {
            const response = await api.get(
              `/applications/${application.id}/assessments`
            )

            return response.data.map((assessment) => ({
              ...assessment,
              applicationId: application.id,
              jobTitle: application.jobTitle,
              companyName: application.companyName,
            }))
          } catch (err) {
            console.error(
              `Failed to load assessments for application ${application.id}`,
              err
            )

            return []
          }
        })
      )

      setAssessments(assessmentResults.flat())
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to load assessments.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssessments()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCreateAssessment = async (e) => {
    e.preventDefault()

    if (!formData.applicationId) {
      setError('Please select an application.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        assessmentName: formData.assessmentName,
        type: formData.type,
        deadline: formData.deadline
          ? formData.deadline + ':00'
          : null,
        status: formData.status,
        score: formData.score !== ''
          ? Number(formData.score)
          : null,
        assessmentLink: formData.assessmentLink || null,
        notes: formData.notes || null,
      }

      await api.post(
        `/applications/${formData.applicationId}/assessments`,
        payload
      )

      resetForm()
      await fetchAssessments()

      setSuccess('Assessment created successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to create assessment.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEditAssessment = (assessment) => {
    let formattedDeadline = ''

    if (assessment.deadline) {
      const date = new Date(assessment.deadline)

      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        formattedDeadline =
          `${year}-${month}-${day}T${hours}:${minutes}`
      }
    }

    setFormData({
      applicationId: String(assessment.applicationId),
      assessmentName: assessment.assessmentName || '',
      type: assessment.type || 'CODING',
      deadline: formattedDeadline,
      status: assessment.status || 'PENDING',
      score:
        assessment.score !== null &&
        assessment.score !== undefined
          ? String(assessment.score)
          : '',
      assessmentLink: assessment.assessmentLink || '',
      notes: assessment.notes || '',
    })

    setEditingAssessmentId(assessment.id)
    setShowForm(true)
    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleUpdateAssessment = async (e) => {
    e.preventDefault()

    if (!formData.applicationId) {
      setError('Please select an application.')
      return
    }

    if (!editingAssessmentId) {
      setError('Invalid assessment selected.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        assessmentName: formData.assessmentName,
        type: formData.type,
        deadline: formData.deadline
          ? formData.deadline + ':00'
          : null,
        status: formData.status,
        score: formData.score !== ''
          ? Number(formData.score)
          : null,
        assessmentLink: formData.assessmentLink || null,
        notes: formData.notes || null,
      }

      await api.put(
        `/applications/${formData.applicationId}/assessments/${editingAssessmentId}`,
        payload
      )

      resetForm()
      await fetchAssessments()

      setSuccess('Assessment updated successfully.')
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to update assessment.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAssessment = async (assessment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assessment.assessmentName}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingAssessmentId(assessment.id)
      setError('')
      setSuccess('')

      await api.delete(
        `/applications/${assessment.applicationId}/assessments/${assessment.id}`
      )

      if (editingAssessmentId === assessment.id) {
        resetForm()
      }

      await fetchAssessments()

      setSuccess(
        `"${assessment.assessmentName}" was deleted successfully.`
      )
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
        'Failed to delete assessment.'
      )
    } finally {
      setDeletingAssessmentId(null)
    }
  }

  const handleFormSubmit = (e) => {
    if (editingAssessmentId) {
      handleUpdateAssessment(e)
    } else {
      handleCreateAssessment(e)
    }
  }

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return 'No deadline'
    }

    const date = new Date(deadline)

    if (Number.isNaN(date.getTime())) {
      return deadline
    }

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isOverdue = (assessment) => {
    if (
      !assessment.deadline ||
      assessment.status === 'COMPLETED' ||
      assessment.status === 'CANCELLED'
    ) {
      return false
    }

    return new Date(assessment.deadline) < new Date()
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'

      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'

      case 'CANCELLED':
        return 'bg-red-100 text-red-700'

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
          <p className="text-gray-500">
            Loading assessments...
          </p>
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
              Assessments
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track coding tests, online assessments and
              other hiring assessments.
            </p>
          </div>

          <button
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
            {assessments.length} assessment
            {assessments.length !== 1 ? 's' : ''}
          </p>

          <button
            onClick={() => {
              if (showForm) {
                resetForm()
                setError('')
                setSuccess('')
              } else {
                setShowForm(true)
                setError('')
                setSuccess('')
              }
            }}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? 'Cancel' : '+ Add Assessment'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
          >
            <p className="text-sm text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* Assessment Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              {editingAssessmentId
                ? 'Edit Assessment'
                : 'Add Assessment'}
            </h2>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-5"
            >
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
                  name="applicationId"
                  value={formData.applicationId}
                  onChange={handleInputChange}
                  required
                  disabled={Boolean(editingAssessmentId) || saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    Select Application
                  </option>

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

              {/* Assessment Name */}
              <div>
                <label
                  htmlFor="assessmentName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Assessment Name
                </label>

                <input
                  id="assessmentName"
                  type="text"
                  name="assessmentName"
                  value={formData.assessmentName}
                  onChange={handleInputChange}
                  placeholder="e.g. TCS Coding Assessment"
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Assessment Type
                </label>

                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                >
                  <option value="CODING">Coding</option>
                  <option value="APTITUDE">Aptitude</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="MCQ">MCQ</option>
                  <option value="ONLINE_TEST">Online Test</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Deadline
                </label>

                <input
                  id="deadline"
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
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
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Score */}
              <div>
                <label
                  htmlFor="score"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Score
                </label>

                <input
                  id="score"
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  placeholder="e.g. 85"
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Assessment Link */}
              <div>
                <label
                  htmlFor="assessmentLink"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Assessment Link
                </label>

                <input
                  id="assessmentLink"
                  type="url"
                  name="assessmentLink"
                  value={formData.assessmentLink}
                  onChange={handleInputChange}
                  placeholder="https://..."
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
                  placeholder="Add assessment details..."
                  rows="4"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
                />
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
                    : editingAssessmentId
                      ? 'Update Assessment'
                      : 'Save Assessment'}
                </button>

                {editingAssessmentId && (
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
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {assessments.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <div className="mb-4 text-4xl">
              📝
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No assessments yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add an assessment to track your hiring tests
              and deadlines.
            </p>
          </div>
        ) : (
          /* Assessment list */
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`rounded-xl border bg-white p-6 ${
                  isOverdue(assessment)
                    ? 'border-red-200'
                    : ''
                }`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {assessment.assessmentName}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          assessment.status
                        )}`}
                      >
                        {formatStatus(assessment.status)}
                      </span>

                      {isOverdue(assessment) && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {assessment.jobTitle} — {assessment.companyName}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Type
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {formatStatus(assessment.type)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Deadline
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium ${
                            isOverdue(assessment)
                              ? 'text-red-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {formatDeadline(assessment.deadline)}
                        </p>
                      </div>

                      {assessment.score !== null &&
                        assessment.score !== undefined && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              Score
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-700">
                              {assessment.score}
                            </p>
                          </div>
                        )}
                    </div>

                    {assessment.assessmentLink && (
                      <div className="mt-4">
                        <a
                          href={assessment.assessmentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          Open Assessment Link
                        </a>
                      </div>
                    )}

                    {assessment.notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Notes
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                          {assessment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assessment actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditAssessment(assessment)}
                      disabled={deletingAssessmentId !== null || saving}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAssessment(assessment)}
                      disabled={
                        deletingAssessmentId !== null || saving
                      }
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingAssessmentId === assessment.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/applications/${assessment.applicationId}`
                        )
                      }
                      disabled={deletingAssessmentId !== null}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      View Application
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Assessments
