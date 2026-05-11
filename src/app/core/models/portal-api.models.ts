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
  requesterName: string;
  createdAtUtc: string;
  submittedAtUtc: string | null;
  completedAtUtc: string | null;
}