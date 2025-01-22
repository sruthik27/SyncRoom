import MembersSidebar from "./MembersSidebar";
import { mount } from "cypress/react18";

describe("MembersSidebar", () => {
  let onRemoveMember;
  let playSound;
  let onClose;

  const usernames = ["Alice", "Bob", "Charlie"];
  const currentUser = "Alice";

  beforeEach(() => {
    onRemoveMember = cy.stub();
    playSound = cy.stub();
    onClose = cy.stub();

    cy.viewport(1280, 720); // Set viewport to desktop size
    mount(
      <MembersSidebar
        isOpen={true}
        onClose={onClose}
        usernames={usernames}
        currentUser={currentUser}
        isAdmin={true}
        onRemoveMember={onRemoveMember}
        playSound={playSound}
      />,
    );
  });

  it("should render the desktop sidebar", () => {
    cy.getByTestId("desktop-sidebar").should("exist");
  });

  it("should render the members list", () => {
    cy.getByTestId("members-list").should("exist");
    usernames.forEach((name) => {
      cy.getByTestId(`member-${name}`).should("exist");
    });
  });

  it("should render the current user with '(you)' label", () => {
    cy.getByTestId(`member-${currentUser}`).contains("(you)");
  });

  it("should handle remove member button click", () => {
    cy.getByTestId("remove-member-Bob").click();
    cy.wrap(onRemoveMember).should("have.been.calledWith", "Bob");
    cy.wrap(playSound).should("have.been.called");
  });

  it("should handle close button click", () => {
    cy.getByTestId("close-button").click();
    cy.wrap(onClose).should("have.been.called");
  });

  it("should render the mobile sheet on smaller screens", () => {
    cy.viewport(375, 667); // Set viewport to mobile size
    mount(
      <MembersSidebar
        isOpen={true}
        onClose={onClose}
        usernames={usernames}
        currentUser={currentUser}
        isAdmin={true}
        onRemoveMember={onRemoveMember}
        playSound={playSound}
      />,
    );
    cy.getByTestId("mobile-sheet-content").should("exist");
  });
});
