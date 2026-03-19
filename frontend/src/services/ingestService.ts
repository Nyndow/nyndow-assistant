import { postForm } from './apiClient'

export type IngestResponse = {
  result: string
  stored_as: string
}

export const ingestPdf = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return postForm<IngestResponse>('/api/ingest', formData)
}
