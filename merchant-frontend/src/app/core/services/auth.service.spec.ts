import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });
  it('creates service', () => expect(service).toBeTruthy());
  it('starts without a user', () => expect(service.user()).toBeNull());
  it('clears session on logout', () => {
    sessionStorage.setItem('accessToken','x');
    service.logout();
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(service.user()).toBeNull();
  });
});
