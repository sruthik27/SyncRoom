import InfoPopup from "./InfoPopup";
import { mount } from "cypress/react";

describe("InfoPopup", () => {
  let onClose;

  beforeEach(() => {
    onClose = cy.stub();

    mount(<InfoPopup onClose={onClose} />);
  });

  it("should render the InfoPopup component", () => {
    cy.getByTestId("info-popup").should("exist");
  });

  it("should render the title with correct text", () => {
    cy.getByTestId("popup-title").should("exist").contains("About This App");
  });

  it("should render the app description", () => {
    cy.getByTestId("app-description").should("exist");
  });

  it("should render the limitations list", () => {
    cy.getByTestId("limitations-list")
      .should("exist")
      .within(() => {
        cy.get("li").should("have.length", 7);
      });
  });

  it("should render the feedback title", () => {
    cy.getByTestId("feedback-title").should("exist").contains("Feedback");
  });

  it("should render the feedback form", () => {
    cy.getByTestId("feedback-form").should("exist");
  });

  it("should handle form submission with valid data", () => {
    cy.intercept(
      "POST",
      "https://owdylz7uw1.execute-api.ap-south-1.amazonaws.com/v1/sendfeedback",
      {
        statusCode: 200,
        body: { message: "Feedback submitted successfully!" },
      },
    ).as("submitFeedback");

    cy.getByTestId("email-input").type("test@example.com");
    cy.getByTestId("feedback-input").type("Great app!");
    cy.getByTestId("submit-button").click();

    cy.wait("@submitFeedback");
    cy.getByTestId("submission-message")
      .should("exist")
      .contains("Feedback submitted successfully");
  });

  it("should show error message for invalid email", () => {
    cy.getByTestId("email-input").type("invalid-email");
    cy.getByTestId("submit-button").click();
    cy.getByTestId("email-error")
      .should("exist")
      .contains("Invalid email format");
  });

  it("should close the popup when the close button is clicked", () => {
    cy.getByTestId("close-button").click();
    cy.wrap(onClose).should("have.been.called");
  });

  it("should close the popup when clicking outside the content", () => {
    cy.getByTestId("info-popup-overlay").click("topLeft");
    cy.wrap(onClose).should("have.been.called");
  });
});
