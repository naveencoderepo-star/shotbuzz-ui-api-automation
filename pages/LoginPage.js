class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByPlaceholder('Enter your email');
        this.passwordInput = page.getByPlaceholder('Enter password');
        this.loginButton = page.getByRole('button', { name: 'Sign in' });
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
