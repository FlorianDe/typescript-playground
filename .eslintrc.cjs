/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        semi: true,
        singleQuote: false,
        trailingComma: "all",
        printWidth: 120,
        tabWidth: 2,
      },
    ],
    "@typescript-eslint/no-unused-vars": "warn",
  },
  overrides: [
    {
      files: ["vite.config.ts", "vite.config.*.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
