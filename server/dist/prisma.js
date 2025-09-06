// server/prisma.ts
import { PrismaClient } from '@prisma/client';
export const prisma = global.__prisma ??
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
if (process.env.NODE_ENV !== 'production')
    global.__prisma = prisma;
