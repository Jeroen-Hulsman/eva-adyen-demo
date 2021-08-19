import { Injectable, OnDestroy } from '@angular/core';
import { settings, ritualsAddGiftCardToOrder, createPayment } from '@springtree/eva-sdk-redux';

import {
  getShoppingCartInfo,
  store,
  core,
  detachOrderFromSession,
  getApplicationConfiguration,
  modifyQuantityOrdered,
  getAvailablePaymentMethods,
  listAdyenCheckoutGateways,
  getOrder,
  createCustomer
} from '@springtree/eva-sdk-redux';
import { first, get } from 'lodash';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';


// const envSettings = require('../../../assets/config/env.json');

import * as envSettings from '../../../assets/config/env.json';

@Injectable()
export class EvaRitualsService implements OnDestroy {
  stop$: Subject<void> = new Subject();

  appConfigState$ = getApplicationConfiguration.getState$().pipe(
    filter(value => !value.isFetching),
    takeUntil(this.stop$)
  );

  constructor() {
  }

  getCiftCardData(
    orderId: number,
    accessToken?: string,
    GiftCardId?: string
  ): Promise<EVA.Rituals.RitualsGiftCard> {
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsGetGiftCardForOrder',
          {
            body: {
              OrderID: orderId,
              AccessToken: accessToken,
              GiftCardID: GiftCardId
            }
          },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(data => {
            // the service can resolve info for multiple giftcards and return an array. We assume there is only one giftcard on a order

            resolve(first(get(data, 'Result')));

          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getGiftCards(
    orderId: number,
    accessToken?: string,
    GiftCardId?: string,
    timeOut?: number,
    userToken?: string
  ): Promise<EVA.Rituals.RitualsGiftCard[]> {
    const tokenToUse = settings.userToken ? settings.userToken : settings.defaultToken;

    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsGetGiftCardForOrder',
          {
            body: {
              OrderID: orderId,
              AccessToken: accessToken,
              GiftCardID: GiftCardId
            }
          },
          timeOut ? timeOut : 15000,
          userToken ? userToken : tokenToUse,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(data => {
            // the service can resolve info for multiple giftcards and return an array. We assume there is only one giftcard on a order
            resolve(get(data, 'Result') as EVA.Rituals.RitualsGiftCard[]);
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  addGiftcardToOrder(request: Partial<EVA.Rituals.RitualsAddGiftCardToOrder>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsAddGiftCardToOrder',
          { body: request },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(() => {
          const [
            getShoppingCartAction,
            promise,
            chainedPromise
          ] = getShoppingCartInfo.createFetchAction();
          store.dispatch(getShoppingCartAction);

          chainedPromise
            .then(() => {
              resolve(true);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  updateGiftCardOrderLine(request: Partial<EVA.Rituals.RitualsUpdateGiftCardOrderLine>) {

    delete request.Data.Theme.ImageBlobID;
    delete request.Data.Theme.VideoBlobID;

    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsUpdateGiftCardOrderLine',
          { body: request },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(() => {
          const [
            getShoppingCartAction,
            promise,
            chainedPromise
          ] = getShoppingCartInfo.createFetchAction();
          store.dispatch(getShoppingCartAction);

          chainedPromise
            .then(() => {
              resolve(true);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  addGiftcartToOrderWithoutUpdatingShoppingCart(request: Partial<EVA.Rituals.RitualsAddGiftCardToOrder>) {
    const [action, promise] = ritualsAddGiftCardToOrder.createFetchAction(request);
    store.dispatch(action);
    return promise;
  }

  removeGiftcardFromOrder(orderLineId: number) {
    return new Promise((resolve, reject) => {
      const request: Partial<EVA.Core.Services.ModifyQuantityOrdered> = {
        OrderLineID: orderLineId,
        NewQuantityOrdered: 0
      };

      const [
        modifyQuantityOrderedAction,
        promise,
        chainedPromise
      ] = modifyQuantityOrdered.createFetchAction(request);

      store.dispatch(modifyQuantityOrderedAction);

      chainedPromise
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async detachOrder(orderId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: Partial<EVA.Core.Services.DetachOrder> = {
        OrderID: orderId
      };

      const [
        detachOrderFromSessionAction,
        promise,
        chainedPromise
      ] = detachOrderFromSession.createFetchAction(request);
      store.dispatch(detachOrderFromSessionAction);

      chainedPromise
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async getEvaOrder(orderId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: Partial<EVA.Core.Services.GetOrder> = {
        OrderID: orderId
      };

      const [
        getOrderAction,
        promise,
        chainedPromise
      ] = getOrder.createFetchAction(request);
      store.dispatch(getOrderAction);

      promise
        .then((result) => {
          resolve(result.Result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  sendEmail(
    orderId: number,
    giftCardId: string,
    fromName: string,
    fromEmail: string,
    toName: string,
    toEmail: string,
    deliverySchedule?: string,
    updateUrl?: string,
    userToken?: string
  ): Promise<boolean> {
    const tokenToUse = settings.userToken ? settings.userToken : settings.defaultToken;

    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsSendGiftCardByMail',
          {
            body: {
              OrderID: orderId,
              GiftCardID: giftCardId,
              FromEmailAddress: fromEmail,
              ToEmailAddress: toEmail,
              DeliverySchedule: deliverySchedule,
              UpdateUrl: updateUrl
            }
          },
          15000,
          userToken ? userToken : tokenToUse,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then((data: any) => {
            resolve(true);
          });
        })
        .catch(error => {
          // this.errorService.notifyError({buttonLabel: 'Close', type: 'RitualsSendGiftCardByMail', code: error.status});
          reject(error);
        });
    });
  }

  updateEmailScheduleOptions(
    token: string,
    orderId: number,
    giftCardId: string,
    fromName: string,
    fromEmail: string,
    toName: string,
    toEmail: string,
    deliverySchedule?: string,
    userToken?: string
  ) {
    const tokenToUse = settings.userToken ? settings.userToken : settings.defaultToken;

    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsUpdateGiftCardMailOptions',
          {
            body: {
              AccessToken: token,
              OrderID: orderId,
              GiftCardID: giftCardId,
              FromEmailAddress: fromEmail,
              ToEmailAddress: toEmail,
              DeliverySchedule: deliverySchedule
            }
          },
          15000,
          userToken ? userToken : tokenToUse,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then((data: any) => {
            resolve(true);
          });
        })
        .catch(error => {
          // this.errorService.notifyError({buttonLabel: 'Close', type: 'RitualsSendGiftCardByMail', code: error.status});
          reject(error);
        });
    });
  }

  getEmailScheduleOptions(
    orderId: number,
    giftcardId: string,
    userToken?: string
  ): Promise<EVA.Rituals.RitualsGetGiftCardMailOptionsResponse> {
    const tokenToUse = settings.userToken ? settings.userToken : settings.defaultToken;
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsGetGiftCardMailOptions',
          {
            body: {
              OrderID: orderId,
              GiftCardID: giftcardId
            }
          },
          15000,
          userToken ? userToken : tokenToUse,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(data => {
            resolve(data);
          });
        });
    });
  }

  downloadGiftcard(
    orderId: number,
    token: string,
    giftcardId: string,
    languageId: string = 'en'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsDownloadGiftCard',
          {
            body: {
              // OrderID: orderId,
              AccessToken: token,
              GiftCardID: giftcardId,
              LanguageID: languageId
            }
          },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(data => {
            resolve(get(data, 'Url'));
          });
        })
        .catch(error => {
          // this.errorService.notifyError({buttonLabel: 'Close', type: 'RitualsDownloadGiftCard', code: error.status});
          reject(error);
        });
    });
  }

  downloadPassBook(
    orderId: number,
    token: string,
    giftcardId: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/RitualsGeneratePassbookPass',
          {
            body: {
              // OrderID: orderId,
              AccessToken: token,
              GiftCardID: giftcardId
            }
          },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(data => {
            resolve(get(data, 'Url'));
          });
        })
        .catch(error => {
          // this.errorService.notifyError({buttonLabel: 'Close', type: 'RitualsDownloadGiftCard', code: error.status});
          reject(error);
        });
    });
  }

  createBlob(
    category: string,
    name: string,
    mimeType: string,
    data: any,
    setExpirationDate?: boolean
  ): Promise<EVA.Blobs.StoreBlobResponse> {
    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/StoreBlob',
          {
            body: {
              Category: category,
              OriginalName: name,
              MimeType: mimeType,
              data,
              ExpireDate: setExpirationDate && new Date(new Date().setDate(new Date().getDate() + 365)).toISOString()
            }
          },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(responseData => {
            resolve(responseData);
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  findBlobForImage(
    originalName: string,
    category: string
  ): Promise<EVA.Blobs.GetBlobInfoResponse> {
    const request: Partial<EVA.Blobs.GetBlobInfo> = {
      Category: category,
      OriginalName: originalName
    };

    return new Promise((resolve, reject) => {
      core
        .fetch(
          envSettings.endPointURL + '/message/GetBlobInfo',
          { body: request },
          15000,
          settings.userToken ? settings.userToken : settings.defaultToken,
          JSON.parse(localStorage.getItem('sessionId'))
        )
        .then(response => {
          response.json().then(responseData => {
            resolve(responseData);
          });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getPaymentMethods(orderId: number): Promise<EVA.Core.Services.GetAvailablePaymentMethodsResponse> {
    return new Promise( (resolve, reject) => {
      const [getAvailablePaymentMethodsAction, promise] = getAvailablePaymentMethods.createFetchAction({OrderID: orderId});

      store.dispatch(getAvailablePaymentMethodsAction);

      promise.then( result => {
        resolve(result);
      }).catch( (error) => {
        reject(error);
      })
    });
  }

  getAdyenGateways(currencyId: string, amount: number): Promise<EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponse> {
    return new Promise( (resolve, reject) => {
      const [listAdyenCheckoutGatewaysAction, promise] = listAdyenCheckoutGateways.createFetchAction({
        CurrencyID: currencyId,
        Amount: amount
      });

      store.dispatch(listAdyenCheckoutGatewaysAction);

      promise.then( (result) => {
        resolve(result);
      }).catch( (error) => {
        reject(error);
      });
    });
  }

  createPayment(methodCode: string, orderId: number, properties: any): Promise<EVA.Core.Services.CreatePaymentResponse> {
    const request: EVA.Core.Services.CreatePayment = {
      OrderID: orderId,
      Code: methodCode,
      Properties: properties,
    };

    const [ createPaymentAction, promise ] = createPayment.createFetchAction(request);
    store.dispatch(createPaymentAction);

    return promise;
  }

  setCustomer(customer: EVA.Core.Services.CustomerDto, anon?: boolean) {
    return new Promise((resolve, reject) => {
      const request: Partial<EVA.Core.Services.CreateCustomer> = {};
      request.AutoLogin = true;

      request.NoAccount = !anon;


      request.User = customer as EVA.Core.Services.CustomerDto;

      const [createCustomerAction, promise] = createCustomer.createFetchAction(
        request
      );
      store.dispatch(createCustomerAction);

      promise
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  ngOnDestroy(): void {
    this.stop$.next();
  }
}
