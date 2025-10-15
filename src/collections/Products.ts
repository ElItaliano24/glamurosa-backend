import { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: 'products',
    admin: { 
        useAsTitle: 'name',
        defaultColumns: ['name', "description", 'price', 'size', 'category']
    },
    access: {
        read: () => true,
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'number', required: true },
        { name: 'size', type: 'text', label: 'Talla' },
        { name: 'colors', type: 'select', hasMany: true, label: 'Colores disponibles',
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
                { label: 'BASICOS EN RIB', value: 'basicos en rib' },
                { label: 'BASICOS EN SUPLEX', value: 'basicos en suplex' },
                { label: 'CHOMPAS Y CHOMPEROS', value: 'chompas y chomperos' },
                { label: 'SACOS Y CONJUNTOS', value: 'sacos y conjuntos' },
                { label: 'PANTALONES', value: 'pantalones' },
                { label: 'LIQUIDACIONES', value: 'liquidaciones' },
            ],
        }
    ],
}