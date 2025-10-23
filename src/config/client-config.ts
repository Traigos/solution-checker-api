/**
 * Configuration for the Dataverse API client
 */
export interface DataverseClientConfig {
  /**
   * The base URL of the Dataverse instance
   * @example "https://org.crm.dynamics.com"
   */
  baseUrl: string;

  /**
   * Authentication token for API requests
   */
  accessToken: string;

  /**
   * API version to use
   * @default "9.2"
   */
  apiVersion?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<DataverseClientConfig> = {
  apiVersion: '9.2',
  timeout: 30000,
};
