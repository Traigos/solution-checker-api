/**
 * Unit tests for HttpClient
 */

import { HttpClient } from '../../src/utils/http-client';
import { DataverseClientConfig } from '../../src/config/client-config';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  const config: DataverseClientConfig = {
    baseUrl: 'https://test.crm.dynamics.com',
    apiVersion: '9.2',
    useIntegratedAuth: true,
    timeout: 30000
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    httpClient = new HttpClient(config);
  });

  describe('constructor', () => {
    it('should create an axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://test.crm.dynamics.com/api/data/v9.2',
          timeout: 30000,
          withCredentials: true
        })
      );
    });

    it('should set correct OData headers', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
          })
        })
      );
    });

    it('should use integrated auth by default', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          withCredentials: true
        })
      );
    });

    it('should allow disabling integrated auth', () => {
      jest.clearAllMocks();
      const configWithoutAuth = { ...config, useIntegratedAuth: false };
      new HttpClient(configWithoutAuth);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          withCredentials: false
        })
      );
    });
  });

  describe('HTTP methods', () => {
    it('should perform GET request', async () => {
      const mockResponse = { data: { value: [] } };
      const mockInstance = (httpClient as any).axiosInstance;
      mockInstance.get.mockResolvedValue(mockResponse);

      const result = await httpClient.get('/test');

      expect(mockInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should perform POST request', async () => {
      const mockResponse = { data: { success: true } };
      const mockData = { name: 'test' };
      const mockInstance = (httpClient as any).axiosInstance;
      mockInstance.post.mockResolvedValue(mockResponse);

      const result = await httpClient.post('/test', mockData);

      expect(mockInstance.post).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should perform PUT request', async () => {
      const mockResponse = { data: { success: true } };
      const mockData = { name: 'updated' };
      const mockInstance = (httpClient as any).axiosInstance;
      mockInstance.put.mockResolvedValue(mockResponse);

      const result = await httpClient.put('/test', mockData);

      expect(mockInstance.put).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should perform PATCH request', async () => {
      const mockResponse = { data: { success: true } };
      const mockData = { name: 'patched' };
      const mockInstance = (httpClient as any).axiosInstance;
      mockInstance.patch.mockResolvedValue(mockResponse);

      const result = await httpClient.patch('/test', mockData);

      expect(mockInstance.patch).toHaveBeenCalledWith('/test', mockData, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should perform DELETE request', async () => {
      const mockResponse = { data: { success: true } };
      const mockInstance = (httpClient as any).axiosInstance;
      mockInstance.delete.mockResolvedValue(mockResponse);

      const result = await httpClient.delete('/test');

      expect(mockInstance.delete).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse);
    });
  });
});
