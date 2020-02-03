import { Component, OnInit, Inject } from '@angular/core';
import { EvaAdyenMethodBaseComponent } from '../eva-adyen-method-base/eva-adyen-method-base.component';
import { get } from 'lodash';

@Component({
  selector: 'rituals-eva-adyen-method-select-and-redirect',
  templateUrl: './eva-adyen-method-select-and-redirect.component.html',
  styleUrls: ['./eva-adyen-method-select-and-redirect.component.scss']
})

export class EvaAdyenMethodSelectAndRedirectComponent extends EvaAdyenMethodBaseComponent implements OnInit {
  constructor() {
    super();
  }

  ngOnInit() {
  }

  methodSelected() {
    this.userData.emit(null);
  }

  createPaymentCallback(response: EVA.Core.Services.CreatePaymentResponse): void {
    const redirectData: { url: string, method: 'GET' | 'POST', data: any } = get(response, 'Properties.Data.redirect');

    if (redirectData && redirectData.url) {
      this.redirectExternal(redirectData.url, redirectData.method, redirectData.data)
    }
  }
}
