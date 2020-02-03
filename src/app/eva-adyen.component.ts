
import { Component, Input, OnInit, EventEmitter, Output, OnChanges, SimpleChanges, SimpleChange, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PAYMENT_LOGO_BASE, SECURE_FIELD_GATEWAY_ITEM_TYPES, ADYEN_CHECKOUT_LIBRARY, ADYEN_CC_METHODE_CODE, ADYEN_CC_BRANDS } from './components/eva-adyen-settings';
import { IMethodData, EvaAdyenMethodComponent } from './components/eva-adyen-method/eva-adyen-method.component';
import { each, find, get, remove, cloneDeep} from 'lodash';

export interface ICreatePaymentPayload {
  gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway;
  data: IMethodData;
}

export interface IPaymentGateway extends EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway {
  CardId?: string;
}

interface TypedChange<T> extends SimpleChange
{
    previousValue: T;
    currentValue: T;
}

export interface CreatePaymentChanges extends SimpleChanges {
  createPaymentResponse: TypedChange<EVA.Core.Services.CreatePaymentResponse>
}

export interface IEvaAdyenGateways {
  evaGateways: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway[],
  options: IEvaAdyenGatewayOptions[]
}

export interface IEvaAdyenGatewayOptions {
  ID: string;
  options: any;
}

@Component({
  selector: 'eva-adyen',
  templateUrl: './eva-adyen.component.html',
  styleUrls: ['./eva-adyen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EvaAdyenComponent implements OnInit, OnChanges {

  @ViewChildren(EvaAdyenMethodComponent) methodComponents !: QueryList<EvaAdyenMethodComponent>

  @Input()
  availableGateways: IEvaAdyenGateways;

  @Input()
  adyenOriginKey: string;

  @Input()
  createPaymentResponse: EVA.Core.Services.CreatePaymentResponse | EVA.Core.Services.CreatePaymentResponse;

  @Input()
  debug: boolean;

  @Input()
  explodeCreditCardMethods: boolean;

  @Input()
  order: EVA.Core.OrderDto | EVA.Core.OrderDto;

  @Input()
  amount: string;
  @Input()
  currencySymbol: string;

  @Output()
  createPaymentPayloadEvent: EventEmitter<ICreatePaymentPayload>;
  @Output()
  paymentAuthorized: EventEmitter<any>;
  @Output()
  paymentFailed: EventEmitter<any>;


  public form: FormGroup;
  protected createPaymentPayload: ICreatePaymentPayload;
  gatewaysToRender: IPaymentGateway[];

  constructor(private fb: FormBuilder) {
    this.createPaymentPayloadEvent = new EventEmitter();
    this.paymentAuthorized = new EventEmitter();
    this.paymentFailed = new EventEmitter();
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        type: ['', [Validators.required]],
        details: ['', [Validators.required]]
      }
    );

    // whenever selection changes, purge old createPaymentPayload and reinit newly selectedcomponent
    this.form.get('type').valueChanges.subscribe( (gateway: any) => {
      let component: EvaAdyenMethodComponent;

      if (gateway) {
        component = this.methodComponents.find( comp => {
          return comp.gateway.Name === gateway.Name;
        });
      }

      if (component) {
        if (this.createPaymentPayload && this.createPaymentPayload.gateway.Name !== gateway.Name) {
          this.createPaymentPayload = null;
        }

        component.componentSelected();
      }
    });

    if (this.availableGateways) {
      this.gatewaysToRender = cloneDeep(this.availableGateways.evaGateways);

      each(this.availableGateways.evaGateways, (gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway) => {

        //
        each(gateway.Details, (detail: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseDetail) => {
          if ( SECURE_FIELD_GATEWAY_ITEM_TYPES.includes(detail.Type) ) {
            this.loadAdyenCheckout(ADYEN_CHECKOUT_LIBRARY);
          }
        });
      });


      // If options.innerSelection is set to true for the card method, create a method for each available card and remove the general card method
      const ccMethodOptions: IEvaAdyenGatewayOptions = find(this.availableGateways.options, { ID: ADYEN_CC_METHODE_CODE });
      if ( get(ccMethodOptions, 'options.innerSelection') ) {
        const ccMethod = find(this.availableGateways.evaGateways, { ID: ADYEN_CC_METHODE_CODE });

        // for each brand, add a method
        each(ADYEN_CC_BRANDS, (brand) => {
          this.gatewaysToRender.push({
            ID: ccMethodOptions.ID,
            Name: `${ccMethod.Name}-${brand}`,
            CardId: brand,
            Details: ccMethod.Details
          });
        });

        // remove the original method
        remove(this.gatewaysToRender, (gateway) => {
            return gateway.ID === ccMethod.ID && gateway.Name === ccMethod.Name && !gateway.CardId;
        });
      }
    }

  }

  ngOnChanges(changes: CreatePaymentChanges): void {
    // whenever we recieve a response on the createPaymentResponse input do a callback to the component the last eventTrigger originated from
    if (changes.createPaymentResponse.currentValue) {
      // find the component that triggered the payload event
      const component = this.methodComponents.find( comp => {
        return comp.gateway.ID === this.createPaymentPayload.gateway.ID;
      });

      // callback to the component with the response
      if (component) {
        component.createPaymentCallback(changes.createPaymentResponse.currentValue);
      }
    }
  }

  getLogo(gateway: IPaymentGateway): string {
    if (gateway.ID === ADYEN_CC_METHODE_CODE) {
      return `${PAYMENT_LOGO_BASE}/${gateway.CardId}.svg`;
    }

    return `${PAYMENT_LOGO_BASE}/${gateway.ID}.svg`;
  }

  eventTrigger($event: IMethodData, gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway): void {
    // whenever an event is triggered from one of the child components, store the event and gateway data.
    this.createPaymentPayload = {
      gateway,
      data: $event
    };
  }

  createPayment(): void {
    // trigger a create payment payload event so the consuming app can trigger a call to EVA's CreatePayment service.
    if (this.createPaymentPayload) {
      this.createPaymentPayloadEvent.emit(this.createPaymentPayload);
    }
  }

  // method wich loads the external Adyen Checkout library which we'll use to gather secure data (for i.e. credit cards)
  public loadAdyenCheckout(url: string) {
    const node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  public setGateway(gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway) {
    this.form.patchValue({ type: gateway});
  }


  public paymentAuthorizedEvent(payload: any) {
    this.paymentAuthorized.next(payload);
  }

  public paymenFailedEvent(payload: any) {
    this.paymentFailed.next(payload);
  }
}
