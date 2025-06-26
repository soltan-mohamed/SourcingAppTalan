import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpScheduleComponent } from './emp-schedule.component';

describe('EmpScheduleComponent', () => {
  let component: EmpScheduleComponent;
  let fixture: ComponentFixture<EmpScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
