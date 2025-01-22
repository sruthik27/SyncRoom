// cypress/support/index.ts
import "../support/commands.ts";
// cypress/e2e/roomform.cy.ts
describe("Room Form Validation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getByTestId("create-room-button").click();
  });

  it("should enable submit button for valid room names", () => {
    cy.getByTestId("room-name-input").type("validName");
    cy.getByTestId("submit-room-button").should("not.be.disabled");
  });

  it("should disable submit button for empty room name", () => {
    cy.getByTestId("room-name-input").type("validName");
    cy.getByTestId("room-name-input").clear();
    cy.getByTestId("submit-room-button").should("be.disabled");
    cy.getByTestId("error-message").should(
      "contain",
      "Room Name cannot be empty or just spaces.",
    );
  });

  it("should disable submit button for room name with spaces", () => {
    cy.getByTestId("room-name-input").type("invalid name");
    cy.getByTestId("submit-room-button").should("be.disabled");
    cy.getByTestId("error-message").should(
      "contain",
      "Room Name cannot contain spaces.",
    );
  });

  it("should disable submit button for room name longer than 10 characters", () => {
    cy.getByTestId("room-name-input").type("longroomname");
    cy.getByTestId("submit-room-button").should("be.disabled");
    cy.getByTestId("error-message").should(
      "contain",
      "Room Name must be less than 10 characters.",
    );
  });

  it("should generate a random room ID when the icon button is clicked", () => {
    cy.getByTestId("generate-room-id-button").click();
    cy.getByTestId("room-name-input").invoke("val").should("not.be.empty");
  });

  it("should disable the random generator icon button while generating", () => {
    cy.getByTestId("generate-room-id-button").click();
    cy.getByTestId("generate-room-id-button").should("be.disabled");
  });

  it("should navigate back when the go back button is clicked", () => {
    cy.getByTestId("go-back-button").click();
    cy.getByTestId("create-room-card").should("not.exist");
  });
});
