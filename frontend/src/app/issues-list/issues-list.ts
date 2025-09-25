import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueService, Issue } from '../issue';

@Component({
  selector: 'app-issues-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './issues-list.html',
  styleUrl: './issues-list.css'
})
export class IssuesList implements OnInit {
  private router = inject(Router);
  private issueService = inject(IssueService);

  issues: Issue[] = [];
  total = 0;
  loading = false;

  // Filters and search
  search = '';
  statusFilter = '';
  priorityFilter = '';
  assigneeFilter = '';

  // Sorting
  sortBy = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  page = 1;
  pageSize = 10;

  // Form state
  showCreateForm = false;
  showEditForm = false;
  editingIssue: Issue | null = null;

  // Form data
  formData = {
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assignee: ''
  };

  ngOnInit() {
    this.loadIssues();
  }

  loadIssues() {
    this.loading = true;
    const params: any = {
      page: this.page,
      page_size: this.pageSize
    };

    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.priorityFilter) params.priority = this.priorityFilter;
    if (this.assigneeFilter) params.assignee = this.assigneeFilter;
    if (this.sortBy) {
      params.sort_by = this.sortBy;
      params.sort_order = this.sortOrder;
    }

    this.issueService.getIssues(params).subscribe({
      next: (response) => {
        this.issues = response.issues;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.page = 1;
    this.loadIssues();
  }

  onFilterChange() {
    this.page = 1;
    this.loadIssues();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadIssues();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadIssues();
  }

  viewIssue(issue: Issue) {
    this.router.navigate(['/issues', issue.id]);
  }

  editIssue(issue: Issue) {
    this.editingIssue = issue;
    this.formData = {
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignee
    };
    this.showEditForm = true;
  }

  createIssue() {
    this.formData = {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      assignee: ''
    };
    this.showCreateForm = true;
  }

  saveIssue() {
    if (this.showCreateForm) {
      this.issueService.createIssue(this.formData).subscribe({
        next: () => {
          this.showCreateForm = false;
          this.loadIssues();
        }
      });
    } else if (this.showEditForm && this.editingIssue) {
      this.issueService.updateIssue(this.editingIssue.id, this.formData).subscribe({
        next: () => {
          this.showEditForm = false;
          this.editingIssue = null;
          this.loadIssues();
        }
      });
    }
  }

  cancelForm() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingIssue = null;
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return '↕️';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getUniqueValues(field: keyof Issue): string[] {
    const values = this.issues.map(issue => issue[field] as string);
    return [...new Set(values)].filter(v => v);
  }
}
