const students    = require ('./students');
const skeletonify = require ('@todojs/jsrpc/skeletonify');
module.exports    = skeletonify ('students', students);