const router = require('express').Router()
const transactionsController = require('../controllers/transactions.controller')
const smsController = require('../controllers/sms.controller')
const validations = require('../helpers/validations/sendValidation')
const isValid = require('../middlewares/validator')

// send cash to phone number
router.post (
  '/initiate', 
  isValid({ 'body':validations.sendValidation }), 
  transactionsController.sendToPhone
)

//authenticate local card and send cash
router.post (
  '/cardauth/local', 
  isValid({ 'body':validations.localCardAuthValidation }), 
  transactionsController.localCardAuthentication
)

//authenticate international card and send cash
router.post (
  '/cardauth/international', 
  isValid({ 'body':validations.foriegnCardAuthValidation }), 
  transactionsController.internationalCardAuth
)

router.post (
  '/validate_otp',
  isValid({ 'body': validations.validateOtpConstriants }),
  transactionsController.validateCardCharge
)

router.post (
  '/smslink/:txref',
  isValid({ 'params': validations.sendsmsValidations }),
  smsController.sendSms
)

router.get (
  '/transaction/:code',
  isValid({ params: validations.getTrxnValidation }),
  transactionsController.getTransaction
)

router.post (
  '/webhook',
  transactionsController.receiveWebhook
)

router.get (
  '/banks/:country',
  isValid({ params: validations.getBanksValidations }),
  transactionsController.getBanks
)

module.exports = router