import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { readFileSync } from 'fs';

// Leer el JSON de credenciales de forma compatible con ES Modules
const creds = JSON.parse(readFileSync('./google-credentials.json', 'utf-8'));

async function accederALExcel() {
    // 1. Autenticación
    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 2. Cargar el documento usando el ID que ya pusiste
    const doc = new GoogleSpreadsheet('1-ighh5BY2ah2_nVbQUyDlkAcB7M4OspdM7U4z3U6ZOM', serviceAccountAuth);

    try {
        await doc.loadInfo();
        console.log(`✅ Conectado al Excel: ${doc.title}`);

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        console.log(`Se encontraron ${rows.length} productos.`);

        // Imprime el primer producto usando las columnas de tu CSV 
        if (rows.length > 0) {
            console.log(`Primer producto: ${rows[0].get('NOMBRE DEL PRODUCTO')} - Precio: ${rows[0].get('PRECIO')}`);
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error);
    }
}

accederALExcel();