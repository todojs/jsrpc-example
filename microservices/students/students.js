const Datastore = require ('nedb-promises');
const db        = new Datastore ({filename : __dirname + '/data/students.dat', autoload : true});

const students = {
  async add (data) {
    const errors = [];
    if (typeof data.name !== 'string' || data.name === '') {
      errors.push ('"name" must be a non-empty string');
    }
    if (typeof data.lastname !== 'string' || data.lastname === '') {
      errors.push ('"lastname" must be a non-empty string');
    }
    if (typeof data.email !== 'string' || data.email === '') {
      errors.push ('"email" must be a non-empty string');
    }
    if (errors.length) {
      return {errors}
    }
    return {errors, data : await db.insert (data)};
  },
  async edit (id, data) {
    const errors = [];
    if (typeof data.name !== 'undefined' && (typeof data.name !== 'string' || data.name === '')) {
      errors.push ('"name" must be a non-empty string');
    }
    if (typeof data.lastname !== 'undefined' && (typeof data.lastname !== 'string' || data.lastname === '')) {
      errors.push ('"lastname" must be a non-empty string');
    }
    if (typeof data.email !== 'undefined' && (typeof data.email !== 'string' || data.email === '')) {
      errors.push ('"email" must be a non-empty string');
    }
    if (errors.length) {
      return {errors}
    }
    return {errors, data : await db.update ({_id : id}, {$set : data}, {returnUpdatedDocs : true})};
  },
  async list (query = {}, sort = {name : 1, lastname: 1}) {
    return {errors : [], data : await db.find (query).sort (sort)};
  },
  async get (id) {
    const errors = [];
    const data = await db.findOne ({_id : id});
    if (data === null) {
      errors.push('"id" not found');
    }
    return {errors, data};
  },
  async del (id) {
    const deleted = await db.remove ({_id : id})
    if (deleted === 1) {
      return {errors : [] };
    }
    return {errors: ['"id" not found']}
  }
};

module.exports = students;