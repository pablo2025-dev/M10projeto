import js from "@eslint/js";

export default [
  js.configs.recommended,

  {
    files: ["server/**/*.js"],

    ignores: [
      "node_modules/**",
      "server/coverage/**",
      "server/logs/**",
      "server/data/**"
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",

        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly"
      }
    },

    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off"
    }
  }
];
