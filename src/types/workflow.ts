/**
 * Dataverse Workflow Types
 * Interfaces for workflows and workflow-related entities
 */

/**
 * Workflow interface
 * Represents a Dataverse workflow (process)
 */
export interface Workflow {
  /** Unique identifier for the workflow */
  workflowid?: string;

  /** Name of the workflow */
  name?: string;

  /** Type of workflow (1: Definition, 2: Activation, 3: Template) */
  type?: number;

  /** Category of the workflow (0: Workflow, 1: Dialog, 2: Business Rule, 3: Action, 4: Business Process Flow, 5: Modern Flow) */
  category?: number;

  /** Primary entity for the workflow */
  primaryentity?: string;

  /** Description of the workflow */
  description?: string;

  /** Workflow state (0: Draft, 1: Activated) */
  statecode?: number;

  /** Workflow status (1: Draft, 2: Activated) */
  statuscode?: number;

  /** Indicates if the workflow is managed */
  ismanaged?: boolean;

  /** Date and time when the workflow was created */
  createdon?: string;

  /** Date and time when the workflow was modified */
  modifiedon?: string;

  /** XAML definition of the workflow */
  xaml?: string;

  /** Process triggers (scope) */
  scope?: number;

  /** Mode of the workflow (0: Background, 1: Real-time) */
  mode?: number;

  /** On-demand process */
  ondemand?: boolean;

  /** Subprocess */
  subprocess?: boolean;

  /** Sync workflow log on failure */
  syncworkflowlogonfailure?: boolean;

  /** Owner ID */
  ownerid?: string;

  /** Unique name */
  uniquename?: string;

  /** Process order */
  processorder?: number;

  /** Process role assignment */
  processroleassignment?: string;

  /** Is transacted */
  istransacted?: boolean;

  /** Language code */
  languagecode?: number;

  /** Version number */
  versionnumber?: number;
}

/**
 * Workflow action step interface
 * Represents an action step within a workflow
 */
export interface WorkflowActionStep {
  /** Unique identifier for the workflow action step */
  workflowactionstepid?: string;

  /** Workflow ID that this step belongs to */
  workflowid?: string;

  /** Step name */
  name?: string;

  /** Step type */
  steptype?: string;

  /** Action name */
  actionname?: string;

  /** From email address for email actions */
  from?: string;

  /** Reply-to email address for email actions */
  replyto?: string;

  /** To recipients */
  to?: string;

  /** CC recipients */
  cc?: string;

  /** BCC recipients */
  bcc?: string;

  /** Subject */
  subject?: string;

  /** Email body */
  body?: string;

  /** Step configuration (XML) */
  configuration?: string;

  /** Order of the step */
  steporder?: number;
}

/**
 * Email action validation result
 */
export interface EmailActionValidation {
  /** Workflow ID */
  workflowId: string;

  /** Workflow name */
  workflowName: string;

  /** Indicates if the workflow has email or approval actions */
  hasEmailOrApprovalActions: boolean;

  /** Indicates if all email actions have 'from' populated */
  hasFromPopulated: boolean;

  /** Indicates if all email actions have 'replyto' populated */
  hasReplyToPopulated: boolean;

  /** List of actions that need attention */
  actionsNeedingAttention?: {
    actionId: string;
    actionName: string;
    missingFields: string[];
  }[];
}

/**
 * Workflow query options
 * OData query parameters for filtering and selecting workflow data
 */
export interface WorkflowQueryOptions {
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
 * Component type enum values for solution components
 * Used to identify different types of components in solutions
 */
export enum ComponentType {
  Entity = 1,
  Attribute = 2,
  Relationship = 3,
  AttributePicklistValue = 4,
  AttributeLookupValue = 5,
  ViewAttribute = 6,
  LocalizedLabel = 7,
  RelationshipExtraCondition = 8,
  OptionSet = 9,
  EntityRelationship = 10,
  EntityRelationshipRole = 11,
  EntityRelationshipRelationships = 12,
  ManagedProperty = 13,
  EntityKey = 14,
  Privilege = 16,
  PrivilegeObjectTypeCode = 17,
  Role = 20,
  RolePrivilege = 21,
  DisplayString = 22,
  DisplayStringMap = 23,
  Form = 24,
  Organization = 25,
  SavedQuery = 26,
  Workflow = 29,
  Report = 31,
  ReportEntity = 32,
  ReportCategory = 33,
  ReportVisibility = 34,
  Attachment = 35,
  EmailTemplate = 36,
  ContractTemplate = 37,
  KBArticleTemplate = 38,
  MailMergeTemplate = 39,
  DuplicateRule = 44,
  DuplicateRuleCondition = 45,
  EntityMap = 46,
  AttributeMap = 47,
  RibbonCommand = 48,
  RibbonContextGroup = 49,
  RibbonCustomization = 50,
  RibbonRule = 52,
  RibbonTabToCommandMap = 53,
  RibbonDiff = 55,
  SavedQueryVisualization = 59,
  SystemForm = 60,
  WebResource = 61,
  SiteMap = 62,
  ConnectionRole = 63,
  ComplexControl = 64,
  FieldSecurityProfile = 70,
  FieldPermission = 71,
  PluginType = 90,
  PluginAssembly = 91,
  SDKMessageProcessingStep = 92,
  SDKMessageProcessingStepImage = 93,
  ServiceEndpoint = 95,
  RoutingRule = 150,
  RoutingRuleItem = 151,
  SLA = 152,
  SLAItem = 153,
  ConvertRule = 154,
  ConvertRuleItem = 155,
  MobileOfflineProfile = 161,
  MobileOfflineProfileItem = 162,
  SimilarityRule = 165,
  CustomControl = 66,
  CustomControlDefaultConfig = 68,
  DataSourceMapping = 166,
  Connector = 371,
  EnvironmentVariableDefinition = 380,
  EnvironmentVariableValue = 381,
  AIProjectType = 400,
  AIProject = 401,
  AIConfiguration = 402,
  EntityAnalyticsConfig = 430,
  AttributeImageConfig = 431,
  EntityImageConfig = 432,
  CanvasApp = 300
}
