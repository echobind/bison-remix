import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="max-w-sm mx-auto rounded-xl sm:shadow-md dark:sm:shadow-slate-600 p-8">
      <Outlet />
    </div>
  );
}
