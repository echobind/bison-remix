# Seeds and Scripts

## Seeds

### Dev VS Prod

- `npm run db:seed` (DEV)
- `npm run db:seed:prod` (PROD)

We use `NODE_ENV` in the scripts to determine the dataset returned for seeds.
This ENV is set in your .env.local file as well, and can be manually set as an ENV in your deploy environment if needed for other scripts.

### File Breakdown (Seeds)

```sh
/seeds
--/model
----/data.ts
----/prismaRunner.ts
----/index.ts
```

**data.ts** contains the exported function `seedModelData: ModelCreateInput[]` this function leverages `NODE_ENV` to return the dataset expected for Dev vs Prod. In the case of `users` this returns `initialDevUsers: UserCreateInput[]` or `initalProdUsers: UserCreateInput[]`.

**prismaRunner.ts** this file contains the Prisma `UPSERT` call for the model. We leverage upsert here so that seeds can potentially be ran more than once as your models and data expand over time.

**index.ts** export of functions for main seed file

### Relationships

In the event your model has a relationship dependency ie. Accounts, Organizations, etc. The prismaRunners are set to return a `Pick<Model, 'id'>` result for you to leverage in future seeds. The dependent runner would expand to take these parameters.

**User/Organization example:**

```ts
import { orgSeedData, seedOrganizations } from "./seeds/organizations";
import { userSeedData, seedUsers } from "./seeds/users";

const [{ id: orgId }] = await seedOrganizations(orgSeedData);
await seedUsers(userSeedData(orgId));
```

```ts
const initialDevUsers = (orgId: string): UserCreateInput[] => [
  {
    email: "john.doe@echobind.com",
    organization: { connect: { id: orgId } },
    // ...other create data
  },
];
```
