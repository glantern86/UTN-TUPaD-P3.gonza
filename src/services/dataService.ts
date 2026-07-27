import type { Categoria } from '../types/categoria';
import type { Product } from '../types/product';
import type { IUser } from '../types/IUser';
import type { Order } from '../types/Order';

export async function fetchCategories(): Promise<Categoria[]> {
  const res = await fetch('/data/categorias.json');
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/data/productos.json');
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function fetchUsers(): Promise<IUser[]> {
  const res = await fetch('/data/usuarios.json');
  if (!res.ok) throw new Error('Error al cargar usuarios');
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/data/pedidos.json');
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
}
