import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallCardChartComponent } from './small-card-chart.component';

describe('SmallCardChartComponent', () => {
  let component: SmallCardChartComponent;
  let fixture: ComponentFixture<SmallCardChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallCardChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallCardChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
