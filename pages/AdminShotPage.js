const { expect } = require('@playwright/test');
const { BaseShotPage } = require('./BaseShotPage');

/**
 * AdminShotPage - Methods specific to the Admin role.
 * 
 * Admin-specific actions:
 * - Verify shot row details (type, status, HOD, complexity, frames)
 * - Open shot action menu
 * - Change status via dropdown
 */
class AdminShotPage extends BaseShotPage {
    constructor(page) {
        super(page);
        this.statusDropdownTrigger = page.getByRole('combobox').filter({ hasText: 'Select Status' });
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
        const row = this.page.getByRole('row').filter({ hasText: shotName });
        await row.getByRole('button', { name: 'Open menu' }).click();
    }

    /**
     * Clicks on "Change Status" from the opened menu
     */
    async clickChangeStatus() {
        await this.page.getByText('Change Status', { exact: true }).click();
    }

    /**
     * Clicks the Select Status dropdown trigger
     */
    async clickSelectStatusDropdown() {
        await this.statusDropdownTrigger.click();
    }
}

module.exports = { AdminShotPage };
