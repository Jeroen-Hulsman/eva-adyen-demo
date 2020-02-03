import { TestBed, async } from '@angular/core/testing';
import { EvaAdyenComponent } from './eva-adyen.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EvaAdyenComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(EvaAdyenComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'eva-adyen'`, () => {
    const fixture = TestBed.createComponent(EvaAdyenComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('eva-adyen');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(EvaAdyenComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to eva-adyen!');
  });
});
