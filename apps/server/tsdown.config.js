const { defineConfig } = require("tsdown");

module.exports = defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  clean: true,
  dts: false,
});
