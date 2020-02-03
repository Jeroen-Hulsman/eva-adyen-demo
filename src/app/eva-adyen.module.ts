import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaAdyenComponent } from './eva-adyen.component';
import { EvaAdyenMethodDirective } from './components/eva-adyen-method.directive';
import { EvaAdyenMethodComponent } from './components/eva-adyen-method/eva-adyen-method.component';
import { EvaAdyenMethodBaseComponent } from './components/eva-adyen-method-base/eva-adyen-method-base.component';
import { EvaAdyenMethodIdealComponent } from './components/eva-adyen-method-ideal/eva-adyen-method-ideal.component';
import {
  EvaAdyenMethodSelectAndRedirectComponent
} from './components/eva-adyen-method-select-and-redirect/eva-adyen-method-select-and-redirect.component';
import { EvaAdyenMethodCreditCardComponent } from './components/eva-adyen-method-credit-card/eva-adyen-method-credit-card.component'

import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { EvaAdyenWindowService } from './components/eva-adyen-window.service';
import { NgSelectModule } from '@ng-select/ng-select';

import {} from '@springtree/eva-sdk-redux';
import { ConfiguredTranslateModule } from './components/translate';

@NgModule({
  entryComponents: [
    EvaAdyenMethodIdealComponent,
    EvaAdyenMethodSelectAndRedirectComponent,
    EvaAdyenMethodCreditCardComponent
  ],
  declarations: [
    EvaAdyenComponent,
    EvaAdyenMethodComponent,
    EvaAdyenMethodBaseComponent,
    EvaAdyenMethodIdealComponent,
    EvaAdyenMethodSelectAndRedirectComponent,
    EvaAdyenMethodCreditCardComponent,
    EvaAdyenMethodDirective
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    NgSelectModule,
    ConfiguredTranslateModule
  ],
  exports: [
    EvaAdyenComponent
  ],
  providers: [
    EvaAdyenWindowService
  ],
  bootstrap: [ EvaAdyenComponent ]
})

export class EvaAdyenModule {
  constructor() {
  }
}
