const courses     = require ('./courses');
const skeletonify = require ('@todojs/jsrpc/skeletonify');
module.exports    = skeletonify ('courses', courses);