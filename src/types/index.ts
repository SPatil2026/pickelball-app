export type Role = 'OWNER' | 'BOOKER'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
  role?: Role
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ApiError {
  message: string
  status?: number
}
