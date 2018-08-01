const joi = require('joi')

module.exports = (validation) => {
  return (req, res, next) => {
    
    // always allow validation to allow unknown fields by default.
    let options = {
      allowUnknown: true
    };

    if (!validation) {
      return next(); // skip validation if not set
    }

    let validProperties = ['body', 'query', 'params'];

    for (let i in validation) {
      if (validProperties.indexOf(i) < 0) {
        console.log('Route contains unsupported validation key');
        throw new Error('An unsupported validation key was set in route');

      } else {
        if (req[i] === undefined) {
          console.log('Empty request ' + i + ' was sent');

          res.send({
            status: 'error',
            message: 'Missing request ' + i,
            data: null
          });
          return;
        }

        let result = joi.validate(req[i], validation[i], options);

        if (result.error) {
          console.log('validation error - %s', result.error.message);

          res.send({
            status: 'error',
            message: result.error.details[0].message,
            data: null 
          });
          return;

        } else {
          console.log('successfully validated request parameters');
        }
      }
    }

    next();
  }
}