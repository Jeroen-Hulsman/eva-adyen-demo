import { EvaAdyenMethodIdealComponent } from './eva-adyen-method-ideal/eva-adyen-method-ideal.component';
import { EvaAdyenMethodSelectAndRedirectComponent } from './eva-adyen-method-select-and-redirect/eva-adyen-method-select-and-redirect.component';
import { EvaAdyenMethodCreditCardComponent } from './eva-adyen-method-credit-card/eva-adyen-method-credit-card.component';

// this maps a certain payment method code to a component.
export const methodMapping = [
  {
    id: 'ideal',
    component: EvaAdyenMethodIdealComponent
  },
  {
    id: 'paypal',
    component: EvaAdyenMethodSelectAndRedirectComponent
  },
  {
    id: 'klarna',
    component: EvaAdyenMethodSelectAndRedirectComponent
  },
  {
    id: 'scheme',
    component: EvaAdyenMethodCreditCardComponent
  }
];
