import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopPerformerComponent } from './top-performer.component';

describe('TopPerformerComponent', () => {
  let component: TopPerformerComponent;
  let fixture: ComponentFixture<TopPerformerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopPerformerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopPerformerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
