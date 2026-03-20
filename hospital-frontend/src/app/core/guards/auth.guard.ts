import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Check role permissions if specified in route data
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.getUserRole();
    if (!userRole || !requiredRoles.includes(userRole)) {
      return router.createUrlTree(['/unauthorized']);
    }
  }

  return true;
};
