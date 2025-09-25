import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = 'http://localhost:8000'; // backend url

  constructor(private http: HttpClient) { }

  getIssues(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/issues`, { params: httpParams });
  }

  getIssue(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/issues/${id}`);
  }

  createIssue(issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, issue);
  }

  updateIssue(id: number, issue: Partial<Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/issues/${id}`, issue);
  }
}
