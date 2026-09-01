import { getInitialRoute } from "../index";

describe("IndexRoute", () => {
  it("does not redirect while authentication is hydrating", () => {
    expect(getInitialRoute(false, false)).toBeNull();
  });

  it("redirects unauthenticated users to login", () => {
    expect(getInitialRoute(true, false)).toBe("/login");
  });

  it("redirects authenticated users to tabs", () => {
    expect(getInitialRoute(true, true)).toBe("/(tabs)");
  });
});
