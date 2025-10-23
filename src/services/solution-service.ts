import { HttpClient } from '../utils/http-client';
import { Solution, SolutionQueryOptions, DataverseResponse } from '../types/solution';

/**
 * Service for interacting with Dataverse Solutions
 */
export class SolutionService {
  private httpClient: HttpClient;
  private readonly SOLUTIONS_ENDPOINT = '/solutions';

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Get all solutions
   * @param options Query options for filtering, selecting, and ordering
   * @returns Promise with array of solutions
   */
  async getSolutions(options?: SolutionQueryOptions): Promise<Solution[]> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.SOLUTIONS_ENDPOINT}${queryParams}`;

    const response = await this.httpClient.get<DataverseResponse<Solution>>(url);
    return response.data.value;
  }

  /**
   * Get a solution by ID
   * @param solutionId The unique identifier of the solution
   * @param options Query options for selecting specific fields
   * @returns Promise with the solution
   */
  async getSolutionById(solutionId: string, options?: SolutionQueryOptions): Promise<Solution> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.SOLUTIONS_ENDPOINT}(${solutionId})${queryParams}`;

    const response = await this.httpClient.get<Solution>(url);
    return response.data;
  }

  /**
   * Get a solution by unique name
   * @param uniqueName The unique name of the solution
   * @param options Query options for selecting specific fields
   * @returns Promise with the solution
   */
  async getSolutionByUniqueName(uniqueName: string, options?: SolutionQueryOptions): Promise<Solution | null> {
    const filterOptions: SolutionQueryOptions = {
      ...options,
      // TODO: Update this filter based on actual field name in your schema
      // $filter: `uniquename eq '${uniqueName}'`,
    };

    const solutions = await this.getSolutions(filterOptions);
    return solutions.length > 0 ? solutions[0] : null;
  }

  /**
   * Build query parameters from options
   */
  private buildQueryParams(options?: SolutionQueryOptions): string {
    if (!options) {
      return '';
    }

    const params: string[] = [];

    // TODO: Implement query parameter building based on your SolutionQueryOptions interface
    // Example:
    // if (options.$select && options.$select.length > 0) {
    //   params.push(`$select=${options.$select.join(',')}`);
    // }
    // if (options.$filter) {
    //   params.push(`$filter=${encodeURIComponent(options.$filter)}`);
    // }
    // if (options.$orderby) {
    //   params.push(`$orderby=${options.$orderby}`);
    // }
    // if (options.$top) {
    //   params.push(`$top=${options.$top}`);
    // }
    // if (options.$skip) {
    //   params.push(`$skip=${options.$skip}`);
    // }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }
}
