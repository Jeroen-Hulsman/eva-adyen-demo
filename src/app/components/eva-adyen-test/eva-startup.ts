
import { Injectable, Injector } from '@angular/core';
import { find, get, clone } from 'lodash';

import 'rxjs/add/operator/share';

import { IEnvironment, bootstrapStore   } from './bootstrap-store';

import { environment } from '../../../environments/environment';

import { store, getShoppingCartInfo, settings } from '@springtree/eva-sdk-redux';
import { TranslateService } from '@ngx-translate/core';
import { LOCATION_INITIALIZED } from '@angular/common';
import { EvaRitualsService } from './eva-rituals.service';

// const envSettings = require('../../../assets/config/env.json');

import * as envSettings from '../../../assets/config/env.json';

/*
  Generated class for the EvaStartupProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class EvaStartupProvider {
  /**
   * Status of the start up, this will be the promise that was returned by the http request we preformed to request the environment file
   * reason we will be storing it, is because we don't want to fetch the same file twice
   */

  constructor(
    private evaService: EvaRitualsService
  ) {}

  /**
   * Loads up the environment file
   */
  public load(): Promise<IEnvironment> {
    let detachOrder = false;

    // regex to fetch the country code from the url
    const rxGetCountryCode = /^.{8}[^\/]*\/([^\/]*)/;
    let countryCode = rxGetCountryCode.exec(window.location.href)[1];

    if (!countryCode) {
      countryCode = 'nl';
    }

    if (localStorage.getItem('country') !== countryCode.toUpperCase()) {
      detachOrder = true;
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userToken');
    }

    localStorage.setItem('country', countryCode.toUpperCase());

    let culture = find(envSettings.cultures, { country: countryCode });

    if ( !culture ) {
      culture = find(envSettings.cultures, { country: 'nl' });
    }

    console.log('>> >> >>>', culture);

    let language: string = culture.languages[0].toUpperCase();

    if (localStorage.getItem('evaLanguage') && culture.languages.includes(localStorage.getItem('evaLanguage') ) ) {
      language = localStorage.getItem('evaLanguage');
    } else {
      localStorage.setItem('evaLanguage', `${language.toLowerCase()}`);
    }

    settings.language = `${language.toLowerCase()}-${countryCode.toUpperCase()}`;

    localStorage.setItem('evaCulture', `${language.toLowerCase()}-${countryCode.toUpperCase()}`);

    // Bootstrap the EVA SDK Redux store
    //
    return new Promise( ( resolve, reject ) => {
      bootstrapStore( environment, get(culture, 'token') )
      .then( () => {
        const [ getShoppingCartAction, promise, chain ] = getShoppingCartInfo.createFetchAction();
        store.dispatch(getShoppingCartAction);



        Promise.all([promise, chain]).then( ([cart, chain]) => {
          if (detachOrder && get(cart, 'OrderID') ) {
            this.evaService.detachOrder(cart.OrderID);
          }

          let existingOrderId = null;

          if (this.getUrlParameter('OrderID')) {
            existingOrderId = this.getUrlParameter('OrderID');
          } else if (localStorage.getItem('orderId')) {
            existingOrderId = localStorage.getItem('orderId');
          }

          const isPaymentSucces = window.location.href.includes('payment-complete');

          // this.stateService.init(existingOrderId, isPaymentSucces).then( () => {
          resolve( environment );
          // });


        })
        .catch( error => {
          console.log(error);

          localStorage.setItem('sessionId', null);
          localStorage.setItem('userToken', null);
          window.location.href = envSettings.websiteUrl;
        });
      } )
      .catch( error => {
        if (error.status === 403) {
          // shopping-cart expired - reset session
          console.log('Bootstrapping failed. Session is cleared in attempt to recover...');
          localStorage.setItem('sessionId', null);
          localStorage.setItem('userToken', null);
          window.location.href = envSettings.websiteUrl;
        }

        if (error.status === 400) {
          console.log('Bootstrapping failed. Session is cleared in attempt to recover...');
          localStorage.setItem('sessionId', null);
          localStorage.setItem('userToken', null);
          window.location.href = envSettings.websiteUrl;
        }

        reject('')
      });
    });
  }
  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
}


export function startupProviderFactory( injector: Injector, startupProvider: EvaStartupProvider ): () => Promise<IEnvironment> {
  return () => new Promise( resolve => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then( () => {
      resolve(startupProvider.load());
    });
  });
}
