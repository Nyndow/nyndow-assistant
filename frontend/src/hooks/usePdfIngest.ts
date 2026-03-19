import { useCallback, useState } from 'react'
import { ingestPdf } from '../services/ingestService'

export const usePdfIngest = () => {
  const [status, setStatus] = useState('Ready to import a PDF.')

  const ingest = useCallback(async (file: File) => {
    setStatus(`Uploading ${file.name}...`)

    try {
      const data = await ingestPdf(file)
      setStatus(data.result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatus(`Error: ${message}`)
    }
  }, [])

  return { status, ingest }
}
