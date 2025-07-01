import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewsComponent } from './interviews';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

describe('InterviewsComponent', () => {
  let component: InterviewsComponent;
  let fixture: ComponentFixture<InterviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewsComponent ],
      imports: [ InterviewsComponent, MatTableModule, MatIconModule, FormsModule, CommonModule, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter interviews by date', () => {
    component.searchDate = '2025-07-01';
    fixture.detectChanges();
    expect(component.dataSource.length).toBe(2);
  });

  it('should call editInterview method', () => {
    spyOn(console, 'log');
    component.editInterview(component.dataSource[0]);
    expect(console.log).toHaveBeenCalledWith('Edit interview:', component.dataSource[0]);
  });
});
