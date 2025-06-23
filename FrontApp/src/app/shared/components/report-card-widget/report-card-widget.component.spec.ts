import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCardWidgetComponent } from './report-card-widget.component';

describe('ReportCardWidgetComponent', () => {
  let component: ReportCardWidgetComponent;
  let fixture: ComponentFixture<ReportCardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
