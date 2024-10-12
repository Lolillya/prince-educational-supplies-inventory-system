"use client";

import { Badge } from "~/components/ui/badge";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import { Role } from "@prisma/client";

interface UserRole {
  Role: Role;
}

interface Staff {
  Personal_Details_Id: string;
  firstName: string;
  lastName: string;
  contact: string;
  company: string;
  email: string;
  location_Id: string | null;
  Notes: string;
  User_Role?: UserRole;
}

interface UserInfoProps {
  staff: Staff[];
}

const UserInfo: React.FC<UserInfoProps> = ({ staff }) => {
  const [selectedUser, setSelectedUser] = useState<Staff | null>(null); // State for selected user

  const handleUserClick = (user: Staff) => {
    setSelectedUser(user);
  };

  return (
    <div className="relative flex h-full justify-between gap-3 px-3">
      <div className="flex w-full flex-col">
        <span>Records</span>
        <div className="flex flex-col gap-3">
          {staff
            .sort((a, b) => {
              const roleA = a.User_Role?.Role.Role_name === "ADMIN" ? 1 : 0;
              const roleB = b.User_Role?.Role.Role_name === "ADMIN" ? 1 : 0;
              return roleB - roleA;
            })
            .map((staffMember) => (
              <div
                key={staffMember.Personal_Details_Id}
                className="flex items-center justify-between rounded-md py-5 pr-7 hover:cursor-pointer hover:bg-gray-200"
                onClick={() => handleUserClick(staffMember)}
              >
                <div className="flex items-center gap-3">
                  <span>{`${staffMember.firstName} ${staffMember.lastName}`}</span>
                  {staffMember.User_Role?.Role.Role_name === "ADMIN" && (
                    <Badge className="rounded-full bg-[#BFE8FF] p-2 text-black transition-all duration-300 hover:scale-110 hover:bg-blue-300">
                      Admin
                    </Badge>
                  )}
                  <span>{staffMember.Personal_Details_Id}</span>
                </div>

                <div>
                  <FaPen color="#989FB3" />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex h-full w-full flex-col">
        <span>Details</span>
        <div className="flex h-full w-full flex-col rounded-lg bg-gray-200 p-5">
          {selectedUser ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <span className="font-bold">{selectedUser.company}</span>
                  <span>{selectedUser.Personal_Details_Id}</span>
                </div>
                {selectedUser.User_Role?.Role.Role_name === "ADMIN" && (
                  <Badge className="rounded-full bg-[#BFE8FF] p-2 text-black transition-all duration-300 hover:scale-110 hover:bg-blue-300">
                    Admin
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Sales Person</span>
                <span>
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Contact Num</span>
                <span>{selectedUser.contact}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Email</span>
                <span>{selectedUser.email}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Location</span>
                <span>
                  {selectedUser.location_Id
                    ? selectedUser.location_Id
                    : "Not Provided"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Notes</span>
                <span>{selectedUser.Notes}</span>
              </div>
            </div>
          ) : (
            <span>Select a user to see the details</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
