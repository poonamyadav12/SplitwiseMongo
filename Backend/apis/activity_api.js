import { v4 as uuidv4 } from 'uuid';
import { activitySchema } from '../dataschema/activity_schema.js';
import { kafka_default_response_handler } from '../kafka/handler.js';
const ActivityModel = require('../Models/ActivityModel');
var _ = require('lodash');
var Joi = require('joi');
const GroupInfoModel = require('../Models/GroupInfoModel');
const kafka = require("../kafka/client");

export async function insertActivity(activity) {
    console.log("Inside create Activity post Request");
    const { error, value } = activitySchema.validate(activity);

    if (error) {
        throw error;
    }

    console.log('Activity', JSON.stringify(activity));
    const modifiedActivity = activity;
    modifiedActivity.id = uuidv4();
    var activity = new ActivityModel(modifiedActivity);
    await activity.save();
}

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

export async function getActivitiesByUserId(userId) {
    const groupInfos = await GroupInfoModel.find({ "members": userId });
    console.log("groupInfos", groupInfos);
    var id = [];
    for (var i in groupInfos) {
        id.push(groupInfos[i].id);
    }
    console.log("id", id);
    const activity = await ActivityModel.aggregate(
        [{
            $match:
            {
                $or: [{ user_id: userId },
                { 'transaction.to': userId },
                { 'transaction.from': userId },
                { 'group.id': { $in: id } }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "added.email",
                foreignField: "email",
                as: "added",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "email",
                as: "creator",
            }
        },
        {
            $lookup: {
                from: "groupinfos",
                localField: "group.id",
                foreignField: "id",
                as: "group",
            }

        },
        {
            $sort: { "created_at": -1 },
        },
        {
            $addFields: { createdAt: "$created_at", updatedAt: "$updated_at", "group": { "$arrayElemAt": ["$group", 0], }, "creator": { "$arrayElemAt": ["$creator", 0] }, "added": { "$arrayElemAt": ["$added", 0] } }
        },
        ]
    );


    return activity;
}
