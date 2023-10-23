import { userSeedData, seedUsers } from "./seeds/users";

const seed = async () => {
  console.info("seeding Users...");
  await seedUsers(userSeedData);
};

seed()
  .catch((e) => console.error(e))
  .finally(() => console.info("Seeding Complete"));
