import Joi from 'joi';
const passwordComplexity = require("joi-password-complexity");

export const SignupStatus = Object.freeze({
    INVITED: "INVITED",
    JOINED: "JOINED",
});

export const GroupJoinStatus = Object.freeze({
    INVITED: "INVITED",
    JOINED: "JOINED",
});

const complexityOptions = {
    min: 8,
    max: 100,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 2,
};

const userfields = {
    first_name: Joi.string().alphanum().min(3).max(50).required().label('First name'),
    last_name: Joi.string().alphanum().min(3).max(50).optional(),
    avatar: Joi.string().uri().required(),
    email: Joi.string().email().required().label('Email'),
    id: Joi.ref('email'),
    country_code: Joi.string().max(5),
    default_currency: Joi.string().min(3).max(3).required().label('Default currency'),
    registration_status: Joi.string().default(SignupStatus.JOINED),
    time_zone: Joi.string().required().label('Time zone'),
};

export const userschema = Joi.object().keys({
    ...userfields,
    password: passwordComplexity(complexityOptions, "password").required().label('password'),
});

export const updateuserschema = Joi.object().keys(
    {
        ...userfields,
        password: Joi.string().required().label('current password'),
        new_password: passwordComplexity(complexityOptions, "new password").optional().label('new password'),
        _id: Joi.string().optional()
    }
);

export const invitedUserSchema = Joi.object().keys(
    {
        first_name: Joi.string().alphanum().min(3).max(50).required(),
        last_name: Joi.string().alphanum().min(3).max(50).optional(),
        picture: Joi.string().uri().optional(),
        email: Joi.string().email().required(),
        registration_status: Joi.string().default(SignupStatus.INVITED),
        group_join_status: Joi.string().optional(),
    }
);
