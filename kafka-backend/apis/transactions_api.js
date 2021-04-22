import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import { insertActivity } from './activity_api.js';
const TransactionModel = require('../models/TransactionModel');
const UserModel = require('../models/UserModel');
var Joi = require('joi');

const commonTransactionAggregationSteps = [
    {
        $lookup: {
            from: "users",
            localField: "comments.userId",
            foreignField: "email",
            as: "commentUsers"
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'from',
            foreignField: 'email',
            as: 'from',
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'to',
            foreignField: 'email',
            as: 'to',
        },
    },
];

const commonFieldsMapping = {
    createdAt: '$created_at',
    updatedAt: '$updated_at',
    from: { $arrayElemAt: ['$from', 0] },
    comments: {
        $map: {
            input: "$comments",
            as: "cm",
            in: {
                $mergeObjects: [
                    "$$cm",
                    {
                        "user": {
                            $first: {
                                $filter: {
                                    input: "$commentUsers",
                                    cond: { $eq: ["$$this.email", "$$cm.userId"] }
                                }
                            }
                        }
                    }
                ]
            },
        },
    }
};

export async function createTransaction(message, callback) {
    console.log('Inside create txn post Request');
    console.log('transaction request ', message);
    let response = {};
    let error = {};
    const transaction = message.body.transaction;
    try {
        const modifiedTxn = JSON.parse(JSON.stringify(transaction));
        modifiedTxn.id = uuidv4();

        //Mongo Db model to save transaction
        var transactionModel = new TransactionModel(modifiedTxn);
        await transactionModel.save();
        const transactionActivity = buiildTransactionActivity(
            modifiedTxn.from,
            modifiedTxn.group_id,
            modifiedTxn
        );
        insertActivity(transactionActivity);
        response.status = 200;
        response.data = modifiedTxn;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully insert the txn! Please check the application logs for more details.',
        };
        return callback(err, null);
    }
}

export async function updateTransactions(message, callback) {
    console.log('Inside update txn post Request');
    const transaction = message.body.transaction;
    let response = {};
    let error = {};
    try {
        const value = await TransactionModel.findOneAndUpdate(
            { id: transaction.id },
            { ...transaction },
            { new: true }
        );
        await value.save();
        response.status = 200;
        response.data = transaction;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully update the txn! Please check the application logs for more details.',
        };
        return callback(error, null);
    }
}

export async function addComment(message, callback) {
    console.log('Inside update txn post Request');
    const comment = message.body;
    let response = {};
    let error = {};
    try {
        const value = await TransactionModel.findOneAndUpdate(
            { id: comment.txnId },
            { $push: { comments: comment } },
            { new: true }
        );
        await value.save();

        const txns = await getTransactionsByTxnId(comment.txnId);

        response.status = 200;

        response.data = txns;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully update the txn! Please check the application logs for more details.',
        };
        return callback(error, null);
    }
}

export async function deleteComment(message, callback) {
    console.log('Inside delete comment post Request');
    const _id = message.body._id;

    console.log("IdT ", _id);
    let response = {};
    let error = {};
    try {
        await TransactionModel.updateMany({}, { $pull: { "comments": { "_id": _id } } }, { multi: true });
        response.status = 200;
        response.data = "success";
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully delete the comment! Please check the application logs for more details.',
        };
        return callback(error, null);
    }
}

export async function settleTransactions(message, callback) {
    let response = {};
    let error = {};
    console.log('Inside settle txn post Request');
    const transactions = message.body.transactions;
    try {
        const modifiedTxns = transactions.map((txn) => {
            txn.id = uuidv4();
            return txn;
        });
        //Mongo db
        await Promise.all(
            modifiedTxns.map(async (txn) => {
                var transactionModel = new TransactionModel(txn);
                await transactionModel.save();
            })
        );
        modifiedTxns.map((modifiedTxn) => {
            const transactionActivity = buiildTransactionActivity(
                modifiedTxn.from,
                modifiedTxn.group_id,
                modifiedTxn
            );
            insertActivity(transactionActivity);
        });
        response.status = 200;
        response.data = modifiedTxns;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully insert the txn! Please check the application logs for more details.',
        };

        return callback(error, null);
    }
}

function buiildTransactionActivity(creator, groupId, transaction) {
    return JSON.parse(
        JSON.stringify({
            user_id: creator,
            group: {
                id: groupId,
            },
            transaction: transaction,
            type: ActivityType.TRANSACTION_ADDED,
        })
    );
}

export async function getAllTransactionsForGroup(message, callback) {
    // Access the provided 'page' and 'limt' query parameters
    let response = {};
    let error = {};
    let groupId = message.groupId;

    console.log('Inside get all transactions for group Request');

    try {
        const transactions = await getTransactionsByGroupId(groupId);
        response.status = 200;
        response.data = transactions;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully insert the Group! Please check the application logs for more details.',
        }
        return callback(null, response);
    }
}

export async function getTransactionsByGroupId(groupId) {
    console.log('Group idX ', groupId);
    const transactions = await TransactionModel.aggregate([
        {
            $match: { group_id: groupId },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);
    return transactions;
}

export async function getTransactionsByTxnId(txnId) {
    console.log('TxnId idX ', txnId);
    const transactions = await TransactionModel.aggregate([
        {
            $match: { id: txnId },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);
    return transactions[0];
}

export async function getAllTransactionsForFriend(message, callback) {
    // Access the provided 'page' and 'limt' query parameters
    let response = {};
    let error = {};
    let friendId = message.friendId;
    let userId = message.userId;
    if (!friendId) {
        error.status = 400;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid friend ID',
        };
        return callback(error, null);
    }

    console.log('Inside get friend Transaction Request');

    try {
        const transactions = await getTransactionsByFriendId(friendId, userId);
        console.log('Transactions By friend ID  ' + JSON.stringify(transactions));
        response.status = 200;
        response.data = transactions;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully get the Friend Transaction! Please check the application logs for more details.',
        }
        return callback(error, null);
    }
}
export async function getAllTransactionsForUser(message, callback) {
    // Access the provided 'page' and 'limt' query parameters
    let userId = message.userId;
    let response = {};
    let error = {};
    if (!userId) {
        error.status = 400;
        error.data = {
            code: 'INVALID_PARAM',
            msg: 'Invalid User ID',
        };
        return callback(error, null);
    }

    console.log('Inside get User Transaction Request');

    try {
        const transactions = await getTransactionsByUserId(userId);
        console.log('Transactions By User ID  ' + JSON.stringify(transactions));
        response.status = 200;
        response.data = transactions;
        return callback(null, response);
    } catch (err) {
        console.log(err);
        error.status = 500;
        error.data = {
            code: err.code,
            msg:
                'Unable to successfully get the User Transaction! Please check the application logs for more details.',
        }
        return callback(error, null);
    }
}

export async function getTransactionsByFriendId(friendId, userId) {
    console.log('friend id ', friendId);
    console.log('user id ', userId);
    const transaction = await TransactionModel.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [{ from: userId }, { to: friendId }],
                    },
                    {
                        $and: [{ from: friendId }, { to: userId }],
                    },
                ],
            },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);

    console.log('transaction response ', transaction);

    return transaction;
}

async function getTransactionsByUserId(userId) {
    const transactions = await TransactionModel.aggregate([
        {
            $match: {
                $or: [{ from: userId }, { to: userId }],
            },
        },
        ...commonTransactionAggregationSteps,
        {
            $lookup: {
                from: 'groupinfos',
                localField: 'group_id',
                foreignField: 'id',
                as: 'group',
            },
        },
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: { ...commonFieldsMapping, group: { $arrayElemAt: ['$group', 0] }, }
        },

    ]);

    return transactions;
}