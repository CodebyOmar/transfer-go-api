const mongoose = require('mongoose')
const Schema = mongoose.Schema

let transactionSchema = new Schema({
  transaction_status: { type:String, required:false, enum:["PENDING", "FAILED", "SUCCESSFUL"], default:"PENDING" }, 
  amount: { type: String, required: false },
  currency: { type: String, required:false },
  message_delivery_status: { type: String, required: false, enum:[ "FAILED", "SENT", "DELIVERED"] },
  claim_token: { type: String, required: false },
  claim: [{ type:mongoose.Schema.Types.ObjectId, required: false, ref:'Claim' }],
  sender: {   
    name: { type: String, required: false },
    phonenumber: { type: String, required: false }
  },
  receiver: { 
    name: { type: String, required: false },
    phonenumber: { type: String, required: false }
  },
}, {timestamps:true})

module.exports = mongoose.model('Transaction', transactionSchema)