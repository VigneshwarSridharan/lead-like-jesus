const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'lead_like_jesus',
        charset: 'utf8'
    }
})
const bookshelf = require('bookshelf')(knex)

const User = bookshelf.model('User', {
    tableName: 'users',
    role() {
        return this.morphOne('Role','id')
    }
})
const Role = bookshelf.model('Role', {
    tableName: 'roles',
})
const Temp = bookshelf.model('Temp', {
    tableName: 'temps'
})
module.exports = {
    User,
    Role,
    Temp
};