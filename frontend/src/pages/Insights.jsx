import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Insights() {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/insights')

      setInsight(response.data)

    } catch (err) {
      console.error(err)

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        setError('Your session has expired. Please login again.')
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to load insights.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  const getPriorityStyle = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 text-red-700'

      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'

      case 'LOW':
        return 'bg-green-50 border-green-200 text-green-700'

      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Insights
          </h1>

          <p className="mt-2 text-gray-600">
            Personalized recommendations to help you manage your
            job search more effectively.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              Analyzing your job search...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Insight */}
        {!loading && !error && insight && (
          <div className="space-y-6">

            {/* Main Insight Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-4xl">
                      💡
                    </span>

                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                        Smart Insight
                      </p>

                      <h2 className="text-2xl font-bold text-gray-900">
                        Your next priority
                      </h2>
                    </div>
                  </div>

                  <p className="max-w-3xl text-lg leading-8 text-gray-700">
                    {insight.recommendation}
                  </p>
                </div>

                {/* Priority */}
                <div
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${getPriorityStyle(
                    insight.priority
                  )}`}
                >
                  Priority: {insight.priority}
                </div>

              </div>

            </div>

            {/* Action Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

              <h3 className="text-xl font-bold text-gray-900">
                What should you do?
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                Use this recommendation as your next action in the
                job search. Staying focused on the highest-priority
                activity can help you manage applications,
                interviews and assessments more effectively.
              </p>

              <div className="mt-6 rounded-xl bg-gray-50 p-5">

                <div className="flex items-start gap-4">

                  <div className="text-2xl">
                    🎯
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Recommended Action
                    </p>

                    <p className="mt-1 leading-6 text-gray-700">
                      {insight.recommendation}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Refresh */}
            <div className="flex justify-center">

              <button
                onClick={fetchInsights}
                disabled={loading}
                className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh Insights
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}