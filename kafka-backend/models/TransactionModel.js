const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export const TransactionStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
});
const opts = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

var commentSchema = new Schema({
  comment: { type: String, required: false },
  userId: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },

});

var transactionSchema = new Schema({
  from: { type: String, required: true },
  to: { type: Array, required: true },
  amount: { type: Number, required: true },
  currency_code: { type: String, required: true },
  id: { type: String, required: false },
  group_id: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: false, default: TransactionStatus.ACTIVE },
  type: { type: String, required: false, default: 'TRANSACTION' },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
  comments : [commentSchema]

},
  {
    versionKey: false
  },
  { timestamps: { createdAt: 'created_at' } },
  { _id: false });
module.exports = mongoose.model('Transaction', transactionSchema);