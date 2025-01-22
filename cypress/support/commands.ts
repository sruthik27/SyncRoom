/// <reference types="cypress" />
Cypress.Commands.add("getByTestId", (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(dataTestId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
