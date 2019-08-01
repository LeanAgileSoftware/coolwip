import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import * as Interfaces from '../interfaces';
import { UserSettingsService } from '../user-settings.service';
import { GithubService } from '../github.service';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

interface ColumnData {
  key: string;
  name: string;
}

@Component({
  selector: 'app-pull-request-table',
  templateUrl: './pull-request-table.component.html',
  styleUrls: ['./pull-request-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class PullRequestTableComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<Interfaces.PullRequestView>;
  columnData: Map<ColumnData['key'], ColumnData['name']>;
  expandedElement: Interfaces.PullRequest | null;
  issues: Interfaces.Issue[];
  currentSelectedIssue: Interfaces.Issue;
  theMap: Map<number, Interfaces.Issue>;
  userSettingsSubRef: Subscription = null;
  columnNames: string[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private userSettingsService: UserSettingsService,
              private githubService: GithubService) {
    this.theMap = new Map<number, Interfaces.Issue>();
    this.userSettingsSubRef = this.userSettingsService.settingChangedObservable.subscribe(() => this.fetchPullRequests());
    this.dataSource = new MatTableDataSource<Interfaces.PullRequestView>();
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  private transformIssueToViewModel(issue: Interfaces.Issue): Interfaces.PullRequestView {
    const issueIsOpen: string = Interfaces.IssueState[issue.state];
    return {
      url: issue.html_url,
      author: issue.user.login,
      org: issue.repository_url,
      repo: issue.repository_url,
      number: issue.number,
      created_date: new Date(issue.created_at),
      updated_date: new Date(issue.updated_at),
      status: issueIsOpen,
      diff_url: issue.pull_request.diff_url,
      patch_url: issue.pull_request.patch_url
    };

  }

  private storeResults(results: Interfaces.IssueSearchResult) {
    for (const issue of results.items) {
      // pull in username at the the top level of the object so we don't have to dig for it later
      this.theMap.set(issue.id, {...issue, ...{username: issue.user.login}});
      this.dataSource.data = Array.from(this.theMap.values()).map(this.transformIssueToViewModel);
    }
  }

  public fetchPullRequests() {
    const observableArray = this.githubService.getPullRequestsForUsers
      (this.userSettingsService.getUserSettings().getTokenizedListOfUsers());
    observableArray.map(item => item.subscribe(
        x => this.storeResults(x),
        err => console.log(`There was an error fetching pull requests: ${err}`)
      )
    );
  }

  ngOnInit(): void {
    // Setup columns
    this.columnData = new Map<ColumnData['key'], ColumnData['name']>();
    this.columnData.set('author', 'Name');
    this.columnData.set('status', 'Status');
    this.columnData.set('number', 'Number');
    this.columnData.set('created_date', 'Created');
    this.columnData.set('updated_date', 'Updated');
    this.columnNames = Array.from(this.columnData.values());
    this.fetchPullRequests();
  }

  ngOnDestroy(): void {
      this.userSettingsSubRef.unsubscribe();
  }

}
