import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { z } from "zod";
import { PasswordField } from "~/components/PasswordField";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";
import { authenticator } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { useIsPending } from "~/utils/misc";
import { sessionStorage } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

const SignUpFormSchema = z
  .object({
    firstName: z
      .string({ required_error: "First Name is required" })
      .min(3, { message: "First Name is too short" })
      .max(100, { message: "First Name is too long" }),
    lastName: z
      .string({ required_error: "Last Name is required" })
      .min(3, { message: "Last Name is too short" })
      .max(100, { message: "Last Name is too long" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Email is invalid" })
      .min(3, { message: "Email is too short" })
      .max(100, { message: "Email is too long" })
      // users can type the email in any case, but we store it in lowercase
      .transform((value) => value.toLowerCase()),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password is too short" })
      .max(100, { message: "Password is too long" }),
    confirmPassword: z
      .string({ required_error: "Password is required" })
      .min(6, { message: "Password is too short" })
      .max(100, { message: "Password is too long" }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: SignUpFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });
        return;
      }
    }),
    async: true,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  try {
    const user = await authenticator.authenticate("form", request, {
      context: { formData },
      throwOnError: true,
    });

    // Valid submission, redirect the user
    // Reimplement the session setting behavior of Remix-Auth so we can redirect with toast
    let session = await sessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.set(authenticator.sessionKey, user);
    session.set(authenticator.sessionStrategyKey, "form");

    return redirectWithToast(
      "/",
      { description: "Your account has been created!" },
      {
        headers: {
          "set-cookie": await sessionStorage.commitSession(session),
        },
      },
    );
  } catch (error) {
    return json({ status: "error", submission } as const, { status: 400 });
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getFieldsetConstraint(SignUpFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignUpFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Form className="flex flex-col gap-6" method="post" {...form.props}>
      <div className="flex flex-col justify-center mb-4">
        <div className="w-16 h-16 bg-gray-300 text-white self-center rounded-full" />

        <h2 className="text-lg text-center mt-2"> Create an account.</h2>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            autoFocus
            isInvalid={!!fields.firstName.errors?.length}
            {...conform.input(fields.firstName)}
          />
          {fields.firstName.errors?.length ? (
            <ErrorList errors={fields.firstName.errors} />
          ) : null}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            isInvalid={!!fields.lastName.errors?.length}
            {...conform.input(fields.lastName)}
          />
          {fields.lastName.errors?.length ? (
            <ErrorList errors={fields.lastName.errors} />
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            data-testid="login-email"
            {...conform.input(fields.email)}
            className="lowercase"
            isInvalid={!!fields.email.errors?.length}
          />
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields.email.errors?.length ? (
              <ErrorList errors={fields.email.errors} />
            ) : null}
          </div>{" "}
        </div>
        <PasswordField
          id="password"
          label="Password"
          isInvalid={!!fields.password.errors?.length}
          autoComplete="new-password"
          {...conform.input(fields.password)}
        >
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields.password.errors?.length ? (
              <ErrorList errors={fields.password.errors} />
            ) : null}
          </div>
        </PasswordField>
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          autoComplete="new-password"
          isInvalid={!!fields.confirmPassword.errors}
          {...conform.input(fields.confirmPassword)}
        >
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields.confirmPassword.errors?.length ? (
              <ErrorList errors={fields.confirmPassword.errors} />
            ) : null}
          </div>
        </PasswordField>
      </div>

      <div className="flex gap-6 flex-col">
        <StatusButton
          className="w-full"
          status={isPending ? "pending" : actionData?.status ?? "idle"}
          type="submit"
          disabled={isPending}
        >
          Create Account
        </StatusButton>
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>

      <div className="flex justify-center mt-8">
        <span className="text-slate-500">
          Have an account? <Link to="/login">Log In</Link>
        </span>
      </div>
    </Form>
  );
}
