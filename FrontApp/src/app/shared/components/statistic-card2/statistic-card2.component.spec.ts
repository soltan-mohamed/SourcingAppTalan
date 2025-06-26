import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticCard2Component } from './statistic-card2.component';

describe('StatisticCard2Component', () => {
  let component: StatisticCard2Component;
  let fixture: ComponentFixture<StatisticCard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticCard2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticCard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
