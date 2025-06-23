import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocWelcomeCardComponent } from './doc-welcome-card.component';

describe('DocWelcomeCardComponent', () => {
  let component: DocWelcomeCardComponent;
  let fixture: ComponentFixture<DocWelcomeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocWelcomeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocWelcomeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
