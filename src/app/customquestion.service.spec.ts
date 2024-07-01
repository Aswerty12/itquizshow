import { TestBed } from '@angular/core/testing';

import { CustomQuestionService } from './customquestion.service';

describe('HostingService', () => {
  let service: CustomQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomQuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});