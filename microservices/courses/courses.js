const Datastore = require ('nedb-promises');
const db        = new Datastore ({filename : __dirname + '/data/courses.dat', autoload : true});
const teachers  = require ('./teachers-stub');
const students  = require ('./students-stub');

const courses = {
  async add (data) {
    const errors = [];
    if (typeof data.name !== 'string' || data.name === '') {
      errors.push ('"name" must be a non-empty string');
    }
    if (typeof data.description !== 'string' || data.description === '') {
      errors.push ('"description" must be a non-empty string');
    }
    if (typeof data.hours !== 'number' || data.hours === 0) {
      errors.push ('"hours" must be a number great than 0');
    }
    if (typeof data.level !== 'string' || ![ 'low', 'medium', 'high' ].includes (data.level)) {
      errors.push ('"level" must be a string with one of these values: "low", "medium" or "high"');
    }
    if (typeof data.teachers !== 'undefined' && Array.isArray (data.teachers) && data.teachers.length) {
      const currrentTeachers = await teachers.list ({_id : {$in : data.teachers}});
      if (currrentTeachers.data.length !== data.teachers.length) {
        errors.push ('One o more teachers are invalid');
      }
    }
    if (typeof data.students !== 'undefined' && Array.isArray (data.students) && data.students.length) {
      const currrentStudents = await students.list ({_id : {$in : data.students}});
      if (currrentStudents.data.length !== data.students.length) {
        errors.push ('One o more students are invalid');
      }
    }
    if ((await db.find ({name : data.name})).length) {
      errors.push ('"name" must be a unique value and other course has the same');
    }
    if (data.teachersExtra) {
      delete data.teachersExtra;
    }
    if (data.studentsExtra) {
      delete data.studentsExtra;
    }
    if (errors.length) {
      return {errors}
    }
    const dataResult = await db.insert (data);
    return {errors, data : dataResult};
  },
  async edit (id, data) {
    const errors = [];
    if (typeof data.name !== 'undefined' && (typeof data.name !== 'string' || data.name === '')) {
      errors.push ('"name" must be a non-empty string');
    }
    if (typeof data.description !== 'undefined' && (typeof data.description !== 'string' || data.description === '')) {
      errors.push ('"description" must be a non-empty string');
    }
    if (typeof data.hours !== 'undefined' && (typeof data.hours !== 'number' || data.hours === 0)) {
      errors.push ('"hours" must be a number great than 0');
    }
    if (typeof data.level !== 'undefined' && (typeof data.level !== 'string' || ![ 'low', 'medium', 'high' ].includes (data.level))) {
      errors.push ('"level" must be a string with one of these values: "low", "medium" or "high"');
    }
    if (data.name && (await db.find ({$not : {_id : id}, name : data.name})).length) {
      errors.push ('"name" must be a unique value and other course has the same');
    }
    if (typeof data.teachers !== 'undefined' && Array.isArray (data.teachers) && data.teachers.length) {
      const currrentTeachers = await teachers.list ({_id : {$in : data.teachers}});
      if (currrentTeachers.data.length !== data.teachers.length) {
        errors.push ('One o more teachers are invalid');
      }
    }
    if (typeof data.students !== 'undefined' && Array.isArray (data.students) && data.students.length) {
      const currrentStudents = await students.list ({_id : {$in : data.students}});
      if (currrentStudents.data.length !== data.students.length) {
        errors.push ('One o more students are invalid');
      }
    }
    if (errors.length) {
      return {errors}
    }
    if (data.teachersExtra) {
      delete data.teachersExtra;
    }
    if (data.studentsExtra) {
      delete data.studentsExtra;
    }
    return {errors, data : await db.update ({_id : id}, {$set : data}, {returnUpdatedDocs : true})};
  },
  async list (query = {}, sort = {name : 1}) {
    return {errors : [], data : await db.find (query).sort (sort)};
  },
  async get (id) {
    const data   = await db.findOne ({_id : id});
    if (data === null) {
      return {errors: ['"id" not found'], data: []};
    }
    if (data.teachers) {
      data.teachersExtra = (await teachers.list ({_id : {$in : data.teachers}})).data;
    }
    if (data.students) {
      data.studentsExtra = (await students.list ({_id : {$in : data.students}})).data;
    }
    return {errors: [], data}
  },
  async del (id) {
    const deleted = await db.remove ({_id : id})
    if (deleted === 1) {
      return {errors : []};
    }
    return {errors : [ '"id" not found' ]}
  }
};

module.exports = courses;