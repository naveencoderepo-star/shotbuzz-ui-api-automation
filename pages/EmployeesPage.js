class EmployeesPage {
    constructor(page) {
        this.page = page;
        this.pageHeader = page.locator('h1, .text-2xl, h2').filter({ hasText: 'Employee Management' });
    }

    async verifyIsLoaded() {
        await this.page.waitForURL(/.*employees/);
    }
}

module.exports = { EmployeesPage };
