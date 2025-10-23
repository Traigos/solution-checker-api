/**
 * Dataverse Solution Types
 *
 * TODO: Define your solution interfaces here
 * This file contains placeholder types that should be defined based on your Dataverse schema
 */

/**
 * Base solution interface
 * Define the structure of a Dataverse solution
 */
export interface Solution {
  // TODO: Define solution properties
  // Example:
  // solutionid?: string;
  // uniquename?: string;
  // friendlyname?: string;
  // version?: string;
  // publisherid?: string;
  // description?: string;
  // installedon?: Date;
  // ismanaged?: boolean;
}

/**
 * Solution query options
 */
export interface SolutionQueryOptions {
  // TODO: Define query options
  // Example:
  // $select?: string[];
  // $filter?: string;
  // $orderby?: string;
  // $top?: number;
  // $skip?: number;
}

/**
 * Solution component interface
 */
export interface SolutionComponent {
  // TODO: Define solution component properties
  // Example:
  // solutioncomponentid?: string;
  // componenttype?: number;
  // objectid?: string;
  // rootcomponentbehavior?: number;
}

/**
 * API response wrapper
 */
export interface DataverseResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

/**
 * API error response
 */
export interface DataverseError {
  error: {
    code: string;
    message: string;
  };
}
