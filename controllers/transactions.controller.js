const raveService = require('../services/rave')
const nexmoService = require('../services/nexmo')

//models
const Transaction = require('../models/transactions')
const Claim = require('../models/claims')

exports.getTransaction = (req, res) => {
  let { code } = req.params

  Transaction.findOne({ claim_token: code }).then(trxn => {
    if(trxn) {
      res.json({ status:'success', data:trxn, message: 'Transaction fetched successfully'})
    }else {
      res.status(404).json({ status:"error", data: null, message: 'Transaction not found'})
    }
  }).catch(err => {
    res.status(503).json({ status:'error', data: null, message: 'Failed to fetch transaction'})
  })
}


// STEP I: Initiate phone transfer/card charge
exports.sendToPhone = async (req, res) => {
  let transaction = new Transaction()
  let { amount, firstname, lastname, meta, phonenumber, currency } = req.body
  transaction.amount = amount
  transaction.currency = currency
  transaction.sender = { name: firstname.concat(" "+lastname), phonenumber }
  transaction.receiver = meta[0]

  let cardData = Object.assign({ "PBFPubKey": process.env.RPK, "txRef": transaction._id, "IP": req.ip}, req.body)

  transaction.save().then(async trxn => {

    const send = await raveService.chargeCard(cardData)
    res.json({ 
      status:send.status, 
      data: { 
        rave_response: send, 
        txRef: trxn._id 
      } 
    })

  }).catch(err => { res.json({ data: { rave_response: null }, status: 'error'}) })
}


// STEP II
// Authenticate local card with PIN
exports.localCardAuthentication = async (req, res) => {
  let trxnData = Object.assign ({"PBFPubKey": process.env.RPK, "IP": req.ip}, req.body)

  const authenticate = await raveService.chargeCard(trxnData)
  res.json({status: authenticate.status, rave_response:authenticate})
}


// Authenticate international card with billing info
exports.internationalCardAuth = async (req, res) => {
  let trxnData = Object.assign ({"PBFPubKey": process.env.RPK, "IP": req.ip}, req.body)

  const authenticate = await raveService.chargeCard(trxnData)
  res.json({status: authenticate.status, rave_response:authenticate})
}


// STEP III: Validate card charge with OTP from bank.
exports.validateCardCharge = async (req, res) => {
  let payload = Object.assign({"PBFPubKey": process.env.RPK }, req.body)

  const validate_otp = await raveService.validateOtp(payload)

  try {
    switch(validate_otp.data.data.responsecode)  {
      // charge successful
      case "00": 
        let ref = validate_otp.data.tx.txRef
        const verifyPay = await raveService.verifyPayment(ref)

        if(verifyPay.data.status === 'successful' && verifyPay.data.chargecode === '00') {
          let resData = {
            txref: ref,
            amount: verifyPay.data.amount, 
            chargedamount: verifyPay.data.chargedamount 
          }

          res.json({status: 'successful', data: resData, message: "Transaction successful"})

        }else {
          res.json({status: verifyPay.data.status, data: null, message: verifyPay.data.chargemessage})
        }
        break;
      // not successfull/pending  
      default: 
        res.json({ data: validate_otp })  
        break;
    }

  }catch {
    res.json({ status: 'error', data: validate_otp })
  }
}


// Claim fundsss
exports.claimFunds = (req, res) => {
  let {amount, meta, account_bank, account_number, currency, narration} = req.body
  let claim = new Claim()

  // find transaction to be claimed
  Transaction.findById( meta[0].transaction_id )
  .populate('claim')
  .then(async trxn => {
     
    let claimed = false

    // check if funds has been claimed already
    if(trxn.claim.length > 0) {
      let response = { 
        status:'success', 
        data:{ is_claimed: true, claim: trxn.claim },
        message:"Claimed successfully" 
      }

      claimed = trxn.claim.some(_claim => _claim.status === "CLAIMED" || _claim.status === "INITIATED")
      claimed && res.status(200).json(response)
    }
    
    //check if amount to be claimed is correct
    if(!claimed && amount === parseInt(trxn.amount)) {
      let payload = {amount, meta, account_bank, account_number, currency, narration}
      payload.reference = claim._id
      payload.seckey = process.env.RSK
      // initiate transfer on rave
      const tryClaim = await raveService.initiateTransfer(payload)

      if(tryClaim.status === 'success') {
        let { id, account_number, fullname, amount, bank_name, currency } = tryClaim.data
        claim.rave_transfer_id = id
        claim.status = "INITIATED"
        claim.amount = amount
        claim.account_name = fullname
        claim.account_number = account_number
        claim.bank = bank_name
        claim.phonenumber = trxn.receiver.phonenumber
        claim.currency = currency
        //save claim
        claim.save()

        // edit transaction and save
        trxn.claim.push(claim)
        trxn.save()
        res.json({ status: 'success', data: tryClaim })

      }else {
        res.json({ status:'error', data: tryClaim, message: 'Failed to initiate transfer.' })
      }

    }else if(!claimed && amount !== parseInt(trxn.amount)) {
      res.status(403).json({ status:'error', data: null, message: 'Unauthorized access!'})
    }

  }).catch(err => {
    res.status(503).json({ status:'error', data:null, message: 'Service unavailable' })
  }) 
}


// receive webhook and update transactions 
exports.receiveWebhook = (req, res) => {
  const hash = req.headers["verif-hash"];

  if(!hash) { res.status(403) }

  const webhook_hash = process.env.WEBHOOK_HASH
  
  //validate hash
  if(hash !== webhook_hash) { res.status(403) }

  // respond with success
  res.status(200)

  // find claim(if claim), update and notify user
  let { status, reference } = req.body

  if (status === 'SUCCESSFUL'){

    Claim.findByIdAndUpdate(reference, {status:'CLAIMED'})
      .then(async claim => {
        if(claim) {
          let message = `Successfully deposited ${claim.amount}(${claim.currency}) in your bank account. Thank you for using Transfer-go.`
          await nexmoService.sendMessage(message, claim.phonenumber)
        }else { return; }
      }).catch(err => { return; })

  }else if (status === 'FAILED') {

    Claim.findByIdAndUpdate(reference, {status:'CLAIMED'})
      .then(async claim => {
        if(claim) {
          let message = `Failed deposit ${claim.amount}(${claim.currency}) in your bank account. Try again, Thank you for using Transfer-go.`
          await nexmoService.sendMessage(message, claim.phonenumber)
        }else { return; }
      }).catch(err => { return; })

  } 
}