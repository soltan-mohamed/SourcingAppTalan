import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningSourceComponent } from './earning-source.component';

describe('EarningSourceComponent', () => {
  let component: EarningSourceComponent;
  let fixture: ComponentFixture<EarningSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarningSourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
