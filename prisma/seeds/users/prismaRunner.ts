import type { Prisma, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

type SeedUserResult = Pick<User, "id" | "email">;

export const seedUsers = async (
  users: Prisma.UserCreateInput[],
): Promise<SeedUserResult[]> => {
  const userPromiseArray = users.map(
    async (user): Promise<SeedUserResult> =>
      prisma.user.upsert({
        where: {
          email: user.email,
        },
        create: {
          email: user.email,
          password: user.password,
          roles: user.roles,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        update: {},
        select: {
          id: true,
          email: true,
        },
      }),
  );

  return Promise.all(userPromiseArray);
};
