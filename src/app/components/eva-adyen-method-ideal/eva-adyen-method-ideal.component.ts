import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EvaAdyenMethodBaseComponent } from '../eva-adyen-method-base/eva-adyen-method-base.component';
import { map, find, get } from 'lodash';
import { PAYMENT_LOGO_BASE } from '../eva-adyen-settings';

export interface IDealOption extends EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseItem {
  Logo: string;
}

@Component({
  selector: 'rituals-eva-adyen-method-ideal',
  templateUrl: './eva-adyen-method-ideal.component.html',
  styleUrls: ['./eva-adyen-method-ideal.component.scss'],
  encapsulation: ViewEncapsulation.None
})

// Ideal payment method implementation. Will output whenever a user selects a bank.
export class EvaAdyenMethodIdealComponent extends EvaAdyenMethodBaseComponent implements OnInit {

  bankList: IDealOption[] = [];
  selectedOption: IDealOption;

  selectedBank: any;

  constructor() {
    super();
  }

  ngOnInit(): void {
    const banks: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseDetail = find( get(this.gateway, 'Details'), { ID: 'issuer' });

    if ( banks && banks.Items.length > 0) {
      this.bankList = map(banks.Items, (item: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseItem) => {
        return {
          ID: item.ID,
          Name: item.Name,
          Logo: `${PAYMENT_LOGO_BASE}/${this.gateway.ID}/${item.ID}.svg`
        }
      })

    }
  }

  selectOption(option: any): void {
    console.log('SELECT', option);
    this.selectedOption = option;


    if (this.isValid()) {
      console.log(this.gateway);
      // this.details.emit([{
      //   ID: this.gateway.Details[0].ID,
      //   Value: this.selectedOption.ID
      // }]);

      this.userData.emit({
        paymentMethod:
          {
            [this.gateway.Details[0].ID]: this.selectedOption.ID
          }
      });
    }
  }

  isValid(): boolean {
    return !!find(this.bankList, {ID: this.selectedOption.ID});
  }

  createPaymentCallback(response: EVA.Core.Services.CreatePaymentResponse): void {
    const redirectData: { url: string, method: 'GET' | 'POST', data: any } = get(response, 'Properties.Data.redirect');

    if (redirectData && redirectData.url) {
      this.redirectExternal(redirectData.url, redirectData.method, redirectData.data)
    }
  }
}
