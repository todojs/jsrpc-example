const teachers    = require ('./teachers');
const skeletonify = require ('@todojs/jsrpc/skeletonify');
module.exports    = skeletonify ('teachers', teachers);