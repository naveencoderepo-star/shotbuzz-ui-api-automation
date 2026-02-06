const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ShotsPage } = require('../pages/ShotsPage');
const { EmployeesPage } = require('../pages/EmployeesPage');
const { ApiHelper } = require('../utils/apiHelper');
const { ShotData } = require('../test-data/shotData'); // Import Data Factory
const testData = require('../test-data/users.json');

test.describe('Admin Portal API & UI Integration', () => {
    let loginPage;
    let employeesPage;
    let shotsPage;
    let apiHelper;

    test.beforeEach(async ({ page, request }) => {
        loginPage = new LoginPage(page);
        employeesPage = new EmployeesPage(page);
        shotsPage = new ShotsPage(page);
        apiHelper = new ApiHelper(request);
        
        await shotsPage.navigate();
    });

    test('Verify Login, Token Capture and Dynamic Shot Creation', async ({ page }) => {
        // 1. Setup Network Interception for Token
        const loginResponsePromise = page.waitForResponse(response => 
            (response.url().includes('/auth/login') || response.url().includes('/api/login')) 
            && response.status() === 200
        );

        // 2. UI Login Flow
        await loginPage.login(testData.adminUser.email, testData.adminUser.password);
        
        // 3. Token Extraction
        const response = await loginResponsePromise;
        const responseBody = await response.json();
        const accessToken = responseBody.token || responseBody.accessToken || responseBody.data?.token;
        
        expect(accessToken, 'Failed to capture access token from login response').toBeDefined();

        // 4. API Shot Creation (using Data Factory)
        const shotPayload = ShotData.getNewShotPayload();
        const newShotResponse = await apiHelper.createShot(accessToken, shotPayload);
        
        console.log(`[PASS] New Shot Created: ${newShotResponse.name}`);

        // 5. Final UI Affirmation
        await employeesPage.verifyIsLoaded();
        await expect(page).toHaveURL(/.*employees/);
    });
});
