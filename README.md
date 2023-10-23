# Bison Remix

## Clone this starter

```bash
npx create-remix@latest ./my-app --template echobind/bison-remix
```

## What's Inside?

- Built with [Remix](https://remix.run)
- Database with Postgres and [Prisma](https://www.prisma.io)
- Styled with [Tailwind](https://tailwindcss.com)
- Components from [shadcn/ui](https://ui.shadcn.com) and built with [Radix](https://www.radix-ui.com/primitives)
- Icons from [Sly](https://sly-cli.fly.dev)
- Forms validated with [Conform](https://conform.guide) and [Zod](https://zod.dev)
- Auth with [remix-auth](https://github.com/sergiodxa/remix-auth)
- i18n with [remix-i18next](https://github.com/sergiodxa/remix-i18next)
- Testing with [Vitest](https://vitest.dev), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), and [Playwright](https://playwright.dev)
- Built with Typescript, eslint, and Prettier

## Getting Started Tutorial

This checklist and mini-tutorial will make sure you make the most of your shiny new Bison Remix app.

## Migrate your database and start the dev server

- [ ] Run `npm run setup:dev` to prep and migrate your local database, as well as
      generate the prisma client. If this fails, make sure you have Postgres running and
      the generated `DATABASE_URL` values are correct in your `.env` files.
- [ ] Run `npm run dev` to start your development server

## Complete a Bison workflow

While not a requirement, Bison works best when you start development with the database and API layer.
We will illustrate how to use this by adding the concept of an organization to our app.
The workflow below assumes you already have `npm run dev` running.

### The Database

Bison uses Prisma for database operations. We've added a few conveniences around the default Prisma
setup, but if you're familiar with Prisma, you're familiar with databases in Bison.

- [ ] Define an Organization table in `prisma/schema.prisma`.

We suggest copying the `id`, `createdAt` and `updatedAt` fields from the `User` model.

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

If you use VSCode and have the [Prisma extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
installed, saving the file should automatically add the inverse relationship to the `User` model!

```prisma
model User {
  id             String        @id @default(cuid())
  email          String        @unique
  password       String
  roles          Role[]
  profile        Profile?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?
}
```

- [ ] Generate a migration with `npm run db:migrate`.

You should see a new folder in `prisma/migrations` and the migration should have been performed.

For more on Prisma, [view the docs](https://www.prisma.io/docs/).

### Add a Frontend page and form that creates an organization

Now that we have the API finished, we can move to the frontend changes.

- [ ] Create a new route to create organizations in `app/routes/_main.organization.create.tsx`
- [ ] Create an `OrganizationForm` route component.
- [ ] Add a simple form with a name input. See the [Conform docs](https://conform.guide)
      for detailed information.

We'll use [zod](https://github.com/colinhacks/zod) to ensure type safety form inputs.

```tsx
// app/routes/_main.organization.create.tsx
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { Form, useActionData } from "@remix-run/react";
import { useIsPending } from "~/utils/misc";
import { ErrorList } from "~/components/ui/error-list";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { StatusButton } from "~/components/ui/status-button";

const OrganizationFormSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name is too short" })
    .max(100, { message: "Name is too long" }),
});

export default function OrganizationForm() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "organization-form",
    constraint: getFieldsetConstraint(OrganizationFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: OrganizationFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Form method="post" className="flex flex-col gap-6" {...form.props}>
      <div>
        <Label htmlFor="organization-form-name">Name</Label>
        <Input
          {...conform.input(fields.name)}
          autoFocus
          isInvalid={!!fields.name.errors?.length}
        />
        <div className="min-h-[32px] px-4 pb-3 pt-1">
          {fields.name.errors?.length ? (
            <ErrorList errors={fields.name.errors} />
          ) : null}
        </div>
      </div>
      <StatusButton
        className="w-full"
        status={isPending ? "pending" : actionData?.status ?? "idle"}
        type="submit"
        disabled={isPending}
      >
        Create
      </StatusButton>
      <ErrorList errors={form.errors} id={form.errorId} />
    </Form>
  );
}
```

- [ ] Add a loader to make sure the user is authenticated.

```tsx
// app/routes/_main.organization.create.tsx
import { authenticator } from "~/utils/auth.server";

// ...

export async function loader({ request }: DataFunctionArgs) {
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  return {};
}

// ...
```

- [ ] Add an action to perform validation and create the organization;

```tsx
// app/routes/_main.organization.create.tsx
import { DataFunctionArgs, json, redirect } from "@remix-run/node";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";

// ...

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: OrganizationFormSchema,
  });

  if (!submission.value || submission.intent !== "submit") {
    return json({ status: "error", submission } as const);
  }

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const org = await prisma.organization.create({
    data: {
      name: submission.value.name,
      users: { connect: [{ id: user.id }] },
    },
    select: { id: true },
  });

  return redirect(`/organization/${org.id}`);
}

// ...
```

You should now have a fully working form that creates a new database entry on submit!

### Adding a new page that shows the organization

- [ ] Generate a new route `app/routes/_main.organization.$id.tsx`.
- [ ] Create a loader to display the organization.
- [ ] Render the loader data to the component.
- [ ] Add an error boundary to handle the not found and error cases.

```tsx
// app/routes/_main.organization.$id.tsx
import {
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { DataFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function loader({ params }: DataFunctionArgs) {
  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) throw new Response("Not Found", { status: 404 });

  return json({ organization });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `An organization named ${data?.organization.name}` }];
};

export default function OrganizationPage() {
  const { organization } = useLoaderData<typeof loader>();
  return <span>Awesome! {organization.name}</span>;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
```

## Congrats

Outside of e2e tests, you've used just about every feature in Bison. But don't worry.
We've got your back there too.

Bonus:

- [ ] View the login and logout e2e tests
