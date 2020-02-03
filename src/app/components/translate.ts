import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable } from 'rxjs';
import { ModuleWithProviders } from '@angular/core';


/**
 * Default loader according to ngx-translate/core
 * @see https://github.com/ngx-translate/core#configuration
 */
const defaultTranslateLoader = {
  provide: TranslateLoader,
  useFactory: translateLoaderFactory,
  deps: [ HttpClient ]
};

export const ConfiguredTranslateModule: ModuleWithProviders<any> = TranslateModule.forRoot({ loader: defaultTranslateLoader });

export function translateLoaderFactory( http: HttpClient ) {
  return new TranslateHttpLoader( http, 'assets/i18n/', '.json' );
}
