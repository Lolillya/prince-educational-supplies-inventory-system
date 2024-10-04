import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.authentication.findFirst({
      where: { username },
      include: {
        personal_details: {
          select: {
            first_name: true,
            last_name: true,
            admins: {
              select: {
                role: {
                  select: {
                    role_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserDetails = async (id: string) => {
  try {
    const user = await prisma.personal_details.findUnique({
      where: {
        personal_details_id: Number(id),
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserRole = async (id: string) => {
  try {
    const role = await prisma.role.findFirst({
      where: {
        admins: {
          some: {
            personal_details_id: Number(id),
          },
        },
      },
    });
    return role?.role_name;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.personal_details.findUnique({
      where: {
        personal_details_id: Number(id),
      },
    });
    return user;
  } catch {
    return null;
  }
};
