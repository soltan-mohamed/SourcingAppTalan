import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressTableComponent } from './progress-table.component';

describe('ProgressTableComponent', () => {
  let component: ProgressTableComponent;
  let fixture: ComponentFixture<ProgressTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
