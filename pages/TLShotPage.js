const { expect } = require('@playwright/test');
const { BaseShotPage } = require('./BaseShotPage');

/**
 * TLShotPage - Methods specific to the TL (Team Lead) role.
 * 
 * TL-specific actions:
 * - Verify TL assignment
 */
class TLShotPage extends BaseShotPage {
    constructor(page) {
        super(page);
    }

    async verifyTLAssigned(name) {
        console.log(`-> Verifying TL assigned: ${name}...`);
        const nameRegex = new RegExp(name.replace(/\s/g, '.*'), 'i');
        await expect(this.shotPopupContainer).toContainText(nameRegex);
        console.log(`[PASS] ${name} is assigned as TL and visible in the popup.`);
    }
}

module.exports = { TLShotPage };
