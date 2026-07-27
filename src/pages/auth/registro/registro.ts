const form = document.querySelector<HTMLFormElement>('#registerform');

form?.addEventListener('submit', (event: Event) => {
  event.preventDefault();
  const formElement = event.currentTarget as HTMLFormElement;
  const formData = new FormData(formElement);

  const nuevoUsuario = {
    id: 0,
    nombre: formData.get('nombre') as string,
    apellido: formData.get('apellido') as string,
    mail: formData.get('email') as string,
    celular: formData.get('celular') as string,
    password: formData.get('password') as string,
    rol: 'USUARIO',
  };

  // Validación básica
  if (!nuevoUsuario.mail || !nuevoUsuario.password || !nuevoUsuario.nombre) {
    alert('Completa todos los campos obligatorios');
    return;
  }

  // Obtener usuarios actuales de localStorage
  const stored = localStorage.getItem('users');
  let usersArray = stored ? JSON.parse(stored) : [];

  // Verificar si el email ya existe
  if (usersArray.some((u: any) => u.mail === nuevoUsuario.mail)) {
    alert('Este email ya está registrado');
    formElement.reset();
    return;
  }

  // Asignar ID (mayor + 1, o 1 si no hay)
  const maxId = usersArray.reduce((max: number, u: any) => u.id > max ? u.id : max, 0);
  nuevoUsuario.id = maxId + 1;

  usersArray.push(nuevoUsuario);
  localStorage.setItem('users', JSON.stringify(usersArray));
  console.log('Usuario registrado:', nuevoUsuario);
  formElement.reset();
  alert('Registro exitoso. Ahora podés iniciar sesión.');
});