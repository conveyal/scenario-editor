// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login',function(){
	// login through the GUI - this should be streamlined to use the API directly
	cy.visit('/');
	cy.get('input[placeholder="yours@example.com"]')
		.type( Cypress.env('username') );
	cy.get('input[placeholder="your password"]')
		.type( Cypress.env('password') );
	cy.contains('Log In').click();
	cy.get('h1').contains('conveyal analysis');
})

Cypress.Commands.add('logout',function(){
	cy.visit('/');
	cy.contains('Log out').click();
})
