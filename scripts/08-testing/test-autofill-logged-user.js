// Script para probar el auto-relleno con usuario logueado
// Ejecutar en la consola del navegador en localhost:3000/checkout

// Simular datos de usuario logueado
const testLoggedUserData = {
  id: "test_user_123",
  email: "usuario@example.com",
  full_name: "María García",
  phone: "+34 987 654 321",
  address: {
    id: "user_address_1",
    name: "Casa",
    street: "Avenida de la Paz 456",
    city: "Barcelona",
    postalCode: "08001",
    country: "España",
    phone: "+34 987 654 321",
    isDefault: true,
  },
  is_guest: false,
  user_id: "test_user_123",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Guardar en localStorage
localStorage.setItem(
  `client_${testLoggedUserData.email}`,
  JSON.stringify(testLoggedUserData)
);

console.log("✅ Datos de usuario logueado guardados en localStorage");
console.log("📧 Email de prueba:", testLoggedUserData.email);
console.log("👤 Nombre:", testLoggedUserData.full_name);
console.log("📱 Teléfono:", testLoggedUserData.phone);
console.log("🏠 Dirección:", testLoggedUserData.address.street);

// Instrucciones para el usuario
console.log(`
🧪 INSTRUCCIONES PARA PROBAR AUTO-RELLENO CON USUARIO LOGUEADO:

1. Ve a http://localhost:3000/shop
2. Añade algún producto al carrito
3. Ve a http://localhost:3000/checkout
4. En el campo "Email", escribe: usuario@example.com
5. Los campos "Nombre" y "Teléfono" deberían auto-rellenarse
6. La dirección también debería auto-rellenarse

Para limpiar los datos de prueba:
localStorage.removeItem('client_usuario@example.com');
`);

// También probar con datos de guest
const testGuestData = {
  id: "test_guest_456",
  email: "invitado@example.com",
  full_name: "Juan Invitado",
  phone: "+34 111 222 333",
  address: {
    id: "guest_address_1",
    name: "Oficina",
    street: "Calle del Comercio 789",
    city: "Valencia",
    postalCode: "46001",
    country: "España",
    phone: "+34 111 222 333",
    isDefault: true,
  },
  is_guest: true,
  user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

localStorage.setItem(
  `client_${testGuestData.email}`,
  JSON.stringify(testGuestData)
);

console.log("✅ Datos de invitado también guardados");
console.log("📧 Email de invitado:", testGuestData.email);
