const app        = require('express')(),
      bodyParser = require('body-parser')
      routes     = require('./routes')
      Database   = require('./config/database.config')

 app.use(bodyParser.urlencoded({ extended:true }))
 app.use(bodyParser.json()) 

 // Connect to database
 new Database(process.env.DB_PORT, process.env.DB_HOST, process.env.DB_NAME)    

 //CORS
 app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });    
 
 //routes
 app.use('/transfer-go/v1/send/', routes.send)
 app.use('/transfer-go/v1/claim/', routes.claim)

 const port = process.env.PORT
 app.listen(port, () => console.log(`App is running on port ${process.env.PORT}!`))