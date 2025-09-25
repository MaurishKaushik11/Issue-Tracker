import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService, Issue } from '../issue';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.html',
  styleUrl: './issue-detail.css'
})
export class IssueDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private issueService = inject(IssueService);

  issue: Issue | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.issueService.getIssue(id).subscribe({
        next: (issue) => this.issue = issue,
        error: () => this.router.navigate(['/issues'])
      });
    }
  }

  goBack() {
    this.router.navigate(['/issues']);
  }
}
