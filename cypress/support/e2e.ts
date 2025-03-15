import '@testing-library/cypress/add-commands';

// Cypress custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      waitForLoadingToComplete(): Chainable<void>;
    }
  }
}

// Custom command to wait for loading indicators to disappear
Cypress.Commands.add('waitForLoadingToComplete', () => {
  // Check for loading spinner/indicator if present, otherwise continue
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="loading"]').length) {
      cy.get('[data-testid="loading"]').should('not.exist');
    }
  });
});

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /sign in/i }).click();
  
  // Wait for redirect (timeout: increased for reliability)
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  // Find and click the logout button (adjust selector as needed)
  cy.findByRole('button', { name: /logout/i }).click();
  
  // Wait for redirect to login
  cy.url({ timeout: 5000 }).should('include', '/login');
}); 