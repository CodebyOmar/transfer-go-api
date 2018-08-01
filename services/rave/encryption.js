function getKey(seckey){
  const md5 = require('md5');
  const keymd5 = md5(seckey);
  const keymd5last12 = keymd5.substr(-12);

  let seckeyadjusted = seckey.replace('FLWSECK-', '');
  let seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

  return seckeyadjustedfirst12 + keymd5last12;
}


const encrypt = (key, text) => {
  var forge    = require('node-forge'); 
  var cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
  cipher.start({iv:''});
  cipher.update(forge.util.createBuffer(text, 'utf-8'));
  cipher.finish();
  var encrypted = cipher.output;
  return ( forge.util.encode64(encrypted.getBytes()) );
}

module.exports = {
  encrypt,
  getEncryptionKey: getKey
}