// src/pages/client/home/home.ts
import { fetchCategories, fetchProducts } from '../../../services/dataService';
import { checkAuthUser } from '../../../utils/auth';
import type { Product } from '../../../types/product';
import type { Categoria } from '../../../types/categoria';

checkAuthUser(
  '/src/pages/auth/login/login.html',
  '/src/pages/admin/home/home.html',
  'USUARIO'
);

const listaCategorias = document.getElementById('lista-categorias') as HTMLUListElement;
const listaProductos = document.getElementById('contenedor-productos') as HTMLUListElement;
const inputSearch = document.querySelector<HTMLInputElement>('#searchbox input');
const botonTodos = document.querySelector<HTMLButtonElement>('#btnTodos');
const noResultados = document.getElementById('noResultados');

let categoriaActiva: string | null = null;
let todosLosProductos: Product[] = [];

function renderizarProductos(productos: Product[]) {
  if (!listaProductos) return;
  listaProductos.innerHTML = '';

  if (productos.length === 0) {
    listaProductos.style.display = 'none';
    if (noResultados) noResultados.style.display = 'block';
    return;
  }
  if (noResultados) noResultados.style.display = 'none';
  listaProductos.style.display = 'grid';

  productos.forEach((producto) => {
    const li = document.createElement('li');
    li.dataset.nombre = producto.nombre.toLowerCase();
    li.innerHTML = `
      <h3>${producto.nombre}</h3>
      <img src="${producto.imagen || '../../../../foodPlaceholder.webp'}" 
           style="width:128px;height:128px;object-fit:cover;" 
           alt="${producto.nombre}">
      <p>${producto.descripcion}</p>
      <p>Precio: <strong>$${producto.precio}</strong></p>
      ${producto.disponible && producto.stock > 0 
        ? `<input type="submit" value="Agregar" class="boton-agregar">` 
        : `<span style="color:red;">No disponible</span>`}
    `;
    listaProductos.appendChild(li);

    const botonAgregar = li.querySelector('.boton-agregar');
    if (botonAgregar) {
      botonAgregar.addEventListener('click', () => {
        agregarAlCarrito(producto);
      });
    }
  });
}

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

function obtenerCarrito(): CartItem[] {
  const guardado = localStorage.getItem('cart');
  return guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito(carrito: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(carrito));
}

function agregarAlCarrito(producto: Product) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen
    });
  }
  guardarCarrito(carrito);
  alert(`${producto.nombre} agregado al carrito`);
}

function filtrarProductos(texto: string) {
  const filtrados = todosLosProductos.filter(p =>
    p.nombre.toLowerCase().includes(texto.toLowerCase()) &&
    p.disponible && p.stock > 0
  );
  renderizarProductos(filtrados);
}

function cargarProductosPorCategoria() {
  let productosAMostrar = todosLosProductos;
  if (categoriaActiva !== null) {
    productosAMostrar = todosLosProductos.filter(p =>
      p.categoria.nombre === categoriaActiva &&
      p.disponible && p.stock > 0
    );
  }
  renderizarProductos(productosAMostrar);
}

async function cargarCategorias() {
  try {
    const categorias = await fetchCategories();
    categorias.forEach((cat) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = cat.nombre;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (categoriaActiva === cat.nombre) {
          categoriaActiva = null;
        } else {
          categoriaActiva = cat.nombre;
        }
        cargarProductosPorCategoria();
      });
      li.appendChild(a);
      listaCategorias.appendChild(li);
    });
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

async function init() {
  try {
    todosLosProductos = await fetchProducts();
    renderizarProductos(todosLosProductos);
    await cargarCategorias();
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

inputSearch?.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  filtrarProductos(target.value);
});

botonTodos?.addEventListener('click', () => {
  categoriaActiva = null;
  cargarProductosPorCategoria();
});

document.getElementById('logoutButton')?.addEventListener('click', () => {
  localStorage.removeItem('userData');
  window.location.href = '/src/pages/auth/login/login.html'; // o usar navigate
});

init();