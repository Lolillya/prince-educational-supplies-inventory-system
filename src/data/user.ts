import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.authentication.findFirst({
      where: { username: username },
      include: {
        Personal_Details: {
          include: {
            Admin: { include: { Role: true } },
            Employee: { include: { Role: true } },
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
};
// export const getUserDetails = async (id: string) => {
//   try {
//     const user = await prisma.personal_Details.findUnique({
//       where: {
//         user_Id: id,
//       },
//     });
//   } catch {
//     return null;
//   }
// };

export const getUserRole = async (user_Id_Role: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: {
        user_Id_Role,
      },
    });
    return role?.Role_name;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.personal_Details.findUnique({
      where: {
        user_Id: id,
      },
    });
    return user;
  } catch {
    return null;
  }
};
