// src/pages/admin/orders/orders.ts
import { checkAuthUser, logout } from '../../../utils/auth';
import { fetchOrders, fetchUsers } from '../../../services/dataService';

checkAuthUser('/src/pages/auth/login/login.html', '/src/pages/store/home/home.html', 'ADMIN');
document.getElementById('logoutButton')?.addEventListener('click', logout);

let pedidos: any[] = [];
let usuarios: any[] = [];
let filtroEstado: string = 'todos';

const container = document.getElementById('ordersContainer') as HTMLDivElement;
const filtroSelect = document.getElementById('filtroEstado') as HTMLSelectElement;
const modal = document.getElementById('modalDetallePedido') as HTMLDivElement;
const closeModal = modal.querySelector('.modal-close') as HTMLSpanElement;

async function cargarDatos() {
  try {
    [pedidos, usuarios] = await Promise.all([fetchOrders(), fetchUsers()]);
    renderizarPedidos();
  } catch (error) {
    console.error('Error cargando pedidos:', error);
  }
}

function getNombreUsuario(userId: number) {
  const user = usuarios.find(u => u.id === userId);
  return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
}

function getBadgeClass(estado: string) {
  const map: Record<string, string> = {
    'PENDIENTE': 'badge-pendiente',
    'CONFIRMADO': 'badge-confirmado',
    'EN_PREPARACION': 'badge-preparacion',
    'TERMINADO': 'badge-terminado',
    'CANCELADO': 'badge-cancelado'
  };
  return map[estado] || 'badge-default';
}

function renderizarPedidos() {
  const filtrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroEstado);

  // Ordenar por fecha descendente
  filtrados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  if (filtrados.length === 0) {
    container.innerHTML = '<p class="empty-message">No hay pedidos con este filtro.</p>';
    return;
  }

  container.innerHTML = '';
  filtrados.forEach(pedido => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const cliente = getNombreUsuario(pedido.usuarioDto.id);
    const totalProductos = pedido.detalles.reduce((sum: number, d: any) => sum + d.cantidad, 0);

    card.innerHTML = `
      <div class="order-header">
        <span class="order-id">#${pedido.id}</span>
        <span class="order-date">${new Date(pedido.fecha).toLocaleDateString()}</span>
        <span class="badge ${getBadgeClass(pedido.estado)}">${pedido.estado}</span>
      </div>
      <div class="order-summary">
        <span><strong>Cliente:</strong> ${cliente}</span>
        <span><strong>Productos:</strong> ${totalProductos}</span>
        <span><strong>Total:</strong> $${pedido.total}</span>
      </div>
      <button class="btn-detalle" data-id="${pedido.id}">Ver detalle</button>
    `;
    container.appendChild(card);

    const btnDetalle = card.querySelector('.btn-detalle');
    btnDetalle?.addEventListener('click', () => {
      abrirModal(pedido.id);
    });
  });
}

function abrirModal(id: number) {
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  const cliente = getNombreUsuario(pedido.usuarioDto.id);
  document.getElementById('detalleId')!.textContent = String(pedido.id);
  document.getElementById('detalleCliente')!.textContent = cliente;
  document.getElementById('detalleFecha')!.textContent = new Date(pedido.fecha).toLocaleDateString();
  document.getElementById('detallePago')!.textContent = pedido.formaPago;
  document.getElementById('detalleTotal')!.textContent = String(pedido.total);
  const selectEstado = document.getElementById('detalleEstado') as HTMLSelectElement;
  selectEstado.value = pedido.estado;

  const lista = document.getElementById('detalleProductos') as HTMLUListElement;
  lista.innerHTML = '';
  let subtotal = 0;
  pedido.detalles.forEach((d: any) => {
    subtotal += d.subtotal;
    const li = document.createElement('li');
    li.textContent = `${d.producto.nombre} x ${d.cantidad} = $${d.subtotal}`;
    lista.appendChild(li);
  });
  document.getElementById('detalleSubtotal')!.textContent = String(subtotal);
  // Envío fijo (ajústalo según tu lógica)
  const envio = 0;
  document.getElementById('detalleEnvio')!.textContent = String(envio);

  // Guardar referencia al pedido actual para cambiar estado
  (modal as any).pedidoActual = pedido;

  modal.style.display = 'flex';
}

// Cambiar estado
document.getElementById('btnCambiarEstado')?.addEventListener('click', () => {
  const pedido = (modal as any).pedidoActual;
  if (!pedido) return;
  const nuevoEstado = (document.getElementById('detalleEstado') as HTMLSelectElement).value;
  // Actualizar en memoria
  const index = pedidos.findIndex(p => p.id === pedido.id);
  if (index !== -1) {
    pedidos[index].estado = nuevoEstado;
    renderizarPedidos();
    // Actualizar modal
    abrirModal(pedido.id); // reabre para actualizar vista
  }
  alert('Estado actualizado (solo en memoria).');
});

// Cerrar modal
closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// Filtro
filtroSelect.addEventListener('change', () => {
  filtroEstado = filtroSelect.value;
  renderizarPedidos();
});

cargarDatos();