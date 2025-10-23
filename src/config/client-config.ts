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
   * API version to use
   * @default "9.2"
   */
  apiVersion?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Use integrated authentication (Windows Authentication)
   * @default true
   */
  useIntegratedAuth?: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<DataverseClientConfig> = {
  apiVersion: '9.2',
  timeout: 30000,
  useIntegratedAuth: true,
};
