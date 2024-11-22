import { db } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.authentication.findFirst({
      where: { username: username },
      include: {
        personal_details: {
          select: {
            first_name: true,
            last_name: true,
            contact: true,
            company: true,
            notes: true,
            User_Role: true,
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
    const role = db.user_Role.findFirst({
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
    // console.log(role);
    return role;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.personal_Details.findUnique({
      where: {
        personal_details_id: id,
      },
    });
    return user;
  } catch {
    return null;
  }
};
