import { creategroupschema, updategroupschema } from '../dataschema/group_schema.js';
import { kafka_default_response_handler } from '../kafka/handler.js';
const kafka = require("../kafka/client");
var Joi = require('joi');

export async function createGroup(req, res) {
    console.log("Inside create group post Request");
    const { error, value } = Joi.object().keys(
        { group: creategroupschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "group-topic",
        { path: "group-create", body: value },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function updateGroup(req, res) {
    console.log("Inside update group post Request");
    const { error } = Joi.object().keys(
        { group: updategroupschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "group-topic",
        { path: "group-update", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function leaveGroup(req, res) {
    console.log("Inside leave group post Request");
    const { error } = Joi.object().keys(
        {
            groupId: Joi.string().required(),
            userId: Joi.string().required()
        }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "group-topic",
        { path: "group-leave", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function joinGroup(req, res) {
    console.log("Inside join group post Request");
    const { error } = Joi.object().keys(
        {
            groupId: Joi.string().required(),
            userId: Joi.string().required()
        }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    kafka.make_request(
        "group-topic",
        { path: "group-join", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );

}

export async function getGroupDetails(req, res) {
    console.log("inside get group details", req.query.groupId);
    let groupId = req.query.groupId;
    if (!groupId) {
        res
            .status(400)
            .send(
                {
                    code: 'INVALID_PARAM',
                    msg: 'Invalid Group ID'
                }
            )
            .end();
    }

    kafka.make_request(
        "group-topic",
        { path: "group-details", groupId },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function getAllGroupsForUser(req, res) {
    // Access the provided 'page' and 'limt' query parameters
    let userId = req.query.userId;
    console.log('user ID', userId);
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

    console.log("Inside get all group details Request");

    kafka.make_request(
        "group-topic",
        { path: "group-all-for-user", userId },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}
