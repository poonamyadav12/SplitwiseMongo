import Joi from 'joi';

export const ActivityType = Object.freeze({
    GROUP_CREATION: "GROUP_CREATION",
    TRANSACTION_ADDED: "TRANSACTION_ADDED",
    TRANSACTION_DELETED: "TRANSACTION_DELETED",
    MEMBER_ADDED: "MEMBER_ADDED",
    MEMBER_DELETED: "MEMBER_DELETED",
    MEMBER_JOINED: "MEMBER_JOINED"
});

export const activitySchema = Joi.object().keys(
    {
        user_id: Joi.string().email().required(),
        group: Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().optional()
        }).required(),
        added: Joi.object().optional(),
        joined: Joi.object().optional(),
        deleted: Joi.object().optional(),
        transaction: Joi.object().optional(),
        type: Joi.string().valid(...Object.values(ActivityType)).required(),
    }
);

const groupCreationSchema = Joi.object().keys(
    {
        group_id: Joi.string().required(),
        name: Joi.string().required(),
    }
);

const tnxAddedSchema = Joi.object().keys(
    {
        group_id: Joi.string().required(),

    }
)