export interface HealthStatus {
  status: string;
  environment: string;
  timestampUtc: string;
  databaseReady: boolean;
  correlationId: string;
}

export interface PortalUser {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

export interface WorkflowSummary {
  id: string;
  key: string;
  name: string;
  version: number;
  isActive: boolean;
  stepCount: number;
}

export interface WorkflowInstanceSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  title: string;
  currentStatus: string;
  requesterId: string;
  requesterName: string;
  createdAtUtc: string;
  submittedAtUtc: string | null;
  completedAtUtc: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedByName: string;
  performedAtUtc: string;
  comment: string | null;
}

export interface ApprovalStepDetail {
  id: string;
  stepIndex: number;
  groupId: string | null;
  name: string;
  requiredRole: string;
  status: string;
  assignedUserName: string | null;
  comment: string | null;
  decidedAtUtc: string | null;
}

export interface WorkflowInstanceDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowKey: string;
  title: string;
  currentStatus: string;
  requesterId: string;
  requesterName: string;
  formData: Record<string, string>;
  createdAtUtc: string;
  submittedAtUtc: string | null;
  completedAtUtc: string | null;
  steps: ApprovalStepDetail[];
  auditLog: AuditLogEntry[];
}

export interface PendingApproval {
  instanceId: string;
  instanceTitle: string;
  workflowName: string;
  requesterName: string;
  stepId: string;
  stepName: string;
  requiredRole: string;
  createdAtUtc: string;
}

export interface CreateWorkflowInstanceRequest {
  workflowKey: string;
  title: string;
  formData: Record<string, string>;
}

export interface SubmitDecisionRequest {
  stepId: string;
  decision: 'Approve' | 'Reject' | 'RequestAdjustment';
  comment?: string;
}