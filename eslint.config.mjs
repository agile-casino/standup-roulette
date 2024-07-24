import eslint from "@eslint/js";
import love from "eslint-config-love";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

const config = tseslint.config(
    love,
    tseslint.configs.eslintRecommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    sonarjs.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            }
        }
    }
);

export default config;
