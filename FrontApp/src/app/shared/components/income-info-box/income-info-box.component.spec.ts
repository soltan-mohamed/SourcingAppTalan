import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeInfoBoxComponent } from './income-info-box.component';

describe('IncomeInfoBoxComponent', () => {
  let component: IncomeInfoBoxComponent;
  let fixture: ComponentFixture<IncomeInfoBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeInfoBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
