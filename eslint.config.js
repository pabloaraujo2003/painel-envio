import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  // Base config for all JS/JSX files
  pluginJs.configs.recommended,

  // Config for React files
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: pluginReact,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...(pluginReact.configs.recommended ? pluginReact.configs.recommended.rules : {}),
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": "warn",
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^[A-Z_]" }]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },

  // Config for Node.js files
  {
    files: ["server/**/*.js", "*.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
        "no-unused-vars": ["warn", { "varsIgnorePattern": "^[A-Z_]" }]
    }
  },
];
