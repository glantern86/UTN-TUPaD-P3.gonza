// src/pages/auth/login/login.ts
import { fetchUsers } from '../../../services/dataService';
import { navigate } from '../../../utils/navigate';

// Seleccionar el formulario
const form = document.querySelector<HTMLFormElement>('#loginform');
const errorMsg = document.createElement('p');
errorMsg.style.color = 'red';
errorMsg.style.marginTop = '10px';

if (!form) {
  throw new Error('Formulario #loginform no encontrado');
}
form.appendChild(errorMsg);

form.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();

  const formData = new FormData(form);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    errorMsg.textContent = 'Completa todos los campos';
    return;
  }

  try {
    // 1. Buscar en el archivo JSON
    const usersFromJson = await fetchUsers();
    let user = usersFromJson.find(u => u.mail === email);

    // 2. Si no está en JSON, buscar en localStorage (usuarios registrados)
    if (!user) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const usersFromLocal = JSON.parse(storedUsers);
        user = usersFromLocal.find((u: any) => u.mail === email);
      }
    }

    if (!user) {
      errorMsg.textContent = 'Usuario no encontrado';
      return;
    }

    if (user.password !== password) {
      errorMsg.textContent = 'Contraseña incorrecta';
      return;
    }

    // Guardar sesión (sin password)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('userData', JSON.stringify({
      ...userWithoutPassword,
      loggedIn: true
    }));

    // Redirigir según rol
    if (user.rol === 'ADMIN') {
      navigate('/src/pages/admin/home/home.html');
    } else {
      navigate('/src/pages/store/home/home.html');
    }
  } catch (error) {
    console.error('Error en login:', error);
    errorMsg.textContent = 'Error al conectar con el servidor de usuarios';
  }
});