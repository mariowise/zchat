
var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
    development: {
        db: 'mongodb://localhost/zchat',
        root: rootPath,
        app: {
            name: 'ZChat'
        },
    },
    production: {
        db:'',
        root: '',
        app: {
            name:''
        },
    }
}