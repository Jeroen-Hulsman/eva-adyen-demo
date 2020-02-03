
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { IMethodData } from '../eva-adyen-method/eva-adyen-method.component';
import { each } from 'lodash';

@Component({
  selector: 'rituals-eva-adyen-method-base',
  templateUrl: './eva-adyen-method-base.component.html',
  styleUrls: ['./eva-adyen-method-base.component.scss'],
  encapsulation: ViewEncapsulation.None
})

// Base implementation of an Eva Adyen Method Component. Any implementation of a method should extend this class and implement it's methods.
export class EvaAdyenMethodBaseComponent {
  @Input()
  gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway | EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway;

  @Input()
  originKey: string;

  @Input()
  debug: boolean;

  @Output()
  callback: Function;

  @Output()
  userData: EventEmitter<IMethodData>;

  @Output()
  paymentAuthorized: EventEmitter<any>;

  @Output()
  paymentFailed: EventEmitter<any>;

  constructor() {
    this.userData = new EventEmitter();
    this.paymentAuthorized = new EventEmitter();
    this.paymentFailed = new EventEmitter();
  }

  public inputValid(): boolean {
    return true;
  }

  public methodSelected() {
    console.log('Method selected', this.gateway);
  }

  public createPaymentCallback(response: EVA.Core.Services.CreatePaymentResponse): void {
    console.log('Base Callback, No implementation!', response);
  }

  protected redirectExternal(url: string, type?: 'POST' | 'GET', params?: {key: string, value: string}[]): void {
    console.log(`External ${type} redirect: `, url, params);

    if (type === 'POST') {
      this.postRedirectExternal(url, params);
    } else {
      this.getRedirectExternal(url);
    }
  }

  private postRedirectExternal( url: string, params: {key: string, value: string}[] ): void {
    let pageContent = `<html><head></head><body><form id="redirectForm" action="${url}" method="POST">`;

    each(params, (value, key) => {
      pageContent += `\n  <input type="hidden" name="${key}" value="${value}">`;
    });

    pageContent += '\n</form><script type="text/javascript">document.getElementById("redirectForm").submit();</script></body></html>';

    console.log('redirecting..', url, params);

    document.open();
    document.write(pageContent);
    document.close();
  }

  private getRedirectExternal( url: string ): void {
    window.location.href = url;
  }
}
