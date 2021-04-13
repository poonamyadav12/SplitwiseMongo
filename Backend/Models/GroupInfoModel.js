const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var groupSchema = new Schema({
  creator: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, required: false },
  members: { type: Array, required: true },
  id: { type: String, required: true, unique: true },
  group_join_status: { type: Array, required: false },
  created_at    : { type: Date, required: true, default: Date.now },
  updated_at    : { type: Date, required: true, default: Date.now }
},
  {
    versionKey: false
  },
  { _id : false });

module.exports = mongoose.model('GroupInfo', groupSchema);