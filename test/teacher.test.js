const expect   = require ('chai').expect;
const teachers = require ('../microservices/teachers/teachers');
// const teachers = require ('../src/teachers-stub');

describe ('teachers', () => {
  let ids = [];
  before (async () => {
    let r = await teachers.add ({
      name     : 'John',
      lastname : 'Willians',
      biography: 'The best teacher',
      email    : 'jwillians@academy.edu'
    });
    ids.push (r.data._id);
    r = await teachers.add ({
      name     : 'Jose',
      lastname : 'Martinez',
      biography: 'The best latin teacher',
      email    : 'jmartinez@academy.edu'
    });
    ids.push (r.data._id);
    r = await teachers.add ({
      name     : 'Abel',
      lastname : 'Dubois',
      biography: 'The best french teacher',
      email    : 'adubois@academy.edu'
    });
    ids.push (r.data._id);
  });
  after (async () => {
    const p = [];
    for (let id of ids) {
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
        p.push (teachers.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (teachers.add).to.be.a ('function');
    });
    it ('insert a new teacher', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
    });
    it ('cannot insert a new teacher with duplicate name', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      ids.push (result.data._id);
      const result2 = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.equal ('"name"+"lastname" must be a unique value and other teacher has the same');
    });
    it ('cannot insert a new teacher without name', async () => {
      const result = await teachers.add ({
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot insert a new teacher without lastname', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"lastname" must be a non-empty string');
    });
    it ('cannot insert a new teacher without biography', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"biography" must be a non-empty string');
    });
    it ('cannot insert a new teacher without email', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        biography: 'A new teacher',
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
      const result = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      id           = result.data._id;
    });
    after (async () => {
      await teachers.del (id);
    });
    afterEach (async () => {
      const p = [];
      for (let id of ids) {
        p.push (teachers.del (id));
      }
      await Promise.all (p);
      ids = [];
    });
    it ('is a function', () => {
      expect (teachers.edit).to.be.a ('function');
    });
    it ('edit an existing teacher', async () => {
      const result = await teachers.edit (id, {
        lastname : 'Newman Polanski'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('Paul');
      expect (result.data.lastname).to.be.equal ('Newman Polanski');
    });
    it ('cannot update an existing teacher with an empty name', async () => {
      const result = await teachers.edit (id, {
        name : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"name" must be a non-empty string');
    });
    it ('cannot edit an existing teacher with an empty lastname', async () => {
      const result = await teachers.edit (id, {
        lastname : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"lastname" must be a non-empty string');
    });
    it ('cannot edit an existing teacher with an empty biography', async () => {
      const result = await teachers.edit (id, {
        biography : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"biography" must be a non-empty string');
    });
    it ('cannot edit an existing teacher with an empty email', async () => {
      const result = await teachers.edit (id, {
        email : ''
      });
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"email" must be a non-empty string');
    });
  });
  describe ('.list()', () => {
    it ('is a function', () => {
      expect (teachers.list).to.be.a ('function');
    });
    it ('return all couses', async () => {
      const result = await teachers.list ();
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (teacher => teacher.name)).to.be.eql ([
        'Abel',
        'John',
        'Jose']
      );
    });
    it ('return teachers by email', async () => {
      const result = await teachers.list ({email : 'adubois@academy.edu'});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (teacher => teacher.name)).to.be.eql ([
        'Abel']
      );
    });
    it ('return teachers sorted by lasname', async () => {
      const result = await teachers.list ({}, {lastname: 1});
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.map (teacher => teacher.name)).to.be.eql ([
        'Abel',
        'Jose',
        'John' ]
      );
    });
  });
  describe ('.get()', () => {
    it ('is a function', () => {
      expect (teachers.get).to.be.a ('function');
    });
    it ('return a teacher by id', async () => {
      const result = await teachers.get (ids[ 0 ]);
      expect (result.errors.length).to.be.equal (0);
      expect (result.data.name).to.be.equal ('John');
    });
    it ('cannot return a teacher with a wrong id', async () => {
      const result = await teachers.get ('wrong');
      expect (result.errors.length).to.be.equal (1);
      expect (result.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  });
  describe ('.del()', () => {
    it ('is a function', () => {
      expect (teachers.del).to.be.a ('function');
    });
    it ('remove a teacher', async () => {
      const result = await teachers.add ({
        name     : 'Paul',
        lastname : 'Newman',
        biography: 'A new teacher',
        email    : 'pnewman@academy.edu'
      });
      expect (result.errors.length).to.be.equal (0);
      expect (result.data._id).to.be.a ('string');
      const result2 = await teachers.del (result.data._id);
      expect (result2.errors.length).to.be.equal (0);
    });
    it ('cannot remove a teacher with a wrong id', async () => {
      const result2 = await teachers.del ('wrong');
      expect (result2.errors.length).to.be.equal (1);
      expect (result2.errors[ 0 ]).to.be.equal ('"id" not found');
    });
  })
});