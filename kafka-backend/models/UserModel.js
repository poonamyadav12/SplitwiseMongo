const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('debug', true);

export const SignupStatus = Object.freeze({
    INVITED: "INVITED",
    JOINED: "JOINED",
});

var usersSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    avatar: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    id: { type: String, required: false },
    country_code: { type: String, required: false },
    default_currency: { type: String, required: true },
    registration_status: { type: String, required: true, default: SignupStatus.JOINED },
    time_zone: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now },
    phone_number:{type:String, required:false}
},
    {
        versionKey: false
    });
usersSchema.index(
    {
        first_name: "text",
        last_name: "text"
    }
);
module.exports = mongoose.model('user', usersSchema);