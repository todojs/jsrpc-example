/**
 * Courses stub
 */
(root => {
  const stubify = typeof window !== 'undefined' ? window.stubify : require ('@todojs/jsrpc/stubify');
  const students = stubify ("http://localhost:9003", 'students', [ 'add', 'edit', 'list', 'get', 'del' ]);
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = students
  } else {
    root.students = students;
  }
}) (this);