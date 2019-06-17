/**
 * Router
 */
(function () {
  const container = document.getElementById ('container');
  const views     = container.getElementsByClassName ('view');
  
  function router () {
    const base  = location.hash.slice (1) || '/';
    const parts = base.split ('/');
    const path  = parts[ 1 ] || 'home';
    const ref   = parts[ 2 ];
    for (let view of views) {
      if (view.id === path) {
        view.classList.remove ('hidden');
        view.dispatchEvent (new CustomEvent ('active', {detail : {ref : ref}}));
      } else {
        view.classList.add ('hidden');
      }
    }
  }
  
  window.addEventListener ('hashchange', router);
  window.addEventListener ('load', router);
  
}) ();

/**
 * Loading
 */
const loading = (function initLoading () {
  const modal = document.querySelector ('#modal-loading');
  return function loading () {
    modal.checked = !modal.checked;
  };
}) ();

/**
 * error
 */
const error = (function initLoading () {
  const modal = document.querySelector ('#modal-error');
  const text  = document.querySelector ('#modal-error + div > .card > p');
  return function error (msg) {
    text.innerHTML = msg;
    modal.checked  = !modal.checked;
  };
}) ();

/**
 * confirm
 */
const confirm = (function initLoading () {
  const modal = document.querySelector ('#modal-confirm');
  const text  = document.querySelector ('#modal-confirm + div > .card > p');
  const yes   = document.querySelector ('#modal-confirm-yes');
  const no    = document.querySelector ('#modal-confirm-no');
  let resolve;
  yes.addEventListener ('click', function () {
    modal.checked = false;
    resolve (true);
  });
  no.addEventListener ('click', function () {
    modal.checked = false;
    resolve (false);
  });
  return function error (msg) {
    text.innerHTML = msg;
    modal.checked  = !modal.checked;
    return new Promise (function (r) {
      resolve = r;
    })
  };
}) ();

/**
 * Courses (list)
 */
(function () {
  const view      = document.querySelector ('#container #courses');
  const addCourse = document.querySelector ('#addCourse');
  const tableBody = view.querySelector ('tbody');
  addCourse.addEventListener ('click', function () {
    window.location.hash = `/course/new/`;
  });
  tableBody.addEventListener ('click', function (evt) {
    let el = evt.target;
    while (el.tagName !== 'TR') {
      el = el.parentNode;
    }
    window.location.hash = `/course/${ el.id }/`;
  });
  view.addEventListener ('active', function () {
    loading ();
    courses.list ()
           .then (function (result) {
             loading ();
             tableBody.innerHTML = result.data.map (record => `
              <tr id="${ record._id }">
                <td data-label="Name">${ record.name }</td>
                <td data-label="Level">${ record.level }</td>
                <td data-label="Hours">${ record.hours }</td>
                <td data-label="Type">${ record.type }</td>
              </tr>
              `).join ('');
           })
           .catch (function (err) {
             loading ();
             error (err.message);
           });
  });
}) ();

/**
 * Course (get, add, edit and delete)
 */
(function () {
  const view                   = document.querySelector ('#container #course');
  const inputName              = document.querySelector ('#course-name');
  const inputDescription       = document.querySelector ('#course-description');
  const inputDuration          = document.querySelector ('#course-duration');
  const inputHours             = document.querySelector ('#course-hours');
  const inputLevel             = document.querySelector ('#course-level');
  const inputType              = document.querySelector ('#course-type');
  const inputTeachers          = document.querySelector ('#course-teachers');
  const btnTeachersAdd         = document.querySelector ('#course-teachers-add');
  const inputStudents          = document.querySelector ('#course-students');
  const btnStudentsAdd         = document.querySelector ('#course-students-add');
  const btnSave                = document.querySelector ('#course-save');
  const btnDelete              = document.querySelector ('#course-delete');
  const btnCancel              = document.querySelector ('#course-cancel');
  const modalTeachers          = document.querySelector ('#modal-teachers');
  const modalTeachersAvailable = document.querySelector ('#modal-teachers-available');
  const modalTeachersSelected  = document.querySelector ('#modal-teachers-selected');
  const modalTeachersAdd       = document.querySelector ('#modal-teachers-add');
  const modalTeachersRemove    = document.querySelector ('#modal-teachers-remove');
  const modalTeachersCancel    = document.querySelector ('#modal-teachers-cancel');
  const modalTeachersOk        = document.querySelector ('#modal-teachers-ok');
  const modalStudents          = document.querySelector ('#modal-students');
  const modalStudentsAvailable = document.querySelector ('#modal-students-available');
  const modalStudentsSelected  = document.querySelector ('#modal-students-selected');
  const modalStudentsAdd       = document.querySelector ('#modal-students-add');
  const modalStudentsRemove    = document.querySelector ('#modal-students-remove');
  const modalStudentsCancel    = document.querySelector ('#modal-students-cancel');
  const modalStudentsOk        = document.querySelector ('#modal-students-ok');
  let ref;
  view.addEventListener ('active', function (e) {
    let data = {
      name          : '',
      description   : '',
      duration      : 0,
      hours         : 0,
      level         : '',
      type          : '',
      teachers      : [],
      teachersExtra : []
    };
    loading ();
    ref = e.detail.ref;
    (ref === 'new' ? Promise.resolve ({errors : [], data}) : courses.get (ref))
      .then (function (result) {
        if (result.errors.length === []) {
          return error (result.error.join ('<br/>'))
        }
        inputName.value         = result.data.name;
        inputDescription.value  = result.data.description;
        inputDuration.value     = result.data.duration;
        inputHours.value        = result.data.hours;
        inputLevel.value        = result.data.level;
        inputType.value         = result.data.type;
        inputTeachers.innerHTML = (result.data.teachersExtra || []).map (teacher => `<option value="${ teacher._id }">${ teacher.name } ${ teacher.lastname }</option>`).join ('');
        inputStudents.innerHTML = (result.data.studentsExtra || []).map (student => `<option value="${ student._id }">${ student.name } ${ student.lastname }</option>`).join ('');
        loading ();
      })
      .catch (function (err) {
        loading ();
        error (err.message);
      })
  });
  btnTeachersAdd.addEventListener ('click', function () {
    loading ();
    teachers
      .list ()
      .then (function (result) {
        modalTeachersSelected.innerHTML  = inputTeachers.innerHTML;
        const ids                        = [ ...modalTeachersSelected.options ].map (function (option) {
          return option.value;
        });
        modalTeachersAvailable.innerHTML = '';
        for (let n = 0; n < result.data.length; n++) {
          if (ids.indexOf (result.data[ n ]._id) === -1) {
            const opt     = document.createElement ('option');
            opt.value     = result.data[ n ]._id;
            opt.innerHTML = `${ result.data[ n ].name } ${ result.data[ n ].lastname }`;
            modalTeachersAvailable.appendChild (opt);
          }
        }
        loading ();
        modalTeachers.checked = true;
        
      })
      .catch (function (err) {
        loading ();
        error (err.message);
      });
  });
  modalTeachersAdd.addEventListener ('click', function () {
    for (let n = 0; n < modalTeachersAvailable.options.length; n++) {
      let option = modalTeachersAvailable.options[ n ];
      if (option.selected) {
        modalTeachersSelected.appendChild (option);
        n--;
      }
    }
  });
  modalTeachersRemove.addEventListener ('click', function () {
    for (let n = 0; n < modalTeachersSelected.options.length; n++) {
      let option = modalTeachersSelected.options[ n ];
      if (option.selected) {
        modalTeachersAvailable.appendChild (option);
        n--;
      }
    }
  });
  modalTeachersOk.addEventListener ('click', function () {
    inputTeachers.innerHTML = modalTeachersSelected.innerHTML;
    modalTeachers.checked   = false;
  });
  modalTeachersCancel.addEventListener ('click', function () {
    modalTeachers.checked = false;
  });
  btnStudentsAdd.addEventListener ('click', function () {
    loading ();
    students
      .list ()
      .then (function (result) {
        modalStudentsSelected.innerHTML  = inputStudents.innerHTML;
        const ids                        = [ ...modalStudentsSelected.options ].map (function (option) {
          return option.value;
        });
        modalStudentsAvailable.innerHTML = '';
        for (let n = 0; n < result.data.length; n++) {
          if (ids.indexOf (result.data[ n ]._id) === -1) {
            const opt     = document.createElement ('option');
            opt.value     = result.data[ n ]._id;
            opt.innerHTML = `${ result.data[ n ].name } ${ result.data[ n ].lastname }`;
            modalStudentsAvailable.appendChild (opt);
          }
        }
        loading ();
        modalStudents.checked = true;
        
      })
      .catch (function (err) {
        loading ();
        error (err.message);
      });
  });
  modalStudentsAdd.addEventListener ('click', function () {
    for (let n = 0; n < modalStudentsAvailable.options.length; n++) {
      let option = modalStudentsAvailable.options[ n ];
      if (option.selected) {
        modalStudentsSelected.appendChild (option);
        n--;
      }
    }
  });
  modalStudentsRemove.addEventListener ('click', function () {
    for (let n = 0; n < modalStudentsSelected.options.length; n++) {
      let option = modalStudentsSelected.options[ n ];
      if (option.selected) {
        modalStudentsAvailable.appendChild (option);
        n--;
      }
    }
  });
  modalStudentsOk.addEventListener ('click', function () {
    inputStudents.innerHTML = modalStudentsSelected.innerHTML;
    modalStudents.checked   = false;
  });
  modalStudentsCancel.addEventListener ('click', function () {
    modalStudents.checked = false;
  });
  btnCancel.addEventListener ('click', function () {
    window.location.hash = `/courses/`;
  });
  btnDelete.addEventListener ('click', function () {
    confirm ('Are you sure you want to delete this course?')
      .then (function (yes) {
        if (yes) {
          loading ();
          courses.del (ref)
                 .then (function (result) {
                   loading ();
                   if (result.errors.length) {
                     return error (result.errores.join ('<br/>'))
                   }
                   window.location.hash = `/courses/`;
                 })
                 .catch (function (err) {
                   loading ();
                   error (err.message);
                 });
        }
      });
  });
  btnSave.addEventListener ('click', function () {
    loading ();
    const data = {
      name        : inputName.value,
      description : inputDescription.value,
      duration    : inputDuration.value,
      hours       : parseInt (inputHours.value),
      level       : inputLevel.value,
      type        : inputType.value,
      teachers    : [ ...inputTeachers.options ].map (option => option.value),
      students    : [ ...inputStudents.options ].map (option => option.value)
    };
    let result;
    if (ref === 'new') {
      result = courses.add (data);
    } else {
      result = courses.edit (ref, data);
    }
    result.then (function (result) {
            loading ();
            if (result.errors.length) {
              return error (result.errors.join ('<br/>'))
            }
            window.location.hash = `/courses/`;
          })
          .catch (function (err) {
            loading ();
            error (err.message);
          });
  });
  
}) ();

/**
 * Teachers (list)
 */
(function () {
  const view       = document.querySelector ('#container #teachers');
  const addTeacher = document.querySelector ('#addTeacher');
  const tableBody  = view.querySelector ('tbody');
  addTeacher.addEventListener ('click', function () {
    window.location.hash = `/teacher/new/`;
  });
  tableBody.addEventListener ('click', function (evt) {
    let el = evt.target;
    while (el.tagName !== 'TR') {
      el = el.parentNode;
    }
    window.location.hash = `/teacher/${ el.id }/`;
  });
  view.addEventListener ('active', function () {
    loading ();
    teachers.list ()
            .then (function (result) {
              loading ();
              tableBody.innerHTML = result.data.map (record => `
              <tr id="${ record._id }">
                <td data-label="Name">${ record.name }</td>
                <td data-label="Lastname">${ record.lastname }</td>
                <td data-label="Email">${ record.email }</td>
              </tr>
              `).join ('');
            })
            .catch (function (err) {
              loading ();
              error (err.message);
            });
  });
}) ();

/**
 * Teacher (get, add, edit and delete)
 */
(function () {
  const view           = document.querySelector ('#container #teacher');
  const inputName      = document.querySelector ('#teacher-name');
  const inputLastname  = document.querySelector ('#teacher-lastname');
  const inputBiography = document.querySelector ('#teacher-biography');
  const inputEmail     = document.querySelector ('#teacher-email');
  const btnSave        = document.querySelector ('#teacher-save');
  const btnDelete      = document.querySelector ('#teacher-delete');
  const btnCancel      = document.querySelector ('#teacher-cancel');
  let ref;
  view.addEventListener ('active', function (e) {
    let data = {
      name      : '',
      lastname  : '',
      biography : '',
      email     : ''
    };
    loading ();
    ref = e.detail.ref;
    (ref === 'new' ? Promise.resolve ({errors : [], data}) : teachers.get (ref))
      .then (function (result) {
        if (result.errors.length === []) {
          return error (result.error.join ('<br/>'))
        }
        inputName.value      = result.data.name;
        inputLastname.value  = result.data.lastname;
        inputBiography.value = result.data.biography;
        inputEmail.value     = result.data.email;
        loading ();
      })
      .catch (function (err) {
        loading ();
        error (err.message);
      })
  });
  btnCancel.addEventListener ('click', function () {
    window.location.hash = `/teachers/`;
  });
  btnDelete.addEventListener ('click', function () {
    confirm ('Are you sure you want to delete this teacher?')
      .then (function (yes) {
        if (yes) {
          loading ();
          teachers.del (ref)
                  .then (function (result) {
                    loading ();
                    if (result.errors.length) {
                      return error (result.errores.join ('<br/>'))
                    }
                    window.location.hash = `/teachers/`;
                  })
                  .catch (function (err) {
                    loading ();
                    error (err.message);
                  });
        }
      });
  });
  btnSave.addEventListener ('click', function () {
    loading ();
    const data = {
      name      : inputName.value,
      lastname  : inputLastname.value,
      biography : inputBiography.value,
      email     : inputEmail.value
    };
    let result;
    if (ref === 'new') {
      result = teachers.add (data);
    } else {
      result = teachers.edit (ref, data);
    }
    result.then (function (result) {
            loading ();
            if (result.errors.length) {
              return error (result.errors.join ('<br/>'))
            }
            window.location.hash = `/teachers/`;
          })
          .catch (function (err) {
            loading ();
            error (err.message);
          });
  });
  
}) ();

/**
 * Students (list)
 */
(function () {
  const view      = document.querySelector ('#container #students');
  const addCourse = document.querySelector ('#addStudent');
  const tableBody = view.querySelector ('tbody');
  addCourse.addEventListener ('click', function () {
    window.location.hash = `/student/new/`;
  });
  tableBody.addEventListener ('click', function (evt) {
    let el = evt.target;
    while (el.tagName !== 'TR') {
      el = el.parentNode;
    }
    window.location.hash = `/student/${ el.id }/`;
  });
  view.addEventListener ('active', function () {
    loading ();
    students.list ()
            .then (function (result) {
              loading ();
              tableBody.innerHTML = result.data.map (record => `
              <tr id="${ record._id }">
                <td data-label="Name">${ record.name }</td>
                <td data-label="Lastname">${ record.lastname }</td>
                <td data-label="Email">${ record.email }</td>
              </tr>
              `).join ('');
            })
            .catch (function (err) {
              loading ();
              error (err.message);
            });
  });
}) ();

/**
 * Student (get, add, edit and delete)
 */
(function () {
  const view          = document.querySelector ('#container #student');
  const inputName     = document.querySelector ('#student-name');
  const inputLastname = document.querySelector ('#student-lastname');
  const inputEmail    = document.querySelector ('#student-email');
  const btnSave       = document.querySelector ('#student-save');
  const btnDelete     = document.querySelector ('#student-delete');
  const btnCancel     = document.querySelector ('#student-cancel');
  let ref;
  view.addEventListener ('active', function (e) {
    let data = {
      name     : '',
      lastname : '',
      email    : ''
    };
    loading ();
    ref = e.detail.ref;
    (ref === 'new' ? Promise.resolve ({errors : [], data}) : students.get (ref))
      .then (function (result) {
        if (result.errors.length === []) {
          return error (result.error.join ('<br/>'))
        }
        inputName.value     = result.data.name;
        inputLastname.value = result.data.lastname;
        inputEmail.value    = result.data.email;
        loading ();
      })
      .catch (function (err) {
        loading ();
        error (err.message);
      })
  });
  btnCancel.addEventListener ('click', function () {
    window.location.hash = `/students/`;
  });
  btnDelete.addEventListener ('click', function () {
    confirm ('Are you sure you want to delete this student?')
      .then (function (yes) {
        if (yes) {
          loading ();
          students.del (ref)
                  .then (function (result) {
                    loading ();
                    if (result.errors.length) {
                      return error (result.errores.join ('<br/>'))
                    }
                    window.location.hash = `/students/`;
                  })
                  .catch (function (err) {
                    loading ();
                    error (err.message);
                  });
        }
      });
  });
  btnSave.addEventListener ('click', function () {
    loading ();
    const data = {
      name     : inputName.value,
      lastname : inputLastname.value,
      email    : inputEmail.value
    };
    let result;
    if (ref === 'new') {
      result = students.add (data);
    } else {
      result = students.edit (ref, data);
    }
    result.then (function (result) {
            loading ();
            if (result.errors.length) {
              return error (result.errors.join ('<br/>'))
            }
            window.location.hash = `/students/`;
          })
          .catch (function (err) {
            loading ();
            error (err.message);
          });
  });
  
}) ();
