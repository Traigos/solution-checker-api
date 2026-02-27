import { HttpClient } from '../utils/http-client';
import { Solution, SolutionQueryOptions, SolutionComponent, DataverseResponse, Entity, Attribute } from '../types/solution';
import { ComponentType } from '../types/workflow';

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
   * Check if solution display name contains "connection" or "connection reference"
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if display name contains connection-related keywords
   */
  async doesSolutionHaveConnectionOrConnectionReferencesInDisplayName(solutionId: string): Promise<boolean> {
    const solution = await this.getSolutionById(solutionId, {
      $select: ['friendlyname', 'uniquename']
    });

    if (!solution.friendlyname) {
      return false;
    }

    const displayName = solution.friendlyname.toLowerCase();
    return displayName.includes('connection') || displayName.includes('connection reference');
  }

  /**
   * Check if solution has connection reference components
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if solution contains connection reference components
   */
  async doesSolutionHaveConnectionReferences(solutionId: string): Promise<boolean> {
    const components = await this.getSolutionComponentsBySolutionId(solutionId, {
      $filter: `componenttype eq ${ComponentType.ConnectionReference}`,
      $select: ['solutioncomponentid', 'componenttype']
    });

    return components.length > 0;
  }

  /**
   * Check if solution customizes components where publisher doesn't match solution publisher
   * Identifies components that belong to a different publisher than the solution
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if mismatched publishers found
   */
  async doesSolutionCustomizeComponentsWherePublisherDoesNotMatchSolutionPublisher(solutionId: string): Promise<boolean> {
    // Get the solution with publisher information
    const solution = await this.getSolutionById(solutionId, {
      $select: ['solutionid', 'uniquename', 'publisheridname'],
      $expand: ['publisherid($select=uniquename,customizationprefix)']
    });

    if (!solution.publisherid) {
      // If no publisher info, we can't determine mismatch
      return false;
    }

    const solutionPublisherPrefix = solution.publisherid.customizationprefix || solution.publisheridname;

    if (!solutionPublisherPrefix) {
      return false;
    }

    // Get all components in the solution
    // We'll check entities and other customizable components
    const components = await this.getSolutionComponentsBySolutionId(solutionId, {
      $select: ['objectid', 'componenttype']
    });

    // Check entities (componenttype = 1) for publisher prefix mismatch
    const entityComponents = components.filter(c => c.componenttype === ComponentType.Entity);

    for (const component of entityComponents) {
      if (component.objectid) {
        // Get entity metadata to check publisher prefix
        try {
          const entityMetadataUrl = `/EntityDefinitions(${component.objectid})`;
          const entityResponse = await this.httpClient.get<any>(entityMetadataUrl);
          const entityData = entityResponse.data;

          // Check if entity LogicalName starts with a different publisher prefix
          if (entityData.LogicalName) {
            const entityPrefix = entityData.LogicalName.split('_')[0];
            if (entityPrefix && entityPrefix !== solutionPublisherPrefix) {
              return true;
            }
          }
        } catch (error) {
          // Skip if we can't get entity metadata
          continue;
        }
      }
    }

    return false;
  }

  /**
   * Check if solution contains security roles that grant System Customizer or System Administrator privileges
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if security roles grant System Customizer or System Admin access
   */
  async doesSecurityRoleGrantSystemCustomizerOrSystemAdmin(solutionId: string): Promise<boolean> {
    // Get all security role components (componenttype = 20)
    const components = await this.getSolutionComponentsBySolutionId(solutionId, {
      $filter: `componenttype eq ${ComponentType.Role}`,
      $select: ['objectid', 'componenttype']
    });

    if (components.length === 0) {
      return false;
    }

    // Check each security role
    for (const component of components) {
      if (component.objectid) {
        try {
          // Get the security role details
          const roleUrl = `/roles(${component.objectid})`;
          const roleResponse = await this.httpClient.get<any>(roleUrl);
          const role = roleResponse.data;

          // Check if the role name indicates System Customizer or System Administrator
          if (role.name) {
            const roleName = role.name.toLowerCase();
            if (roleName.includes('system customizer') ||
                roleName.includes('system administrator') ||
                roleName === 'system customizer' ||
                roleName === 'system administrator') {
              return true;
            }
          }

          // Additionally, check role privileges for admin-level access
          // System Administrator and System Customizer roles have specific privilege depths
          // that indicate elevated permissions (typically Global depth on key entities)

        } catch (error) {
          // Skip if we can't get role details
          continue;
        }
      }
    }

    return false;
  }

  /**
   * Check if solution security roles grant access to tables outside of the publisher's scope
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if security roles grant access to tables from other publishers
   */
  async doesSecurityRoleGrantAccessToTableOutsideOfPublisher(solutionId: string): Promise<boolean> {
    // Get the solution with publisher information
    const solution = await this.getSolutionById(solutionId, {
      $select: ['solutionid', 'uniquename', 'publisheridname'],
      $expand: ['publisherid($select=uniquename,customizationprefix)']
    });

    if (!solution.publisherid) {
      return false;
    }

    const solutionPublisherPrefix = solution.publisherid.customizationprefix || solution.publisheridname;

    if (!solutionPublisherPrefix) {
      return false;
    }

    // Get all security role components
    const components = await this.getSolutionComponentsBySolutionId(solutionId, {
      $filter: `componenttype eq ${ComponentType.Role}`,
      $select: ['objectid', 'componenttype']
    });

    if (components.length === 0) {
      return false;
    }

    // Check each security role's privileges
    for (const component of components) {
      if (component.objectid) {
        try {
          // Get role privileges
          const privilegesUrl = `/roles(${component.objectid})/roleprivileges`;
          const privilegesResponse = await this.httpClient.get<any>(privilegesUrl);
          const privileges = privilegesResponse.data.value || [];

          // Check each privilege to see if it grants access to entities outside the publisher
          for (const privilege of privileges) {
            // Get the privilege details to find the associated entity
            if (privilege.privilegeid) {
              try {
                const privilegeUrl = `/privileges(${privilege.privilegeid})`;
                const privilegeResponse = await this.httpClient.get<any>(privilegeUrl);
                const privilegeData = privilegeResponse.data;

                // Check if the privilege is for an entity
                if (privilegeData.accessright && privilegeData.name) {
                  // Entity privileges typically have names like "prvReadAccount", "prvCreateNew_customentity"
                  // Extract entity name and check publisher prefix
                  const entityMatch = privilegeData.name.match(/prv(?:Read|Write|Create|Delete|Append|AppendTo|Assign|Share)(.+)/);
                  if (entityMatch && entityMatch[1]) {
                    const entityLogicalName = entityMatch[1].toLowerCase();

                    // Check if entity belongs to a different publisher
                    if (entityLogicalName.includes('_')) {
                      const entityPrefix = entityLogicalName.split('_')[0];
                      if (entityPrefix !== solutionPublisherPrefix.toLowerCase()) {
                        return true;
                      }
                    }
                  }
                }
              } catch (error) {
                // Skip if we can't get privilege details
                continue;
              }
            }
          }
        } catch (error) {
          // Skip if we can't get role privileges
          continue;
        }
      }
    }

    return false;
  }

  /**
   * Update the description of an attribute
   * @param attributeId The unique identifier (MetadataId) of the attribute (GUID)
   * @param description The new description for the attribute
   * @returns Promise<void>
   */
  async updateAttributeDescription(attributeId: string, description: string): Promise<void> {
    // First, get the attribute metadata to determine the entity
    const attributeMetadataUrl = `/EntityDefinitions/Attributes(${attributeId})`;

    try {
      const attributeResponse = await this.httpClient.get<Attribute>(attributeMetadataUrl);
      const attribute = attributeResponse.data;

      if (!attribute) {
        throw new Error(`Attribute ${attributeId} not found`);
      }

      // Update the attribute description
      // We need to use the EntityLogicalName and AttributeLogicalName
      const entityLogicalName = attribute.EntityLogicalName;
      const attributeLogicalName = attribute.LogicalName;

      if (!entityLogicalName || !attributeLogicalName) {
        throw new Error(`Could not determine entity or attribute logical name for attribute ${attributeId}`);
      }

      // Update the attribute using the entity and attribute logical names
      const updateUrl = `/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attributeLogicalName}')`;

      // Use PUT to update the attribute metadata
      await this.httpClient.put(updateUrl, {
        Description: {
          '@odata.type': 'Microsoft.Dynamics.CRM.Label',
          LocalizedLabels: [
            {
              '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
              Label: description,
              LanguageCode: 1033 // English
            }
          ]
        }
      });

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Attribute ${attributeId} not found`);
      }
      throw error;
    }
  }

  /**
   * Update the description of an entity/table
   * @param entityId The unique identifier (MetadataId) of the entity (GUID)
   * @param description The new description for the entity
   * @returns Promise<void>
   */
  async updateEntityDescription(entityId: string, description: string): Promise<void> {
    // First, get the entity metadata to get the logical name
    const entityMetadataUrl = `/EntityDefinitions(${entityId})`;

    try {
      const entityResponse = await this.httpClient.get<Entity>(entityMetadataUrl);
      const entity = entityResponse.data;

      if (!entity) {
        throw new Error(`Entity ${entityId} not found`);
      }

      const entityLogicalName = entity.LogicalName;

      if (!entityLogicalName) {
        throw new Error(`Could not determine entity logical name for entity ${entityId}`);
      }

      // Update the entity using the logical name
      const updateUrl = `/EntityDefinitions(LogicalName='${entityLogicalName}')`;

      // Use PUT to update the entity metadata
      await this.httpClient.put(updateUrl, {
        Description: {
          '@odata.type': 'Microsoft.Dynamics.CRM.Label',
          LocalizedLabels: [
            {
              '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
              Label: description,
              LanguageCode: 1033 // English
            }
          ]
        }
      });

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error(`Entity ${entityId} not found`);
      }
      throw error;
    }
  }

  /**
   * Get all tables/entities modified by solution that are missing descriptions
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of entities missing descriptions
   */
  async allTablesModifiedBySolutionMissingDescription(solutionId: string): Promise<Entity[]> {
    // Get all entity components from the solution (componenttype = 1)
    const components = await this.getSolutionComponentsBySolutionId(solutionId, {
      $filter: `componenttype eq ${ComponentType.Entity}`,
      $select: ['objectid', 'componenttype']
    });

    if (components.length === 0) {
      return [];
    }

    const entitiesMissingDescription: Entity[] = [];

    // Check each entity for missing description
    for (const component of components) {
      if (component.objectid) {
        try {
          // Get entity metadata
          const entityUrl = `/EntityDefinitions(${component.objectid})`;
          const entityResponse = await this.httpClient.get<Entity>(entityUrl);
          const entity = entityResponse.data;

          // Check if description is missing or empty
          const hasDescription = entity.Description?.LocalizedLabels?.some(
            (label: { Label?: string }) => label.Label && label.Label.trim().length > 0
          );

          if (!hasDescription) {
            entitiesMissingDescription.push(entity);
          }
        } catch (error) {
          // Skip if we can't get entity metadata
          continue;
        }
      }
    }

    return entitiesMissingDescription;
  }

  /**
   * Check if Solution Checker has been run on a solution
   * Checks for the existence of analysis jobs for the given solution
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<boolean> - true if Solution Checker has been run on this solution
   */
  async hasSolutionCheckerBeenRun(solutionId: string): Promise<boolean> {
    try {
      // Query for analysis jobs related to this solution
      // The msdyn_analysisjob entity stores Solution Checker job information
      const analysisJobsUrl = `/msdyn_analysisjobs?$filter=_msdyn_solutionhealthruleset_value eq '${solutionId}'&$top=1&$select=msdyn_analysisjobid`;

      const response = await this.httpClient.get<DataverseResponse<any>>(analysisJobsUrl);

      // If we find any analysis jobs, the checker has been run
      if (response.data.value && response.data.value.length > 0) {
        return true;
      }

      // Also check msdyn_analysiscomponent which stores component-level results
      const analysisComponentsUrl = `/msdyn_analysiscomponents?$filter=_msdyn_solutionid_value eq '${solutionId}'&$top=1&$select=msdyn_analysiscomponentid`;

      const componentsResponse = await this.httpClient.get<DataverseResponse<any>>(analysisComponentsUrl);

      return componentsResponse.data.value && componentsResponse.data.value.length > 0;

    } catch (error: any) {
      // If the entities don't exist (404) or we can't query them, assume checker hasn't been run
      if (error.response && (error.response.status === 404 || error.response.status === 401)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Run Solution Checker on a solution
   * Initiates an analysis job to check the solution for issues
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise<void>
   */
  async runSolutionChecker(solutionId: string): Promise<void> {
    // Get the solution to verify it exists
    const solution = await this.getSolutionById(solutionId, {
      $select: ['solutionid', 'uniquename', 'friendlyname']
    });

    if (!solution) {
      throw new Error(`Solution ${solutionId} not found`);
    }

    try {
      // Call the Dataverse action to run the solution checker
      // The action name is typically 'Microsoft.Dynamics.CRM.msdyn_AnalyzeSolution'
      const actionUrl = '/msdyn_AnalyzeSolution';

      await this.httpClient.post(actionUrl, {
        SolutionName: solution.uniquename,
        SolutionId: solutionId
      });

    } catch (error: any) {
      // If the action doesn't exist or isn't available
      if (error.response && error.response.status === 404) {
        throw new Error('Solution Checker action is not available in this environment. Ensure the Solution Checker solution is installed.');
      }
      throw error;
    }
  }

  /**
   * Get Solution Checker results for a solution
   * Retrieves analysis results including issues found by Solution Checker
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of solution checker results
   */
  async getSolutionCheckerResults(solutionId: string): Promise<any[]> {
    try {
      // Query for analysis results related to this solution
      const resultsUrl = `/msdyn_analysisresults?$filter=_msdyn_solutionhealthruleset_value eq '${solutionId}'&$orderby=createdon desc`;

      const response = await this.httpClient.get<DataverseResponse<any>>(resultsUrl);
      return response.data.value || [];
    } catch (error: any) {
      if (error.response && (error.response.status === 404 || error.response.status === 401)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get detailed Solution Checker analysis components for a solution
   * Retrieves component-level analysis results
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of analysis components
   */
  async getSolutionCheckerAnalysisComponents(solutionId: string): Promise<any[]> {
    try {
      const componentsUrl = `/msdyn_analysiscomponents?$filter=_msdyn_solutionid_value eq '${solutionId}'&$orderby=createdon desc`;

      const response = await this.httpClient.get<DataverseResponse<any>>(componentsUrl);
      return response.data.value || [];
    } catch (error: any) {
      if (error.response && (error.response.status === 404 || error.response.status === 401)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get Solution Checker analysis jobs for a solution
   * Retrieves the history of analysis jobs run on the solution
   * @param solutionId The unique identifier of the solution (GUID)
   * @returns Promise with array of analysis jobs
   */
  async getSolutionCheckerJobs(solutionId: string): Promise<any[]> {
    try {
      const jobsUrl = `/msdyn_analysisjobs?$filter=_msdyn_solutionhealthruleset_value eq '${solutionId}'&$orderby=createdon desc`;

      const response = await this.httpClient.get<DataverseResponse<any>>(jobsUrl);
      return response.data.value || [];
    } catch (error: any) {
      if (error.response && (error.response.status === 404 || error.response.status === 401)) {
        return [];
      }
      throw error;
    }
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
