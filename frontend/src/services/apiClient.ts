export const API_BASE = import.meta.env.VITE_API_BASE ?? ''

type ApiError = {
  message: string
  status: number
}

const buildError = (status: number) => ({
  message: `Server error: ${status}`,
  status,
})

export const postJson = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw buildError(response.status)
  }

  return response.json() as Promise<T>
}

export const postForm = async <T>(path: string, formData: FormData): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw buildError(response.status)
  }

  return response.json() as Promise<T>
}

export type { ApiError }
