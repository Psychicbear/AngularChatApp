Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/login')
    cy.get('[data-testid=l-email]').type(email)
    cy.get('[data-testid=l-pass]').type(password)
    cy.get('[data-testid=l-submit]').click()
  
    cy.get('title').should('contain', 'Dashboard')
})

describe('Group interaction page', () => { 
    beforeEach(() => {
        cy.login('fred@.com.au', 'password123')
    })

    it('No visible permissions', () => {
        cy.get('[data-testid=add-btn]').should('not.exist')
        cy.get('[data-test=edit-btn]').should('not.exist')
        cy.get('[data-test=del-btn]').should('not.exist')
    })

    it('Can open joined group', () => {
        cy.get('[data-testid=user-groups]').first().find('[data-test=open-btn]').click()
        cy.url().should('include', '/groups')
    })

    it('Can request to join group', () => {
        cy.get('[data-testid=group-list]').first().within(() => {
            cy.get('[data-test=is-requested]').should('not.exist')
            cy.get('[data-test=req-btn]').click()
            cy.get('[data-test=is-requested]').should('exist')
        })
    })
})

describe('Channel interaction page', () => { 
    beforeEach(() => {
        cy.login('fred@.com.au', 'password123')
        cy.get('[data-testid=user-groups]').first().find('[data-test=open-btn]').click()
        cy.url().should('include', '/groups')
    })

    it('No visible permissions', () => {
        cy.get('[data-test=mod-tools]').should('not.exist')
        cy.get('[data-testid=add-btn]').should('not.exist')
        cy.get('[data-test=channel-modify]').should('not.exist')
    })

    it('Can open channel', () => {
        cy.get('[data-test=load-channel]').first().click()
        cy.get('[data-testid=channel-name]').should('contain', 'Main')
    })

    it('Can send message to channel', () => {
        cy.get('[data-test=load-channel]').first().click()
        cy.get('[data-testid=channel-name]').should('contain', 'Main')
        cy.get('[data-testid=msg-field]').type('Hello to everyone in the channel')
        cy.get('[data-testid=send-btn]').click()

        cy.get('[data-test=channel-messages]').last().find('[data-test=msg-content]').should('contain', 'Hello to everyone in the channel')
    })
})

describe('Account interaction page', () => {
    beforeEach(() => {
        cy.login('fred@.com.au', 'password123')
        cy.visit('/account')
    })
})