import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuthComponent } from './user-auth.component';
import { UserSettingsService } from '../user-settings.service';
import { SessionLoginInformation } from '../interfaces';
import { UserAuthStepperComponent } from '../user-auth-stepper/user-auth-stepper.component';
import { ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper';
import { GithubService } from '../github.service';
import { UserSettings } from '../user-settings';
import { Router } from '@angular/router';


describe('UserAuthComponent', () => {
  let component: UserAuthComponent;
  let fixture: ComponentFixture<UserAuthComponent>;
  let spySettings: jasmine.SpyObj<UserSettingsService>;
  let spyGithub: jasmine.SpyObj<GithubService>;
  const dummyUsers = ['user1', 'user2'];

  beforeEach(async(() => {
    const mockSettingsProvider = jasmine.createSpyObj('UserSettingsService', ['setUserSettings', 'getUserSettings']);
    const mockGithubProvider = jasmine.createSpyObj('GithubService', ['verifyConnection', 'getPullRequests']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [ UserAuthComponent, UserAuthStepperComponent],
      imports: [ MatStepperModule,
                 ReactiveFormsModule,
                 MatFormFieldModule,
                 MatInputModule,
                 MatCardModule,
                 BrowserAnimationsModule ],
      providers: [ {provide: UserSettingsService, useValue: mockSettingsProvider},
                   {provide: GithubService, useValue: mockGithubProvider},
                   {provide: Router, useValue: mockRouter}]
    })
    .compileComponents();
    const dummySettings: UserSettings = new UserSettings('github.company.com', '123', dummyUsers.toString());
    mockSettingsProvider.getUserSettings.and.returnValue(dummySettings);
    spySettings = TestBed.get(UserSettingsService);
    spyGithub = TestBed.get(GithubService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should handle passing the settings to the UserSettingsService', () => {
    component.processSettings();
    for (const user of dummyUsers) {
      expect(spyGithub.getPullRequests).toHaveBeenCalledWith(user);
    }
  });
});
