import axios from 'axios'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
}

export const ownerApi = {
  getDashboard: () =>
    api.get('/owner/dashboard').then((r) => r.data),

  getVenues: () =>
    api.get('/owner/venues').then((r) => r.data),

  getVenueById: (venueId: string) =>
    api.get(`/owner/venue/${venueId}`).then((r) => r.data),

  getBookings: (date?: string) =>
    api.get('/owner/bookings', { params: { date } }).then((r) => r.data),

  createVenue: (data: any) =>
    api.post('/owner/create-venue', data).then((r) => r.data),

  updateVenue: (venueId: string, data: any) =>
    api.put(`/owner/venue/${venueId}`, data).then((r) => r.data),

  deleteVenue: (venueId: string) =>
    api.delete(`/owner/venue/${venueId}`).then((r) => r.data),

  setPricing: (venueId: string, data: any) =>
    api.post(`/owner/venue/${venueId}/pricing`, data).then((r) => r.data),

  createCourt: (data: { venue_id: string; court_number: number }) =>
    api.post('/owner/create-court', data).then((r) => r.data),

  removeCourt: (courtId: string) =>
    api.delete('/owner/remove-court', { data: { court_id: courtId } }).then((r) => r.data),
}

export const uploadApi = {
  getVenueImages: (venueId: string) =>
    api.get(`/owner/upload/venue-images/${venueId}`).then((r) => r.data),

  uploadVenueImages: (venueId: string, files: FileList | File[]) => {
    const formData = new FormData()
    formData.append('venue_id', venueId)
    Array.from(files).forEach((file) => {
      formData.append('images', file)
    })
    return api.post('/owner/upload/venue-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((r) => r.data)
  },

  deleteVenueImage: (imageId: string) =>
    api.delete(`/owner/upload/venue-images/${imageId}`).then((r) => r.data),

  replaceVenueImage: (imageId: string, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.put(`/owner/upload/venues/images/${imageId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((r) => r.data)
  },

  setVenueThumbnail: (imageId: string) =>
    api.put(`/owner/upload/venues/images/${imageId}/thumbnail`).then((r) => r.data),
}

export const bookerApi = {
  getVenues: (params?: { date?: string; time?: string }) =>
    api.get('/booker/venues', { params }).then((r) => r.data),

  getVenueById: (venueId: string) =>
    api.get(`/booker/venues/${venueId}`).then((r) => r.data),
}

export default api
