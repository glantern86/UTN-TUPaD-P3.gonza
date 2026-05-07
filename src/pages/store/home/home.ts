import {getCategories} from "../../../data/data.ts"
import {PRODUCTS} from "../../../data/data.ts"
const listaCategorias = document.getElementById("lista-categorias");
const listaProductos = document.getElementById("contenedor-productos");
const inputKey = document.querySelector<HTMLInputElement>("#searchbox");
const botonTodos = document.querySelector<HTMLButtonElement>("#btnTodos");
let categoriaActiva: string | null = null;

interface Itemcarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

function renderizarProductos(productos: Product[]) {
    if (!listaProductos) return;
    listaProductos.innerHTML = '';

    productos.forEach((producto) => {
        const li = document.createElement('li');
        li.setAttribute('data-nombre', producto.nombre.toLowerCase());
        li.innerHTML = `
            <h3>${producto.nombre}</h3>
            <element id="${producto.nombre}"></element>
            <img src="../../../../foodPlaceholder.webp" 
                style="width:128px;height:128px;" 
                alt="${producto.nombre}">
            <p>${producto.descripcion}</p>
            <p>Precio: <strong>${producto.precio}</strong></p>
            <input type="submit" value="Agregar" class="boton-agregar">
        `;
        listaProductos.appendChild(li);

        const botonAgregar = li.querySelector('.boton-agregar');
        if (botonAgregar) {
            botonAgregar.addEventListener('click', () => {
                let carrito = obtenerCarrito();
                const sumarProducto = carrito.find(item => item.id === producto.id);
                if(sumarProducto){
                    sumarProducto.cantidad = sumarProducto.cantidad +1
                } else {
                    carrito.push({
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        cantidad: 1,
                        imagen: producto.imagen
                    });
                }
                alert(`${producto.nombre} agregado al carrito`);
                guardarCarrito(carrito);
            });
        }
    });
}

const cargarCategorias=()=> {
    const categoriasArray = getCategories();
    categoriasArray.forEach((categoria) => { 
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#top" id="producto.${categoria.nombre}">${categoria.nombre}</a>
        `;

        const enlace = li.querySelector('a');
        enlace?.addEventListener('click', (event) => {
        event.preventDefault();
           
        if (categoriaActiva === categoria.nombre) {
            categoriaActiva = null;
        } else {
            categoriaActiva = categoria.nombre;
        }
        
        recargarProductosPorCategoria();
        });

        if(listaCategorias){
            listaCategorias.appendChild(li);
        }
    });
};

function filtrarProductos(texto: string) {
    const productos = document.querySelectorAll("#contenedor-productos li");
    const noResultados = document.getElementById("noResultados");
    
    let resultados = false
    productos.forEach((producto) => {
        const nombreProducto = producto.getAttribute('data-nombre')?.toLowerCase() || "";
        if (nombreProducto.includes(texto)) {
            (producto as HTMLElement).style.display = "";
            resultados = true;
        } else {
            (producto as HTMLElement).style.display = "none";
        }
    })
    if (noResultados) {
        if (!resultados) {
            noResultados.style.display = "";
            listaProductos!.style.display = "none";
        } else {
            noResultados.style.display = "none";
            listaProductos!.style.display = "grid";
        }
    }
};

function recargarProductosPorCategoria() {
    let productosAMostrar = PRODUCTS;

    if (categoriaActiva !== null) {
    productosAMostrar = PRODUCTS.filter(producto =>
        producto.categorias.some(cat => cat.nombre === categoriaActiva));
    }

    renderizarProductos(productosAMostrar);
}

inputKey?.addEventListener("input", (event: Event) => {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const busqueda = target.value.toLowerCase();
    filtrarProductos(busqueda);
    }
);

if (botonTodos) {
    botonTodos.addEventListener("click", () => {
        console.log("Botón deshabilitado");
        renderizarProductos(PRODUCTS);
    });
}

function obtenerCarrito(): Itemcarrito[] {
    const guardado = localStorage.getItem('cart');
    return guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito(carrito: Itemcarrito[]) {
    localStorage.setItem('cart', JSON.stringify(carrito));
}

cargarCategorias();
renderizarProductos(PRODUCTS);