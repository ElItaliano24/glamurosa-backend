import { initPayload } from '../../../initPayload'; 

export const GET = async () => {
  const payload = initPayload(); // inicializa Payload si aún no lo está

  // ejemplo: obtener todos los productos
  const products = await payload.find({
    collection: 'products',
    limit: 10, // opcional
  });

  return new Response(JSON.stringify({ products }));
}
