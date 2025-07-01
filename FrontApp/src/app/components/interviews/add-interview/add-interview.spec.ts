import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInterview } from './add-interview';

describe('AddInterview', () => {
  let component: AddInterview;
  let fixture: ComponentFixture<AddInterview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInterview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInterview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
