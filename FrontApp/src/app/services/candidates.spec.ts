import { TestBed } from '@angular/core/testing';

import { Candidates } from './candidates';

describe('Candidates', () => {
  let service: Candidates;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Candidates);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
