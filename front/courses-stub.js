/**
 * Courses stub
 */
(root => {
  const stubify = typeof window !== 'undefined' ? window.stubify : require ('@todojs/jsrpc/stubify');
  const courses = stubify ("http://localhost:9001", 'courses', [ 'add', 'edit', 'list', 'get', 'del' ]);
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = courses
  } else {
    root.courses = courses;
  }
}) (this);