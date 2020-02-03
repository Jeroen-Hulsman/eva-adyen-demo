import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[ritualsMethodHost]',
})
export class EvaAdyenMethodDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
