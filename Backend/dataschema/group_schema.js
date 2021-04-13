import Joi from 'joi';
import { invitedUserSchema } from './user_schema';

const groupfields = {
    creator: Joi.string().email().required().label('creator'),
    name: Joi.string().min(3).max(50).required().label('name'),
    avatar: Joi.string().uri().required(),
    members: Joi.array().items(invitedUserSchema).min(2).label('members'),
};

export const creategroupschema = Joi.object().keys(
    groupfields
);

export const updategroupschema = Joi.object().keys(
    {
        ...groupfields,
        id: Joi.string().required().label('Group ID'),
        _id:Joi.string().optional(),
    }
);