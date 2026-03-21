import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export const searchCompany = (q) => api.get(`/search?q=${encodeURIComponent(q)}`)

export const getMetrics = (data) => api.post('/metrics', data)

export const downloadPdf = async (data) => {
  const response = await api.post('/report/pdf', data, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${data.company_name}_${data.year}_재무분석.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const streamAnalysis = (data, onChunk, onDone, onError) => {
  fetch(`${import.meta.env.VITE_API_URL || '/api'}/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((response) => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) { onDone?.(); return }
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6).trim()
              if (raw === '[DONE]') { onDone?.(); return }
              try {
                const parsed = JSON.parse(raw)
                if (parsed.text) onChunk(parsed.text)
              } catch {}
            }
          }
          read()
        })
      }
      read()
    })
    .catch(onError)
}
