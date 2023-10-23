import { createRemixStub } from "@remix-run/testing";
import { test, describe, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import Login from "~/routes/_main._auth.login";
import { json, redirect } from "@remix-run/node";
import Index from "~/routes/_main._index";
import Layout from "~/routes/_main";

const LoginStub = createRemixStub([
  {
    Component: Layout,
    children: [
      {
        path: "/",
        index: true,
        Component: Index,
      },
    ],
  },

  {
    path: "/login",
    Component: Login,
    action: async ({ request }) => {
      const formData = await request.formData();
      if (
        formData.get("email") === "test@test.com" &&
        formData.get("password") === "password"
      ) {
        return redirect("/");
      }
      return json(
        {
          status: "error",
          submission: {
            intent: "submit",
            session: null,
            email: formData.get("email"),
            payload: { email: "test@Test.com" },
            error: { "": ["Invalid username or password"] },
          },
        },
        { status: 400 },
      );
    },
  },
]);

describe("LoginForm", () => {
  test("loads", async () => {
    render(<LoginStub />);

    userEvent.click(screen.getByText("Login"));
    await waitFor(() => screen.findByText("Welcome Back!"));
  });
  test("shows errors when password is invalid", async () => {
    render(<LoginStub initialEntries={["/login"]} />);

    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "pass");
    userEvent.click(screen.getByText("Log in"));

    await waitFor(() => screen.findByText("Password is too short"));
    expect(screen.getByLabelText("Password")).toBeInvalid();

    await userEvent.clear(screen.getByLabelText("Password"));
    await userEvent.type(screen.getByLabelText("Password"), "password");

    userEvent.click(screen.getByText("Email"));
    await waitFor(() => expect(screen.getByLabelText("Password")).toBeValid());
  });
  test("Routes to the homepage when login is successful", async () => {
    render(<LoginStub initialEntries={["/login"]} />);

    await userEvent.type(screen.getByLabelText("Email"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "notthepassword");
    userEvent.click(screen.getByText("Log in"));

    expect(
      await screen.findByText("Invalid username or password"),
    ).toBeDefined();

    await userEvent.clear(screen.getByLabelText("Password"));
    await userEvent.type(screen.getByLabelText("Password"), "password");
    userEvent.click(screen.getByText("Log in"));

    await waitFor(() => screen.findByText("welcomeMessage"));
  });
});
