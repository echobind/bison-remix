import { expect, test } from "vitest";
import { Nav } from "~/components/nav";
import { renderSimpleRemixStub } from "../utils";

test("Properly renders the Nav component", () => {
  const element = renderSimpleRemixStub(Nav);
  expect(element).toBeDefined();
});
