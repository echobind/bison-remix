import { Form, Link, Outlet } from "@remix-run/react";
import { Nav } from "~/components/nav";
import { Footer } from "~/components/footer";
import { Logo } from "~/components/logo";
import { Button, buttonVariants } from "~/components/ui/button";
import { useOptionalUser } from "~/utils/user";

export default function Layout() {
  const user = useOptionalUser();
  return (
    <div className="flex flex-col min-h-screen w-full">
      <>
        <div className="flex p-4">
          <Logo />
          <div className="flex-1" />
          {user ? (
            <>
              <Nav />

              <Form method="post" action="/">
                <Button
                  variant="outline"
                  className="ml-16"
                  name="intent"
                  value="logout"
                >
                  Logout
                </Button>
              </Form>
            </>
          ) : (
            <Link
              className={buttonVariants({ variant: "outline" })}
              to="/login"
            >
              Login
            </Link>
          )}
        </div>
      </>

      <div className="flex-1 mt-8">
        <div className="w-full max-w-7xl my-4 lg:my-16 lg:mx-auto">
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
}
