const expect   = require ('chai').expect;
const students = require ('../microservices/students/students');
// const students = require ('../microservice/students-stub');

describe ('students', () => {
  let ids = [];
  before (async () => {
    let r = await students.add ({
      name     : 'John',
      lastname : 'Smith',
      email    : 'jsmith@academy.edu'
    });
    ids.push (r.data._id);
    r = await students.add ({
      name     : 'Maria',
      lastname : 'Lopez',
      email    : 'mlopezh@academy.edu'
    });
    ids.push (r.data._id);
    r = await students.add ({
      name     : 'Ricard',
      lastname : 'Macron',
      email    : 'rmacron@academy.edu'
    });
    ids.push (r.data._id);
  });
  after (async () => {
    const p = [];
    for (let id of ids) {
      p.push (students.del (id));
    }
    await Promise.all (p);
    ids = [];
  });
  describe ('.add()', () => {
    let ids = [];
    afterEach (async () => {
      const p = [];
      for (let id of ids) {
        p.push (students.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (students.add).to.be.a ('function');
    });
    it ('insert a new student', async () => {
      const result = await students.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
    });
    it ('can insert a new student with duplicate name', async () => {
      const result = await students.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
      const result2 = await students.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result2.errors.length).to.be.equal (0);
      expect (result2.data._id).to.be.a ('string');
      ids.push (result2.data._id);
    });
    it ('cannot insert a new student without name', async () => {
      const result = await students.add ({
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot insert a new student without lastname', async () => {
      const result = await students.add ({
        name     : 'Paul',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"lastname" must be a non-empty string');
    });
    it ('cannot insert a new student without email', async () => {
      const result = await students.add ({
        name     : 'Paul',
        lastname : 'Newman'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"email" must be a non-empty string');
    });
  });
  describe ('.edit()', () => {
    let id;
    let ids = [];
    before (async () => {
      const result = await students.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      id           = result.data._id;
    });
    after (async () => {
      await students.del (id);
    });
    afterEach (async () => {
      const p = [];
      for (let id of ids) {
        p.push (students.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (students.edit).to.be.a ('function');
    });
    it ('edit an existing student', async () => {
      const result = await students.edit (id, {
        lastname : 'Newman Polanski'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('Paul');
      expect (result.data.lastname).to.be.equal ('Newman Polanski');
    });
    it ('cannot update an existing student with an empty name', async () => {
      const result = await students.edit (id, {
        name : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot edit an existing student with an empty lastname', async () => {
      const result = await students.edit (id, {
        lastname : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"lastname" must be a non-empty string');
    });
    it ('cannot edit an existing student with an empty email', async () => {
      const result = await students.edit (id, {
        email : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"email" must be a non-empty string');
    });
  });
  describe ('.list()', () => {
    it ('is a function', () => {
      expect (students.list).to.be.a ('function');
    });
    it ('return all couses', async () => {
      const result = await students.list ();
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (student => student.name)).to.be.eql ([
        'John',
        'Maria',
        'Ricard' ]
      );
    });
    it ('return students by email', async () => {
      const result = await students.list ({email : 'rmacron@academy.edu'});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (student => student.name)).to.be.eql ([
        'Ricard']
      );
    });
    it ('return students sorted by lasname', async () => {
      const result = await students.list ({}, {lastname: 1});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (student => student.name)).to.be.eql ([
        'Maria',
        'Ricard',
        'John' ]
      );
    });
  });
  describe ('.get()', () => {
    it ('is a function', () => {
      expect (students.get).to.be.a ('function');
    });
    it ('return a student by id', async () => {
      const result = await students.get (ids[ 0 ]);
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('John');
    });
    it ('cannot return a student with a wrong id', async () => {
      const result = await students.get ('wrong');
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  });
  describe ('.del()', () => {
    it ('is a function', () => {
      expect (students.del).to.be.a ('function');
    });
    it ('remove a student', async () => {
      const result = await students.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      const result2 = await students.del (result.data._id);
      expect (result2.errors.length).to.be.equal (0);
    });
    it ('cannot remove a student with a wrong id', async () => {
      const result2 = await students.del ('wrong');
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  })
});