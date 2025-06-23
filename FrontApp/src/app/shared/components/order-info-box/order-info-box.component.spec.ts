import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderInfoBoxComponent } from './order-info-box.component';

describe('OrderInfoBoxComponent', () => {
  let component: OrderInfoBoxComponent;
  let fixture: ComponentFixture<OrderInfoBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderInfoBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
