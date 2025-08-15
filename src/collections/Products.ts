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
            name: 'images',
            type: 'array',
            fields: [
                { name: 'image', type: 'upload', relationTo: 'media' }
            ],
        },
    ],
}