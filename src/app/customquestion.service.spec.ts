import { TestBed } from '@angular/core/testing';

import { CustomquestionService } from './hosting.service';

describe('HostingService', () => {
  let service: CustomquestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomquestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});