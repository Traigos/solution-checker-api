import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DataverseClientConfig, DEFAULT_CONFIG } from '../config/client-config';

/**
 * HTTP client for Dataverse API requests
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private config: DataverseClientConfig;

  constructor(config: DataverseClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: `${this.config.baseUrl}/api/data/v${this.config.apiVersion}`,
      timeout: this.config.timeout,
      withCredentials: this.config.useIntegratedAuth !== false, // Use integrated auth by default
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          console.error(`API Error [${status}]:`, data);
        } else if (error.request) {
          // Request made but no response
          console.error('No response received:', error.request);
        } else {
          // Error in request setup
          console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Perform GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Perform POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Perform PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Perform PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  /**
   * Perform DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}
