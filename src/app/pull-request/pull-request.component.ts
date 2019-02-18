import { Component, OnInit, Input } from '@angular/core';
import { GithubService } from '../github.service';
import * as Interfaces from '../interfaces';

@Component({
  selector: 'app-pull-request',
  templateUrl: './pull-request.component.html',
  styleUrls: ['./pull-request.component.css']
})
export class PullRequestComponent implements OnInit {

  issues: Interfaces.Issue[];
  currentSelectedIssue: Interfaces.Issue;
  theMap: Map<number, Interfaces.Issue>;
  users: string[];

  public setUsers(users: string[]) {
    this.users = users;
  }

  private parseResults(results: Interfaces.IssueSearchResult) {
    for (const issue of results.items) {
      this.theMap.set(issue.id, issue);
    }
  }

  private sendPullRequestGet() {
    this.users.forEach(user => {
      this.githubService.getPullRequests(user).subscribe(results => this.parseResults(results));
    });
  }

  constructor(private githubService: GithubService) {
    this.theMap = new Map<number, Interfaces.Issue>();
  }

  ngOnInit() {
    this.sendPullRequestGet();
  }

}
