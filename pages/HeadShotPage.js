const { expect } = require('@playwright/test');
const { BaseShotPage } = require('./BaseShotPage');

/**
 * HeadShotPage - Methods specific to the Head (HOD) role.
 * 
 * Head-specific actions:
 * - Verify status dropdown is locked/non-interactive
 * - Assign Supervisor
 * - Verify status changed to ATS
 * - Verify Supervisor assignment
 */
class HeadShotPage extends BaseShotPage {
    constructor(page) {
        super(page);
        this.popupStatusTrigger = page.getByRole('button').filter({ hasText: /YTA|WIP|STQ|CRT/ });
    }

    async verifyStatusDropdownLocked() {
        console.log("-> Verifying that the Status Dropdown is locked/non-interactive...");
        
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"], div').filter({ hasText: /YTA|WIP|STQ|CRT/ }).first();
        
        await expect(trigger).toBeVisible();
        
        const isDisabled = await trigger.getAttribute('disabled');
        const ariaDisabled = await trigger.getAttribute('aria-disabled');
        const isReadOnly = await trigger.getAttribute('readonly');
        
        if (isDisabled !== null || ariaDisabled === 'true' || isReadOnly !== null) {
            console.log(`[PASS] Status dropdown is restricted (disabled=${isDisabled}, aria-disabled=${ariaDisabled}, readonly=${isReadOnly}).`);
        } else {
            console.log("-> Attempting to click and verify it doesn't open...");
            await trigger.click({ force: true });
            const listbox = this.page.getByRole('listbox');
            await expect(listbox).not.toBeVisible({ timeout: 2000 });
            console.log("[PASS] No listbox appeared. Status dropdown is non-interactive.");
        }
    }

    async assignSupervisor(name) {
        console.log(`-> Assigning Supervisor: ${name}...`);
        
        const label = this.shotPopupContainer.locator('div, span, label').filter({ hasText: /^Supervisor$/i }).first();
        const trigger = this.shotPopupContainer.locator('button, [role="combobox"], [role="button"]', { near: label }).filter({ hasText: /Unassigned|Select/i }).first();
        
        await trigger.click();
        const option = this.page.getByRole('option').filter({ hasText: new RegExp(name.replace(/\s/g, '.*'), 'i') }).first();
        await option.click();
    }

    async verifyStatusChangedToATS() {
        console.log("-> Waiting for status to change to ATS...");
        const statusBadge = this.shotPopupContainer.locator('div, button, span').filter({ hasText: 'ATS' }).first();
        await expect(statusBadge).toBeVisible({ timeout: 15000 });
        console.log("[PASS] Status changed to ATS.");
    }

    async verifySupervisorAssigned(name) {
        console.log(`-> Verifying Supervisor assigned: ${name}...`);
        const nameRegex = new RegExp(name.replace(/\s/g, '.*'), 'i');
        await expect(this.shotPopupContainer).toContainText(nameRegex);
        console.log(`[PASS] ${name} is assigned and visible in the popup.`);
    }
}

module.exports = { HeadShotPage };
