
import { Component, Input, ViewChild, OnInit, ComponentFactoryResolver, Output, EventEmitter, ComponentRef, ComponentFactory, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { EvaAdyenMethodDirective } from '../eva-adyen-method.directive';

import { methodMapping } from '../eva-adyen-component-mapping';

import { find } from 'lodash';
import { EvaAdyenMethodBaseComponent } from '../eva-adyen-method-base/eva-adyen-method-base.component';

// Output date with collected details
export interface IMethodData {
  paymentMethod: {
    [ID: string]: any;
  };

  browserInfo?: {
    [ID: string]: any;
  };

  shopperIp?: string;
}

// Wrapper component for any adyen method implementation. Each componenent will need an input in the form of EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway.
// The component will collect info from the user and output this on the details output as IMethodData

@Component({
  selector: 'rituals-eva-adyen-method',
  templateUrl: './eva-adyen-method.component.html',
  styleUrls: ['./eva-adyen-method.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EvaAdyenMethodComponent implements OnInit {
  @Input()
  gateway: EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway | EVA.Payment.Adyen.ListAdyenCheckoutGatewaysResponseGateway;

  @Input()
  originKey: string;

  @Input()
  debug: boolean;

  @Output()
  userData: EventEmitter<IMethodData>;

  @Output()
  paymentAuthorized: EventEmitter<any>;

  @Output()
  paymentFailed: EventEmitter<any>;

  // reference to the viewcontainer of the component created
  @ViewChild(EvaAdyenMethodDirective, {read: ViewContainerRef, static: false})
  ritualsMethodHost: EvaAdyenMethodDirective;

  // flag which is set if a method is not mapped to a component
  unknownComponent = false;

  // reference to the component that was created
  componentRef: ComponentRef<EvaAdyenMethodBaseComponent>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    this.userData = new EventEmitter();
    this.paymentAuthorized = new EventEmitter();
    this.paymentFailed = new EventEmitter();
  }

  ngOnInit() {
    this.loadComponent();
  }

  createPaymentCallback(response: EVA.Core.Services.CreatePaymentResponse) {
    if (!this.unknownComponent) {
      this.componentRef.instance.createPaymentCallback(response);
    }
  }

  componentSelected() {
    console.log('Component Selected, ', this.componentRef.instance.gateway);
    if (this.componentRef) {
      this.componentRef.instance.methodSelected();
    }
  }

  private loadComponent() {
    const mapping = find(methodMapping, {id: this.gateway.ID});

    if (mapping) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(mapping.component) as ComponentFactory<EvaAdyenMethodBaseComponent>;
      const viewContainerRef = this.ritualsMethodHost.viewContainerRef;
      viewContainerRef.clear();

      this.componentRef = viewContainerRef.createComponent(componentFactory);

      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).gateway = this.gateway;
      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).userData = this.userData;
      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).originKey = this.originKey;
      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).debug = this.debug;
      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).paymentAuthorized = this.paymentAuthorized;
      ( this.componentRef.instance as EvaAdyenMethodBaseComponent).paymentFailed = this.paymentFailed;


    } else {
      this.unknownComponent = true;
    }
  }




}
