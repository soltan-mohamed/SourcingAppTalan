import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCard4Component } from './chart-card4.component';

describe('ChartCard4Component', () => {
  let component: ChartCard4Component;
  let fixture: ComponentFixture<ChartCard4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartCard4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartCard4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
