import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBox1Component } from './info-box1.component';

describe('InfoBox1Component', () => {
  let component: InfoBox1Component;
  let fixture: ComponentFixture<InfoBox1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBox1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoBox1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
