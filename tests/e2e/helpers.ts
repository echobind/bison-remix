import Chance from "chance";
import type { BrowserContext, Locator, Page } from "@playwright/test";
import { Role } from "@prisma/client";
import { UserFactory } from "../../prisma/factories";
import { commitSession, getSession } from "~/utils/session.server";
import playwrightConfig from "../../playwright.config";
import { authenticator } from "~/utils/auth.server";
import { parse } from "cookie";
const chance = new Chance();

export type SessionUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: Role[];
};

const generateSessionToken = async (user: SessionUser): Promise<string> => {
  const session = await getSession();
  session.set(authenticator.sessionKey, user);
  session.set(authenticator.sessionStrategyKey, "form");
  return await commitSession(session);
};

export async function clickNewPage(
  context: BrowserContext,
  // the locator that, when clicked, will open a new page
  clickableTarget: Locator,
): Promise<Page> {
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    // assume this opens the new tab
    clickableTarget.click(),
  ]);

  // the page doesn't seem to inherit the timeout from context, so setting it
  // here too
  newPage.setDefaultTimeout(playwrightConfig.timeout || 30000);
  newPage.setDefaultNavigationTimeout(playwrightConfig.timeout || 30000);

  await newPage.waitForLoadState();

  return newPage;
}

export async function uploadFile(
  page: Page,
  clickableTarget: Locator,
  filePath: string,
) {
  // Note that Promise.all prevents a race condition
  // between clicking and waiting for the file chooser.
  const [fileChooser] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    page.waitForEvent("filechooser"),
    // Opens the file chooser.
    clickableTarget.click(),
  ]);

  await fileChooser.setFiles(filePath);
}

export async function loginAs(page: Page, userInitial: Partial<SessionUser>) {
  const user = {
    email: chance.email(),
    firstName: chance.first(),
    lastName: chance.last(),
    roles: [Role.USER],
    ...userInitial,
  };

  const createArgs = {
    email: user.email,
    roles: user.roles,
    emailVerified: new Date().toISOString(),
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const userPrisma = await UserFactory.create(createArgs);

  const sessionToken = await generateSessionToken(userPrisma);

  const context = page.context();
  const cookie = parse(sessionToken);
  await context.addCookies([
    {
      name: "_session",
      value: cookie._session,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  return userPrisma;
}
