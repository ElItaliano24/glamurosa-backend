import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { readFileSync } from 'fs';

// Cargamos tus credenciales igual que en el test
const creds = JSON.parse(readFileSync('./google-credentials.json', 'utf-8'));

async function sincronizar() {
    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet('1-ighh5BY2ah2_nVbQUyDlkAcB7M4OspdM7U4z3U6ZOM', serviceAccountAuth);
    
    await doc.loadInfo();
    console.log(`✅ Conectado al Excel: ${doc.title}`);
    
    // Configuración de tu web
    const PAYLOAD_URL = 'https://glamurosa-backend.vercel.app'; 
    
    console.log('🔑 Pidiendo permiso a la web...');
    const login = await fetch(`${PAYLOAD_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: process.env.PAYLOAD_ADMIN_EMAIL, 
            password: process.env.PAYLOAD_ADMIN_PASSWORD 
        }),
    });
    const loginData = await login.json();
    const token = loginData.token;

    if (!token) {
        console.log('❌ Error: No se pudo obtener el token. Revisa tus credenciales de admin.');
        return;
    }
    console.log('✅ Permiso concedido.');

    // --- PROCESAMIENTO DE FILAS ---
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    console.log(`📦 Procesando ${rows.length} filas...`);

    for (const row of rows) {
        // Obtenemos los datos usando los nombres de tus columnas del Excel
        const sku = row.get('ID')?.toString().trim(); 
        const nombre = row.get('NOMBRE DEL PRODUCTO');
        const precio = parseFloat(row.get('PRECIO'));
        const stock = parseInt(row.get('STOCK')) || 0;
        const categoria = (row.get('CATEGORIA') || '').trim().toUpperCase();

        if (!sku) continue; // Si la fila no tiene ID, la saltamos

        console.log(`-----------------------------------`);
        console.log(`🔎 Buscando: ${nombre} (${sku})`);

        // A. Buscamos si el producto ya existe en la base de datos por su SKU
        const search = await fetch(`${PAYLOAD_URL}/api/products?where[sku][equals]=${sku}`, {
            headers: { Authorization: `JWT ${token}` }
        });
        const { docs } = await search.json();

        // Estructura del producto que enviaremos
        const productData = {
            name: nombre,
            sku: sku,
            price: precio,
            stock: stock,
            category: categoria,
            status: stock > 0 ? 'activo' : 'agotado'
        };

        if (docs && docs.length > 0) {
            // EL PRODUCTO YA EXISTE -> ACTUALIZAMOS (PATCH)
            const idEnBaseDeDatos = docs[0].id;
            console.log(`   🔄 Existe (ID: ${idEnBaseDeDatos}). Actualizando stock/precio...`);
            
            await fetch(`${PAYLOAD_URL}/api/products/${idEnBaseDeDatos}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${token}` 
                },
                body: JSON.stringify(productData)
            });
            console.log('   ✅ Actualizado con éxito.');

        } else {
            // EL PRODUCTO NO EXISTE -> CREAMOS NUEVO (POST)
            console.log(`   ✨ Nuevo. Creándolo en la base de datos...`);
            
            const create = await fetch(`${PAYLOAD_URL}/api/products`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${token}` 
                },
                body: JSON.stringify(productData)
            });

            if (create.ok) {
                console.log('   ✅ Creado con éxito.');
            } else {
                console.log('   ❌ Error al crear. Revisa si la categoría existe en Payload.');
            }
        }
    }

    console.log('\n🏁 Sincronización finalizada.');
}

sincronizar();