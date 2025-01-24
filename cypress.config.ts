const { defineConfig } = require("cypress");
const { chromium } = require("playwright");

let browserInstance = null;

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
  },
});
