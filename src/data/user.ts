import { prisma } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.authentication.findFirst({
      where: { username: username as string },
      include: {
        Personal_Details: {
          select: {
            firstName: true,
            lastName: true,
            Admin: {
              select: {
                Role: {
                  select: {
                    Role_name: true,
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

export const getUserRole = async(id: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: {
        user_Id_Role: id
      }
    })
    return role?.Role_name
  }

  catch {
    return null
  }
}

  export const getUserById = async (id: string) => {
    try {
      const user = await prisma.personal_Details.findUnique({
        where:{
          user_Id: id
        }
      })
      return user
    }

    catch {
      return null
    }
  }