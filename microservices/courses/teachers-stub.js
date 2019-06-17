/**
 * Courses stub
 */
(root => {
  const stubify = typeof window !== 'undefined' ? window.stubify : require ('@todojs/jsrpc/stubify');
  const teachers = stubify ("http://localhost:9002", 'teachers', [ 'add', 'edit', 'list', 'get', 'del' ]);
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = teachers
  } else {
    root.teachers = teachers;
  }
}) (this);