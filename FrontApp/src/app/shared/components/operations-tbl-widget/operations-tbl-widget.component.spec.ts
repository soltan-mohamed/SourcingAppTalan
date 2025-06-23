import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsTblWidgetComponent } from './operations-tbl-widget.component';

describe('OperationsTblWidgetComponent', () => {
  let component: OperationsTblWidgetComponent;
  let fixture: ComponentFixture<OperationsTblWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsTblWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationsTblWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
