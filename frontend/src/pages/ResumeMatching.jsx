import { useState } from 'react'
import api from '../api/api'

export default function ResumeMatching() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMatch = async () => {
    setError('')
    setResult(null)

    if (!resumeFile) {
      setError('Please upload your resume PDF.')
      return
    }

    if (!jobDescription.trim()) {
      setError('Please enter the job description.')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()

      formData.append('file', resumeFile)
      formData.append('jobDescription', jobDescription)

      const response = await api.post(
        '/resume/match',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setResult(response.data)

    } catch (err) {

      if (err.response?.status === 401 ||
          err.response?.status === 403) {
        setError('Your session has expired. Please login again.')
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to analyze the resume. Please try again.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Moderate Match'
    return 'Low Match'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Resume Matcher
          </h1>

          <p className="mt-2 text-gray-600">
            Compare your resume with a job description and identify
            your skill gaps before applying.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Resume Upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Upload Resume
            </h2>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-10 transition hover:border-gray-500">

              <div className="mb-3 text-4xl">
                📄
              </div>

              <p className="font-medium text-gray-700">
                {resumeFile
                  ? resumeFile.name
                  : 'Choose your resume PDF'}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                PDF files only
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]

                  if (file) {
                    setResumeFile(file)
                  }
                }}
              />

            </label>

          </div>

          {/* Job Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. Job Description
            </h2>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description here..."
              className="h-52 w-full resize-none rounded-lg border border-gray-300 p-4 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />

            <p className="mt-2 text-xs text-gray-500">
              Include the technical skills and requirements from
              the job posting.
            </p>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Analyze Button */}
        <div className="mt-6 flex justify-center">

          <button
            onClick={handleMatch}
            disabled={loading}
            className="rounded-lg bg-gray-900 px-8 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Analyzing Resume...'
              : 'Analyze Job Match'}
          </button>

        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Matching Results
              </h2>

              <p className="mt-1 text-gray-600">
                Here's how your resume compares with this job.
              </p>
            </div>

            {/* Score */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col items-center justify-center">

                <div className="text-6xl font-bold text-gray-900">
                  {result.matchPercentage}%
                </div>

                <div className="mt-2 text-lg font-semibold text-gray-700">
                  {getScoreLabel(result.matchPercentage)}
                </div>

                <div className="mt-5 h-4 w-full max-w-xl overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-gray-900 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        result.matchPercentage,
                        100
                      )}%`
                    }}
                  />

                </div>

              </div>

            </div>

            {/* Skills */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* Matched */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Matched Skills
                </h3>

                <div className="flex flex-wrap gap-2">

                  {result.matchedSkills?.length > 0 ? (
                    result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No matching skills detected.
                    </p>
                  )}

                </div>

              </div>

              {/* Missing */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">

                  {result.missingSkills?.length > 0 ? (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800"
                      >
                        ✗ {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No missing skills detected.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* Recommendation */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Recommendation
              </h3>

              <p className="leading-7 text-gray-700">
                {result.recommendation}
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}