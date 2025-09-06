import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '../shared/schema.js'; // ajusta si tu schema está en otra ruta
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@tasksur.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin1234';

  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el .env del backend');
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  // ¿ya existe?
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    console.log('Ya existe un admin con ese email:', email);
    await client.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Inserta el admin (ajusta campos si tu login requiere otros)
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    password: passwordHash, // tu columna es 'password' en schema
    role: 'admin',
    firstName: 'Admin',
    lastName: 'TaskSur',
    isTasker: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Admin creado con éxito.');
  console.log('Credenciales:');
  console.log({ email, password });

  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});