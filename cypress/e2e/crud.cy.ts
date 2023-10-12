Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/login')
    cy.get('[data-testid=l-email]').type(email)
    cy.get('[data-testid=l-pass]').type(password)
    cy.get('[data-testid=l-submit]').click()
  
    cy.get('title').should('contain', 'Dashboard')
})

describe('Group CRUD', () => {
    beforeEach(() => {
        cy.login('rjscho@live.com.au', 'helloworld')
    })

    

    it('Create a new group', () => {
        cy.get('[data-testid=add-btn]').click()

        cy.get('[data-testid=add-name]').type('Cool new group')
        cy.get('[data-testid=add-desc]').type('Cool description for group')
        cy.get('[data-testid=add-submit]').click()

        cy.get('[data-testid=group-list]').last()
            .find('div > h5').should('contain', 'Cool new group')
        
    })

    it('Read the newly created group', () => {
        cy.get('[data-testid=group-list').last().within(() => {
            cy.get('div > h5').should('contain', 'Cool new group')
            cy.get('[data-test=open-btn]').click()
        })
        cy.url().should('contain', '/groups')
        
    })

    it('Edit the newly created group', () => {
        cy.get('[data-testid=group-list]').last()
            .find('div > [data-test=edit-btn]').click()

        cy.get('[data-testid=edit-name]').type('{selectall}{backspace}Changed group')
        cy.get('[data-testid=edit-desc]').type('{selectall}{backspace}Changed description for group')
        cy.get('[data-testid=edit-submit]').click()

        cy.get('[data-testid=group-list]').last()
            .find('div > h5').should('contain', 'Changed group')
    })

    it('Delete the newly created group', () => {
        cy.get('[data-testid=group-list]').last()
            .find('div > [data-test=del-btn]').click()

        cy.get('[data-testid=group-list]').last()
            .find('div > h5').should('not.contain', 'Changed group')
    })
})

describe('Channel CRUD', () => { 
    beforeEach(() => {
        cy.login('rjscho@live.com.au', 'helloworld')
        cy.get('[data-testid=group-list').first().find('[data-test=open-btn]').click()
        cy.url().should('contain', '/groups')
    })

    it('Create a new channel', () => {
        cy.get('[data-testid=add-btn]').click()

        cy.get('[data-testid=add-name]').type('Cool new channel')
        cy.get('[data-testid=add-desc]').type('Cool description for channel')
        cy.get('[data-testid=add-submit]').click()

        cy.get('[data-test=load-channel]').last().should('contain', 'Cool new channel')
    })

    it('Read the newly created channel', () => {
        cy.get('[data-test=load-channel]').last()
            .should('contain', 'Cool new channel')
            .click()
        cy.get('[data-testid=channel-name]').should('contain', 'Cool new channel')
    })

    it('Edit the newly created group', () => {
        cy.get('[data-test=load-channel]').last().click()
        cy.get('[data-testid=edit-btn]').click()

        cy.get('[data-testid=edit-name]').type('{selectall}{backspace}Less cool channel')
        cy.get('[data-testid=edit-desc]').type('{selectall}{backspace}Changed description for group')
        cy.get('[data-testid=edit-submit]').click()

        cy.get('[data-test=load-channel]').last().click()
        cy.get('[data-testid=channel-name]').should('contain', 'Less cool channel')
    })

    it('Delete the newly created channel', () => {
        cy.get('[data-test=load-channel]').last().click()
        cy.get('[data-testid=del-btn]').click()
        
        cy.get('[data-testid=no-channel]').should('exist')
        cy.get('[data-test=load-channel]').last().should('not.contain', 'Less cool channel')
    })
})