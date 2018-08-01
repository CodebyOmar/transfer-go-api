const nexmoService = require('../services/nexmo')
const googleApi = require('../services/google')
const md5 = require('md5');

//models
const Transaction = require('../models/transactions')

async function generateTextandLink(trxn) {
  let { _id, sender, receiver, amount, currency } = trxn
  const code = _id.toString().substr(-2, Math.floor((Math.random() * 10) + 1))
  const link = encodeURI(process.env._BASE + `/transfer-go/v1/claim/` + md5(code))
  const shorten = await googleApi.shortenUrl( "https://trgo.page.link/?link=".concat(link) )
  let shorturl;

  shorten.status === 'success' ? shorturl = shorten.data.shortLink : shorturl = link
  const text = `Hi ${receiver.name}, ${sender.name} sent you ${amount} (${currency}). Click on the link to deposit funds into you bank account - \n${shorturl} \n\n Sent with Transfer-go.`
  
  return { text, code }                 
}


exports.sendSms = (req, res) => {
  let { txref } = req.params

  Transaction.findByIdAndUpdate(txref, { transaction_status:"SUCCESSFUL" })
    .then(async trxn => {
      let message = await generateTextandLink(trxn)
      let send = await nexmoService.sendMessage(message.text, trxn.receiver.phonenumber)

      if(send.is_sent) {
        trxn.claim_token = md5(message.code)
        trxn.message_delivery_status = "SENT"

        trxn.save().then(savedTrxn => {
          res.json({status:'success', data: savedTrxn, message: 'SMS transfer successful.'})
        }).catch(err => res.json({status:'success'}))

      }else {
        res.json({status:'error', data: null, message: 'Unable to send SMS.'})
      }
    })
    .catch(err => {
      res.json({status:'error', data: null, message: 'SMS transfer failed'})
    })
}