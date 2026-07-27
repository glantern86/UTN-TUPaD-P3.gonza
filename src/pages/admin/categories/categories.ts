import { checkAuthUser, logout } from '../../../utils/auth';
import { fetchCategories } from '../../../services/dataService';
import type { Categoria } from '../../../types/categoria';

checkAuthUser('/src/pages/auth/login/login.html', '/src/pages/store/home/home.html', 'ADMIN');
document.getElementById('logoutButton')?.addEventListener('click', logout);

let categorias: Categoria[] = [];
let editandoId: number | null = null;

const tbody = document.getElementById('categoriasBody') as HTMLTableSectionElement;
const modal = document.getElementById('modalCategoria') as HTMLDivElement;
const modalTitle = document.getElementById('modalCategoriaTitle') as HTMLHeadingElement;
const form = document.getElementById('formCategoria') as HTMLFormElement;
const inputId = document.getElementById('categoriaId') as HTMLInputElement;
const inputNombre = document.getElementById('catNombre') as HTMLInputElement;
const inputDescripcion = document.getElementById('catDescripcion') as HTMLTextAreaElement;
const closeModal = modal.querySelector('.modal-close') as HTMLSpanElement;

async function cargarCategorias() {
  try {
    categorias = await fetchCategories();
    renderizarTabla();
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

function renderizarTabla() {
  tbody.innerHTML = '';
  categorias.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.id}</td>
      <td>${cat.nombre}</td>
      <td>${cat.descripcion}</td>
      <td>
        <button class="btn-editar" data-id="${cat.id}">Editar</button>
        <button class="btn-eliminar" data-id="${cat.id}">Eliminar</button>
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
      if (confirm('¿Eliminar esta categoría?')) {
        eliminarCategoria(id);
      }
    });
  });
}

function eliminarCategoria(id: number) {
  categorias = categorias.filter(c => c.id !== id);
  renderizarTabla();
}

function abrirModal(id?: number) {
  if (id) {
    const cat = categorias.find(c => c.id === id);
    if (!cat) return;
    editandoId = id;
    modalTitle.textContent = 'Editar Categoría';
    inputId.value = String(cat.id);
    inputNombre.value = cat.nombre;
    inputDescripcion.value = cat.descripcion;
  } else {
    editandoId = null;
    modalTitle.textContent = 'Nueva Categoría';
    inputId.value = '';
    inputNombre.value = '';
    inputDescripcion.value = '';
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
  if (!nombre || !descripcion) {
    alert('Nombre y descripción son obligatorios');
    return;
  }

  if (editandoId !== null) {
    const index = categorias.findIndex(c => c.id === editandoId);
    if (index !== -1) {
      categorias[index] = { ...categorias[index], nombre, descripcion };
    }
  } else {
    const maxId = categorias.reduce((max, c) => Math.max(max, c.id), 0);
    const nueva: Categoria = {
      id: maxId + 1,
      nombre,
      descripcion
    };
    categorias.push(nueva);
  }
  renderizarTabla();
  cerrarModal();
});

document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => {
  abrirModal();
});

cargarCategorias();