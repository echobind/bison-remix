import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useOptionalUser } from "~/utils/user";

export const meta: MetaFunction = () => {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to Bison Remix!" },
  ];
};

export default function Index() {
  const { t } = useTranslation();
  const user = useOptionalUser();
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-3xl font-bold" data-testid="welcome-header">
        {t("welcomeMessage", { firstName: user?.firstName || "Guest" })}
      </h1>
    </div>
  );
}
