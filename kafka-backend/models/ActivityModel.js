const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var activityScema = new Schema({
  user_id: { type: String, required: true },
  group: new Schema({
    id: { type: String, required: true },
    name: { type: String, required: false }
  }),
  added: { type: Object, required: false },
  joined: { type: Object, required: false },
  deleted: { type: Object, required: false },
  transaction: { type: Object, required: false },
  type: { type: String, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now }
},
  {
    versionKey: false
  },
  { _id: false });

activityScema.plugin(aggregatePaginate);
module.exports = mongoose.model('Activity', activityScema);