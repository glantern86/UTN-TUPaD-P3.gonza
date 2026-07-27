import { checkAuthUser, logout } from '../../../utils/auth';
import { fetchCategories, fetchProducts, fetchOrders } from '../../../services/dataService';

checkAuthUser(
  '/src/pages/auth/login/login.html',
  '/src/pages/store/home/home.html',
  'ADMIN'
);

document.getElementById('logoutButton')?.addEventListener('click', logout);

async function cargarEstadisticas() {
  try {
    const [categorias, productos, pedidos] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchOrders()
    ]);

    const totalCategorias = categorias.length;
    document.getElementById('totalCategorias')!.textContent = String(totalCategorias);

    const totalProductos = productos.length;
    document.getElementById('totalProductos')!.textContent = String(totalProductos);

    const totalPedidos = pedidos.length;
    document.getElementById('totalPedidos')!.textContent = String(totalPedidos);

    const disponibles = productos.filter(p => p.disponible && p.stock > 0).length;
    document.getElementById('productosDisponibles')!.textContent = String(disponibles);
/*
    const categoriasActivas = categorias.filter(p => p.disponible === true).length;
    document.getElementById('categoriasActivas')!.textContent = String(categoriasActivas);
*/
    const productosActivos = productos.filter(p => p.disponible === true).length;
    document.getElementById('productosActivos')!.textContent = String(productosActivos);

    const productosInactivos = productos.filter(p => p.disponible === false).length;
    document.getElementById('productosInactivos')!.textContent = String(productosInactivos);

    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    document.getElementById('pedidosPendientes')!.textContent = String(pendientes);

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

cargarEstadisticas();