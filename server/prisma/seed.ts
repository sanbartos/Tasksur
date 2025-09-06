import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
}

async function main() {
  const hashedPassword1 = await hashPassword("contraseña1");
  const hashedPassword2 = await hashPassword("contraseña2");
  const hashedPassword3 = await hashPassword("contraseña3");

  await prisma.auth_users.createMany({
    data: [
      {
        id: "11111111-1111-1111-1111-111111111111",
        email: "cliente1@example.com",
        // password: hashedPassword1,
        is_sso_user: false,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        email: "cliente2@example.com",
        // password: hashedPassword2,
        is_sso_user: false,
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        email: "cliente3@example.com",
        // password: hashedPassword3,
        is_sso_user: false,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.users.createMany({
    data: [
      {
        id: "11111111-1111-1111-1111-111111111111",
        first_name: "Cliente",
        last_name: "Uno",
        email: "cliente1@example.com",
        role: "client",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        first_name: "Cliente",
        last_name: "Dos",
        email: "cliente2@example.com",
        role: "client",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        first_name: "Cliente",
        last_name: "Tres",
        email: "cliente3@example.com",
        role: "client",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.categories.createMany({
    data: [
      {
        id: 1,
        name: "Limpieza",
        slug: "limpieza",
        description: "Servicios de limpieza",
        icon: "icon-limpieza.png",
        color: "#00ff00",
      },
      {
        id: 2,
        name: "Administración",
        slug: "administracion",
        description: "Servicios administrativos",
        icon: "icon-admin.png",
        color: "#0000ff",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.tasks.createMany({
    data: [
      {
        id: 1,
        category_id: 1,
        client_id: "11111111-1111-1111-1111-111111111111",
        title: "Limpieza casa",
        budget: 50,
        location: "Montevideo",
      },
      {
        id: 2,
        category_id: 1,
        client_id: "22222222-2222-2222-2222-222222222222",
        title: "Limpieza oficina",
        budget: 100,
        location: "Montevideo",
      },
      {
        id: 3,
        category_id: 2,
        client_id: "33333333-3333-3333-3333-333333333333",
        title: "Contabilidad básica",
        budget: 200,
        location: "Montevideo",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Datos de prueba insertados");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });