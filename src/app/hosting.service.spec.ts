import { TestBed } from '@angular/core/testing';

import { HostingService } from './hosting.service';

describe('HostingService', () => {
  let service: HostingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
