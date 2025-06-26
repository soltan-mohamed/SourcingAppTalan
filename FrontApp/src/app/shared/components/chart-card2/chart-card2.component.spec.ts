import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCard2Component } from './chart-card2.component';

describe('ChartCard2Component', () => {
  let component: ChartCard2Component;
  let fixture: ComponentFixture<ChartCard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCard2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartCard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
