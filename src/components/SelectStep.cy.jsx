import SelectStep from "./SelectStep";
import { mount } from "cypress/react18";

describe("SelectStep", () => {
  let onSelect;
  let setIsCreatingRoom;
  const fadeIn = { initial: "hidden", animate: "visible" };

  beforeEach(() => {
    onSelect = cy.stub();
    setIsCreatingRoom = cy.stub();

    mount(
      <SelectStep
        onSelect={onSelect}
        fadeIn={fadeIn}
        setIsCreatingRoom={setIsCreatingRoom}
      />,
    );
  });

  it("should render the container", () => {
    cy.getByTestId("select-container").should("exist");
  });

  it("should render the title with correct text", () => {
    cy.getByTestId("select-title").should("exist").contains("Sync Room");
  });

  it("should render the background decoration", () => {
    cy.getByTestId("background-decoration").should("exist");
  });

  it("should render the card with header and content", () => {
    cy.getByTestId("select-card").should("exist");
    cy.getByTestId("card-header").should("exist");
    cy.getByTestId("card-title").should("exist").contains("🎶");
    cy.getByTestId("card-description")
      .should("exist")
      .contains("Your gateway to collaborative music");
    cy.getByTestId("card-content").should("exist");
  });

  it("should render the join room button and handle click", () => {
    cy.getByTestId("join-room-button").should("exist").click();
    cy.wrap(onSelect).should("have.been.calledWith", "join");
    cy.wrap(setIsCreatingRoom).should("have.been.calledWith", false);
  });

  it("should render the create room button and handle click", () => {
    cy.getByTestId("create-room-button").should("exist").click();
    cy.wrap(onSelect).should("have.been.calledWith", "create");
    cy.wrap(setIsCreatingRoom).should("have.been.calledWith", true);
  });

  it("should render the decorative waves", () => {
    cy.getByTestId("decorative-waves").should("exist");
  });

  it("should handle hover states for buttons", () => {
    cy.getByTestId("join-room-button").trigger("mouseover");
    cy.getByTestId("join-room-button").should(
      "have.class",
      "border-purple-500 shadow-lg",
    );
    cy.getByTestId("join-room-button").trigger("mouseout");
    cy.getByTestId("join-room-button").should(
      "not.have.class",
      "border-purple-500 shadow-lg",
    );

    cy.getByTestId("create-room-button").trigger("mouseover");
    cy.getByTestId("create-room-button").should(
      "have.class",
      "border-purple-500 shadow-lg",
    );
    cy.getByTestId("create-room-button").trigger("mouseout");
    cy.getByTestId("create-room-button").should(
      "not.have.class",
      "border-purple-500 shadow-lg",
    );
  });
});
