'use strict';

class Database {
  constructor(port, host, name) {
    this.mongoose = require('mongoose');
    this._connect(port, host, name);
  }

  _connect(port, host, name) {
    this.mongoose.Promise = global.Promise;
    this.mongoose.connect(`mongodb://${host}:${port}/${name}`, { useNewUrlParser: true });
    const {connection} = this.mongoose;

    connection.on('connected', () =>
      console.log('Database Connection was Successful')
    );
    connection.on('error', (err) =>
      console.log('Database Connection Failed' + err)
    );
    connection.on('disconnected', () =>
      console.log('Database Connection Disconnected')
    );

    process.on('SIGINT', () => {
      connection.close();
      console.log(
        'Database Connection closed due to NodeJs process termination'
      );
      process.exit(0);
    });

    // initialize Models
    require('../models');
  }
}

module.exports = Database;