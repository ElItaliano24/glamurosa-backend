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
    origins: ['http://localhost:3000', 'https://glamurosa-frontend.vercel.app'],
    headers: ['Content-Type', 'Authorization'],
  },
  csrf: ['http://localhost:3000', 'https://glamurosa-frontend.vercel.app'],
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
    // storage-adapter-placeholder
  ],
  serverURL: 'http://localhost:3001',
})
