import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './error/error.component';
import { AngularMaterialModule } from './angular-material.module';
import { PostsModule } from './posts/posts.module';
import { FooterComponent } from './footer/footer.component';
import { MatPaginatorIntlFrench } from './posts/post-create/traduction-mat-paginator.service';

@NgModule({
  declarations: [				
    AppComponent,
    HeaderComponent,
    ErrorComponent,
    FooterComponent
   ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularMaterialModule,
    PostsModule,
    FlexLayoutModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass:  AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass:  ErrorInterceptor, multi: true },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlFrench }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
