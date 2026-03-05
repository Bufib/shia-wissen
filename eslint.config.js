// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);

// const { defineConfig } = require("eslint/config");
// const expoConfig = require("eslint-config-expo/flat");

// module.exports = defineConfig([
//   expoConfig,
//   {
//     ignores: ["dist/*"],
//   },
//   {
//     rules: {
//       "react-hooks/exhaustive-deps": "warn",
//       "react-hooks/rules-of-hooks": "error",
//     },
//   },
// ]);
