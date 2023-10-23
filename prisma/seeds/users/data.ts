import { type Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// *********************************************
// ** DEVELOPMENT DATA SET
// *********************************************

const INITIAL_PASSWORD = "test1234";

const initialDevUsers: Prisma.UserCreateInput[] = [
  {
    email: "barry.allen@speedforce.net",
    password: bcrypt.hashSync(INITIAL_PASSWORD, 10),
    roles: [Role.ADMIN],
    firstName: "Barry",
    lastName: "Allen",
  },
];

// *********************************************
// ** PRODUCTION DATA SET
// *********************************************

const INITIAL_PROD_PASSWORD = "strong@password";

const initialProdUsers: Prisma.UserCreateInput[] = [
  {
    email: "apps@echobind.com",
    password: bcrypt.hashSync(INITIAL_PROD_PASSWORD, 10),
    roles: [Role.ADMIN],
    firstName: "EB",
    lastName: "Admin",
  },
];

// *********************************************
// ** MAIN DATA EXPORT
// *********************************************

export const userSeedData: Prisma.UserCreateInput[] =
  process.env.NODE_ENV === "production" ? initialProdUsers : initialDevUsers;
