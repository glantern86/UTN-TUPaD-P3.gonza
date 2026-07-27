import type { Rol } from './Rol';

export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: Rol;
  password: string;
}