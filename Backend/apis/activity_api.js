import { v4 as uuidv4 } from 'uuid';
import { activitySchema } from '../dataschema/activity_schema.js';
const ActivityModel = require('../Models/ActivityModel');
var _ = require('lodash');
var Joi = require('joi');
const GroupInfoModel = require('../Models/GroupInfoModel');

export async function insertActivity( activity) {
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

    try {
        const activities = await getActivitiesByUserId(userId);
        console.log("Activities By User ID " + JSON.stringify(activities));

        const sortedActivities = activities.slice().sort((a, b) => a.createdAt - b.createdAt)
        res.status(200).send(sortedActivities).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send(
                {
                    code: err.code,
                    msg: 'Unable to successfully get the Activities! Please check the application logs for more details.'
                }
            )
            .end();
    } 
}

export async function getActivitiesByUserId( userId) {

    const groupInfos = await GroupInfoModel.find({ "members": userId });
    console.log("groupInfos",groupInfos);
    var id = [];
    for (var i in groupInfos) {
        id.push(groupInfos[i].id);
      }
    console.log("id",id);  
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
            $addFields: { createdAt: "$created_at", updatedAt: "$updated_at", "group": { "$arrayElemAt": [ "$group", 0 ], } , "creator":{ "$arrayElemAt": [ "$creator", 0 ]}, "added":{ "$arrayElemAt": [ "$added", 0 ]}}
        },
        ]
    );


    return activity;
}
