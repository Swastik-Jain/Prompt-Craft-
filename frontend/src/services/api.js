import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn()
    return response.data
  } catch (err) {
    let message = 'An unexpected error occurred'
    if (err?.response?.data?.detail) {
      const detail = err.response.data.detail
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail
          .map((d) => d.msg || `${d.loc?.join('.') || 'field'}: ${d.type || 'invalid'}`)
          .join(', ')
      } else if (typeof detail === 'object') {
        message = detail.msg || detail.message || JSON.stringify(detail)
      }
    } else if (err?.response?.data?.message) {
      message =
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : JSON.stringify(err.response.data.message)
    } else if (err?.message) {
      message = err.message
    }
    return { error: String(message) }
  }
}

export const optimizePrompt = (payload) =>
  handleRequest(() => api.post('/prompts/optimize', payload))

export const generateResponse = (payload) =>
  handleRequest(() => api.post('/prompts/generate', payload))

export const compareExperiment = (payload) =>
  handleRequest(() => api.post('/experiments/compare', payload))

export const evaluateExperiment = (id) =>
  handleRequest(() => api.post(`/experiments/${id}/evaluate`))

export const getExperiments = () =>
  handleRequest(() => api.get('/experiments'))

export const getExperiment = (id) =>
  handleRequest(() => api.get(`/experiments/${id}`))

export const deleteExperiment = (id) =>
  handleRequest(() => api.delete(`/experiments/${id}`))

export const getAnalyticsSummary = () =>
  handleRequest(() => api.get('/analytics/summary'))

export const checkHealth = () =>
  handleRequest(() => api.get('/health'))

export default api
