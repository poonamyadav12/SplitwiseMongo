import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import {
    createtxnschema,
    updatetxnschema,
} from '../dataschema/transaction_schema.js';
import { insertActivity } from './activity_api.js';
const TransactionModel = require('../Models/TransactionModel');
const UserModel = require('../Models/UserModel');
var Joi = require('joi');

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
    const transaction = value.transaction;
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

        res.status(200).send(modifiedTxn).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully insert the txn! Please check the application logs for more details.',
            })
            .end();
    } 
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
    const transaction = value.transaction;
    try {
        //Mongo DB model
        const value = await TransactionModel.findOneAndUpdate(
            { id: transaction.id },
            { ...transaction },
            { new: true }
        );
        await value.save();

        res.status(200).send(transaction).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully update the txn! Please check the application logs for more details.',
            })
            .end();
    }
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

    const transactions = value.transactions;
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

        res.status(200).send(modifiedTxns).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully insert the txn! Please check the application logs for more details.',
            })
            .end();
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

export async function getAllTransactionsForGroup(req, res) {
    // Access the provided 'page' and 'limt' query parameters
    let groupId = req.query.groupId;
    if (!groupId) {
        res
            .status(400)
            .send({
                code: 'INVALID_PARAM',
                msg: 'Invalid User ID',
            })
            .end();
    }

    console.log('Inside get all transactions for group Request');

    try {
        const transactions = await getTransactionsByGroupId(groupId);

        res.status(200).send(transactions).end();
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

export async function getTransactionsByGroupId(groupId) {
    console.log('Group id ', groupId);
    return TransactionModel.aggregate([
        {
            $match: { group_id: groupId },
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
                from: { $arrayElemAt: ['$from', 0] },
                createdAt: '$created_at',
            },
        },
    ]);
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

    try {
        const transactions = await getTransactionsByFriendId(friendId, userId);
        console.log('Transactions By friend ID  ' + JSON.stringify(transactions));

        res.status(200).send(transactions).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully get the Friend Transaction! Please check the application logs for more details.',
            })
            .end();
    } 
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

    try {
        const transactions = await getTransactionsByUserId(userId);
        console.log('Transactions By User ID  ' + JSON.stringify(transactions));

        res.status(200).send(transactions).end();
    } catch (err) {
        console.log(err);
        res
            .status(500)
            .send({
                code: err.code,
                msg:
                    'Unable to successfully get the User Transaction! Please check the application logs for more details.',
            })
            .end();
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
