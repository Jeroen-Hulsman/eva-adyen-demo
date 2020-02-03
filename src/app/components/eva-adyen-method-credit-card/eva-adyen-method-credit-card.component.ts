import { Component, OnInit } from '@angular/core';
import { EvaAdyenMethodBaseComponent } from '../eva-adyen-method-base/eva-adyen-method-base.component';
import { EvaAdyenWindowService, IAdyenInstance, IAdyenSecuredFieldsSchemeOutputData } from '../eva-adyen-window.service';
import { IMethodData } from '../eva-adyen-method/eva-adyen-method.component';
import { ADYEN_CC_BRANDS } from '../eva-adyen-settings';
import { remove, find } from 'lodash';

export interface IAdyenFieldErrorEvent {
  rootNode: Element;
  fieldType: string;
  error: string;
  type: string;
  i18n: string;
}

export interface IAdyenFieldValidEvent {
  rootNode: Element;
  fieldType: string;
  error: string;
  type: string;
  encryptedFieldName: string;
  uid: string;
  valid: boolean;
  blob: string;
  endDigits?: string;
}


@Component({
  selector: 'rituals-eva-adyen-method-credit-card',
  templateUrl: './eva-adyen-method-credit-card.component.html',
  styleUrls: ['./eva-adyen-method-credit-card.component.scss']
})

// Ideal payment method implementation. Will output whenever a user selects a bank.
export class EvaAdyenMethodCreditCardComponent extends EvaAdyenMethodBaseComponent implements OnInit {
  checkoutInstance: IAdyenInstance;
  secureFieldsInstance: any;
  state: IAdyenSecuredFieldsSchemeOutputData;
  errors: IAdyenFieldErrorEvent[];
  currentBrand: any;
  ccContainerId: any;
  holderName: any;


  constructor(private evaAdyenWindowService: EvaAdyenWindowService ) {
    super();
  }

  ngOnInit(): void {
    this.ccContainerId = this.hashCode(this.gateway.Name)
  }

  methodSelected() {
    this.errors = [];
    if (this.secureFieldsInstance) {
      this.secureFieldsInstance.unmount();
    }

    this.checkoutInstance = new this.evaAdyenWindowService.nativeWindow.AdyenCheckout({
      locale: 'nl_NL', // TODO - make this an input
      environment: 'test', // TODO - make this an input
      originKey: this.originKey,
      onChange: this.handleOnChange,
      onError: this.handleOnError,
      onBrand: this.handleBrand,
      onFieldValid: this.handleOnFieldValid
    }) as IAdyenInstance;

    this.secureFieldsInstance = this.checkoutInstance.create('securedfields', {
      type: 'card',
      brands: ADYEN_CC_BRANDS,
      hasHolderName: true,
      holderNameRequired: true,
      styles: {
        base: {
            color: '#001b2b',
            fontSize: '16px',
            fontWeight: '400',
            background: 'white',
            padding: '10px',
            fontFamily: `'ScalaSansOT', 'Arial', Helvetica, sans-serif`,
            letterSpacing: '0.5px'
        },
        placeholder: {
            color: '#90a2bd',
            fontWeight: '200',
            height: '10px'
        },
        error: {
            color: '#001b2b'
        }
      },
    });

    this.secureFieldsInstance.mount(`#cc-container-${this.ccContainerId}`);


  }

  handleOnChange = (state: IAdyenSecuredFieldsSchemeOutputData, component: any) => {
    console.log('NEW STATE', state, this.gateway, this.holderName, component);
    this.state = state;

    if (this.inputValid()) {
      const userData: IMethodData = {
        paymentMethod: state.data.paymentMethod,
        browserInfo: state.data.browserInfo
      };

      userData.paymentMethod.holderName = this.holderName;

      this.userData.emit(userData);

    } else {
      this.userData.emit(null);
    }
  }

  inputValid() {
    if (this.state) {
      return this.state.isValid && this.holderName && this.holderName.length;
    }

    return false;
  }

  holderNameChanged(event: any) {
    this.holderName = event.target.value;

    this.handleOnChange(this.state, null);
  }

  public createPaymentCallback(response: EVA.Core.Services.CreatePaymentResponse): void {
    if (response.Properties.Data.resultCode === 'Authorised') {
      this.paymentAuthorized.emit(response.Properties.Data);
    }

    if (response.Properties.Data.resultCode === 'RedirectShopper') {
      this.redirectExternal(response.Properties.Data.redirect.url, response.Properties.Data.redirect.method, response.Properties.Data.redirect.data);
    }

    // TODO - handle other result codes like 'FRAUD'
  }

  public getError(key: string) {
    const error = find(this.errors, {fieldType: key});

    if (error) {
      return error.i18n;
    }
  }

  handleOnError = (error: IAdyenFieldErrorEvent) => {
    remove(this.errors, {fieldType: error.fieldType});

    if (error.error.length) {
      this.errors.push(error);
    }
  }

  handleBrand = (brandInfo) => {
    this.currentBrand = brandInfo.brand;
  }

  handleOnFieldValid = (valid: IAdyenFieldValidEvent) => {
    if  (valid.valid) {
      remove(this.errors, {fieldType: valid.fieldType});
    }
  }

  hashCode = function(s) {
    let code = s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    if (code < 0) {
      code *= -1;
    }

    return code;
  };
}
