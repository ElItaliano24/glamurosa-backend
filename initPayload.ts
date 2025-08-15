// server/payload.ts
import payload from 'payload';
import { buildConfig } from 'payload';
import { Users } from 'src/collections/Users';
import { Media } from 'src/collections/Media';
import { Products } from 'src/collections/Products';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import sharp from 'sharp';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export function initPayload() {
    if (!(payload as any).isInitialized) {
    (payload as any).init(buildConfig({
        admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
        collections: [Users, Media, Products],
        editor: lexicalEditor(),
        cors: { origins: ['http://localhost:3000'], headers: ['Content-Type', 'Authorization'] },
        csrf: ['http://localhost:3000'],
        secret: process.env.PAYLOAD_SECRET!,
        typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
        db: mongooseAdapter({ url: process.env.DATABASE_URI!, connectOptions: { tls: true } }),
        sharp,
        plugins: [payloadCloudPlugin()],
        serverURL: process.env.SERVER_URL || 'http://localhost:3001',
    }));
    }
    return payload;
}
