import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysAppointmentComponent } from './todays-appointment.component';

describe('TodaysAppointmentComponent', () => {
  let component: TodaysAppointmentComponent;
  let fixture: ComponentFixture<TodaysAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaysAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaysAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
