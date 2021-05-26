module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    browser: true,
  },
  extends: ["eslint:recommended", "airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // https://eslint.org/docs/rules/max-len
    "max-len": ["error", { code: 90, ignoreComments: true, ignoreUrls: true }],
    "linebreak-style": ["error", "unix"],
    "no-inline-comments": 1,
    "no-console": 1,
    eqeqeq: ["error", "always"],
  },
};
