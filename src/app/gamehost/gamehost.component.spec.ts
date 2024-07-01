import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHostComponent } from './gamehost.component';

describe('GamehostComponent', () => {
  let component: GameHostComponent;
  let fixture: ComponentFixture<GameHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
