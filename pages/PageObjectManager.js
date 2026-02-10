const { LoginPage } = require('./LoginPage');
const { AdminShotPage } = require('./AdminShotPage');
const { HeadShotPage } = require('./HeadShotPage');
const { SupervisorShotPage } = require('./SupervisorShotPage');
const { TLShotPage } = require('./TLShotPage');
const { EmployeesPage } = require('./EmployeesPage');

/**
 * Page Object Manager (POM)
 * 
 * Centralized manager class that initializes and provides access to all page objects.
 * Supports role-based Shot page instances (Admin, Head, Supervisor, TL).
 * 
 * Benefits:
 * - Single point of initialization for all page objects
 * - Lazy initialization (pages are created only when accessed)
 * - Role-based Shot pages for clean separation of concerns
 * - Reduces code duplication in test files
 * - Easy to maintain and scale as new pages/roles are added
 * 
 * Usage:
 * const pom = new PageObjectManager(page, request);
 * await pom.getLoginPage().login(email, password);
 * await pom.getAdminShotPage().navigateToShotsDashboard();
 * await pom.getHeadShotPage().assignSupervisor('John');
 */
class PageObjectManager {
    constructor(page, request = null) {
        this.page = page;
        this.request = request;
        
        // Initialize page objects as null (lazy initialization)
        this._loginPage = null;
        this._adminShotPage = null;
        this._headShotPage = null;
        this._supervisorShotPage = null;
        this._tlShotPage = null;
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
     * Get AdminShotPage instance (lazy initialization)
     * @returns {AdminShotPage}
     */
    getAdminShotPage() {
        if (!this._adminShotPage) {
            this._adminShotPage = new AdminShotPage(this.page);
        }
        return this._adminShotPage;
    }

    /**
     * Get HeadShotPage instance (lazy initialization)
     * @returns {HeadShotPage}
     */
    getHeadShotPage() {
        if (!this._headShotPage) {
            this._headShotPage = new HeadShotPage(this.page);
        }
        return this._headShotPage;
    }

    /**
     * Get SupervisorShotPage instance (lazy initialization)
     * @returns {SupervisorShotPage}
     */
    getSupervisorShotPage() {
        if (!this._supervisorShotPage) {
            this._supervisorShotPage = new SupervisorShotPage(this.page);
        }
        return this._supervisorShotPage;
    }

    /**
     * Get TLShotPage instance (lazy initialization)
     * @returns {TLShotPage}
     */
    getTLShotPage() {
        if (!this._tlShotPage) {
            this._tlShotPage = new TLShotPage(this.page);
        }
        return this._tlShotPage;
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
        this._adminShotPage = null;
        this._headShotPage = null;
        this._supervisorShotPage = null;
        this._tlShotPage = null;
        this._employeesPage = null;
    }

    /**
     * Get all initialized page objects
     * @returns {Object} Object containing all initialized page instances
     */
    getAllPages() {
        return {
            loginPage: this.getLoginPage(),
            adminShotPage: this.getAdminShotPage(),
            headShotPage: this.getHeadShotPage(),
            supervisorShotPage: this.getSupervisorShotPage(),
            tlShotPage: this.getTLShotPage(),
            employeesPage: this.getEmployeesPage()
        };
    }
}

module.exports = { PageObjectManager };
