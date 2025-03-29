import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCheckoutComponent } from './main-checkout.component';

describe('MainCheckoutComponent', () => {
  let component: MainCheckoutComponent;
  let fixture: ComponentFixture<MainCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
