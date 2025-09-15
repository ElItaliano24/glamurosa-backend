// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
// import { nodemailerAdapter } from '@payloadcms/email-nodemailer';

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'

import { cloudinaryStorage } from 'payload-cloudinary';

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // email: nodemailerAdapter(),
  collections: [Users, Media, Products],
  editor: lexicalEditor(),
  cors: {
    origins: ['http://localhost:3000', 'https://glamurosa.vercel.app'],
    headers: ['Content-Type', 'Authorization'],
  },
  csrf: ['http://localhost:3000', 'https://glamurosa.vercel.app'],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      family: 4,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 20000,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    cloudinaryStorage({
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
        api_key: process.env.CLOUDINARY_API_KEY as string,
        api_secret: process.env.CLOUDINARY_API_SECRET as string,
      },
      collections: {
        media: true, // aplica Cloudinary a tu colección media
      },
      folder: 'glamurosa-media', // opcional
    }),
    // storage-adapter-placeholder
  ],
  serverURL: 'https://glamurosa-backend.vercel.app',
})
