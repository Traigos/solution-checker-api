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
 * Entity interface
 * Represents a Dataverse table/entity
 */
export interface Entity {
  /** Metadata ID of the entity */
  MetadataId?: string;

  /** Logical name of the entity */
  LogicalName?: string;

  /** Schema name of the entity */
  SchemaName?: string;

  /** Display name of the entity */
  DisplayName?: {
    LocalizedLabels?: Array<{
      Label?: string;
      LanguageCode?: number;
    }>;
  };

  /** Description of the entity */
  Description?: {
    LocalizedLabels?: Array<{
      Label?: string;
      LanguageCode?: number;
    }>;
  };

  /** Entity type code */
  ObjectTypeCode?: number;

  /** Primary ID attribute */
  PrimaryIdAttribute?: string;

  /** Primary name attribute */
  PrimaryNameAttribute?: string;

  /** Table type (0 = Standard, 1 = Activity, 2 = Virtual) */
  TableType?: string;

  /** Ownership type (0 = None, 1 = UserOwned, 2 = TeamOwned, 4 = OrganizationOwned) */
  OwnershipType?: number;

  /** Is custom entity */
  IsCustomEntity?: boolean;

  /** Is managed */
  IsManaged?: boolean;
}

/**
 * Attribute interface
 * Represents a Dataverse table column/attribute
 */
export interface Attribute {
  /** Metadata ID of the attribute */
  MetadataId?: string;

  /** Logical name of the attribute */
  LogicalName?: string;

  /** Schema name of the attribute */
  SchemaName?: string;

  /** Entity logical name that this attribute belongs to */
  EntityLogicalName?: string;

  /** Display name of the attribute */
  DisplayName?: {
    LocalizedLabels?: Array<{
      Label?: string;
      LanguageCode?: number;
    }>;
  };

  /** Description of the attribute */
  Description?: {
    LocalizedLabels?: Array<{
      Label?: string;
      LanguageCode?: number;
    }>;
  };

  /** Attribute type */
  AttributeType?: string;

  /** Is custom attribute */
  IsCustomAttribute?: boolean;

  /** Is managed */
  IsManaged?: boolean;
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

/**
 * Solution import options
 */
export interface ImportSolutionOptions {
  /** Indicates whether to overwrite customizations */
  OverwriteUnmanagedCustomizations?: boolean;

  /** Indicates whether to publish workflows */
  PublishWorkflows?: boolean;

  /** Import job ID (for tracking async imports) */
  ImportJobId?: string;

  /** Convert to managed solution on import */
  ConvertToManaged?: boolean;

  /** Skip product update dependencies */
  SkipProductUpdateDependencies?: boolean;

  /** Hold solution to be upgraded until apply */
  HoldingSolution?: boolean;
}

/**
 * Solution import request
 */
export interface ImportSolutionRequest extends ImportSolutionOptions {
  /** Base64 encoded solution file content */
  CustomizationFile: string;
}

/**
 * Solution import result
 */
export interface ImportSolutionResult {
  /** Import job ID for tracking the import */
  ImportJobId?: string;

  /** Indicates whether the import was successful */
  Success?: boolean;

  /** Error message if import failed */
  ErrorText?: string;
}

/**
 * Async import job result
 */
export interface AsyncImportJob {
  /** Import job ID */
  importjobid?: string;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Status code (0=InProgress, 1=Completed, 2=Failed, 3=Canceled) */
  statuscode?: number;

  /** Data containing result information */
  data?: string;

  /** Solution name being imported */
  solutionname?: string;

  /** Completed on date/time */
  completedon?: string;

  /** Created on date/time */
  createdon?: string;
}

/**
 * Solution export options
 */
export interface ExportSolutionOptions {
  /** Unique name of the solution to export */
  SolutionName: string;

  /** Export as managed solution */
  Managed?: boolean;

  /** Include version in the solution file name */
  ExportAutoNumberingSettings?: boolean;

  /** Include calendar settings */
  ExportCalendarSettings?: boolean;

  /** Include customization */
  ExportCustomizationSettings?: boolean;

  /** Include email tracking settings */
  ExportEmailTrackingSettings?: boolean;

  /** Include general settings */
  ExportGeneralSettings?: boolean;

  /** Include marketing settings */
  ExportMarketingSettings?: boolean;

  /** Include outlook synchronization settings */
  ExportOutlookSynchronizationSettings?: boolean;

  /** Include relationship roles */
  ExportRelationshipRoles?: boolean;

  /** Include ISV config */
  ExportIsvConfig?: boolean;

  /** Include sales settings */
  ExportSales?: boolean;

  /** Include external applications */
  ExportExternalApplications?: boolean;
}

/**
 * Solution export result
 */
export interface ExportSolutionResult {
  /** Base64 encoded solution file content */
  ExportSolutionFile?: string;
}

/**
 * Solution delete result
 */
export interface DeleteSolutionResult {
  /** Indicates whether the delete was successful */
  Success: boolean;

  /** Error message if delete failed */
  ErrorMessage?: string;
}
