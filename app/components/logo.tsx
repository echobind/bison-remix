import { Link } from "@remix-run/react";

export function Logo() {
  return (
    <Link to="/">
      <span className="text-2xl font-bold text-gray-900">MyApp</span>
    </Link>
  );
}
