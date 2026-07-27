// src/pages/admin/products/products.ts
import { checkAuthUser, logout } from '../../../utils/auth';
import { fetchCategories, fetchProducts } from '../../../services/dataService';
import type { Product } from '../../../types/product';
import type { Categoria } from '../../../types/categoria';

checkAuthUser('/src/pages/auth/login/login.html', '/src/pages/store/home/home.html', 'ADMIN');
document.getElementById('logoutButton')?.addEventListener('click', logout);

let productos: Product[] = [];
let categorias: Categoria[] = [];
let editandoId: number | null = null;

const tbody = document.getElementById('productosBody') as HTMLTableSectionElement;
const modal = document.getElementById('modalProducto') as HTMLDivElement;
const modalTitle = document.getElementById('modalProductoTitle') as HTMLHeadingElement;
const form = document.getElementById('formProducto') as HTMLFormElement;
const inputId = document.getElementById('productoId') as HTMLInputElement;
const inputNombre = document.getElementById('prodNombre') as HTMLInputElement;
const inputDescripcion = document.getElementById('prodDescripcion') as HTMLTextAreaElement;
const inputPrecio = document.getElementById('prodPrecio') as HTMLInputElement;
const inputStock = document.getElementById('prodStock') as HTMLInputElement;
const selectCategoria = document.getElementById('prodCategoria') as HTMLSelectElement;
const inputImagen = document.getElementById('prodImagen') as HTMLInputElement;
const checkDisponible = document.getElementById('prodDisponible') as HTMLInputElement;
const closeModal = modal.querySelector('.modal-close') as HTMLSpanElement;

async function cargarDatos() {
  try {
    [productos, categorias] = await Promise.all([fetchProducts(), fetchCategories()]);
    renderizarTabla();
    llenarSelectCategorias();
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

function llenarSelectCategorias() {
  selectCategoria.innerHTML = '';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = String(cat.id);
    opt.textContent = cat.nombre;
    selectCategoria.appendChild(opt);
  });
}

function renderizarTabla() {
  tbody.innerHTML = '';
  productos.forEach(p => {
    const tr = document.createElement('tr');
    const catNombre = categorias.find(c => c.id === p.categoria.id)?.nombre || 'Sin categoría';
    tr.innerHTML = `
      <td>${p.id}</td>
      <td><img src="${p.imagen || '../../../../foodPlaceholder.webp'}" style="width:40px;height:40px;object-fit:cover;"></td>
      <td>${p.nombre}</td>
      <td>$${p.precio}</td>
      <td>${catNombre}</td>
      <td>${p.stock}</td>
      <td>${p.disponible ? '✅ Activo' : '❌ Inactivo'}</td>
      <td>
        <button class="btn-editar" data-id="${p.id}">Editar</button>
        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      abrirModal(id);
    });
  });
  tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      if (confirm('¿Eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        renderizarTabla();
      }
    });
  });
}

function abrirModal(id?: number) {
  if (id) {
    const p = productos.find(prod => prod.id === id);
    if (!p) return;
    editandoId = id;
    modalTitle.textContent = 'Editar Producto';
    inputId.value = String(p.id);
    inputNombre.value = p.nombre;
    inputDescripcion.value = p.descripcion;
    inputPrecio.value = String(p.precio);
    inputStock.value = String(p.stock);
    selectCategoria.value = String(p.categoria.id);
    inputImagen.value = p.imagen || '';
    checkDisponible.checked = p.disponible;
  } else {
    editandoId = null;
    modalTitle.textContent = 'Nuevo Producto';
    inputId.value = '';
    inputNombre.value = '';
    inputDescripcion.value = '';
    inputPrecio.value = '';
    inputStock.value = '';
    selectCategoria.value = '';
    inputImagen.value = '';
    checkDisponible.checked = true;
  }
  modal.style.display = 'flex';
}

function cerrarModal() {
  modal.style.display = 'none';
}
closeModal.addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) cerrarModal();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const precio = parseFloat(inputPrecio.value);
  const stock = parseInt(inputStock.value);
  const catId = Number(selectCategoria.value);
  const imagen = inputImagen.value.trim();
  const disponible = checkDisponible.checked;

  if (!nombre || !descripcion || isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0 || !catId) {
    alert('Todos los campos obligatorios deben estar completos y válidos.');
    return;
  }

  const categoria = categorias.find(c => c.id === catId);
  if (!categoria) {
    alert('Categoría no válida');
    return;
  }

  if (editandoId !== null) {
    const index = productos.findIndex(p => p.id === editandoId);
    if (index !== -1) {
      productos[index] = {
        ...productos[index],
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        imagen: imagen || '',
        disponible
      };
    }
  } else {
    const maxId = productos.reduce((max, p) => Math.max(max, p.id), 0);
    const nuevo: Product = {
      id: maxId + 1,
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagen: imagen || '',
      disponible
    };
    productos.push(nuevo);
  }
  renderizarTabla();
  cerrarModal();
});

document.getElementById('btnNuevoProducto')?.addEventListener('click', () => abrirModal());

cargarDatos();