import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuardGuard: CanActivateFn = (route, state) => {
  let router = inject(Router)
  let auth = inject(AuthService)

  if(auth.isAuthenticated.getValue()){
    return true
  } else {
    router.navigate(['/login'])
    return false
  }
};
