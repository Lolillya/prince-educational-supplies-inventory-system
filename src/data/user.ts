import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.authentication.findFirst({
      where: {
        username: username,
      },
      include: {
        Personal_Details: {
          select: {
            firstName: true,
            lastName: true,
            Role: {
              select: {Role_name: true}
            }
          }
        }
      }
      
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserDetails = async (id: string) => {
  try {
    const user = await prisma.personal_Details.findUnique({
      where:{
        user_Id: id
      }
    })
  }
  catch {
    return null
  }
}

export const getUserById = async (UserId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { UserId } });
    return user;
  } catch {
    return null;
  }
};

export const getUserRole = async(User_Id: string) => {
  try {
    const role = await prisma.role
  }

  catch{
    return null
  }
}
