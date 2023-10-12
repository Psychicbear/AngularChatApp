describe('Authentication', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('Cannot accces site before authentication', () => {
        cy.visit('/account')
        cy.url().should('include', '/login')

        cy.visit('/')
        cy.url().should('include', '/login')
    })

    it('Error on invalid username or password', () => {
        cy.get('[data-testid=l-email]').type('bob@.com.au')
        cy.get('[data-testid=l-pass]').type('wrongpass')
        cy.get('[data-testid=l-submit]').click()

        cy.get('[data-testid=error-msg]').should('contain', 'Invalid login')
    })

    it('Successful login using valid login details', () => {
        cy.get('[data-testid=l-email]').type('bob@.com.au')
        cy.get('[data-testid=l-pass]').type('password123')
        cy.get('[data-testid=l-submit]').click()

        cy.get('title').should('contain', 'Dashboard')
    })

    it('Error on registering when user already exists', () => {
        cy.get('[data-testid=register-option]').click()

        cy.get('[data-testid=r-email]').type('bob@.com.au')
        cy.get('[data-testid=r-username]').type('bob')
        cy.get('[data-testid=r-pass]').type('password123')
        cy.get('[data-testid=r-pass2]').type('password123')
        cy.get('[data-testid=r-submit]').click()

        cy.get('[data-testid=error-msg]').should('contain', 'User with this email already exists')
    })

    it('Error on password confirmation does not match', () => {
        cy.get('[data-testid=register-option]').click()

        cy.get('[data-testid=r-email]').type('testuser@.com.au')
        cy.get('[data-testid=r-username]').type('testuser')
        cy.get('[data-testid=r-pass]').type('password123')
        cy.get('[data-testid=r-pass2]').type('not matching')
        cy.get('[data-testid=r-submit]').click()

        cy.get('[data-testid=error-msg]').should('contain', 'Passwords do not match')
    })

    it('Successful registration using valid register details', () => {
        cy.get('[data-testid=register-option]').click()

        cy.get('[data-testid=r-email]').type('testuser@.com.au')
        cy.get('[data-testid=r-username]').type('testuser')
        cy.get('[data-testid=r-pass]').type('password123')
        cy.get('[data-testid=r-pass2]').type('password123')
        cy.get('[data-testid=r-submit]').click()

        cy.get('title').should('contain', 'Dashboard')
    })
    

})