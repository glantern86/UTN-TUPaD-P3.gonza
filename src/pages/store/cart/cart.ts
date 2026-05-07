const carritoProductos = document.getElementById("cart-items-list");
const totalSpan = document.getElementById('total');

interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
}

function recuperarCarrito(): CartItem[] {
    const carritoGuardado = localStorage.getItem('cart');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function guardarCarrito(carrito: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(carrito));
}

function modificarCantidad(id: number, cambio: number) {
    let carrito = recuperarCarrito();
    const index = carrito.findIndex(item => item.id === id);
    if (index !== -1) {
        const nuevaCant = carrito[index].cantidad + cambio;
        if (nuevaCant <= 0) {
            carrito.splice(index, 1);
        } else {
            carrito[index].cantidad = nuevaCant;
        }
        guardarCarrito(carrito);
        mostrarCarrito();
    }
}

function eliminarProducto(id: number) {
    let carrito = recuperarCarrito();
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito(carrito);
    mostrarCarrito();
}

function mostrarCarrito() {
    const carrito = recuperarCarrito();
    if (!carritoProductos) return;

    if (carrito.length === 0) {
        carritoProductos.innerHTML = '<li>No hay productos en el carrito.</li>';
        if (totalSpan) totalSpan.innerText = '0';
        return;
    }

    let total = 0;
    let html = '';
    carrito.forEach((item) => {
        total += item.precio * item.cantidad;
        html += `
            <li class="cart-item" data-id="${item.id}">
                <img src="../../../../foodPlaceholder.webp" style="width:60px;height:60px;">
                <div class="cart-item-info">
                    <strong>${item.nombre}</strong>
                    <p>Precio: $${item.precio}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="increase" data-id="${item.id}">+</button>
                    <button class="remove" data-id="${item.id}">Eliminar</button>
                </div>
            </li>
        `;
    });

    carritoProductos.innerHTML = html;
    if (totalSpan) totalSpan.innerText = total.toString();

    carritoProductos.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id')!);
            modificarCantidad(id, 1);
        });
    });
    carritoProductos.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id')!);
            modificarCantidad(id, -1);
        });
    });
    carritoProductos.querySelectorAll('.remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id')!);
            eliminarProducto(id);
        });
    });
}

mostrarCarrito();