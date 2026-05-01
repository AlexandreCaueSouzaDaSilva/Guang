import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'resultado',
    loadComponent: () => import('./pages/resultado/resultado.page').then( m => m.ResultadoPage)
  },
  {
    path: 'notebooks',
    loadComponent: () => import('./pages/notebooks/notebooks.page').then( m => m.NotebooksPage)
  },
  {
    path: 'config',
    loadComponent: () => import('./pages/config/config.page').then( m => m.ConfigPage)
  },
  {
    path: 'config',
    loadComponent: () => import('./pages/config/config.page').then( m => m.ConfigPage)
  },

];