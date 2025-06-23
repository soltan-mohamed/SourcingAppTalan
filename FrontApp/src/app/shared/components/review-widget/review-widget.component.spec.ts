import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewWidgetComponent } from './review-widget.component';

describe('ReviewWidgetComponent', () => {
  let component: ReviewWidgetComponent;
  let fixture: ComponentFixture<ReviewWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
