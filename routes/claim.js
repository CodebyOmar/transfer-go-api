const router = require('express').Router()
const transactionsController = require('../controllers/transactions.controller')
const validations = require('../helpers/validations/sendValidation')
const isValid = require('../middlewares/validator')

// Activate fundss claim
router.post (
  '/activate', 
  isValid({ 'body':validations.claimValidations }), 
  transactionsController.claimFunds
)

module.exports = router