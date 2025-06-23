import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCard1Component } from './chart-card1.component';

describe('ChartCard1Component', () => {
  let component: ChartCard1Component;
  let fixture: ComponentFixture<ChartCard1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCard1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartCard1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
