import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/issues', pathMatch: 'full' },
  { path: 'issues', loadComponent: () => import('./issues-list/issues-list.component').then(m => m.IssuesList) },
  { path: 'issues/:id', loadComponent: () => import('./issue-detail/issue-detail.component').then(m => m.IssueDetail) }
];
