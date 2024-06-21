import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomquestionuploadComponent } from './customquestionupload.component';

describe('CustomquestionuploadComponent', () => {
  let component: CustomquestionuploadComponent;
  let fixture: ComponentFixture<CustomquestionuploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomquestionuploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomquestionuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
