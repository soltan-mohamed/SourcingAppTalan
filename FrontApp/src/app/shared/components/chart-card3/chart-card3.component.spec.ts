import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCard3Component } from './chart-card3.component';

describe('ChartCard3Component', () => {
  let component: ChartCard3Component;
  let fixture: ComponentFixture<ChartCard3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCard3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartCard3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
