const API_BASE = 'http://localhost:8081'

export class ApiError extends Error {
  constructor(message, status, fieldErrors = null) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      qs.set(key, String(val))
    }
  })
  const str = qs.toString()
  return str ? `?${str}` : ''
}

export async function adminFetch(path, { method = 'GET', body, params } = {}) {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let msg = data?.message || `Erro ${response.status} ao comunicar com o servidor.`
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
      const firstErr = Object.values(data.fieldErrors)[0]
      if (firstErr) msg = firstErr
    }
    throw new ApiError(msg, response.status, data?.fieldErrors || null)
  }

  return data
}

export async function adminUpload(path, files) {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  Array.from(files).forEach((file) => {
    formData.append('files', file)
  })

  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      data?.message || `Erro ${response.status} ao enviar imagens.`,
      response.status
    )
  }
  return data
}
