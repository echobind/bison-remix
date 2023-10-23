import {
  type DataFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";

import { PasswordField } from "~/components/PasswordField";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { z } from "zod";
import { ErrorList } from "~/components/ui/error-list";
import { useIsPending } from "~/utils/misc";
import { StatusButton } from "~/components/ui/status-button";
import { authenticator } from "~/utils/auth.server";
import { redirectWithToast } from "~/utils/toast.server";
import { sessionStorage } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "Login" }];
};

const LoginFormSchema = z.object({
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
});

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: (intent) =>
      // We add the transform to the schema so we can validate the login
      // as part of the schema parsing process and return errors to the client
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, session: null };
        try {
          var session = await authenticator.authenticate("form", request, {
            context: { formData },
            throwOnError: true,
          });
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true,
  });
  // get the password off the payload that's sent back
  delete submission.payload.password;

  if (submission.intent !== "submit") {
    // @ts-expect-error - conform should probably have support for doing this
    delete submission.value?.password;
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.session) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  // Valid submission, redirect the user
  // Reimplement the session setting behavior of Remix-Auth so we can redirect with toast
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set(authenticator.sessionKey, submission.value.session);
  session.set(authenticator.sessionStrategyKey, "form");

  return redirectWithToast(
    "/",
    { description: "Welcome!" },
    {
      headers: {
        "set-cookie": await sessionStorage.commitSession(session),
      },
    },
  );
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Form method="post" className="flex flex-col gap-6" {...form.props}>
      <div className="flex flex-col justify-center mb-4">
        <div className="w-16 h-16 bg-gray-300 text-white self-center rounded-full" />

        <h2 className="text-lg text-center mt-2">Welcome Back!</h2>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <Label htmlFor="login-form-email">Email</Label>
          <Input
            type="email"
            {...conform.input(fields.email)}
            autoFocus
            className="lowercase"
            isInvalid={!!fields.email.errors?.length}
          />
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields.email.errors?.length ? (
              <ErrorList errors={fields.email.errors} />
            ) : null}
          </div>
        </div>
        <PasswordField
          label="Password"
          {...conform.input(fields.password)}
          isInvalid={!!fields.password.errors?.length}
        >
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            {fields.password.errors?.length ? (
              <ErrorList errors={fields.password.errors} />
            ) : null}
          </div>{" "}
        </PasswordField>
      </div>
      <div className="flex justify-between">
        <Link to="/reset-password">Forgot password?</Link>
      </div>
      <div className="flex gap-6 flex-col">
        <StatusButton
          className="w-full"
          status={isPending ? "pending" : actionData?.status ?? "idle"}
          type="submit"
          disabled={isPending}
        >
          Log in
        </StatusButton>
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>
      <div className="flex justify-center mt-8">
        <span className="text-slate-500">
          New User? <Link to="/signup">Create an account</Link>
        </span>
      </div>
    </Form>
  );
}
