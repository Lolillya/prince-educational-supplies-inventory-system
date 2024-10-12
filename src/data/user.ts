import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.authentication.findFirst({
      where: { username: username },
      include: {
        Personal_Details: {
          select: {
            firstName: true,
            lastName: true,
            contact: true,
            company: true,
            Notes: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserRole = async (Personal_Details_Id: string) => {
  try {
    const role = prisma.user_Role.findFirst({
      where: {
        Personal_Details_Id,
      },
      include: {
        Role: {
          select: {
            Role_name: true,
          },
        },
      },
    });
    return role;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.personal_Details.findUnique({
      where: {
        Personal_Details_Id: id,
      },
    });
    return user;
  } catch {
    return null;
  }
};
