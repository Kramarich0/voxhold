import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,

  {
    files: ["**/*"],
    rules: {
      "fsd/forbidden-imports": "error",
      "fsd/no-cross-imports": "error",
      "fsd/no-higher-level-imports": "error",
      "fsd/segments-by-purpose": "error",
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
      "fsd/insignificant-slice": "off",
      "fsd/shared-lib-grouping": "off",
    },
  },

  {
    files: ["src/entities/**", "src/features/**", "src/widgets/**"],
    rules: {
      "fsd/import-locality": "error",
    },
  },

  {
    files: ["src/shared/**"],
    rules: {
      "fsd/import-locality": "off",
    },
  },
]);
