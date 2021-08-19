import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { EvaRitualsService } from './eva-rituals.service';

import { getShoppingCart, createPayment, store } from '@springtree/eva-sdk-redux';

import { ADYEN_API_METHOD_CODE, ADYEN_ORIGIN_KEY_LOCALHOST, EVA_ADYEN_GATEWAY_SETTINGS } from '../eva-adyen-settings';
import { IEvaAdyenGateways, ICreatePaymentPayload  } from 'eva-adyen-angular';

import { find } from 'lodash';
import { ActivatedRoute } from '@angular/router';
// const envSettings = require('../../../assets/config/env.json');

import * as envSettings from '../../../assets/config/env.json';

export interface ICulture {
  country: string;
  token: string;
  languages: string[];
}



@Component({
  selector: 'eva-adyen-test',
  templateUrl: './eva-adyen-test.component.html',
  styleUrls: ['./eva-adyen-test.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EvaAdyenTestComponent implements OnInit {
  order: EVA.Core.OrderDto;
  giftcard: EVA.Rituals.RitualsGiftCard;
  availableMethods: EVA.Core.Services.GetAvailablePaymentMethodsResponse;
  adyenGateways: IEvaAdyenGateways;
  originKey: string;
  createPaymentResponse: EVA.Core.Services.CreatePaymentResponse;
  createPaymentError: any;
  cultures: ICulture[];
  selectedCulture: ICulture;
  selectedLanguage: string;
  availableLanguages: string[];
  paymentFailedEvent: any;
  paymentAuthorizedEvent: any;

  constructor(private evaRitualsService: EvaRitualsService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.originKey = ADYEN_ORIGIN_KEY_LOCALHOST;

    this.cultures = envSettings.cultures;

    this.selectedCulture = find(this.cultures, {country: localStorage.getItem('country').toLowerCase()});
    if (this.selectedCulture) {
      this.availableLanguages = this.selectedCulture.languages;

      if (this.availableLanguages.includes(localStorage.getItem('evaLanguage'))) {
        this.selectedLanguage = localStorage.getItem('evaLanguage');
      } else {
        this.selectedLanguage = this.availableLanguages[0];
      }
    } else {
      this.selectedCulture = find(this.cultures, {country: 'nl'});
    }

    console.log('sl', this.selectedCulture);
    // this.selectOu();


    console.log('cultures', this.cultures);

    getShoppingCart.getOrder$().subscribe( order => {
      console.log('>>>', order);
      this.order = order;

      if (order && order.Lines.length > 0) {
        this.evaRitualsService.getCiftCardData(order.ID).then(giftcard => {
          this.giftcard = giftcard;

          this.evaRitualsService.getPaymentMethods(order.ID).then( methods => {
            console.log('methods available', methods);

            this.availableMethods = methods;

            if (this.availableMethods.PaymentMethods.includes(ADYEN_API_METHOD_CODE)) {
              this.evaRitualsService.getAdyenGateways(order.CurrencyID, order.TotalAmountInTax).then( gateways => {
                this.adyenGateways = {
                  evaGateways:  gateways.Gateways,
                  options: EVA_ADYEN_GATEWAY_SETTINGS
                };
              })
              .catch((error) => {
                this.adyenGateways = {
                  evaGateways: [],
                  options: null
                };
                console.log('error retrieving adyen gateways: ', error);
              });
            }
          });
        });
      }

    });

  }

  prepareNewCart(anon: boolean = false) {
    this.evaRitualsService.addGiftcardToOrder({
      Amount: 10,
      CloudinaryImageID: null,
      CloudinaryImageMimeType: null,
      CloudinaryVideoID: null,
      CloudinaryVideoMimeType: null,
      Data: {
        From: 'John Doe',
        FromEmailAddress: 'john@doe.nut',
        Text: 'Adyen Test',
        Theme: {
          ID: 'Adyen Test Theme'
        } as EVA.Rituals.RitualsGiftCardTheme,
        To: 'Jane Doe',
        ToEmailAddress: 'jane@doe.nut',
        UpdateUrl: null,
        DeliverySchedule: null
      },
      UpdateUrl: null
    }).then(result => {
      const customer: Partial<EVA.Core.Services.CustomerDto> = {
        FirstName: 'John',
        LastName: 'Doe',
        LanguageID: 'nl',
        EmailAddress: `john-${new Date().getTime()}@live.nl`
      };

      if (!anon) {
        customer.BillingAddress = {
          Street: 'Keizersgracht',
          City: 'Amsterdam',
          CountryID: this.selectedCulture.country.toUpperCase(),
          HouseNumber: '1',
          ZipCode: '1015CC',
        } as EVA.Core.AddressDto;

        customer.ShippingAddress = {
          Street: 'Keizersgracht',
          City: 'Amsterdam',
          CountryID: this.selectedCulture.country.toUpperCase(),
          HouseNumber: '1',
          ZipCode: '1015CC',
        } as EVA.Core.AddressDto;

        customer.DateOfBirth = new Date(1984, 11, 27).toISOString();
      }

      console.log('CUSTOMER', customer);

      this.evaRitualsService.setCustomer(customer as EVA.Core.Services.CustomerDto, anon);
    });
  }

  public async createPayment(payload: ICreatePaymentPayload) {
    const returnUrl = `http://localhost:4200/${this.selectedCulture.country}/?orderId=${this.order.ID}`;
    const properties: any = {
      ReturnUrl: returnUrl,
      GatewayID: payload.gateway.ID,

      Data: payload.data
    };

    // if (payload.data) {



    //   if (payload.data.paymentMethod) {

    //     properties.paymentMethod = payload.data.paymentMethod
    //     // properties = {...properties, ...payload.data.paymentMethod};

    //   }

    //   if (payload.data.browserInfo) {
    //     properties.BrowserInfo = payload.data.browserInfo;
    //   }

    //   if (payload.data.shopperEmail) {
    //     properties.ShopperEmail = payload.data.shopperEmail;
    //   }


    // }

    const request: EVA.Core.Services.CreatePayment = {
      OrderID: this.order.ID,
      Code: ADYEN_API_METHOD_CODE,
      Properties: properties,
      Amount: null,
    };

    const [ createPaymentAction, promise ] = createPayment.createFetchAction(request);
    store.dispatch(createPaymentAction);

    promise.then( result => {
      this.createPaymentResponse = result;
      // this.authorizationService.setDefaultAuthorizationToken();
    }).catch(async error => {
      console.log('An error occured when creating your payment', error);
      this.createPaymentError = error;
    });
  }

  paymentAuthorized(event$) {
    console.log('Payment Authorized callback', event$);
    this.paymentAuthorizedEvent = event$;
  }

  paymentFailed(event$) {
    console.log('Payment Failed callback', event$);
    this.paymentFailedEvent = event$;
  }
  emptyCart(orderId: number) {
    this.evaRitualsService.detachOrder(orderId);
    this.availableMethods = null;
    this.adyenGateways = null;
  }

  selectOu() {
    this.availableLanguages = this.selectedCulture.languages;
    if (this.availableLanguages.includes(localStorage.getItem('evaLanguage'))) {
      this.selectedLanguage = localStorage.getItem('evaLanguage');
    } else {
      this.selectedLanguage = this.availableLanguages[0];
    }

    this.selectLanguage();
  }

  selectLanguage() {
    localStorage.setItem('evaLanguage', this.selectedLanguage);

    this.reload(this.selectedCulture.country);

  }

  reload(ou: string) {
    window.location.href = `${ou}`;
  }

}
