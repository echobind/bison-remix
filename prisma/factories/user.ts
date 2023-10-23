import Chance from "chance";
import { type Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/db.server";

const chance = new Chance();

type FactoryUpsertArgs = {
  where: Prisma.UserUpsertArgs["where"];
  createArgs: Partial<Prisma.UserUpsertArgs["create"]>;
  updateArgs: Prisma.UserUpsertArgs["update"];
  select?: Prisma.UserUpsertArgs["select"];
};

export const UserFactory = {
  build: (
    args: Partial<Prisma.UserCreateArgs["data"]> = {},
    select: Prisma.UserCreateArgs["select"] = {},
  ): Prisma.UserCreateArgs => {
    const password = args.password
      ? bcrypt.hashSync(args.password, 10)
      : bcrypt.hashSync("test1234", 10);
    const defaultSelect = {
      ...select,
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      roles: true,
      firstName: true,
      lastName: true,
      image: true,
    };

    return {
      data: {
        email: chance.email(),
        roles: { set: [Role.USER] },
        firstName: chance.first(),
        lastName: chance.last(),
        ...args,
        password,
      },

      select: defaultSelect,
    };
  },

  create: async (
    args: Partial<Prisma.UserCreateArgs["data"]> = {},
    select: Prisma.UserCreateArgs["select"] = {},
  ) => {
    const userArgs = UserFactory.build(args, select);

    const user = await prisma.user.create(userArgs);
    return user;
  },

  upsert: async ({
    where,
    createArgs = {},
    updateArgs = {},
    select = {},
  }: FactoryUpsertArgs) => {
    // Grab Build Defaults for Create
    const userArgs = UserFactory.build(createArgs, select);
    const password = updateArgs.password
      ? bcrypt.hashSync(updateArgs.password as string, 10)
      : undefined;

    return await prisma.user.upsert({
      where,
      create: userArgs.data,
      select: userArgs.select,
      update: { ...updateArgs, password },
    });
  },
};
