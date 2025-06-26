import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTaskTabComponent } from './emp-task-tab.component';

describe('EmpTaskTabComponent', () => {
  let component: EmpTaskTabComponent;
  let fixture: ComponentFixture<EmpTaskTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTaskTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTaskTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
