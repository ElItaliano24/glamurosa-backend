import { CollectionConfig } from "payload";

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
        { name: 'size', type: 'text', label: 'Talla'},
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
}