import { kafka_default_response_handler } from '../kafka/handler.js';
const ActivityModel = require('../Models/ActivityModel');
var _ = require('lodash');
var Joi = require('joi');
const GroupInfoModel = require('../Models/GroupInfoModel');
const kafka = require("../kafka/client");

export async function getActivities(req, res) {
    let userId = req.query.userId;
    if (!userId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid User ID'
                }
            )
            .end();
    }

    kafka.make_request(
        "activity-topic",
        { path: "user-activity", userId },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function getActivitiesV2(req, res) {
    let userId = req.query.userId;
    if (!userId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid User ID'
                }
            )
            .end();
    }

    kafka.make_request(
        'activity-topic',
        {
            path: 'user-activity-v2',
            userId,
            options: {
                pageIndex: req.query.pageIndex || 1,
                pageSize: req.query.pageSize || 2,
                groupName: req.query.groupName,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc',
            },
        },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}
