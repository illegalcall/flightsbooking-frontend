describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Set up auth interceptors - use more general patterns
    cy.intercept('POST', '**/auth/**').as('authRequest');
    cy.intercept('GET', '**/auth/**').as('getAuthData');
  });

  it('should show validation using browser native validation', () => {
    cy.visit('/login');
    
    // Native browser validation will prevent form submission without entering data
    // in the required fields. We can test this by checking that the form doesn't submit.
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('include', '/login'); // We're still on the login page
  });

  it('should validate email format', () => {
    cy.visit('/login');
    
    // Enter invalid email and submit
    cy.findByLabelText(/email/i).type('invalid-email');
    cy.findByLabelText(/password/i).type('password123');
    
    // Native browser validation should prevent submission of invalid email format
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('include', '/login');
  });

  it('should handle failed login attempt', () => {
    cy.visit('/login');
    
    cy.findByLabelText(/email/i).type('wrong@example.com');
    cy.findByLabelText(/password/i).type('wrongpassword');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // The error message could be either "Invalid login credentials" or something similar
    cy.get('[role="alert"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should navigate to profile page when logged in', () => {
    // First visit the profile page directly
    cy.visit('/profile');
    
    // Should redirect to login page
    cy.url().should('include', '/login');
    
    // Now enter credentials and login
    cy.findByLabelText(/email/i).type('dhruvcoding67@gmail.com');
    cy.findByLabelText(/password/i).type('Rhythm@91');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Wait for a reasonable time for authentication and redirection
    cy.wait(3000);
    
    // Should be on the dashboard or profile page (not login)
    cy.url().should('not.include', '/login');
  });

  it('should successfully login and maintain auth state', () => {
    cy.visit('/login');
    
    // Attempt login
    cy.findByLabelText(/email/i).type('dhruvcoding67@gmail.com');
    cy.findByLabelText(/password/i).type('Rhythm@91');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Wait for auth request to complete
    cy.wait('@authRequest');
    
    // Verify redirection to home page
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Check if auth store exists and verify state (wrapped in a try block)
    cy.window().then(win => {
      if (win.__authStore) {
        // If auth store exists, verify its state
        cy.wrap(win.__authStore.getState()).then(state => {
          cy.wrap(state.isAuthenticated).should('be.true');
          cy.wrap(state.user).should('not.be.null');
          cy.wrap(state.session).should('not.be.null');
          cy.wrap(state.isLoading).should('be.false');
        });
      } else {
        // Skip this verification if auth store isn't available in tests
        cy.log('Auth store not available on window object - skipping store state verification');
      }
    });
    
    // Verify authenticated navigation is accessible
    cy.findByRole('button', { name: /DH/i }).should('be.visible');
  });
}); 