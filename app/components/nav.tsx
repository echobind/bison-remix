import { Icon } from "./ui/icon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Link } from "@remix-run/react";

export function Nav() {
  return (
    <>
      <NavigationMenu className="sm:hidden block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Icon name="menu" />
              <span className="sr-only">Menu</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink asChild>
                <Link to="/">Link 1</Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/">Link 2</Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/">Link 3</Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a href="https://github.com/echobind">Link 3</a>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <nav className="hidden sm:flex ml-auto items-center text-base gap-8">
        <Link to="/">Link 1</Link>

        <Link to="/#features">Link 2</Link>
        <Link to="/#tech">Link 3</Link>
        <a href="https://github.com/echobind/">External</a>
      </nav>
    </>
  );
}
