/**
 * Dataverse Solution Types
 *
 * TODO: Define your solution interfaces here
 * This file contains placeholder types that should be defined based on your Dataverse schema
 */

/**
 * Base solution interface
 * Define the structure of a Dataverse solution
 * Based on Microsoft Dataverse Solution entity schema
 */
export interface Solution {
  /** Unique identifier for the solution */
  solutionid?: string;

  /** Unique name of the solution */
  uniquename?: string;

  /** Display name of the solution */
  friendlyname?: string;

  /** Solution version in format Major.Minor.Build.Revision */
  version?: string;

  /** Publisher identifier reference */
  publisherid?: {
    publisherid?: string;
    uniquename?: string;
    friendlyname?: string;
    customizationprefix?: string;
  };

  /** Description of the solution */
  description?: string;

  /** Date and time when the solution was installed */
  installedon?: string;

  /** Indicates whether the solution is managed */
  ismanaged?: boolean;

  /** Indicates whether the solution is visible */
  isvisible?: boolean;

  /** Solution package version */
  solutionpackageversion?: string;

  /** Date and time when the solution was created */
  createdon?: string;

  /** Date and time when the solution was last modified */
  modifiedon?: string;

  /** Type of the solution (0: None, 1: Snapshot, 2: Internal) */
  solutiontype?: number;

  /** Configuration page for the solution */
  configurationpageid?: {
    webresourceid?: string;
    name?: string;
  };

  /** Version number of the solution */
  versionnumber?: number;

  /** Indicates if solution is an internal solution */
  isinternal?: boolean;

  /** Publisher prefix for the solution */
  publisheridname?: string;
}

/**
 * Solution query options
 * OData query parameters for filtering and selecting solution data
 */
export interface SolutionQueryOptions {
  /** Select specific fields to return */
  $select?: string[];

  /** Filter expression to filter the results */
  $filter?: string;

  /** Order by expression to sort the results */
  $orderby?: string;

  /** Limit the number of results returned */
  $top?: number;

  /** Skip a number of results (for pagination) */
  $skip?: number;

  /** Expand related entities */
  $expand?: string[];

  /** Include count of total results */
  $count?: boolean;
}

/**
 * Solution component interface
 * Represents a component within a Dataverse solution
 */
export interface SolutionComponent {
  /** Unique identifier for the solution component */
  solutioncomponentid?: string;

  /** Solution identifier that this component belongs to */
  solutionid?: string;

  /** OData lookup value for solution ID */
  _solutionid_value?: string;

  /** Type of the component (entity, workflow, web resource, etc.) */
  componenttype?: number;

  /** Unique identifier of the component object */
  objectid?: string;

  /** Root component behavior (0: Include Subcomponents, 1: Do Not Include Subcomponents, 2: Include As Shell Only) */
  rootcomponentbehavior?: number;

  /** Date and time when the component was created */
  createdon?: string;

  /** Date and time when the component was modified */
  modifiedon?: string;

  /** Indicates whether the component is metadata */
  ismetadata?: boolean;
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
