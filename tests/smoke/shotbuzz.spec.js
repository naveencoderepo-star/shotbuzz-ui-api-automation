const { test, expect } = require('@playwright/test');
const { PageObjectManager } = require('../../pages/PageObjectManager');
const { ApiHelper } = require('../../utils/apiHelper');
const { ShotData } = require('../../test-data/shotData');
const testData = require('../../test-data/users.json');

test.describe.serial('ShotBuzz Portal API & UI Integration', () => {
    let pom; // Page Object Manager
    let apiHelper;
    let createdShotName;

    test.beforeEach(async ({ page, request }) => {
        // Initialize Page Object Manager
        pom = new PageObjectManager(page, request);
        apiHelper = new ApiHelper(request);
        
        // Navigate to shots page
        await pom.getAdminShotPage().navigate();
    });

    test('Verify Login, Token Capture and Dynamic Shot Creation', async ({ page }) => {
        let accessToken;
        let newShotResponse;

        await test.step('1. UI Login and Capturing Access Token', async () => {
            const loginResponsePromise = page.waitForResponse(response => 
                (response.url().includes('/auth/login') || response.url().includes('/api/login')) 
                && response.status() === 200
            );
            await pom.getLoginPage().login(testData.adminUser.email, testData.adminUser.password);
            const response = await loginResponsePromise;
            const responseBody = await response.json();
            accessToken = responseBody.token || responseBody.accessToken || responseBody.data?.token;
            expect(accessToken, 'Failed to capture access token from login response').toBeDefined();
            console.log("[PASS] Login successful and Access Token captured.");
        });

        await test.step('2. API - Dynamic Shot Creation', async () => {
            const shotPayload = ShotData.getNewShotPayload();
            newShotResponse = await apiHelper.createShot(accessToken, shotPayload);
            createdShotName = newShotResponse.name;
            console.log(`[PASS] API: Shot Created with name: ${createdShotName}`);
        });

        await test.step('3. UI - Navigate to Shots Dashboard', async () => {
            await pom.getEmployeesPage().verifyIsLoaded();
            await pom.getAdminShotPage().navigateToShotsDashboard();
        });

        await test.step('4. UI - Verify Created Shot in Table', async () => {
            const shotRow = await pom.getAdminShotPage().verifyShotVisible(newShotResponse.name);
            await pom.getAdminShotPage().verifyShotRowDetails(shotRow, {
                type: 'NEW',
                status: 'YTA',
                hod: 'TravisHead',
                complexity: 'EASY',
                startFrame: 1300,
                endFrame: 1600
            });
        });

        await test.step('5. UI - Interact with Menu and Status Dropdown', async () => {
            await pom.getAdminShotPage().openShotMenu(newShotResponse.name);
            await pom.getAdminShotPage().clickChangeStatus();
            await pom.getAdminShotPage().clickSelectStatusDropdown();
            console.log("[PASS] Successfully interacted with Action Menu and Status Trigger.");
        });
    });

    test('Verify Shot Visibility in Head Portal', async ({ page }) => {
        test.slow();
        expect(createdShotName, 'Shot name should be captured from the previous test').toBeDefined();

        await test.step('1. Login to Head Portal', async () => {
            await pom.getLoginPage().login(testData.headUser.email, testData.headUser.password);
            console.log("[PASS] Head Portal login successful.");
        });

        await test.step('2. Navigate to Shots Dashboard', async () => {
            await expect(pom.getHeadShotPage().shotDashboardBtn).toBeVisible();
            await pom.getHeadShotPage().navigateToShotsDashboard();
        });

        await test.step('3. Verify Created Shot is Visible for Head User', async () => {
            await pom.getHeadShotPage().verifyShotVisible(createdShotName);
            console.log(`[PASS] Shot '${createdShotName}' is visible in Head Portal.`);
        });

        await test.step('4. Verify Shot Popup and Restricted Status Dropdown', async () => {
            await pom.getHeadShotPage().clickShotRow(createdShotName);
            await pom.getHeadShotPage().verifyPopupLoaded(createdShotName);
            await pom.getHeadShotPage().verifyPopupStatus('YTA');
            await pom.getHeadShotPage().verifyStatusDropdownLocked();
            console.log(`[PASS] Shot popup verified for '${createdShotName}' with restricted status dropdown.`);
        });

        await test.step('5. Assign Supervisor and Verify ATS Status', async () => {
            await pom.getHeadShotPage().goToTeamTab();
            await pom.getHeadShotPage().clickEditRoles();
            await pom.getHeadShotPage().assignSupervisor('Mitchel John');
            await pom.getHeadShotPage().clickUpdateRoles();

            await page.waitForTimeout(5000);
            await pom.getHeadShotPage().verifyStatusChangedToATS();
            await pom.getHeadShotPage().verifySupervisorAssigned('Mitchel John');
            console.log("[PASS] Successfully assigned Supervisor and verified ATS status update.");
        });
    });

    test('Verify Shot Status update to ATS in Admin Portal', async ({ page }) => {
        expect(createdShotName, 'Shot name should be captured from the previous test').toBeDefined();

        await test.step('1. Login to Admin Portal', async () => {
            await pom.getLoginPage().login(testData.adminUser.email, testData.adminUser.password);
            console.log("[PASS] Admin Portal login successful.");
        });

        await test.step('2. Navigate to Shots Dashboard', async () => {
            await pom.getEmployeesPage().verifyIsLoaded();
            await pom.getAdminShotPage().navigateToShotsDashboard();
        });

        await test.step('3. Verify Status is ATS for the Shot', async () => {
            const shotRow = await pom.getAdminShotPage().verifyShotVisible(createdShotName);
            await pom.getAdminShotPage().verifyShotRowDetails(shotRow, {
                status: 'ATS'
            });
            console.log(`[PASS] Shot '${createdShotName}' status verified as ATS in Admin Portal.`);
        });
    });

    test('Verify Shot status in Supervisor Portal and Assign TL', async ({ page }) => {
        expect(createdShotName, 'Shot name should be captured from previous tests').toBeDefined();

        await test.step('1. Login to Supervisor Portal', async () => {
            await pom.getLoginPage().login(testData.supervisorUser.email, testData.supervisorUser.password);
            console.log("[PASS] Supervisor Portal login successful.");
        });

        await test.step('2. Navigate to Dashboard and Open Shot', async () => {
            const isShotVisible = await page.getByText(createdShotName).isVisible();
            if (!isShotVisible) {
                await expect(pom.getSupervisorShotPage().supervisorShotDashboardBtn).toBeVisible();
                await pom.getSupervisorShotPage().supervisorShotDashboardBtn.click();
                await pom.getSupervisorShotPage().verifyShotsDashboardLoaded();
            }
            await pom.getSupervisorShotPage().verifyShotVisible(createdShotName);
            await pom.getSupervisorShotPage().clickShotRow(createdShotName);
            await pom.getSupervisorShotPage().verifyPopupLoaded(createdShotName);
        });

        await test.step('3. Verify Status is ATS', async () => {
            await pom.getSupervisorShotPage().verifyPopupStatus('ATS');
            console.log("[PASS] Initial status in Supervisor portal is ATS.");
        });

        await test.step('4. Assign TL and Verify ATL Status', async () => {
            await pom.getSupervisorShotPage().goToTeamTab();
            await pom.getSupervisorShotPage().clickEditRoles();
            await pom.getSupervisorShotPage().assignTL('Vidya Shree');
            await pom.getSupervisorShotPage().clickUpdateRoles();
            await pom.getSupervisorShotPage().verifyStatusChangedToATL();
            console.log("[PASS] Successfully assigned TL and verified ATL status update.");
        });
    });

    test('Verify Shot Status in TL Portal', async ({ page }) => {
        expect(createdShotName, 'Shot name should be captured from previous tests').toBeDefined();

        await test.step('1. Login to TL Portal', async () => {
            await pom.getLoginPage().login(testData.tlUser.email, testData.tlUser.password);
            console.log("[PASS] TL Portal login successful.");
        });

        await test.step('2. Open Shot Directly', async () => {
            await pom.getTLShotPage().verifyShotVisible(createdShotName);
            await pom.getTLShotPage().clickShotRow(createdShotName);
            await pom.getTLShotPage().verifyPopupLoaded(createdShotName);
            console.log(`[PASS] Shot '${createdShotName}' opened successfully.`);
        });

        await test.step('3. Verify Status is ATL', async () => {
            await pom.getTLShotPage().verifyPopupStatus('ATL');
            console.log(`[PASS] Shot '${createdShotName}' status verified as ATL in TL Portal.`);
        });

        await test.step('4. Verify TL Assignment', async () => {
            await pom.getTLShotPage().goToTeamTab();
            await pom.getTLShotPage().verifyTLAssigned('Vidya Shree');
            console.log("[PASS] TL assignment verified in TL Portal.");
        });
    });

    
});
