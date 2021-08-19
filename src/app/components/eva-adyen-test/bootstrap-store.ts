import { each, isNil } from 'lodash';

import {
  core,
  settings,
} from '@springtree/eva-sdk-redux';

import { environment } from '../../../environments/environment';
import { IBootstrapOtions } from '@springtree/eva-sdk-redux/dist/types/core';

// const envSettings = require('../../../assets/config/env.json');

import * as envSettings from '../../../assets/config/env.json';

export interface IEnvironment {
  version: string;
  production: boolean;
  contentfulToken: string;
  contentfulSpaceId: string;
  contentfulFallbackImageContentTypeID: string;
  cloudinarySpaceId: string;
  cloudinaryUploadPreset: string;
}


export const bootstrapStore = ( env: IEnvironment, token: string ): Promise<any[]> => {
  return new Promise( ( resolve, reject ) => {
    console.log( '[bootstrap-store] Applying settings and starting up' );

    // Default included fields (for product search)
    //
    settings.includedFields = [ 'primary_image.blob', 'display_value', 'display_price', 'short_product_description', 'custom_id', 'product_requirements' ];

    // Default product properties (for shopping cart products)
    //
    settings.productProperties = [ 'primary_image.blob', 'product_requirements', 'product_description' ];


    // Don't need the potential discounts
    //
    settings.enablePotentialDiscountOptions = false;

    // Restore persisted settings
    //
    each( [ 'userToken', 'sessionId' ], ( settingName ) => {
      const storedValue = localStorage.getItem( settingName );

      if ( storedValue ) {
        console.log( '[app:settings] Restoring setting', settingName, storedValue );
        try {
          settings[ settingName ] = JSON.parse( storedValue );
        } catch ( jsonParseError ) {
          // Invalid setting in localstorage
          //
          console.warn( '[app:settings] Invalid setting value', jsonParseError );
        }
      }
    } );

    // clear the persisted session id
    //
    // localStorage.removeItem( 'sessionId' );
    // localStorage.removeItem( 'userToken' );

    // Subscribe to setting changes to persist them
    // Not all settings are emitted. Only the following:
    //
    // - language
    // - defaultToken
    // - userToken
    // - sessionId
    //
    settings.changes$.subscribe( ( changedSetting ) => {
      console.log( '[app:settings] Persisting changed setting', changedSetting );
      localStorage.setItem( changedSetting.name, JSON.stringify( isNil( changedSetting.new ) ? '' : changedSetting.new ) );
    } );

    // if we have a token, make sure we have a fresh session
    if (localStorage.getItem('payment-success-token')) {
      settings.sessionId = settings.generateSessionId();
    }


    const options: IBootstrapOtions = {
      debug:                false,
      appName:              envSettings.appKey,
      appVersion:           environment.version,
      endPointUrl:          envSettings.endPointURL,
      sessionId:            settings.sessionId,
      userToken:            settings.userToken,
      defaultToken:         token,

      disableDataBootstrap: false,
      disableCartBootstrap: false,
      disableOnPremise: true,
      startCommunicator: true,
    }

    let urlParams;

    if (window.location.search) {
      urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get('token')) {
        options.userToken = urlParams.get('token');
      }

      if (urlParams.get('OrderId')) {
        localStorage.setItem('orderId', urlParams.get('OrderId'));

        if ( urlParams.get('success') === 'false'  ) {
          localStorage.setItem('paymentFailed', 'true');
        }
      }

      if (urlParams.get('token') && !urlParams.get('OrderId')) {
        options.userToken = null;
      }

      if ( urlParams.get('lang')) {
        localStorage.setItem('evaLanguage', urlParams.get('lang'));
      }
    }


    // Initialise the SDK
    //
    core.bootstrap( options )
    .then( ( bootstrapResponses ) => {
      console.log( '[bootstrap-store] Done with bootstrap', bootstrapResponses );

      if (urlParams && urlParams.get('Authorization')) {
        localStorage.setItem('payment-success-token', urlParams.get('Authorization'))
      }

      resolve();
    } )
    .catch( ( bootstrapError ) => {
      console.error( '[bootstrap-store] Failed to bootstrap', bootstrapError );

      if (localStorage.getItem('userToken')) {
        localStorage.removeItem( 'userToken' );
        window.location.href = envSettings.websiteUrl;
      }

      reject( bootstrapError );
    } );
  } );
};
