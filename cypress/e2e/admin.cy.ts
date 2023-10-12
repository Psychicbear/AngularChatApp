Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/login')
    cy.get('[data-testid=l-email]').type(email)
    cy.get('[data-testid=l-pass]').type(password)
    cy.get('[data-testid=l-submit]').click()
  
    cy.get('title').should('contain', 'Dashboard')
})

describe('Admin interaction test', () => {
    beforeEach(() => {
        cy.login('bob@.com.au', 'password123')
    })
})