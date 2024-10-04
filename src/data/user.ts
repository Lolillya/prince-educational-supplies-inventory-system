import { prisma } from "~/server/db"; // Adjust based on your project structure

// Function to get user details by username
export const getUserByUsername = async (username: string) => {
  return await prisma.authentication.findUnique({
    where: { username },
    include: {
      personal_details: {
        include: {
          admins: {
            include: {
              role: true, // Include the role data for admins
            },
          },
          employees: {
            include: {
              role: true, // Include the role data for employees
            },
          },
        },
      },
    },
  });
};

// Function to get user role based on personal_details_id
export const getUserRole = async (personal_details_id: number) => {
  const adminRole = await prisma.role.findFirst({
    where: {
      admins: {
        some: {
          personal_details_id,
        },
      },
    },
  });

  const employeeRole = await prisma.role.findFirst({
    where: {
      employees: {
        some: {
          personal_details_id,
        },
      },
    },
  });

  return adminRole?.role_name || employeeRole?.role_name || null;
};

// Function to get user details by ID
export const getUserDetails = async (id: string) => {
  try {
    return await prisma.personal_details.findUnique({
      where: {
        personal_details_id: Number(id),
      },
      include: {
        admins: {
          include: {
            role: true, // Include role information for admins
          },
        },
        employees: {
          include: {
            role: true, // Include role information for employees
          },
        },
      },
    });
  } catch {
    return null;
  }
};

// Function to get user by personal_details_id
export const getUserById = async (id: string) => {
  try {
    return await prisma.personal_details.findUnique({
      where: {
        personal_details_id: Number(id),
      },
    });
  } catch {
    return null;
  }
};
