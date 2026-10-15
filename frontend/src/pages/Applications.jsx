import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function Applications() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [companies, setCompanies] = useState([])

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCompanyForm, setShowCompanyForm] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [addingCompany, setAddingCompany] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    companyId: '',
    jobTitle: '',
    jobDescription: '',
    applicationSource: '',
    status: 'SAVED',
    appliedAt: '',
    deadline: '',
    followUpDate: '',
  })

  const [companyData, setCompanyData] = useState({
    name: '',
    website: '',
    location: '',
  })

  const fetchApplications = async () => {
    try {
      setLoading(true)

      const response = await api.get('/applications')

      setApplications(response.data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies')

      setCompanies(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load companies.')
    }
  }

  useEffect(() => {
    fetchApplications()
    fetchCompanies()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCompanyChange = (event) => {
    const { name, value } = event.target

    setCompanyData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleAddCompany = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!companyData.name.trim()) {
      setError('Please enter the company name.')
      return
    }

    try {
      setAddingCompany(true)

      const response = await api.post('/companies', {
        name: companyData.name,
        website: companyData.website,
        location: companyData.location,
      })

      const newCompany = response.data

      setCompanies((previous) => [
        ...previous,
        newCompany,
      ])

      setFormData((previous) => ({
        ...previous,
        companyId: String(newCompany.id),
      }))

      setCompanyData({
        name: '',
        website: '',
        location: '',
      })

      setShowCompanyForm(false)

      setSuccess(
        `${newCompany.name} added successfully and selected.`
      )
    } catch (err) {
      console.error(err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to add company.')
      }
    } finally {
      setAddingCompany(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.companyId) {
      setError('Please select a company.')
      return
    }

    if (!formData.jobTitle.trim()) {
      setError('Please enter the job title.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        applicationSource: formData.applicationSource,
        status: formData.status,
        appliedAt: formData.appliedAt || null,
        deadline: formData.deadline || null,
        followUpDate: formData.followUpDate || null,
      }

      await api.post(
        `/applications?companyId=${formData.companyId}`,
        payload
      )

      setSuccess('Application added successfully.')

      setFormData({
        companyId: '',
        jobTitle: '',
        jobDescription: '',
        applicationSource: '',
        status: 'SAVED',
        appliedAt: '',
        deadline: '',
        followUpDate: '',
      })

      setShowForm(false)

      await fetchApplications()
    } catch (err) {
      console.error(err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to add application.')
      }
    } finally {
      setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white px-8 py-5">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Applications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job applications
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-8 py-8">

        {/* Page heading */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              My Applications
            </h2>

            <p className="text-sm text-gray-500">
              {applications.length} application
              {applications.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm)
              setError('')
              setSuccess('')
            }}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {showForm ? 'Cancel' : '+ Add Application'}
          </button>

        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Application Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Application
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter the details of the job application you want to track.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Company */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company *
                  </label>

                  <div className="flex gap-2">

                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                    >
                      <option value="">
                        Select company
                      </option>

                      {companies.map((company) => (
                        <option
                          key={company.id}
                          value={company.id}
                        >
                          {company.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCompanyForm(!showCompanyForm)
                        setError('')
                      }}
                      className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      + Add Company
                    </button>

                  </div>

                </div>

                {/* Job Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>

                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Java Developer"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Application Source
                  </label>

                  <select
                    name="applicationSource"
                    value={formData.applicationSource}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                  >
                    <option value="">
                      Select source
                    </option>
                    <option value="LinkedIn">
                      LinkedIn
                    </option>
                    <option value="Company Portal">
                      Company Portal
                    </option>
                    <option value="College Drive">
                      College Drive
                    </option>
                    <option value="Referral">
                      Referral
                    </option>
                    <option value="Naukri">
                      Naukri
                    </option>
                    <option value="Indeed">
                      Indeed
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="TECHNICAL_INTERVIEW">
                      Technical Interview
                    </option>
                    <option value="HR_INTERVIEW">
                      HR Interview
                    </option>
                    <option value="OFFER">
                      Offer
                    </option>
                    <option value="REJECTED">
                      Rejected
                    </option>
                    <option value="WITHDRAWN">
                      Withdrawn
                    </option>
                  </select>
                </div>

                {/* Applied Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Applied Date
                  </label>

                  <input
                    type="date"
                    name="appliedAt"
                    value={formData.appliedAt}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Deadline
                  </label>

                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

              </div>

              {/* Add Company Form */}
              {showCompanyForm && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Add New Company
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      Add a company you want to track applications for.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">

                    {/* Company Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Company Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={companyData.name}
                        onChange={handleCompanyChange}
                        placeholder="e.g. Infosys"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Website
                      </label>

                      <input
                        type="text"
                        name="website"
                        value={companyData.website}
                        onChange={handleCompanyChange}
                        placeholder="https://example.com"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Location
                      </label>

                      <input
                        type="text"
                        name="location"
                        value={companyData.location}
                        onChange={handleCompanyChange}
                        placeholder="e.g. Bangalore"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>

                  </div>

                  <div className="mt-4 flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() => setShowCompanyForm(false)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCompany}
                      disabled={addingCompany}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {addingCompany
                        ? 'Adding...'
                        : 'Add Company'}
                    </button>

                  </div>

                </div>
              )}

              {/* Job Description */}
              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Job Description
                </label>

                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Paste or write the job description here..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                />

              </div>

              {/* Submit */}
              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Adding...'
                    : 'Add Application'}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <p className="text-gray-500">
              Loading applications...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && applications.length === 0 && (
          <div className="rounded-xl border bg-white p-12 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📋
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Start tracking your job applications by adding your first
              application.
            </p>

          </div>
        )}

        {/* Applications table */}
        {!loading && applications.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-white">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-gray-50">

                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Job
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Company
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Source
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y">

                  {applications.map((application) => (

                   <tr
                    key={application.id}
                    onClick={() => navigate(`/applications/${application.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                   >

                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-900">
                          {application.jobTitle || 'Untitled Position'}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {application.companyName || 'Unknown Company'}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {formatStatus(application.status)}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {application.appliedAt || '—'}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {application.applicationSource || '—'}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

    </div>
  )
}

export default Applications