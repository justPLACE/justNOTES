export const getPathString = () => {
  const stack = new Error()
    .stack!.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("at "));
  const [thisPath, otherPath] = [stack[1], stack[2]].map((s) => {
    const i1 = s.indexOf("(");
    const i2 = s.indexOf(":", i1 + "webpack://".length);
    return s.substring(i1 > -1 ? i1 + 1 : "at ".length, i2).replace(/\\/g, "/");
  });
  return otherPath.substring(
    thisPath.lastIndexOf("/", thisPath.lastIndexOf("/") - 1) + "/api/".length,
    otherPath.lastIndexOf("/")
  );
};
