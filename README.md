# jsRPC example

Simple jsRPC use example. All comunicatio from browser to server and microservice to microservice are using jsRPC.


## Microservices


### Courses

Call to `students` and `teachers` microservices.

Expose this methods:

- `courses.list([query][, sort])` get all course with a query (by default all) and a sort (by default name)
- `courses.get(id)` get a course by id
- `courses.add(data)` create a new course
- `courses.edit(id, data)` update an existing course
- `courses.del(id)` remove an existing course

run with

```bash
cd microservices/courses
node index.js
```


### Students

Expose this methods:

- `students.list([query][, sort])` get all student with a query (by default all) and a sort (by default name)
- `students.get(id)` get a student by id
- `students.add(data)` create a new student
- `students.edit(id, data)` update an existing student
- `students.del(id)` remove an existing student

run with

```bash
cd microservices/students
node index.js
```


### Teachers

Expose this methods:

- `teachers.list([query][, sort])` get all teacher with a query (by default all) and a sort (by default name)
- `teachers.get(id)` get a teacher by id
- `teachers.add(data)` create a new teacher
- `teachers.edit(id, data)` update an existing teacher
- `teachers.del(id)` remove an existing teacher

run with

```bash
cd microservices/teachers
node index.js
```


## Browser

Open with:

```bash
./node_modules/.bin/http-server ./front -o
```