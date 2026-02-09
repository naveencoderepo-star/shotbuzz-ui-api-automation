const { LoginPage } = require('./LoginPage');
const { ShotsPage } = require('./ShotsPage');
const { EmployeesPage } = require('./EmployeesPage');

/**
 * Page Object Manager (POM)
 * 
 * Centralized manager class that initializes and provides access to all page objects.
 * This follows the industry-standard design pattern for managing page objects in automation frameworks.
 * 
 * Benefits:
 * - Single point of initialization for all page objects
 * - Lazy initialization (pages are created only when accessed)
 * - Reduces code duplication in test files
 * - Easy to maintain and scale as new pages are added
 * - Provides consistent interface across all tests
 * 
 * Usage:
 * const pom = new PageObjectManager(page, request);
 * await pom.getLoginPage().login(email, password);
 * await pom.getShotsPage().navigateToShotsDashboard();
 */
class PageObjectManager {
    constructor(page, request = null) {
        this.page = page;
        this.request = request;
        
        // Initialize page objects as null (lazy initialization)
        this._loginPage = null;
        this._shotsPage = null;
        this._employeesPage = null;
    }

    /**
     * Get LoginPage instance (lazy initialization)
     * @returns {LoginPage}
     */
    getLoginPage() {
        if (!this._loginPage) {
            this._loginPage = new LoginPage(this.page);
        }
        return this._loginPage;
    }

    /**
     * Get ShotsPage instance (lazy initialization)
     * @returns {ShotsPage}
     */
    getShotsPage() {
        if (!this._shotsPage) {
            this._shotsPage = new ShotsPage(this.page);
        }
        return this._shotsPage;
    }

    /**
     * Get EmployeesPage instance (lazy initialization)
     * @returns {EmployeesPage}
     */
    getEmployeesPage() {
        if (!this._employeesPage) {
            this._employeesPage = new EmployeesPage(this.page);
        }
        return this._employeesPage;
    }

    /**
     * Reset all page objects (useful for test cleanup or when navigating to a new context)
     */
    resetPages() {
        this._loginPage = null;
        this._shotsPage = null;
        this._employeesPage = null;
    }

    /**
     * Get all initialized page objects
     * @returns {Object} Object containing all initialized page instances
     */
    getAllPages() {
        return {
            loginPage: this.getLoginPage(),
            shotsPage: this.getShotsPage(),
            employeesPage: this.getEmployeesPage()
        };
    }
}

module.exports = { PageObjectManager };
