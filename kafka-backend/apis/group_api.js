import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import { GroupJoinStatus } from '../dataschema/user_schema.js';
import { insertActivity } from './activity_api.js';
import { getTransactionsByGroupId } from './transactions_api.js';
import { getUserById, insertIfNotExist } from './user_api.js';
const GroupInfoModel = require('../models/GroupInfoModel');
var _ = require('lodash');

export async function createGroup(message, callback) {
    console.log('Group Create Message ', message);
    return createOrUpdateGroup(message.body, callback, false);
}

export async function updateGroup(message, callback) {
    console.log("Inside update group post Request");
    return createOrUpdateGroup(message.body, callback, true);
}

async function createOrUpdateGroup(message, callback, isUpdate) {
    let response = {};
    let err = {};
    const group = message.group;
    try {
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        if (!isUpdate) {
            modifiedGroup.id = uuidv4();
            group.id = modifiedGroup.id;
        }

        modifiedGroup.members = group.members.map((member) => member.email);
        modifiedGroup.group_join_status = group.members.map((member) => member.group_join_status || GroupJoinStatus.JOINED);
        if (!isUpdate) {
            console.log("Inside GroupInfo Create  " + JSON.stringify(modifiedGroup));
            var groupInfo = new GroupInfoModel(modifiedGroup);
            await groupInfo.save();
        } else {
            console.log("GroupInfo GroupInfo Update ", JSON.stringify(modifiedGroup));
            const value = await GroupInfoModel.findOneAndUpdate(
                { id: modifiedGroup.id },
                { ...modifiedGroup },
                { new: true }
            );
            await value.save();
        }
        await Promise.all(group.members.map((member) =>
            insertIfNotExist(member)));
        if (isUpdate) {
            const storedGroup = await getGroupById(group.id);
            const newMembers = _.difference(group.to, storedGroup.to);
            await Promise.all(newMembers.filter((member) => member.email != storedGroup.creator).map((member) => insertActivity(buildMemberAddedActivity(group.creator, group, member))));
        } else {
            await Promise.all(group.members.filter((member) => member.email != group.creator).map((member) => insertActivity(buildMemberAddedActivity(group.creator, group, member))));
        }

        if (!isUpdate) {
            await insertActivity(buildGroupCreatedActivity(group.creator, group));
        }
        response.status = 200;
        response.data = group;
        return callback(null, response);
    } catch (error) {
        console.log(error);
        err.status = 500;
        err.data = {
            code: error.code,
            msg: 'Unable to successfully insert/update the Group! Please check the application logs for more details.'
        };
        return callback(err, null);
    }
}

export async function leaveGroup(message, callback) {
    console.log("Inside leave group post Request");
    let response = {};
    let err = {};
    const { groupId, userId } = message.body;
    try {
        const storedGroup = JSON.parse(JSON.stringify(await getGroupById(groupId)));
        const newMembersWithJoinStatus = _.remove(_.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => ({ member, group_join_status })
        ), (mg) => mg.member != userId);
        storedGroup.members = newMembersWithJoinStatus.map((mg) => mg.member);
        storedGroup.group_join_status = newMembersWithJoinStatus.map((mg) => mg.group_join_status);
        //UPDATE GROUP USING MONGO DB    
        const value = await GroupInfoModel.findOneAndUpdate(
            { id: storedGroup.id },
            { ...storedGroup },
            { new: true }
        );
        await value.save();
        const user = await getUserById(userId);
        await insertActivity(buildMemberDeletedActivity(user.email, storedGroup, user));
        response.status = 200;
        response.data = storedGroup;
        return callback(null, response);
    } catch (error) {
        console.log(error);
        err.status = 500;
        err.data = {
            code: error.code,
            msg: 'Unable to successfully insert/update the Group! Please check the application logs for more details.'
        };
        return callback(err, null);
    }
}

export async function joinGroup(message, callback) {
    let response = {};
    let err = {};
    console.log("Inside join group post Request");
    const { groupId, userId } = message.body;
    try {
        const storedGroup = await getGroupById(groupId);
        const members_with_join_status = _.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => {
                if (member === userId) {
                    return { member, group_join_status: 'JOINED' };
                }
                return { member, group_join_status };
            }
        );

        storedGroup.members = members_with_join_status.map((m) => m.member);
        storedGroup.group_join_status = members_with_join_status.map((m) => m.group_join_status);
        console.log("storedGroupRRR ", JSON.stringify(storedGroup));
        const value = await GroupInfoModel.findOneAndUpdate(
            { id: storedGroup.id },
            { ...storedGroup },
            { new: true }
        );
        await value.save();
        const user = await getUserById(userId);
        await insertActivity(buildMemberJoinedActivity(user.email, storedGroup, user));
        response.status = 200;
        response.data = storedGroup;
        return callback(null, response);
    } catch (error) {
        console.log(error);
        err.status = 500;
        err.data = {
            code: error.code,
            msg: 'Unable to successfully join the Group! Please check the application logs for more details.'
        }
        return callback(err, null);
    }
}

export async function getGroupDetails(message, callback) {
    let response = {};
    let error = {};
    console.log("inside get group details", message.groupId);
    let groupId = message.groupId;
    if (!groupId) {
        error.status = 400;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid Group ID'
        }
        return callback(error, null);
    }

    console.log("Inside get group details Request");
    try {
        const group = await getGroupById(groupId);
        const members = await Promise.all(
            group.members.map((member) => getUserById(member))
        );
        const modifiedGroup = group;
        const newMembers = _.zipWith(
            JSON.parse(JSON.stringify(members)),
            group.group_join_status,
            (m, g) => ({ ...m, group_join_status: g })
        );
        modifiedGroup.members = newMembers;
        response.status = 200;
        response.data = modifiedGroup;
        return callback(response, null);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully get the Group! Please check the application logs for more details.',
        }
        return callback(error, null);
    }
}

export async function getAllGroupsForUser(message, callback) {
    let userId = message.userId;
    let response = {};
    let error = {};
    if (!userId) {
        error.status = 400;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid User ID'
        };
        return callback(error, null);
    }

    console.log("Inside get all group details Request");
    try {
        const groups = await getGroupsByUserId(userId);
        const modifiedGroups = await Promise.all(groups.map(async (group) => {
            const members = await Promise.all(group.members.map((member) => getUserById(member)));
            const modifiedGroup = group;
            console.log("GG Group", group);
            const newMembers = _.zipWith(
                JSON.parse(JSON.stringify(members)),
                group.group_join_status,
                (m, g) => ({ ...m, group_join_status: g })
            );
            modifiedGroup.members = newMembers;
            console.log("Modified Group", modifiedGroup);
            const transactions = await getTransactionsByGroupId(group.id);
            modifiedGroup.transactions = transactions;
            return modifiedGroup;
        }));
        response.status = 200;
        response.data = modifiedGroups;
        return callback(response, null);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg: 'Unable to successfully insert the Group! Please check the application logs for more details.'
        };
        return callback(error, null);
    }
}


async function getGroupById(groupId) {
    const group = await GroupInfoModel.findOne(
        { id: groupId }
    );
    return group;
}

async function getGroupsByUserId(userId) {
    console.log("Inside get Groups By User ID");
    const result = await GroupInfoModel.find({ "members": userId });
    console.log("Results ", JSON.stringify(result));
    return result;
}

function buildMemberAddedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        added: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_ADDED
    }));
}

function buildMemberDeletedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        deleted: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_DELETED
    }));
}

function buildMemberJoinedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        joined: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_JOINED
    }));
}

function buildGroupCreatedActivity(creator, group) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        type: ActivityType.GROUP_CREATION
    }));
}
