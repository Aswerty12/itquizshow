import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLoginComponent } from './game-login.component';

describe('GameLoginComponent', () => {
  let component: GameLoginComponent;
  let fixture: ComponentFixture<GameLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
