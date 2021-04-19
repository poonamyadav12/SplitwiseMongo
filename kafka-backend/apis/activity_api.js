import { v4 as uuidv4 } from 'uuid';
const ActivityModel = require('../models/ActivityModel');
var _ = require('lodash');
const GroupInfoModel = require('../models/GroupInfoModel');
import { activitySchema, ActivityType } from '../dataschema/activity_schema.js';

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

export async function getActivities(message, callback) {
    let userId = message.userId;
    let response = {};
    let error = {};
    if (!userId) {
        error.status = 500;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid User ID'
        };
        return callback(error, null);
    }

    try {
        const activities = await getActivitiesByUserId(userId);
        console.log("Activities By User ID " + JSON.stringify(activities));

        const sortedActivities = activities.slice().sort((a, b) => a.createdAt - b.createdAt)
        response.status = 200;
        response.data = sortedActivities;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg: 'Unable to successfully get the Activities! Please check the application logs for more details.'
        }
        return callback(error, null);
    }
}

export async function getActivitiesV2(message, callback) {
    let userId = message.userId;
    let response = {};
    let error = {};
    if (!userId) {
        error.status = 500;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid User ID'
        };
        return callback(error, null);
    }

    try {
        const activities = await getActivitiesByUserIdV2(userId, message.options);
        console.log("Activities By User ID " + JSON.stringify(activities));
        response.status = 200;
        response.data = activities;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg: 'Unable to successfully get the Activities! Please check the application logs for more details.'
        }
        return callback(error, null);
    }
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


export async function getActivitiesByUserIdV2(
    userId,
    options
) {
    const newOptions = Object.assign({
        pageIndex: 1,
        pageSize: 2,
        groupName: null,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }, options);
    const groupInfos = await GroupInfoModel.find({ members: userId });
    console.log('groupInfos', groupInfos);
    const id = groupInfos.filter((g) => {
        console.log('groupInfo ', g);
        return (!newOptions.groupName || newOptions.groupName === g.name)
    }).map((g) => g.id);
    console.log('idX ', id);
    const activity = ActivityModel.aggregate([
        {
            $match:
            {
                $and: [
                    newOptions.groupName ?
                        {

                            $and: [
                                {
                                    $or: [
                                        { user_id: userId },
                                        { 'transaction.to': userId },
                                        { 'transaction.from': userId },
                                        { 'group.id': { $in: id } },
                                    ]
                                },
                                { 'group.id': { $in: id } },
                            ],
                        } : {
                            $or: [
                                { user_id: userId },
                                { 'transaction.to': userId },
                                { 'transaction.from': userId },
                                { 'group.id': { $in: id } },
                            ],
                        },
                    // Since MEMBER_JOINED is not being displayed on the UI. Filter it out.
                    {
                        type: {
                            $ne: ActivityType.MEMBER_JOINED,
                        },
                    },
                ]
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'added.email',
                foreignField: 'email',
                as: 'added',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: 'email',
                as: 'creator',
            },
        },
        {
            $lookup: {
                from: 'groupinfos',
                localField: 'group.id',
                foreignField: 'id',
                as: 'group',
            },
        },
        {
            $addFields: {
                createdAt: '$created_at',
                updatedAt: '$updated_at',
                group: { $arrayElemAt: ['$group', 0] },
                creator: { $arrayElemAt: ['$creator', 0] },
                added: { $arrayElemAt: ['$added', 0] },
            },
        },
    ]);

    console.log('New options ', JSON.stringify(newOptions));
    const sortBy = newOptions.sortBy;
    const sortOrder = newOptions.sortOrder;
    const sort = {};
    sort[`${sortBy}`] = sortOrder == 'desc' ? -1 : 1;
    const paginatedActivity = await ActivityModel.aggregatePaginate(activity, {
        page: newOptions.pageIndex,
        limit: newOptions.pageSize,
        sort,
    });
    return paginatedActivity;
}
