import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import perfectionist from "eslint-plugin-perfectionist";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";
import cspell from "@cspell/eslint-plugin/configs";

const config = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: true,
    jsx: true
  }),
  perfectionist.configs["recommended-natural"],
  sonarjs.configs.recommended,
  cspell.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    rules: {
      "@cspell/spellchecker": ["warn", {}],
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/operator-linebreak": ["error", "before", { overrides: { "=": "after" } }],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "perfectionist/sort-imports": [
        "error",
        {
          ...perfectionist.configs["recommended-natural"].rules["perfectionist/sort-imports"][1],
          newlinesBetween: "never",
          groups: [
            "type",
            ["builtin", "external"],
            "internal-type",
            "internal",
            ["parent-type", "sibling-type", "index-type"],
            ["parent", "sibling", "index"],
            "object",
            "unknown",
            "style"
          ],
          customGroups: {
            value: {
              style: ["*.css"]
            }
          }
        }
      ],
      "perfectionist/sort-interfaces": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-objects": "off",
      "perfectionist/sort-union-types": [
        "error",
        {
          ...perfectionist.configs["recommended-natural"].rules["perfectionist/sort-union-types"][1],
          groups: [
            [
              "conditional",
              "function",
              "import",
              "intersection",
              "keyword",
              "literal",
              "named",
              "object",
              "operator",
              "tuple",
              "union",
              "unknown"
            ],
            "nullish"
          ]
        }
      ]
    }
  }
);

export default config;
