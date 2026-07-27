import { navigate } from './navigate';
import type { IUser } from '../types/IUser';
import type { Rol } from '../types/Rol';

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: Rol;
  loggedIn: boolean;
}

export function getAuthUser(): AuthUser | null {
  const data = localStorage.getItem('userData');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const user = getAuthUser();
  return user !== null && user.loggedIn === true;
}

export function hasRole(role: Rol): boolean {
  const user = getAuthUser();
  return user !== null && user.rol === role;
}

export function checkAuthUser(
  loginPath: string,
  redirectPath: string,
  requiredRole?: Rol
) {
  const user = getAuthUser();
  if (!user || !user.loggedIn) {
    navigate(loginPath);
    return;
  }
  if (requiredRole && user.rol !== requiredRole) {
    if (user.rol === 'ADMIN') {
      navigate('/src/pages/admin/home/home.html');
    } else {
      navigate('/src/pages/client/home/home.html');
    }
    return;
  }
}

export function logout() {
  localStorage.removeItem('userData');
  navigate('/src/pages/auth/login/login.html');
}