const mongoose = require('mongoose')
const Schema = mongoose.Schema

let claimSchema = new Schema ({
  status: { type: String, required: false, enum:['NOT CLAIMED','INITIATED', 'FAILED', 'CLAIMED'] },
  rave_transfer_id: { type: Number },
  amount: { type: Number, required: false },
  currency: String,
  account_name: String ,
  account_number: { type:String, required: false },
  bank: { type:String, required: false },
  phonenumber: String
}, { timestamps: true })

module.exports = mongoose.model("Claim", claimSchema)