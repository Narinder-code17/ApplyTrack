import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  applicationId: '',
  priority: 'MEDIUM',
}

function getApplicationName(applications, applicationId) {
  if (applicationId == null || applicationId === '') {
    return 'General Task'
  }

  const application = applications.find(
    (item) => String(item.id) === String(applicationId)
  )

  return application
    ? `${application.jobTitle} — ${application.companyName}`
    : 'Linked Application'
}

function isTaskOverdue(task) {
  if (!task.dueDate || task.completed) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(`${task.dueDate}T00:00:00`)

  return !Number.isNaN(dueDate.getTime()) && dueDate < today
}

function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date'

  const date = new Date(`${dueDate}T00:00:00`)

  if (Number.isNaN(date.getTime())) return dueDate

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-700'
    case 'LOW':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

function Tasks() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  async function fetchTasks() {
    try {
      setLoading(true)

      const [tasksResponse, applicationsResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/applications'),
      ])

      if (!Array.isArray(tasksResponse.data)) {
        throw new Error('Unexpected task response from the server.')
      }

      setTasks(tasksResponse.data)

      setApplications(
        Array.isArray(applicationsResponse.data)
          ? applicationsResponse.data
          : []
      )

      setError('')
    } catch (err) {
      console.error('Failed to load tasks:', err)

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to load tasks. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingTaskId(null)
    setShowForm(false)
  }

  function handleAddTask() {
    setFormData(emptyForm)
    setEditingTaskId(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function handleEditTask(task) {
    setEditingTaskId(task.id)

    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      applicationId:
        task.applicationId != null ? String(task.applicationId) : '',
      priority: task.priority || 'MEDIUM',
    })

    setShowForm(true)
    setError('')
    setSuccess('')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveTask(event) {
    event.preventDefault()

    if (!formData.title.trim()) {
      setError('Please enter a task title.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
        priority: formData.priority,
      }

      if (editingTaskId !== null) {
        const query = `?applicationId=${encodeURIComponent(
          formData.applicationId
        )}`

        await api.put(`/tasks/${editingTaskId}${query}`, payload)
      } else {
        const applicationId = formData.applicationId

        const url = applicationId
          ? `/tasks?applicationId=${encodeURIComponent(applicationId)}`
          : '/tasks'

        await api.post(url, payload)
      }

      const wasEditing = editingTaskId !== null

      resetForm()
      await fetchTasks()

      setSuccess(
        wasEditing
          ? 'Task updated successfully.'
          : 'Task created successfully.'
      )
    } catch (err) {
      console.error('Failed to save task:', err)

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to save task. Check the backend logs and try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setBusyTaskId(task.id)
      setError('')
      setSuccess('')

      await api.delete(`/tasks/${task.id}`)

      if (editingTaskId === task.id) {
        resetForm()
      }

      await fetchTasks()
      setSuccess('Task deleted successfully.')
    } catch (err) {
      console.error('Failed to delete task:', err)

      setError(
        err.response?.data?.message ||
        'Failed to delete task. Please try again.'
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  async function handleToggleTask(task) {
    try {
      setBusyTaskId(task.id)
      setError('')
      setSuccess('')

      await api.patch(`/tasks/${task.id}/toggle`)
      await fetchTasks()

      setSuccess(
        task.completed
          ? 'Task marked as pending.'
          : 'Task marked as completed.'
      )
    } catch (err) {
      console.error('Failed to update task:', err)

      setError(
        err.response?.data?.message ||
        'Failed to update task. Please try again.'
      )
    } finally {
      setBusyTaskId(null)
    }
  }

  const totalTasks = tasks.length

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length

  const pendingTasks = totalTasks - completedTasks

  const overdueTasks = tasks.filter(isTaskOverdue).length

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const applicationName = getApplicationName(
        applications,
        task.applicationId
      ).toLowerCase()

      const matchesSearch =
        !query ||
        (task.title || '').toLowerCase().includes(query) ||
        (task.description || '').toLowerCase().includes(query) ||
        applicationName.includes(query)

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && task.completed) ||
        (statusFilter === 'PENDING' && !task.completed) ||
        (statusFilter === 'OVERDUE' && isTaskOverdue(task))

      const matchesPriority =
        priorityFilter === 'ALL' ||
        (task.priority || 'MEDIUM') === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, applications, search, statusFilter, priorityFilter])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your job search, priorities, and deadlines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <p>{success}</p>
            <button
              type="button"
              onClick={() => setSuccess('')}
              aria-label="Dismiss success message"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-bold">{totalTasks}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {pendingTasks}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedTasks}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {overdueTasks}
            </p>
          </div>
        </section>

        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Your Tasks</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredTasks.length} of {totalTasks} tasks
            </p>
          </div>

          <button
            type="button"
            onClick={showForm ? resetForm : handleAddTask}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {showForm ? 'Cancel Form' : '+ Add Task'}
          </button>
        </section>

        {showForm && (
          <section className="mb-6 rounded-xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 text-lg font-semibold">
              {editingTaskId !== null ? 'Edit Task' : 'Create a Task'}
            </h2>

            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Task Title *
                </label>

                <input
                  id="task-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Prepare for TCS technical interview"
                  maxLength={255}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="task-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add notes or preparation details..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-due-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Due Date
                  </label>

                  <input
                    id="task-due-date"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-medium"
                  >
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="task-application"
                  className="mb-2 block text-sm font-medium"
                >
                  Link to Application
                </label>

                <select
                  id="task-application"
                  name="applicationId"
                  value={formData.applicationId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">General Task</option>

                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.jobTitle} — {application.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingTaskId !== null
                      ? 'Save Changes'
                      : 'Create Task'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="task-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Search Tasks
            </label>

            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, notes, company..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="task-status-filter"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Status
            </label>

            <select
              id="task-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="ALL">All Tasks</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority-filter"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Priority
            </label>

            <select
              id="task-priority-filter"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <div className="text-4xl">📋</div>

            <h2 className="mt-3 text-lg font-semibold">
              {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {tasks.length === 0
                ? 'Create your first task to organize your job search.'
                : 'Try changing your search or filters.'}
            </p>

            {tasks.length === 0 && (
              <button
                type="button"
                onClick={handleAddTask}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const overdue = isTaskOverdue(task)
              const priority = task.priority || 'MEDIUM'
              const busy = busyTaskId === task.id

              return (
                <article
                  key={task.id}
                  className={`rounded-xl border bg-white p-5 shadow-sm sm:p-6 ${
                    overdue ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleTask(task)}
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} as incomplete`
                            : `Mark ${task.title} as completed`
                        }
                        title={
                          task.completed
                            ? 'Mark as incomplete'
                            : 'Mark as completed'
                        }
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold disabled:opacity-50 ${
                          task.completed
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white text-gray-400 hover:border-blue-500'
                        }`}
                      >
                        {task.completed ? '✓' : ''}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`break-words text-lg font-semibold ${
                            task.completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                            {task.description}
                          </p>
                        )}

                        <p className="mt-3 text-sm text-gray-500">
                          {getApplicationName(applications, task.applicationId)}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(priority)}`}
                          >
                            {priority.charAt(0) +
                              priority.slice(1).toLowerCase()}{' '}
                            Priority
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              task.completed
                                ? 'bg-green-100 text-green-700'
                                : overdue
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {task.completed
                              ? 'Completed'
                              : overdue
                                ? 'Overdue'
                                : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-44 lg:items-end">
                      <p
                        className={`text-sm font-medium ${
                          overdue
                            ? 'text-red-600'
                            : task.completed
                              ? 'text-green-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {task.dueDate
                          ? `${overdue ? 'Overdue · ' : 'Due · '}${formatDueDate(task.dueDate)}`
                          : 'No due date'}
                      </p>

                      {/* Task actions: always visible */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy || saving}
                          onClick={() => handleEditTask(task)}
                          aria-label={`Edit task: ${task.title}`}
                          title="Edit this task"
                          className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✎ Edit
                        </button>

                        <button
                          type="button"
                          disabled={busy || saving}
                          onClick={() => handleDeleteTask(task)}
                          aria-label={`Delete task: ${task.title}`}
                          title="Delete this task"
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? 'Please wait...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Tasks
