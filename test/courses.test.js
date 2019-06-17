const expect   = require ('chai').expect;
const courses  = require ('../microservices/courses/courses');
const teachers = require ('../microservices/teachers/teachers');
// const courses = require ('../src/courses-stub');
// const teachers = require ('../src/teachers-stub');

describe ('courses', () => {
  let ids        = [];
  let teachersId = [];
  before (async () => {
    let r = await teachers.add ({
      name      : 'Jeny',
      lastname  : 'Meldenson',
      biography : 'A tearcher',
      email     : 'jmeldenson@academy.edu'
    });
    teachersId.push (r.data._id);
    r = await teachers.add ({
      name      : 'Allan',
      lastname  : 'Allen',
      biography : 'A tearcher',
      email     : 'aallen@academy.edu'
    });
    teachersId.push (r.data._id);
    r = await courses.add ({
      name        : 'Avanced Javascript',
      description : 'The best avanced course about Javascript',
      duration    : '4 weeks',
      hours       : 20,
      level       : 'high',
      type        : 'online',
      teachers    : teachersId
    });
    ids.push (r.data._id);
    r = await courses.add ({
      name        : 'All Javascript',
      description : 'The best medium level course about Javascript',
      duration    : '2 weeks',
      hours       : 10,
      level       : 'medium',
      type        : 'online'
    });
    ids.push (r.data._id);
    r = await courses.add ({
      name        : 'Introduction to Javascript',
      description : 'The best introduction about Javascript',
      duration    : '1 weeks',
      hours       : 5,
      level       : 'low',
      type        : 'online'
    });
    ids.push (r.data._id);
  });
  after (async () => {
    const p = [];
    for (let id of ids) {
      p.push (courses.del (id));
    }
    for (let id of teachersId) {
      p.push (teachers.del (id));
    }
    await Promise.all (p);
    ids = [];
  });
  describe ('.add()', () => {
    let ids = [];
    afterEach (async () => {
      const p = [];
      for (let id of ids) {
        p.push (courses.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (courses.add).to.be.a ('function');
    });
    it ('insert a new course', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The best avanced course about Javascript',
        duration    : '4 weeks',
        hours       : 20,
        level       : 'high',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
    });
    it ('insert a new course with tearchers', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The best avanced course about Javascript',
        duration    : '4 weeks',
        hours       : 20,
        level       : 'high',
        type        : 'online',
        teachers    : teachersId
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
    });
    it ('cannot insert a new course with duplicate name', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The best avanced course about Javascript',
        duration    : '4 weeks',
        hours       : 20,
        level       : 'high',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
      const result2 = await courses.add ({
        name        : 'JS Avanced',
        description : 'The second avanced course about Javascript',
        duration    : '2 weeks',
        hours       : 10,
        level       : 'high',
        type        : 'online'
      });
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.eql ('"name" must be a unique value and other course has the same');
    });
    it ('cannot insert a new course without name', async () => {
      const result = await courses.add ({
        description : 'The second avanced course about Javascript',
        duration    : '2 weeks',
        hours       : 10,
        level       : 'high',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot insert a new course without description', async () => {
      const result = await courses.add ({
        name     : 'JS Avanced',
        duration : '2 weeks',
        hours    : 10,
        level    : 'high',
        type     : 'online'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"description" must be a non-empty string');
    });
    it ('cannot insert a new course without hours', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The second avanced course about Javascript',
        duration    : '2 weeks',
        hours       : 0,
        level       : 'high',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"hours" must be a number great than 0');
    });
    it ('cannot insert a new course with wrong level', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The second avanced course about Javascript',
        duration    : '2 weeks',
        hours       : 20,
        level       : 'other',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"level" must be a string with one of these values: "low", "medium" or "high"');
    });
  });
  describe ('.edit()', () => {
    let id;
    let ids = [];
    before (async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The best avanced course about Javascript',
        duration    : '4 weeks',
        hours       : 20,
        level       : 'high',
        type        : 'online'
      });
      id           = result.data._id;
    });
    after (async () => {
      await courses.del (id);
    });
    afterEach (async () => {
      const p = [];
      for (let id of ids) {
        p.push (courses.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (courses.edit).to.be.a ('function');
    });
    it ('edit an existing course', async () => {
      const result = await courses.edit (id, {
        name  : 'Very Avanced Javascript',
        hours : 40
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('Very Avanced Javascript');
      expect (result.data.hours).to.be.equal (40);
      expect (result.data.level).to.be.equal ('high');
    });
    it ('cannot update an existing course with duplicate name', async () => {
      const result2 = await courses.edit (id, {
        name : 'Avanced Javascript'
      });
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.eql ('"name" must be a unique value and other course has the same');
    });
    it ('cannot update an existing course with an empty name', async () => {
      const result = await courses.edit (id, {
        name : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot edit an existing course with an empty description', async () => {
      const result = await courses.edit (id, {
        description : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"description" must be a non-empty string');
    });
    it ('cannot edit an existing course without hours', async () => {
      const result = await courses.edit (id, {
        hours : 0
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"hours" must be a number great than 0');
    });
    it ('cannot edit an existing course with wrong level', async () => {
      const result = await courses.edit (id, {
        level : 'other'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"level" must be a string with one of these values: "low", "medium" or "high"');
    });
  });
  describe ('.list()', () => {
    it ('is a function', () => {
      expect (courses.list).to.be.a ('function');
    });
    it ('return all couses', async () => {
      const result = await courses.list ();
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (course => course.name)).to.be.eql ([
        'All Javascript',
        'Avanced Javascript',
        'Introduction to Javascript' ]
      );
    });
    it ('return medium and high level courses', async () => {
      const result = await courses.list ({$or : [ {level : 'medium'}, {level : 'high'} ]});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (course => course.name)).to.be.eql ([
        'All Javascript',
        'Avanced Javascript' ]
      );
    });
    it ('return courses sorted by duration (low to high)', async () => {
      const result = await courses.list ({}, {hours : 1});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (course => course.name)).to.be.eql ([
        'Introduction to Javascript',
        'All Javascript',
        'Avanced Javascript' ]
      );
    });
  });
  describe ('.get()', () => {
    it ('is a function', () => {
      expect (courses.get).to.be.a ('function');
    });
    it ('return a course by id', async () => {
      const result = await courses.get (ids[ 0 ]);
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('Avanced Javascript');
      expect (result.data.teachersExtra[0].email).to.be.equal('aallen@academy.edu');
      expect (result.data.teachersExtra[1].email).to.be.equal('jmeldenson@academy.edu');
    });
    it ('cannot return a course with a wrong id', async () => {
      const result = await courses.get ('wrong');
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  });
  describe ('.del()', () => {
    it ('is a function', () => {
      expect (courses.del).to.be.a ('function');
    });
    it ('remove a course', async () => {
      const result = await courses.add ({
        name        : 'JS Avanced',
        description : 'The best avanced course about Javascript',
        duration    : '4 weeks',
        hours       : 20,
        level       : 'high',
        type        : 'online'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      const result2 = await courses.del (result.data._id);
      expect (result2.errors.length).to.be.equal (0);
    });
    it ('cannot remove a course with a wrong id', async () => {
      const result2 = await courses.del ('wrong');
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  })
});