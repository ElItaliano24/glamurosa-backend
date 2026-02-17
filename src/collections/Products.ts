import { CollectionConfig } from "payload";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['sku', 'name', 'price', 'category']
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
            name: 'inventario',
            type: 'array',
            label: 'Inventario',
            admin: {
                description: 'Define qué colores hay disponibles y cuántas unidades hay de cada uno.'
            },
            fields: [
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'color',
                            type: 'select',
                            label: 'Color',
                            required: true,
                            options: [
                                { label: 'Negro', value: 'negro' },
                                { label: 'Blanco', value: 'blanco' },
                                { label: 'Rojo', value: 'rojo' },
                                { label: 'Azul', value: 'azul' },
                                { label: 'Verde', value: 'verde' },
                                { label: 'Amarillo', value: 'amarillo' },
                                { label: 'Rosa', value: 'rosa' },
                            ],
                            admin: {
                                width: '50%',
                            }
                        },
                        {
                            name: 'quantity',
                            type: 'number',
                            label: 'Cantidad / Stock',
                            required: true,
                            min: 0,
                            admin: {
                                width: '50%',
                            }
                        }
                    ],
                },
            ]
        },
        // ...
        { name: 'size', type: 'text', label: 'Talla' },
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
        },
        {
            name: 'status',
            type: 'select',
            label: 'Estado',
            options: [
                { label: 'Activo', value: 'Activo' },
                { label: 'Agotado', value: 'Agotado' },
            ],
            admin: {
                description: 'Se sincroniza desde la columna ESTADO del Excel'
            }
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

                    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', serviceAccountAuth);
                    await doc.loadInfo();

                    // 1. SELECCIONAR LA PRIMERA HOJA Y OBTENER FILAS
                    const sheet = doc.sheetsByIndex[0];
                    const rows = await sheet.getRows();

                    let actualizados = 0;
                    let noEncontrados = 0;

                    // 2. RECORRER CADA FILA DEL EXCEL
                    for (const row of rows) {
                        const idExcel = row.get('ID');
                        const nombreExcel = row.get('NOMBRE DEL PRODUCTO');
                        const precioExcel = row.get('PRECIO');
                        const estadoExcel = row.get('ESTADO');
                        const categoriaExcel = row.get('CATEGORIA');

                        if (idExcel) {
                            // 3. BUSCAR PRODUCTO EN PAYLOAD POR SKU
                            const result = await req.payload.find({
                                collection: 'products',
                                where: {
                                    sku: { equals: idExcel }
                                }
                            });

                            if (result.docs.length > 0) {
                                // 4. LIMPIAR PRECIO (Convierte "154,00" a 154.00)
                                const precioNumerico = typeof precioExcel === 'string'
                                    ? parseFloat(precioExcel.replace(',', '.'))
                                    : parseFloat(precioExcel);

                                // 5. ACTUALIZAR EN PAYLOAD
                                await req.payload.update({
                                    collection: 'products',
                                    id: result.docs[0].id,
                                    data: {
                                        name: nombreExcel || result.docs[0].name,
                                        price: precioNumerico || 0,
                                        status: estadoExcel || result.docs[0].status,
                                        category: categoriaExcel || result.docs[0].category,
                                    }
                                });
                                actualizados++;
                            } else {
                                noEncontrados++;
                            }
                        }
                    }

                    return Response.json({
                        message: `✅ Sincronización exitosa`,
                        details: `Se actualizaron ${actualizados} productos. IDs no encontrados en Payload: ${noEncontrados}.`,
                        archivo: doc.title
                    });

                } catch (error: any) {
                    return Response.json({
                        error: '❌ Error en la sincronización',
                        debug: error.message
                    }, { status: 500 });
                }
            }
        }
    ],
}