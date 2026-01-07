import { CollectionConfig } from "payload";
import { JWT } from "google-auth-library";

export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['sku', 'name', 'price', 'stock', 'category']
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'sku',
            type: 'text',
            label: 'ID/SKU (Excel)',
            unique: true,
            admin: {
                description: 'Identificador único del producto, debe coincidir con el SKU en el archivo de Excel.'
            }
        },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'number', required: true },
        {
            name: 'stock',
            type: 'number',
            defaultValue: 0,
            label: 'Stock actual',
            admin: {
                description: 'Se actualiza automáticamente desde el Excel'
            }
        },
        { name: 'size', type: 'text', label: 'Talla' },
        {
            name: 'colors',
            type: 'select',
            hasMany: true,
            label: 'Colores disponibles',
            options: [
                { label: 'Negro', value: 'negro' },
                { label: 'Blanco', value: 'blanco' },
                { label: 'Rojo', value: 'rojo' },
                { label: 'Azul', value: 'azul' },
                { label: 'Verde', value: 'verde' },
                { label: 'Amarillo', value: 'amarillo' },
                { label: 'Rosa', value: 'rosa' },
            ],
        },
        {
            name: 'images',
            type: 'array',
            fields: [
                { name: 'image', type: 'upload', relationTo: 'media' }
            ],
        },
        {
            name: 'category',
            type: 'select',
            label: 'Categoría',
            options: [
                { label: 'BASICOS EN RIB', value: 'BASICOS EN RIB' },
                { label: 'BASICOS EN SUPLEX', value: 'BASICOS EN SUPLEX' },
                { label: 'CHOMPAS Y CHOMPEROS', value: 'CHOMPAS Y CHOMPEROS' },
                { label: 'SACOS Y CONJUNTOS', value: 'SACOS Y CONJUNTOS' },
                { label: 'PANTALONES', value: 'PANTALONES' },
                { label: 'LIQUIDACIONES', value: 'LIQUIDACIONES' },
            ],
        }
    ],
    endpoints: [
        {

            path: '/sync-excel',
            method: 'get',
            handler: async (req) => {
                // 1. EXTRAER EL TOKEN DE LA URL
                const { searchParams } = new URL(req.url);
                const tokenRecibido = searchParams.get('token');

                // 2. VALIDAR CON LA VARIABLE DE ENTORNO DE VERCEL
                const tokenValido = process.env.SYNC_TOKEN;

                // Si no hay token o no coincide, cerramos la puerta de inmediato
                if (!tokenRecibido || tokenRecibido !== tokenValido) {
                    return Response.json(
                        { error: 'No autorizado. El SYNC_TOKEN es incorrecto.' },
                        { status: 401 }
                    );
                }

                // 3. AQUÍ IRÁ LA LÓGICA DE GOOGLE SHEETS
                try {

                    const serviceAccountAuth = new JWT({
                        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    })

                    await serviceAccountAuth.authorize();

                    return Response.json({
                        message: '✅ ¡Conexión exitosa!',
                        details: 'Payload logró autenticarse con Google Cloud correctamente.'
                    });
                } catch (error: any) {
                    // Si la llave es inválida o el email está mal, el error saldrá aquí
                    return Response.json({ 
                        error: '❌ Error de conexión con Google',
                        debug: error.message 
                    }, { status: 500 });
                }
            }
        }
    ],
}