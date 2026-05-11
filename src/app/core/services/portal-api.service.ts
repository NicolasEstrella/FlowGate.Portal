import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HealthStatus, PortalUser, WorkflowInstanceSummary, WorkflowSummary } from '../models/portal-api.models';

@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly http = inject(HttpClient);

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>('/health');
  }

  getUsers(): Observable<PortalUser[]> {
    return this.http.get<PortalUser[]>('/users');
  }

  getWorkflows(): Observable<WorkflowSummary[]> {
    return this.http.get<WorkflowSummary[]>('/workflows');
  }

  getWorkflowInstances(): Observable<WorkflowInstanceSummary[]> {
    return this.http.get<WorkflowInstanceSummary[]>('/workflow-instances');
  }
}