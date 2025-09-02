import { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: 'products',
    admin: { useAsTitle: 'name' },
    access: {
        read: () => true,
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'number', required: true },
        {
            name: 'size',
            type: 'text',
            label: 'Talla',
        },
        {
            name: 'colors',
            type: 'select',
            hasMany: true,   // permite seleccionar varios
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
    ],
}