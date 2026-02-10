const { expect } = require('@playwright/test');

/**
 * BaseShotPage - Shared locators and methods used across all user roles.
 * Role-specific pages (Admin, Head, Supervisor, TL) extend this class.
 */
class BaseShotPage {
    constructor(page) {
        this.page = page;

        // Sidebar Navigation
        this.shotDashboardBtn = page.locator('[data-sidebar="menu-button"], a, button').filter({ hasText: /^(Headshots|Shots?)$/i }).first();
        this.supervisorShotDashboardBtn = page.locator('button[data-sidebar="menu-button"]').filter({ hasText: /^Shot$/ }).first();

        // Dashboard Elements
        this.shotsPageHeader = page.getByRole('heading', { name: /Shot List|Head Reports|Dashboard/i })
            .or(page.locator('h1, h2, .text-2xl').filter({ hasText: /Shot List|Head Reports/i }))
            .or(page.getByText(/TOTAL SHOTS/i))
            .first();
        this.searchInput = page.getByPlaceholder(/Search shots/i);

        // Popup Locators
        this.shotPopupContainer = page.getByRole('dialog');
        this.teamTab = page.getByRole('tab', { name: 'TEAM' });
        this.editRolesBtn = page.getByRole('button', { name: 'Edit roles' });
        this.updateRolesBtn = page.getByRole('button', { name: 'Update roles' });
    }

    async navigate() {
        await this.page.goto('/shots');
    }

    async navigateToShotsDashboard() {
        console.log("-> Navigating to Shots Dashboard via Sidebar...");
        
        await this.shotDashboardBtn.waitFor({ state: 'visible', timeout: 10000 });
        
        // Attempt click and verify up to 2 times
        for (let i = 0; i < 2; i++) {
            await this.shotDashboardBtn.click();
            try {
                await expect(this.page).toHaveURL(/.*shot/i, { timeout: 5000 });
                break;
            } catch (e) {
                if (i === 1) throw e;
                console.log(`-> [RETRY] Click did not transition to Shots page. Retrying click...`);
            }
        }
        
        await this.verifyShotsDashboardLoaded();
    }

    async verifyShotsDashboardLoaded() {
        console.log("-> Verifying Shots Dashboard URL and Header...");
        await expect(this.page).toHaveURL(/.*shot/i, { timeout: 10000 });
        await expect(this.shotsPageHeader).toBeVisible({ timeout: 10000 });
        console.log("[PASS] Shots Dashboard loaded successfully.");
    }

    async verifyShotVisible(shotName) {
        console.log(`-> Searching for Shot: ${shotName}`);
        
        await this.page.waitForTimeout(2000);

        await this.searchInput.click();
        await this.searchInput.fill('');
        await this.searchInput.pressSequentially(shotName, { delay: 50 });
        await this.searchInput.press('Enter'); 
        
        const shotRow = this.page.getByRole('row').filter({ hasText: shotName });
        
        try {
            await expect(shotRow).toBeVisible({ timeout: 20000 });
        } catch (error) {
            console.log(`-> [RETRY] Shot '${shotName}' not found. Reloading page...`);
            await this.page.reload();
            await this.verifyShotsDashboardLoaded();
            await this.searchInput.click();
            await this.searchInput.fill(shotName);
            await this.searchInput.press('Enter');
            await expect(shotRow).toBeVisible({ timeout: 20000 });
        }

        console.log(`[PASS] Shot '${shotName}' is visible in the table.`);
        return shotRow; 
    }

    async clickShotRow(shotName) {
        console.log(`-> Clicking on Shot: ${shotName} to open popup...`);
        await this.page.getByText(shotName, { exact: true }).first().click();
    }

    async verifyPopupLoaded(shotName) {
        console.log(`-> Verifying popup loaded for shot: ${shotName}`);
        await expect(this.shotPopupContainer).toBeVisible();
        await expect(this.shotPopupContainer).toContainText(shotName);
    }

    async verifyPopupStatus(expectedStatus) {
        console.log(`-> Verifying popup status is: ${expectedStatus}`);
        const statusBadge = this.shotPopupContainer.locator('div, button, span, [role="button"]').filter({ hasText: expectedStatus }).first();
        await expect(statusBadge).toBeVisible();
    }

    async goToTeamTab() {
        console.log("-> Navigating to TEAM tab in popup...");
        await this.teamTab.click();
        await this.page.waitForTimeout(1000);
    }

    async clickEditRoles() {
        console.log("-> Clicking 'Edit roles' button...");
        await this.editRolesBtn.click();
    }

    async clickUpdateRoles() {
        console.log("-> Clicking 'Update roles' button...");
        await this.updateRolesBtn.click();
        await this.page.waitForTimeout(5000);
    }
}

module.exports = { BaseShotPage };
