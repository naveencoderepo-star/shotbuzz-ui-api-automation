class ShotsPage {
    constructor(page) {
        this.page = page;
    }

    async navigate() {
        await this.page.goto('/shots');
    }
}

module.exports = { ShotsPage };
