import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectHoursComponent } from './project-hours.component';

describe('ProjectHoursComponent', () => {
  let component: ProjectHoursComponent;
  let fixture: ComponentFixture<ProjectHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
