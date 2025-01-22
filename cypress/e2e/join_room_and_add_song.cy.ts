// cypress/e2e/room-flow.cy.ts
import "../support/commands.ts";

function generateRandom6DigitNumber(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

describe("Room Creation and Joining Flow", () => {
  const roomId = generateRandom6DigitNumber();

  before(() => {
    // Launch external browser and create room
    cy.task("launchBrowser", {
      url: Cypress.config().baseUrl,
      roomId: roomId,
    });

    // Give time for the room to be properly created
    cy.wait(2000);
  });

  after(function () {
    // Wrap the cleanup in a try-catch
    try {
      cy.task("closeBrowser", null, { timeout: 10000 });
    } catch (error) {
      console.log("Error during cleanup:", error);
    }
  });

  it("should join the created room", () => {
    // Join room in Cypress
    cy.visit("/");
    cy.getByTestId("join-room-button").click();
    cy.getByTestId("room-name-input").type(String(roomId));
    cy.getByTestId("submit-room-button").click();
    cy.getByTestId("name-input").type("validName2");
    cy.getByTestId("submit-name-button").click();

    // Verify join was successful
    cy.getByTestId("join-room-card").should("not.exist");

    // Add a song
    cy.getByTestId("search-input").type("Blue");
    cy.intercept(
      "GET",
      "https://d6nsmmp64k.execute-api.ap-south-1.amazonaws.com/default/YouTubeSearcher?songName=Blue",
    ).as("getSearchResults");
    cy.wait("@getSearchResults");

    // Wait for search results to load
    cy.getByTestId("search-result").should("have.length.greaterThan", 1);

    // Click the add button on the second song
    cy.getByTestId("search-result")
      .eq(1)
      .within(() => {
        cy.getByTestId("add-button").click();
      });
    //
    // Verify the song is added to the playlist
    cy.getByTestId("playlist").within(() => {
      cy.getByTestId("playlist-item-0").should("exist");
    });
  });
});
