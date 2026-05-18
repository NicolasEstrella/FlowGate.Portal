import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateWorkflowInstanceRequest,
  PendingApproval,
  SubmitDecisionRequest,
  WorkflowInstanceDetail,
  WorkflowInstanceSummary
} from '../models/portal-api.models';

@Injectable({ providedIn: 'root' })
export class WorkflowInstancesService {
  private readonly http = inject(HttpClient);
  private readonly base = '/workflow-instances';

  getAll(): Observable<WorkflowInstanceSummary[]> {
    return this.http.get<WorkflowInstanceSummary[]>(this.base);
  }

  getById(id: string): Observable<WorkflowInstanceDetail> {
    return this.http.get<WorkflowInstanceDetail>(`${this.base}/${id}`);
  }

  getPending(): Observable<PendingApproval[]> {
    return this.http.get<PendingApproval[]>(`${this.base}/pending`);
  }

  createRequest(request: CreateWorkflowInstanceRequest): Observable<WorkflowInstanceDetail> {
    return this.http.post<WorkflowInstanceDetail>(this.base, request);
  }

  submit(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/submit`, {});
  }

  decide(id: string, request: SubmitDecisionRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/decide`, request);
  }

  cancel(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/cancel`, {});
  }
}
