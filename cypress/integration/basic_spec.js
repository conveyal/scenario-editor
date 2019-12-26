describe('Login', ()=>{
	before(()=>{ cy.login() });
	after(()=>{ cy.logout() });

	it('Visit existing region', ()=>{
		cy.contains('Nate - testing UI').click();
		cy.get('legend').contains('Nate - testing UI');
	})

})
