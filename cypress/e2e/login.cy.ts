describe('Authentication', () => {
    beforeEach(() => {
        cy.clearAllLocalStorage()
        cy.clearAllSessionStorage()
        cy.visit('/login')
    })

    it('Access site before authentication', () => {
        cy.visit('/account')
        cy.url().should('include', '/login')

        cy.visit('/')
        cy.url().should('include', '/login')
    })

    it('Entering invalid username or password', () => {
        cy.get('[data-testid=l-email').type('bob@.com.au')
        cy.get('[data-testid=l-pass').type('wrongpass')
        cy.get('[data-testid=l-submit').click()

        cy.get('[data-testid=error-msg').should('include', 'Invalid login')
    })
})