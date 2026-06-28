import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants'

interface ApiError {
  message: string
  statusCode: number
  error?: string
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER_DATA)
          window.location.href = '/login'
        }

        const apiError: ApiError = {
          message: error.response?.data?.message || 'Erro ao processar requisição',
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        }

        return Promise.reject(apiError)
      }
    )
  }

  public getInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()
export const api = apiService.getInstance()
