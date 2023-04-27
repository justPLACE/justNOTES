import { getPathString } from "./path";

it("Gets path string", () => {
  const pathString = (() => getPathString())();
  expect(pathString).toBe("functions".substring("/api/".length - 1));
});
