const index = require("./index");

test("that index returns hello world", () => {
  expect(index()).toBe("hello world");
});
