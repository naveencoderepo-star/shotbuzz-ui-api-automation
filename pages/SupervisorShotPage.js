const { expect } = require('@playwright/test');
const { BaseShotPage } = require('./BaseShotPage');

/**
 * SupervisorShotPage - Methods specific to the Supervisor role.
 * 
 * Supervisor-specific actions:
 * - Assign TL (Team Lead)
 * - Verify status changed to ATL
 */
class SupervisorShotPage extends BaseShotPage {
    constructor(page) {
        super(page);
    }

    async assignTL(name) {
        console.log(`-> Assigning TL: ${name}...`);
        const label = this.shotPopupContainer.locator('div, span, label').filter({ hasText: /^(TL|Team Lead)$/i }).first();
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"]', { near: label }).filter({ hasText: /Unassigned|Select/i }).first();
        
        await trigger.click();
        const option = this.page.getByRole('option').filter({ hasText: new RegExp(name.replace(/\s/g, '.*'), 'i') }).first();
        await option.click();
    }

    async verifyStatusChangedToATL() {
        console.log("-> Waiting for status to change to ATL...");
        const statusBadge = this.shotPopupContainer.locator('div, button, span').filter({ hasText: 'ATL' }).first();
        await expect(statusBadge).toBeVisible({ timeout: 15000 });
        console.log("[PASS] Status changed to ATL.");
    }
}

module.exports = { SupervisorShotPage };
