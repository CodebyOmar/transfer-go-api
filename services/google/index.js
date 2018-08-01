const axios = require('axios')

const shortenUrl = async (longDynamicLink) => {
  return await axios({
    method: 'post',
    params: { key: process.env.GUS_API_KEY },
    data: { longDynamicLink, "suffix": { "option": "SHORT"} },
    headers: { 'Content-Type': 'application/json' }, 
    url:"https://firebasedynamiclinks.googleapis.com/v1/shortLinks"
  }).then(response => {

    if (response.data.shortLink) {
      return { 'status':'success', data:response.data, message:'Successful.'}
    }else {
      return { 'status':'error', data:response.data, message:'Failed.'}
    }
    
  }).catch(err => console.error(err.response) )
}

module.exports = {
  shortenUrl
}