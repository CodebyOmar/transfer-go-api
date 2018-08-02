const joi = require('joi');

exports.sendValidation = joi.object().keys ({
    "cardno": joi.string().required(),
    "cvv": joi.string().required(),
    "expirymonth": joi.string().max(2).required(),
    "expiryyear": joi.string().max(2).required(),
    "currency": joi.string().required(),
    "country": joi.string().required(),
    "amount": joi.string().required(),
    "email": joi.string().email().required(),
    "phonenumber": joi.string().required(),
    "firstname": joi.string().required(),
    "lastname": joi.string().required(),
    "meta": joi.array().items(
      joi.object().keys({ 
        "receiver": joi.object().keys({
          name: joi.string().required(),
          phonenumber: joi.string().required()
        })
      })
    )
}).required()


exports.localCardAuthValidation = joi.object().keys ({
  "cardno": joi.string().required(),
  "cvv": joi.string().required(),
  "expirymonth": joi.string().max(2).required(),
  "expiryyear": joi.string().max(2).required(),
  "currency": joi.string().required(),
  "country": joi.string().required(),
  "amount": joi.string().required(),
  "email": joi.string().email().required(),
  "phonenumber": joi.string().required(),
  "firstname": joi.string().required(),
  "lastname": joi.string().required(),
  "txRef": joi.string().required(),
  "pin": joi.string().required(),
  "suggested_auth": joi.string().required(),
  "meta": joi.array().items(
    joi.object().keys({ 
      "receiver": joi.object().keys({
        name: joi.string().required(),
        phonenumber: joi.string().required()
      })
    })
  )
}).required()


exports.foriegnCardAuthValidation = joi.object().keys ({
  "cardno": joi.string().required(),
  "cvv": joi.string().required(),
  "expirymonth": joi.string().max(2).required(),
  "expiryyear": joi.string().max(2).required(),
  "currency": joi.string().required(),
  "country": joi.string().required(),
  "amount": joi.string().required(),
  "email": joi.string().email().required(),
  "phonenumber": joi.string().required(),
  "firstname": joi.string().required(),
  "lastname": joi.string().required(),
  "txRef": joi.string().required(),
  "suggested_auth": joi.string().required(),
  "billingzip": joi.string().required(),
  "billingcity": joi.string().required(),
  "billingaddress": joi.string().required(),
  "billingstate": joi.string().required(),
  "billingcountry": joi.string().required(),
  "meta": joi.array().items(
    joi.object().keys({ 
      "receiver": joi.object().keys({
        name: joi.string().required(),
        phonenumber: joi.string().required()
      })
    })
  )
}).required()

exports.validateOtpConstriants = joi.object().keys ({
  transaction_reference: joi.string().required(),
  otp: joi.string().required()
}).required()


exports.sendsmsValidations = joi.object().keys ({
  txref: joi.string().required(),
}).required()


exports.claimValidations = joi.object().keys ({
  "account_bank": joi.string().required(),
  "account_number": joi.string().required(),
  "amount": joi.number().required(),
  "currency": joi.string().required(),
  "narration": joi.string().required(),
  "meta": joi.array().items(
    joi.object().keys({ 
      "transaction_id": joi.string().required()
    })
  )
})


exports.getTrxnValidation = joi.object().keys({
  "code": joi.string().required()
})

exports.getBanksValidations = joi.object().keys ({
  "country": joi.string().required()
})