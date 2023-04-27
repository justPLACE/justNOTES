module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/(?!(api/))**/*test.js"],
  coverageReporters: [],
  resolver: require.resolve("jest-pnp-resolver"),
  watchPlugins: ["./tests/watchplugin.js"],
};
