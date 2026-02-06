class ApiHelper {
    constructor(request) {
        this.request = request;
    }

    /**
     * Generates a dynamic shot name (e.g., F7_123) and creates a shot via API
     * @param {string} token - The access token captured from login
     * @param {Object} basePayload - The base template for the shot
     */
    async createShot(token, basePayload) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        const dynamicName = `F7_${randomNum}`;
        
        const fullPayload = {
            ...basePayload,
            name: dynamicName
        };

        console.log(`Creating shot with name: ${dynamicName}`);

        const response = await this.request.post('https://shotbuzz-dev-master.coherent.in/api/shots', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: fullPayload
        });

        const status = response.status();
        const responseJson = await response.json();

        if (status !== 201 && status !== 200) {
            throw new Error(`Failed to create shot. Status: ${status}, Response: ${JSON.stringify(responseJson)}`);
        }

        return responseJson;
    }
}

module.exports = { ApiHelper };
