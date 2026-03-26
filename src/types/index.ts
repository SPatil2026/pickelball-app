export enum Role {
  OWNER = 'OWNER',
  BOOKER = 'BOOKER',
}

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

export interface Reschedule {
  rescheduled_at: string
  new_date: string
  new_start_time: string
  new_end_time: string
}

export interface Booking {
  booking_id: string
  date: string
  start_time: string
  end_time: string
  total_amount: number
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED'
  is_reschedule_eligible: boolean
  is_cancel_eligible: boolean
  reschedule_ineligible_reason: string | null
  cancel_ineligible_reason: string | null
  court: {
    court_number: number
    venue: {
      name: string
      address: string
      contact_number: string
    }
  }
  reschedules: Reschedule[]
}

export interface Court {
  court_id: string
  court_number: number
}

export interface Venue {
  venue_id: string
  name: string
  address: string
  contact_number: string
  opening_time: string
  closing_time: string
  courts: Court[]
  images?: { image_url: string }[]
}

export interface CartItem {
  cart_item_id: string
  date: string
  start_time: string
  end_time: string
  price: number
  court: {
    court_number: number
    venue: {
      name: string
      address: string
    }
  }
}

export interface Cart {
  cart_id: string
  items: CartItem[]
}