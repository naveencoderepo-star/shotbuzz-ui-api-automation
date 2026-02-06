class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        // Placeholder for login button, assuming generic submit for now or user to provide
        this.loginButton = page.locator('button[type="submit"]'); 
    }

    async getTitle() {
        return this.page.title();
    }

    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click(); 
    }
}

module.exports = { LoginPage };
