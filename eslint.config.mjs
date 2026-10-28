import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/**
 * React Compiler rules enabled as errors by eslint-plugin-react-hooks 6.
 * They flag pre-existing patterns in the vendored design system (theme
 * hydration gates). Refactoring changes runtime behaviour, so they are
 * warnings until each component is migrated; they must not block CI.
 */
const reactCompilerDebtRules = {
  "react-hooks/set-state-in-effect": "warn",
  "react-hooks/refs": "warn",
  "react-hooks/purity": "warn",
  "react-hooks/immutability": "warn",
  "react-hooks/exhaustive-deps": "warn",
};

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: reactCompilerDebtRules,
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "next-env.d.ts",
    ],
  },
];
