import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  return prisma.authentication.findUnique({
    where: { username },
    include: {
      personal_details: {
        include: {
          admins: { include: { role: true } },
          employees: { include: { role: true } },
        },
      },
    },
  });
};

export const getUserRole = async (personal_details_id: number) => {
  const [adminRole, employeeRole] = await Promise.all([
    prisma.role.findFirst({
      where: { admins: { some: { personal_details_id } } },
    }),
    prisma.role.findFirst({
      where: { employees: { some: { personal_details_id } } },
    }),
  ]);

  return adminRole?.role_name ?? employeeRole?.role_name ?? null;
};

// export const getUserDetails = async (id: string) => {
//   try {
//     return await prisma.personal_details.findUnique({
//       where: { personal_details_id: Number(id) },
//       include: {
//         admins: { include: { role: true } },
//         employees: { include: { role: true } },
//       },
//     });
//   } catch {
//     return null;
//   }
// };

// export const getUserById = async (id: string) => {
//   try {
//     return await prisma.personal_details.findUnique({
//       where: { personal_details_id: Number(id) },
//     });
//   } catch {
//     return null;
//   }
// };
