import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // anyの使用を許可
      "@typescript-eslint/no-empty-object-type": "off", // 空のオブジェクト型を許可
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": "off", // consoleの使用を完全に許可
    },
    ignores: ["node_modules/**", "dist/**", "build/**"],
  },
);
