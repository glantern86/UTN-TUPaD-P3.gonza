import type { IUser } from './IUser';
import type { Product } from './product';

export interface OrderDetail {
  cantidad: number;
  subtotal: number;
  producto: Product;
}

export interface Order {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  formaPago: string;
  detalles: OrderDetail[];
  usuarioDto: IUser;
}