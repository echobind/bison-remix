import { expect, test } from "vitest";
import { Logo } from "~/components/logo";
import { renderSimpleRemixStub } from "../utils";

test("Properly renders the Logo component", () => {
  const element = renderSimpleRemixStub(Logo);
  expect(element).toBeDefined();
  expect(element.queryByText("MyApp")).toBeDefined();
});
