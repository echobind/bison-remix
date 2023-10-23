import { cssBundleHref } from "@remix-run/css-bundle";
import {
  json,
  type DataFunctionArgs,
  type LinksFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { Toaster } from "./components/ui/toaster";
import { authenticator } from "./utils/auth.server";
import { getEnv } from "./utils/env.server";
import { useEffect, type ReactNode } from "react";
import { GeneralErrorBoundary } from "./components/error-boundary";
import i18next from "./utils/i18next.server";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "./utils/i18n";
import { getToast } from "./utils/toast.server";
import { combineHeaders } from "./utils/misc";
import { useToast } from "./components/ui/use-toast";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: styles },
];

export async function loader({ request }: DataFunctionArgs) {
  const [user, locale, { toast, headers: toastHeaders }] = await Promise.all([
    authenticator.isAuthenticated(request),
    i18next.getLocale(request),
    getToast(request),
  ]);

  return json(
    {
      user,
      locale,
      ENV: getEnv(),
      toast,
    },
    { headers: combineHeaders(toastHeaders) },
  );
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "logout":
      await authenticator.logout(request, { redirectTo: "/" });
  }
  return {};
}

export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

function Document({
  children,
  env,
  locale,
  dir,
}: {
  children: ReactNode;
  env?: Record<string, string>;
  locale: string;
  dir: string;
}) {
  return (
    <html lang={locale} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  let { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(data.locale);

  return (
    <Document env={data.ENV} locale={data.locale} dir={i18n.dir()}>
      <div className="flex flex-col min-h-screen justify-between">
        <Outlet />
      </div>
      <SSRToaster toast={data.toast} />
    </Document>
  );
}

function SSRToaster({
  toast,
}: {
  toast: Awaited<ReturnType<typeof getToast>>["toast"];
}) {
  const { toast: showToast } = useToast();
  useEffect(() => {
    if (toast) {
      setTimeout(() => {
        showToast({ title: toast.title, description: toast.description });
      }, 0);
    }
  }, [toast, showToast]);
  return <Toaster />;
}

export function ErrorBoundary() {
  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document locale="en" dir="rtl">
      <GeneralErrorBoundary />
    </Document>
  );
}
