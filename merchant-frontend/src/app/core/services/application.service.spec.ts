import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
    service=TestBed.inject(ApplicationService); http=TestBed.inject(HttpTestingController);
  });
  afterEach(()=>http.verify());
  it('requests paginated applications',()=>{
    service.list(1,10,'','').subscribe(r=>expect(r.total).toBe(0));
    const req=http.expectOne(r=>r.url==='/api/applications');
    expect(req.request.method).toBe('GET');
    req.flush({items:[],total:0,page:1,limit:10});
  });
});
