
// import { NgModule } from '@angular/core';
// import { Routes, RouterModule } from '@angular/router';

// const routes: Routes = [
//   {
//     path: '',
//     loadChildren: () =>
//       import('./pages/home/home.module').then(m => m.HomeModule),
//   },
//   {
//     path: 'product-details/:id',
//     loadChildren: () =>
//       import('./pages/product-details/product-details.module').then(m => m.ProductDetailsModule),
//     data: { prerender: false }
//   },
//   {
//     path: 'products/:categoryId',
//     loadChildren: () =>
//       import('./pages/products/products.module').then(m => m.ProductsModule),
//     data: { prerender: false }
//   },
//   {
//     path: 'reset-password/:token',
//     loadChildren: () =>
//       import('./pages/reset-password/reset-password.module').then(m => m.ResetPasswordModule),
//     data: { prerender: false }
//   },
//   {
//     path: '**',
//     loadChildren: () =>
//       import('./pages/not-found/not-found.module').then(m => m.NotFoundModule)
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes, {
//     initialNavigation: 'enabledBlocking'
//   })],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
