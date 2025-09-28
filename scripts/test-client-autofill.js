// Script para probar el auto-relleno de datos de cliente
// Ejecutar en la consola del navegador en localhost:3000/checkout

// Simular datos de cliente en localStorage
const testClientData = {
  id: "test_client_123",
  email: "test@example.com",
  full_name: "Juan Pérez",
  phone: "+34 123 456 789",
  address: {
    id: "test_address",
    name: "Casa",
    street: "Calle de Prueba 123",
    city: "Madrid",
    postalCode: "28001",
    country: "España",
    phone: "+34 123 456 789",
    isDefault: true,
  },
  is_guest: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Guardar en localStorage
localStorage.setItem(
  `client_${testClientData.email}`,
  JSON.stringify(testClientData)
);

console.log("✅ Datos de prueba guardados en localStorage");
console.log("📧 Email de prueba:", testClientData.email);
console.log("👤 Nombre:", testClientData.full_name);
console.log("📱 Teléfono:", testClientData.phone);

// Instrucciones para el usuario
console.log(`
🧪 INSTRUCCIONES PARA PROBAR:

1. Ve a http://localhost:3000/shop
2. Añade algún producto al carrito
3. Ve a http://localhost:3000/checkout
4. En el campo "Email", escribe: test@example.com
5. Los campos "Nombre" y "Teléfono" deberían auto-rellenarse
6. La dirección también debería auto-rellenarse

Para limpiar los datos de prueba:
localStorage.removeItem('client_test@example.com');
`);
