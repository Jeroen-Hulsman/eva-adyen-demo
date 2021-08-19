import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvaAdyenTestComponent } from './components/eva-adyen-test/eva-adyen-test.component';
import { EvaRitualsService } from './components/eva-adyen-test/eva-rituals.service';

import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import '@springtree/eva-sdk-redux';

import { EvaStartupProvider, startupProviderFactory } from './components/eva-adyen-test/eva-startup';
import { AppRoutingModule } from './app-routing.module';

import { EvaRootComponent } from './app.component';

import { EvaAdyenAngularModule } from 'eva-adyen-angular';

import {TranslateLoader, TranslateModule, TranslateService, TranslateStore} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


@NgModule({
  entryComponents: [

    EvaAdyenTestComponent,
    // EvaAdyenMethodIdealComponent,
    // EvaAdyenMethodSelectAndRedirectComponent,
    // EvaAdyenMethodCreditCardComponent,
    // EvaAdyenMethodPaypalComponent,
    // EvaAdyenMethodKlarnaComponent,
    EvaRootComponent
  ],
  declarations: [

    EvaAdyenTestComponent,
    // EvaAdyenMethodComponent,
    // EvaAdyenMethodBaseComponent,
    // EvaAdyenMethodIdealComponent,
    // EvaAdyenMethodSelectAndRedirectComponent,
    // EvaAdyenMethodCreditCardComponent,
    // EvaAdyenMethodDirective,
    // EvaAdyenMethodPaypalComponent,
    // EvaAdyenMethodKlarnaComponent,
    EvaRootComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule,
    AppRoutingModule,
    EvaAdyenAngularModule,
    TranslateModule.forRoot({ useDefaultLang: true, isolate: true, loader: { provide: TranslateLoader, useFactory: (translateLoaderFactory), deps: [HttpClient] } })
  ],
  exports: [
    EvaAdyenTestComponent
  ],
  providers: [
    // EvaAdyenWindowService,
    EvaRitualsService,
    EvaStartupProvider,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: startupProviderFactory,
      deps: [ Injector, EvaStartupProvider, ]
    },
  ],
  bootstrap: [
    EvaRootComponent
  ]
})

export class EvaAdyenModule {
  constructor() {
  }
}


export function translateLoaderFactory( http: HttpClient ) {
  return new TranslateHttpLoader( http, './assets/locales/', '.json' );
}
