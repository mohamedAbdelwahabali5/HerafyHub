import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  ...appConfig, // Spread the existing app config
  providers: [
    ...(appConfig.providers || []), // Merge existing providers
    provideAnimations(), // Required for toastr animations
    provideToastr() // Toastr service provider
  ]
}).catch(err => console.error(err));

