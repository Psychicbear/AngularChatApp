import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuardGuard: CanActivateFn = (route, state) => {
  let router = inject(Router)
  let auth = inject(AuthService)

  if(auth.isAuthenticated){
    return true
  } else {
    router.navigate(['/login'], { state: {error: "You are not logged in"}})
    return false
  }
};
