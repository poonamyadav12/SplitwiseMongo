import Joi from 'joi';

export const TransactionStatus = Object.freeze({
    ACTIVE: "ACTIVE",
    DELETED: "DELETED",
});

const txnfields = {
    from: Joi.string().email().required(),
    to: Joi.array().items(Joi.string().email()).min(1).required().label('to'),
    amount: Joi.number().required().label('amount'),
    currency_code: Joi.string().max(3).required().label('Currency code'),
    group_id: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().default(TransactionStatus.ACTIVE),
    type: Joi.string().default('TRANSACTION'),
};

export const createtxnschema = Joi.object().keys(
    txnfields
);

export const updatetxnschema = Joi.object().keys(
    {
        ...txnfields,
        id: Joi.string().required().label('Transaction ID'),
        _id: Joi.string().optional(),
        created_at: Joi.string().optional(),
        updated_at: Joi.string().optional()
    }
);