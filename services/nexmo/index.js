const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: process.env.NAK,
  apiSecret: process.env.NSK
});


const sendMessage = async (text, phoneno, from="Transfer-go") => {  
  const opts = { "type": "unicode" }

  return await new Promise((resolve, reject) => {
    nexmo.message.sendSms(from, phoneno, text, opts, (error, response) => {
      if(error) {
        reject ({ status:"FAILED", is_sent: false, message:null });

      }else if(response.messages[0].status != 0) {

        reject ({ status:"FAILED", is_sent: false, message:'Nexmo returned back a non-zero status' });

      } else {

        resolve ({ status:"SENT", is_sent: true, message:null });
      }
    });
  })
  .then(response => response)
  .catch(err => err)
}

module.exports = {
  sendMessage
}