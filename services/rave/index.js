/**
 * ravepayyy
 */
const axios = require('axios')
const Encryption = require('./encryption')
const RPK = process.env.RPK
const RSK = process.env.RSK

const Rave = axios.create({
  baseURL: "https://ravesandboxapi.flutterwave.com",
  headers: {
    'Content-Type': 'application/json'
  }
})

// fetch banks
exports.getBanks = async (country) => {
  return await Rave.get('/banks', { params: {country} })
    .then(response => response.data)
    .catch(err => err.response.data)
}

// initiate card charge
exports.chargeCard = async (data) => {
  let key = Encryption.getEncryptionKey(process.env.RSK)
  let payload = {}
  payload.client = Encryption.encrypt(key, JSON.stringify(data))
  payload.PBFPubKey = process.env.RPK
  payload.alg = '3DES-24'

  return await Rave.post("/flwv3-pug/getpaidx/api/charge", payload)
    .then(response => response.data)
    .catch(err => err.response.data)
}

// validate otp/payment
exports.validateOtp = async (data) => {
  return await Rave.post("/flwv3-pug/getpaidx/api/validatecharge", data)
    .then(response => response.data)
    .catch(err => err.response.data)
}

// verify payment
exports.verifyPayment = async (trxnRef) => {
  let payload = {}
  payload.txref = trxnRef
  payload.SECKEY = process.env.RSK

  return await Rave.post("/flwv3-pug/getpaidx/api/v2/verify", payload)
    .then(response => response.data)
    .catch(err => err.response.data)
}

// initiate transfer
exports.initiateTransfer = async (data) => {
  return await Rave.post("v2/gpx/transfers/create", data)
    .then(response => response.data)
    .catch(err => err.response.data)
}

// fetch transfer
exports.getTransfer = async (params) => {
  return await Rave.get("/v2/gpx/transfers", { params })
  .then(response => response.data)
  .catch(err => err.response.data)
}