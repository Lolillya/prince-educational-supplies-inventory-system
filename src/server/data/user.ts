"use server";
import { db } from "~/server/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = db.authentication.findFirst({
      where: { username: username },
      include: {
        personal_details: {
          select: {
            first_name: true,
            last_name: true,
            contact: true,
            company: true,
            notes: true,
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
    const roleRecord = await db.user_Role.findFirst({
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

    // Return only the Role_name if the role is found
    return roleRecord?.Role?.Role_name || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
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
