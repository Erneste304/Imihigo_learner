export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Fetch error')
    return { data }
  },
  post: async (endpoint: string, body?: any) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Fetch error')
    return { data }
  },
  put: async (endpoint: string, body?: any) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Fetch error')
    return { data }
  },
  upload: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        // Do NOT set Content-Type here, let the browser set it with the boundary
      },
      body: formData
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Upload error')
    return { data }
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Fetch error')
    return { data }
  }
}
