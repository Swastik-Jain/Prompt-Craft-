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
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      'An unexpected error occurred'
    return { error: message }
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
