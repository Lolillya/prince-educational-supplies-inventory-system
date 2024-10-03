import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        Username: username,
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (UserId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { UserId } });
    return user;
  } catch {
    return null;
  }
};
