// src/pages/store/orders/orders.ts
import { checkAuthUser, logout, getAuthUser } from '../../../utils/auth';
import { fetchOrders } from '../../../services/dataService';
import type { Order } from '../../../types/Order';

// Verificar autenticación y rol
checkAuthUser(
  '/src/pages/auth/login/login.html',
  '/src/pages/admin/home/home.html',
  'USUARIO'
);

// Logout
document.getElementById('logoutButton')?.addEventListener('click', logout);

// Obtener usuario actual
const user = getAuthUser();
if (!user) {
  window.location.href = '/src/pages/auth/login/login.html';
  throw new Error('Usuario no autenticado');
}

const userId = user.id;

// Elementos DOM
const contenedor = document.getElementById('pedidos-container') as HTMLDivElement;
const noPedidos = document.getElementById('no-pedidos') as HTMLDivElement;
const modal = document.getElementById('modal-detalle') as HTMLDivElement;
const closeModal = document.querySelector('.modal-close') as HTMLSpanElement;

// Función para obtener el color del badge según estado
function getEstadoBadge(estado: string): string {
  const map: Record<string, string> = {
    'PENDIENTE': 'badge-pendiente',
    'CONFIRMADO': 'badge-confirmado',
    'TERMINADO': 'badge-terminado',
    'CANCELADO': 'badge-cancelado',
    'EN_PREPARACION': 'badge-preparacion',
  };
  return map[estado] || 'badge-default';
}

// Renderizar lista de pedidos
function renderizarPedidos(pedidos: Order[]) {
  contenedor.innerHTML = '';

  if (pedidos.length === 0) {
    noPedidos.style.display = 'block';
    contenedor.style.display = 'none';
    return;
  }

  noPedidos.style.display = 'none';
  contenedor.style.display = 'grid';

  pedidos.forEach((pedido) => {
    const card = document.createElement('div');
    card.className = 'pedido-card';

    // Resumen de productos (máximo 3)
    const productosResumen = pedido.detalles
      .slice(0, 3)
      .map(d => d.producto.nombre)
      .join(', ');
    const mas = pedido.detalles.length > 3 ? ` +${pedido.detalles.length - 3} más` : '';

    card.innerHTML = `
      <div class="pedido-header">
        <span class="pedido-id">#${pedido.id}</span>
        <span class="badge ${getEstadoBadge(pedido.estado)}">${pedido.estado}</span>
      </div>
      <div class="pedido-body">
        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString()}</p>
        <p><strong>Productos:</strong> ${productosResumen} ${mas}</p>
        <p><strong>Total:</strong> $${pedido.total}</p>
      </div>
      <button class="btn-detalle" data-id="${pedido.id}">Ver detalle</button>
    `;

    contenedor.appendChild(card);

    // Evento para abrir modal
    const btnDetalle = card.querySelector('.btn-detalle');
    btnDetalle?.addEventListener('click', () => {
      abrirModal(pedido);
    });
  });
}

// Abrir modal con detalle completo
function abrirModal(pedido: Order) {
  // Llenar campos
  document.getElementById('modal-id')!.textContent = String(pedido.id);
  document.getElementById('modal-fecha')!.textContent = new Date(pedido.fecha).toLocaleDateString();
  document.getElementById('modal-estado')!.textContent = pedido.estado;
  document.getElementById('modal-estado')!.className = `badge ${getEstadoBadge(pedido.estado)}`;
  document.getElementById('modal-pago')!.textContent = pedido.formaPago;
  document.getElementById('modal-total')!.textContent = String(pedido.total);

  // Productos
  const lista = document.getElementById('modal-productos') as HTMLUListElement;
  lista.innerHTML = '';
  pedido.detalles.forEach(det => {
    const li = document.createElement('li');
    li.textContent = `${det.producto.nombre} x ${det.cantidad} = $${det.subtotal}`;
    lista.appendChild(li);
  });

  // Desglose (suponiendo envío fijo, podrías calcularlo)
  const subtotal = pedido.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const envio = 0; // o un valor fijo, según tu configuración
  document.getElementById('modal-subtotal')!.textContent = String(subtotal);
  document.getElementById('modal-envio')!.textContent = String(envio);
  document.getElementById('modal-total-final')!.textContent = String(subtotal + envio);

  // Mostrar modal
  modal.style.display = 'flex';
}

// Cerrar modal
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Cargar pedidos del usuario
async function cargarPedidos() {
  try {
    const todos = await fetchOrders();
    const misPedidos = todos.filter(p => p.usuarioDto.id === userId);
    // Ordenar por fecha descendente (más reciente primero)
    misPedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    renderizarPedidos(misPedidos);
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    contenedor.innerHTML = '<p class="error">Error al cargar los pedidos. Intenta más tarde.</p>';
  }
}

cargarPedidos();