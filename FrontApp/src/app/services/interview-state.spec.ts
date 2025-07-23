import { TestBed } from '@angular/core/testing';

import { InterviewState } from './interview-state';

describe('InterviewState', () => {
  let service: InterviewState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterviewState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
