import { HttpClient } from '../utils/http-client';
import { Solution, SolutionQueryOptions, SolutionComponent, DataverseResponse } from '../types/solution';

/**
 * Service for interacting with Dataverse Solutions
 */
export class SolutionService {
  private httpClient: HttpClient;
  private readonly SOLUTIONS_ENDPOINT = '/solutions';
  private readonly SOLUTION_COMPONENTS_ENDPOINT = '/solutioncomponents';

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
      $filter: `uniquename eq '${uniqueName}'`,
    };

    const solutions = await this.getSolutions(filterOptions);
    return solutions.length > 0 ? solutions[0] : null;
  }

  /**
   * Get solution components by solution ID
   * Retrieves all components that belong to a specific solution
   * @param solutionId The unique identifier of the solution (GUID)
   * @param options Query options for filtering, selecting, and ordering
   * @returns Promise with array of solution components
   */
  async getSolutionComponentsBySolutionId(solutionId: string, options?: SolutionQueryOptions): Promise<SolutionComponent[]> {
    const filterOptions: SolutionQueryOptions = {
      ...options,
      $filter: options?.$filter
        ? `_solutionid_value eq '${solutionId}' and (${options.$filter})`
        : `_solutionid_value eq '${solutionId}'`
    };

    const queryParams = this.buildQueryParams(filterOptions);
    const url = `${this.SOLUTION_COMPONENTS_ENDPOINT}${queryParams}`;

    const response = await this.httpClient.get<DataverseResponse<SolutionComponent>>(url);
    return response.data.value;
  }

  /**
   * Get solution components that are found in multiple solutions
   * Identifies components that exist in more than one solution
   * @param options Query options for filtering, selecting, and ordering
   * @returns Promise with array of solution components that are duplicated across solutions
   */
  async getSolutionComponentsFoundInOtherSolutions(options?: SolutionQueryOptions): Promise<SolutionComponent[]> {
    // Get all solution components with necessary fields
    const allComponents = await this.getAllSolutionComponents({
      ...options,
      $select: ['solutioncomponentid', 'objectid', 'componenttype', 'solutionid', '_solutionid_value', 'createdon']
    });

    // Create a map to track components by their unique identifier (objectid + componenttype)
    const componentMap = new Map<string, SolutionComponent[]>();

    for (const component of allComponents) {
      if (component.objectid && component.componenttype !== undefined) {
        // Use objectid and componenttype as the unique key
        const key = `${component.objectid}_${component.componenttype}`;

        if (!componentMap.has(key)) {
          componentMap.set(key, []);
        }

        componentMap.get(key)!.push(component);
      }
    }

    // Filter to only components that appear in more than one solution
    const duplicateComponents: SolutionComponent[] = [];

    for (const components of componentMap.values()) {
      if (components.length > 1) {
        // Get unique solution IDs for these components
        const uniqueSolutionIds = new Set(
          components
            .map(c => c._solutionid_value || c.solutionid)
            .filter(id => id !== undefined)
        );

        // Only include if the component appears in multiple different solutions
        if (uniqueSolutionIds.size > 1) {
          duplicateComponents.push(...components);
        }
      }
    }

    return duplicateComponents;
  }

  /**
   * Remove a component from a solution
   * Deletes a solution component record, removing the component from the specified solution
   * @param componentId The unique identifier of the solution component (solutioncomponentid)
   * @param solutionId The unique identifier of the solution (for validation)
   * @returns Promise<void>
   */
  async removeSolutionComponent(componentId: string, solutionId: string): Promise<void> {
    // First, verify that the component belongs to the specified solution
    const component = await this.getSolutionComponentById(componentId);

    if (!component) {
      throw new Error(`Solution component ${componentId} not found`);
    }

    // Verify the component belongs to the specified solution
    const componentSolutionId = component._solutionid_value || component.solutionid;
    if (componentSolutionId !== solutionId) {
      throw new Error(
        `Component ${componentId} does not belong to solution ${solutionId}. ` +
        `It belongs to solution ${componentSolutionId}`
      );
    }

    // Delete the solution component
    const url = `${this.SOLUTION_COMPONENTS_ENDPOINT}(${componentId})`;
    await this.httpClient.delete(url);
  }

  /**
   * Get a solution component by ID
   * @param componentId The unique identifier of the solution component
   * @returns Promise with the solution component or null if not found
   * @private
   */
  private async getSolutionComponentById(componentId: string): Promise<SolutionComponent | null> {
    try {
      const url = `${this.SOLUTION_COMPONENTS_ENDPOINT}(${componentId})`;
      const response = await this.httpClient.get<SolutionComponent>(url);
      return response.data;
    } catch (error: any) {
      // If component not found (404), return null
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all solution components (helper method)
   * @private
   */
  private async getAllSolutionComponents(options?: SolutionQueryOptions): Promise<SolutionComponent[]> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.SOLUTION_COMPONENTS_ENDPOINT}${queryParams}`;

    const response = await this.httpClient.get<DataverseResponse<SolutionComponent>>(url);
    return response.data.value;
  }

  /**
   * Build query parameters from options
   * Converts SolutionQueryOptions to OData query string
   */
  private buildQueryParams(options?: SolutionQueryOptions): string {
    if (!options) {
      return '';
    }

    const params: string[] = [];

    // Build $select parameter for selecting specific fields
    if (options.$select && options.$select.length > 0) {
      params.push(`$select=${options.$select.join(',')}`);
    }

    // Build $filter parameter for filtering results
    if (options.$filter) {
      params.push(`$filter=${encodeURIComponent(options.$filter)}`);
    }

    // Build $orderby parameter for sorting results
    if (options.$orderby) {
      params.push(`$orderby=${options.$orderby}`);
    }

    // Build $expand parameter for expanding related entities
    if (options.$expand && options.$expand.length > 0) {
      params.push(`$expand=${options.$expand.join(',')}`);
    }

    // Build $top parameter for limiting results
    if (options.$top !== undefined && options.$top > 0) {
      params.push(`$top=${options.$top}`);
    }

    // Build $skip parameter for pagination
    if (options.$skip !== undefined && options.$skip > 0) {
      params.push(`$skip=${options.$skip}`);
    }

    // Build $count parameter to include total count
    if (options.$count === true) {
      params.push('$count=true');
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
  }
}
