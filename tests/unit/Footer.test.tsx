import { expect, test } from "vitest";
import { Footer } from "~/components/footer";
import { renderSimpleRemixStub } from "../utils";

test("Properly renders the Footer component", () => {
  const element = renderSimpleRemixStub(Footer);
  expect(element.queryByText("Echobind")).toBeDefined();
});
