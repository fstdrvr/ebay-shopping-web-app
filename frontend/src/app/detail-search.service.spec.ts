import { TestBed } from '@angular/core/testing';

import { DetailSearchService } from './detail-search.service';

describe('DetailSearchService', () => {
  let service: DetailSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
