import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamehostComponent } from './gamehost.component';

describe('GamehostComponent', () => {
  let component: GamehostComponent;
  let fixture: ComponentFixture<GamehostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamehostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GamehostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
