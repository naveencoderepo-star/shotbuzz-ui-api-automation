/**
 * This class provides base payload templates for API interactions.
 * It follows the Data Factory pattern to keep test data separate from test logic.
 */
class ShotData {
    static getNewShotPayload() {
        return {
            "sequenceId": 8,
            "episodeId": 5,
            "type": "NEW",
            "taskTypeId": 7,
            "actualStartFrame": 1300,
            "actualEndFrame": 1600,
            "workStartFrame": 1350,
            "workEndFrame": 1450,
            "eta": "2026-02-24T06:39:00.000Z",
            "internalEta": "2026-02-23T06:39:00.000Z",
            "wipEta": "2026-02-17T06:39:00.000Z",
            "startDate": "2026-02-04T18:30:00.000Z",
            "endDate": "2026-02-27T18:30:00.000Z",
            "submittedDate": "",
            "estimateId": "",
            "estimateDate": "",
            "pendingMandays": 0,
            "achievedMandays": 0,
            "internalBidDays": 3,
            "actualBidDays": 14,
            "inputPath": "download/inputpath",
            "retakePath": "",
            "outputPath": "",
            "imgSrcPath": "",
            "comments": "TESTING DESCRIPTION - after lunch",
            "description": "TESTING DESCRIPTION",
            "version": "",
            "namingCheck": false,
            "packageId": "",
            "scopeOfWork": "",
            "complexityId": 3,
            "locationId": 4,
            "parentShotId": null,
            "supervisorId": 0,
            "teamLeadId": 0,
            "captainId": 0,
            "hodId": 28,
            "shotStatusId": 0,
            "artistInfos": [],
            "artists": []
        };
    }
}

module.exports = { ShotData };
