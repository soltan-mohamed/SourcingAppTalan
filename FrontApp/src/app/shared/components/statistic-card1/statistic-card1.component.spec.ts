import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticCard1Component } from './statistic-card1.component';

describe('StatisticCard1Component', () => {
  let component: StatisticCard1Component;
  let fixture: ComponentFixture<StatisticCard1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticCard1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticCard1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
