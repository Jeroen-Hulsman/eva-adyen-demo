import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EvaAdyenTestComponent } from './components/eva-adyen-test/eva-adyen-test.component';

const routes: Routes = [
  { path: '**', component: EvaAdyenTestComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false,  }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
