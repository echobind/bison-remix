import { render } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";

export function renderSimpleRemixStub(Component: React.ComponentType) {
  const RemixStub = createRemixStub([{ Component, id: "index", path: "/" }]);

  return render(<RemixStub />);
}
