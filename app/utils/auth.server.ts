import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "./db.server";

export let authenticator = new Authenticator<Omit<User, "password">>(
  sessionStorage,
);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    // Here you can use `form` to access and input values from the form.
    // and also use `context` to access more things from the server
    let email = form.get("email");
    let password = form.get("password");
    let firstName = form.get("firstName");
    let lastName = form.get("lastName");

    // You can validate the inputs however you want
    invariant(typeof email === "string", "username must be a string");
    invariant(email.length > 0, "username must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");

    // And finally, you can find, or create, the user
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      invariant(typeof firstName === "string", "firstName must be a string");
      invariant(typeof lastName === "string", "lastName must be a string");
      // And if you have a password you should hash it
      let hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          roles: ["USER"],
        },
      });
    } else {
      if (!(await bcrypt.compare(password, user.password || ""))) {
        throw new Error("Invalid password");
      }
    }

    user.password = null;
    // And return the user as the Authenticator expects it
    return user as any;
  }),
  "form",
);
