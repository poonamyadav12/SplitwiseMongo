import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import {
    createtxnschema,
    updatetxnschema,
} from '../dataschema/transaction_schema.js';
import { kafka_default_response_handler } from '../kafka/handler.js';
import { insertActivity } from './activity_api.js';
const TransactionModel = require('../Models/TransactionModel');
const UserModel = require('../Models/UserModel');
var Joi = require('joi');
const kafka = require("../kafka/client");

export async function createTransaction(req, res) {
    console.log('Inside create txn post Request');
    const { error, value } = Joi.object()
        .keys({ transaction: createtxnschema.required() })
        .validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    console.log('transaction request ', value);

    kafka.make_request(
        "transaction-topic",
        { path: "transaction-create", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function updateTransactions(req, res) {
    console.log('Inside update txn post Request');
    const { error, value } = Joi.object()
        .keys({ transaction: updatetxnschema.required() })
        .validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "transaction-topic",
        { path: "transaction-update", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function settleTransactions(req, res) {
    console.log('Inside settle txn post Request');
    const { error, value } = Joi.object()
        .keys({
            transactions: Joi.array().items(createtxnschema),
        })
        .validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "transaction-topic",
        { path: "transaction-settle", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
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

export async function getAllTransactionsForGroup(req, res) {
    // Access the provided 'page' and 'limt' query parameters
    let groupId = req.query.groupId;
    if (!groupId) {
        res
            .status(400)
            .send({
                code: 'INVALID_PARAM',
                msg: 'Invalid Group ID',
            })
            .end();
    }

    console.log('Inside get all transactions for group Request');

    try {
        kafka.make_request(
            "transaction-topic",
            { path: "transaction-group", groupId },
            (err, results) => kafka_default_response_handler(res, err, results)
        );
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully insert the Group! Please check the application logs for more details.',
            })
            .end();
    }
}

export async function getAllTransactionsForFriend(req, res) {
    // Access the provided 'page' and 'limt' query parameters
    let friendId = req.query.friendId;
    let userId = req.query.userId;
    if (!friendId) {
        res
            .status(400)
            .send({
                code: 'INVALID_PARAM',
                msg: 'Invalid friend ID',
            })
            .end();
    }

    console.log('Inside get friend Transaction Request');
    kafka.make_request(
        "transaction-topic",
        { path: "transaction-friend", friendId, userId },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}
export async function getAllTransactionsForUser(req, res) {
    // Access the provided 'page' and 'limt' query parameters
    let userId = req.query.userId;
    if (!userId) {
        res
            .status(400)
            .send({
                code: 'INVALID_PARAM',
                msg: 'Invalid User ID',
            })
            .end();
    }

    console.log('Inside get User Transaction Request');

    kafka.make_request(
        "transaction-topic",
        { path: "transaction-user", userId },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
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
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: {
                createdAt: '$created_at',
                updatedAt: '$updated_at',
                from: { $arrayElemAt: ['$from', 0] },
            },
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
            $addFields: {
                createdAt: '$created_at',
                updatedAt: '$updated_at',
                from: { $arrayElemAt: ['$from', 0] },
                group: { $arrayElemAt: ['$group', 0] },
            },
        },

    ]);

    return transactions;
}

export async function addComment(req, res) {
    const { error, value } = Joi.object()
        .keys({ txnId: Joi.string().required(), comment: Joi.string().required(), userId: Joi.string().required() })
        .validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }

    kafka.make_request(
        "transaction-topic",
        { path: "transaction-comment", body: value },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function deleteComment(req, res) {
    const { error, value } = Joi.object()
        .keys({ _id: Joi.string().required() })
        .validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }

    kafka.make_request(
        "transaction-topic",
        { path: "transaction-comment-delete", body: value },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}