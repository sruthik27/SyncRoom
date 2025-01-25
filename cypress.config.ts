import { defineConfig } from "cypress";
import { chromium } from "playwright";

let browserInstance: any = null;
const isCI = process.env.CI === "true";

export default defineConfig({
  e2e: isCI
    ? {}
    : {
        baseUrl: "http://localhost:5173",
        supportFile: false,
        experimentalRunAllSpecs: true,
        experimentalModifyObstructiveThirdPartyCode: true,
        chromeWebSecurity: false,
        defaultCommandTimeout: 10000,
        pageLoadTimeout: 100000,
        setupNodeEvents(on, config) {
          // Tasks to manage the external browser
          on("task", {
            async launchBrowser({
              url,
              roomId,
            }: {
              url: string;
              roomId: string;
            }) {
              // Launch a persistent browser with playwright
              browserInstance = await chromium.launch({ headless: false });
              const context = await browserInstance.newContext();
              const page = await context.newPage();

              // Navigate and create room
              await page.goto(url);
              await page.click('[data-testid="create-room-button"]');
              await page.fill(
                '[data-testid="room-name-input"]',
                String(roomId),
              );
              await page.click('[data-testid="submit-room-button"]');
              await page.fill('[data-testid="name-input"]', "validName1");
              await page.click('[data-testid="submit-name-button"]');
              return null;
            },
            async closeBrowser() {
              try {
                if (browserInstance) {
                  await browserInstance.close();
                  browserInstance = null;
                }
              } catch (error) {
                console.log("Error closing browser:", error);
              }
              return null;
            },
          });
        },
      },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "src/components/**/*.cy.{js,jsx,ts,tsx}",
  },
});
