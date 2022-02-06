import { TestBed } from '@angular/core/testing';

import { CentrifugeService } from './centrifuge.service';

describe('CentrifugeService', () => {
  let service: CentrifugeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentrifugeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
