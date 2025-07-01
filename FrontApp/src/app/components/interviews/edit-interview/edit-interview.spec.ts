import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInterview } from './edit-interview';

describe('EditInterview', () => {
  let component: EditInterview;
  let fixture: ComponentFixture<EditInterview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditInterview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditInterview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
