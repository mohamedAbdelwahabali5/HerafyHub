import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { mergeApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

const config = mergeApplicationConfig(appConfig, {
  providers: [
    provideClientHydration()
  ]
});

bootstrapApplication(AppComponent, config)
  .catch((err) => console.error(err));