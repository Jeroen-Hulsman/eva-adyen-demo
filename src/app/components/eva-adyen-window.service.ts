import { Injectable } from '@angular/core';

export type IAdyenConfigType = 'test' | 'live';

export interface IAdyenConfig {
  locale: string;
  originKey: string;
  environment: IAdyenConfigType;
  onChange: (state: any, component: any) => any;
  onError: (error: any) => any;
  onBrand: (brand: any) => any;
  onFieldValid: (valid: any) => any;
};

export interface IAdyenInstance {
  options: {
    locale: string,
    environment: IAdyenConfigType,
    originKey: string,
    onChange: (state: any, component: any) => any;
    onError: (error: any) => any;
    onBrand: (brand: any) => any;
    onFieldValid: (valid: any) => any;
    loadingContext: string;
  };

  modules: any
  paymentMethodsResponse: any;

  create: (type: string, options: {}) => any;
}

export interface IAdyenSecuredFieldsSchemeOutputData {
  isValid: boolean;

  data: {
    riskData: {
      clientData: string
    }


    paymentMethod: {
      type: string;
      encryptedCardNumber: string;
      encryptedExpiryMonth: string;
      encryptedExpiryYeat: string;
      encryptedSecurityCode: string;
    }

    browserInfo: any;
  }


}

export interface IAdyenWindow extends Window {
    AdyenCheckout(configuration: IAdyenConfig): void;
}

function getWindow (): any {
    return window;
}

@Injectable()
export class EvaAdyenWindowService {
    get nativeWindow (): IAdyenWindow {
        return getWindow();
    }
}
