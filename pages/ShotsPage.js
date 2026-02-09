const { expect } = require('@playwright/test');

class ShotsPage {
    constructor(page) {
        this.page = page;
        this.shotDashboardBtn = page.locator('[data-sidebar="menu-button"], a, button').filter({ hasText: /^(Headshots|Shots?)$/i }).first();
        this.supervisorShotDashboardBtn = page.locator('button[data-sidebar="menu-button"]').filter({ hasText: /^Shot$/ }).first();
        this.shotsPageHeader = page.getByRole('heading', { name: /Shot List|Head Reports|Dashboard/i })
            .or(page.locator('h1, h2, .text-2xl').filter({ hasText: /Shot List|Head Reports/i }))
            .or(page.getByText(/TOTAL SHOTS/i))
            .first();
        this.searchInput = page.getByPlaceholder(/Search shots/i);
        this.statusDropdownTrigger = page.getByRole('combobox').filter({ hasText: 'Select Status' });
        
        // Popup Locators
        this.shotPopupContainer = page.getByRole('dialog');
        this.popupStatusTrigger = page.getByRole('button').filter({ hasText: /YTA|WIP|STQ|CRT/ });
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
        // 1. Verify URL contains 'shot'
        await expect(this.page).toHaveURL(/.*shot/i, { timeout: 10000 });
        
        // 2. Verify unique element (e.g., Header) is visible
        await expect(this.shotsPageHeader).toBeVisible({ timeout: 10000 });
        console.log("[PASS] Shots Dashboard loaded successfully.");
    }

    async verifyShotVisible(shotName) {
        console.log(`-> Searching for Shot: ${shotName}`);
        
        // 0. Small delay to allow API indexing
        await this.page.waitForTimeout(2000);

        // 1. Search for the shot
        await this.searchInput.click();
        await this.searchInput.fill('');
        await this.searchInput.pressSequentially(shotName, { delay: 50 });
        await this.searchInput.press('Enter'); 
        
        // 2. Verify the row with the shot name appears in the table
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

    async verifyShotRowDetails(row, expected) {
        console.log("-> Validating Shot Row details (Type, Status, HOD, Frames)...");
        if (expected.type) await expect(row).toContainText(expected.type);
        if (expected.status) await expect(row).toContainText(expected.status);
        if (expected.hod) await expect(row).toContainText(expected.hod);
        if (expected.complexity) await expect(row).toContainText(expected.complexity);
        if (expected.startFrame) await expect(row).toContainText(expected.startFrame.toString());
        if (expected.endFrame) await expect(row).toContainText(expected.endFrame.toString());
        console.log("[PASS] All Shot Row details match the expected payload.");
    }

    /**
     * Opens the action menu for a specific shot
     * @param {string} shotName - The unique shot name
     */
    async openShotMenu(shotName) {
        // 1. Locate the row
        const row = this.page.getByRole('row').filter({ hasText: shotName });
        
        // 2. Click the "Open menu" button inside that row
        await row.getByRole('button', { name: 'Open menu' }).click();
    }

    /**
     * Clicks on "Change Status" from the opened menu
     */
    async clickChangeStatus() {
        // Dropdowns often use menuitem role or simply text
        await this.page.getByText('Change Status', { exact: true }).click();
    }

    /**
     * Clicks the Select Status dropdown trigger
     */
    async clickSelectStatusDropdown() {
        await this.statusDropdownTrigger.click();
    }

    async clickShotRow(shotName) {
        console.log(`-> Clicking on Shot: ${shotName} to open popup...`);
        // Find the specific text for the shot name and click it
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

    async verifyStatusDropdownLocked() {
        console.log("-> Verifying that the Status Dropdown is locked/non-interactive...");
        
        // Find the status indicator/trigger in the popup
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"], div').filter({ hasText: /YTA|WIP|STQ|CRT/ }).first();
        
        await expect(trigger).toBeVisible();
        
        const isDisabled = await trigger.getAttribute('disabled');
        const ariaDisabled = await trigger.getAttribute('aria-disabled');
        const isReadOnly = await trigger.getAttribute('readonly');
        
        if (isDisabled !== null || ariaDisabled === 'true' || isReadOnly !== null) {
            console.log(`[PASS] Status dropdown is restricted (disabled=${isDisabled}, aria-disabled=${ariaDisabled}, readonly=${isReadOnly}).`);
        } else {
            console.log("-> Attempting to click and verify it doesn't open...");
            // If it's not explicitly disabled, try to click and see if it behaves like a static element
            await trigger.click({ force: true });
            // Wait a moment to see if any listbox appears
            const listbox = this.page.getByRole('listbox');
            await expect(listbox).not.toBeVisible({ timeout: 2000 });
            console.log("[PASS] No listbox appeared. Status dropdown is non-interactive.");
        }
    }

    async goToTeamTab() {
        console.log("-> Navigating to TEAM tab in popup...");
        await this.teamTab.click();
        await this.page.waitForTimeout(1000); // Give time for tab content to render
    }

    async clickEditRoles() {
        console.log("-> Clicking 'Edit roles' button...");
        await this.editRolesBtn.click();
    }

    async assignSupervisor(name) {
        console.log(`-> Assigning Supervisor: ${name}...`);
        
        // Find by label-like text and then look for the dropdown button in the immediate container
        const label = this.shotPopupContainer.locator('div, span, label').filter({ hasText: /^Supervisor$/i }).first();
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"]', { near: label }).filter({ hasText: /Unassigned|Select/i }).first();
        
        await trigger.click();
        const option = this.page.getByRole('option').filter({ hasText: new RegExp(name.replace(/\s/g, '.*'), 'i') }).first();
        await option.click();
    }

    async assignTL(name) {
        console.log(`-> Assigning TL: ${name}...`);
        const label = this.shotPopupContainer.locator('div, span, label').filter({ hasText: /^(TL|Team Lead)$/i }).first();
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"]', { near: label }).filter({ hasText: /Unassigned|Select/i }).first();
        
        await trigger.click();
        const option = this.page.getByRole('option').filter({ hasText: new RegExp(name.replace(/\s/g, '.*'), 'i') }).first();
        await option.click();
    }

    async clickUpdateRoles() {
        console.log("-> Clicking 'Update roles' button...");
        await this.updateRolesBtn.click();
        // Wait for potential success message or for the button to disappear/re-enable
        await this.page.waitForTimeout(5000); // Increased wait time for backend processing
    }

    async verifyStatusChangedToATS() {
        console.log("-> Waiting for status to change to ATS...");
        const statusBadge = this.shotPopupContainer.locator('div, button, span').filter({ hasText: 'ATS' }).first();
        await expect(statusBadge).toBeVisible({ timeout: 15000 });
        console.log("[PASS] Status changed to ATS.");
    }

    async verifyStatusChangedToATL() {
        console.log("-> Waiting for status to change to ATL...");
        const statusBadge = this.shotPopupContainer.locator('div, button, span').filter({ hasText: 'ATL' }).first();
        await expect(statusBadge).toBeVisible({ timeout: 15000 });
        console.log("[PASS] Status changed to ATL.");
    }

    async verifySupervisorAssigned(name) {
        console.log(`-> Verifying Supervisor assigned: ${name}...`);
        // Check if the name exists anywhere in the popup, focusing on the text
        const nameRegex = new RegExp(name.replace(/\s/g, '.*'), 'i');
        await expect(this.shotPopupContainer).toContainText(nameRegex);
        console.log(`[PASS] ${name} is assigned and visible in the popup.`);
    }

    async verifyTLAssigned(name) {
        console.log(`-> Verifying TL assigned: ${name}...`);
        // Check if the name exists anywhere in the popup, focusing on the text
        const nameRegex = new RegExp(name.replace(/\s/g, '.*'), 'i');
        await expect(this.shotPopupContainer).toContainText(nameRegex);
        console.log(`[PASS] ${name} is assigned as TL and visible in the popup.`);
    }
}

module.exports = { ShotsPage };
