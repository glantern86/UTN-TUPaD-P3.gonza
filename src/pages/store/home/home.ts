import { checkAuthUser, logout } from '../../../utils/auth';
import { fetchCategories, fetchProducts } from '../../../services/dataService';
import type { Product } from '../../../types/product';

checkAuthUser(
  '/src/pages/auth/login/login.html',
  '/src/pages/admin/home/home.html',
  'USUARIO'
);

document.getElementById('logoutButton')?.addEventListener('click', logout);

const listaCategorias = document.getElementById('lista-categorias') as HTMLUListElement;
const contenedorProductos = document.getElementById('contenedor-productos') as HTMLUListElement;
const inputSearch = document.querySelector<HTMLInputElement>('#searchbox input');
const botonTodos = document.querySelector<HTMLButtonElement>('#btnTodos');
const noResultados = document.getElementById('noResultados');

let todosLosProductos: Product[] = [];
let categoriaActiva: string | null = null;
let textoBusqueda: string = '';

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

function obtenerCarrito(): ItemCarrito[] {
  const guardado = localStorage.getItem('cart');
  return guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito(carrito: ItemCarrito[]) {
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
      imagen: producto.imagen,
    });
  }
  guardarCarrito(carrito);
  alert(`${producto.nombre} agregado al carrito`);
}

function renderizarProductos(productos: Product[]) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = '';

  if (productos.length === 0) {
    contenedorProductos.style.display = 'none';
    if (noResultados) noResultados.style.display = 'block';
    return;
  }

  contenedorProductos.style.display = 'grid';
  if (noResultados) noResultados.style.display = 'none';

  productos.forEach((producto) => {
    const li = document.createElement('li');
    li.dataset.id = String(producto.id);
    li.dataset.nombre = producto.nombre.toLowerCase();

    const disponible = producto.disponible && producto.stock > 0;

    li.innerHTML = `
      <h3>${producto.nombre}</h3>
      <img src="${producto.imagen || '../../../../foodPlaceholder.webp'}" 
           style="width:128px;height:128px;object-fit:cover;" 
           alt="${producto.nombre}">
      <p>${producto.descripcion}</p>
      <p>Precio: <strong>$${producto.precio}</strong></p>
      <p>Stock: ${producto.stock}</p>
      ${disponible 
        ? `<button class="boton-agregar" data-id="${producto.id}">Agregar al carrito</button>` 
        : `<span style="color:red;">No disponible</span>`}
    `;
    contenedorProductos.appendChild(li);

    const btnAgregar = li.querySelector('.boton-agregar');
    if (btnAgregar) {
      btnAgregar.addEventListener('click', () => agregarAlCarrito(producto));
    }
  });
}

function aplicarFiltros() {
  let productosFiltrados = todosLosProductos;

  if (categoriaActiva !== null) {
    productosFiltrados = productosFiltrados.filter(
      p => p.categoria.nombre === categoriaActiva
    );
  }

  if (textoBusqueda.trim() !== '') {
    const lower = textoBusqueda.toLowerCase();
    productosFiltrados = productosFiltrados.filter(
      p => p.nombre.toLowerCase().includes(lower)
    );
  }

  productosFiltrados = productosFiltrados.filter(
    p => p.disponible && p.stock > 0
  );

  renderizarProductos(productosFiltrados);
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
        // Alternar categoría activa
        if (categoriaActiva === cat.nombre) {
          categoriaActiva = null;
        } else {
          categoriaActiva = cat.nombre;
        }
        aplicarFiltros();
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
    // Cargar productos y categorías en paralelo
    const [productos, categorias] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
    todosLosProductos = productos;

    aplicarFiltros();

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
        aplicarFiltros();
      });
      li.appendChild(a);
      listaCategorias.appendChild(li);
    });
  } catch (error) {
    console.error('Error al cargar datos:', error);
    contenedorProductos.innerHTML = '<p class="error">No se pudieron cargar los productos. Intenta más tarde.</p>';
  }
}

inputSearch?.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  textoBusqueda = target.value;
  aplicarFiltros();
});

botonTodos?.addEventListener('click', () => {
  categoriaActiva = null;
  textoBusqueda = '';
  if (inputSearch) inputSearch.value = '';
  aplicarFiltros();
});

init();