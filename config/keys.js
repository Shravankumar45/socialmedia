if(process.env.NODE_ENV === 'production'){
  module.exports =require('./keys-prod');
}
else{
  module.exports = require('./keys-dev');
}
// module.exports = {
//       MongoURI:'mongodb+srv://shravan1:shravan12@cluster0-no1dp.gcp.mongodb.net/test?retryWrites=true&w=majority',
//     GoogleClientID:'935563091981-ur5vkaemfqik5inlot2598auuh59mspu.apps.googleusercontent.com',
//     GoogleClientSecret:'R4pX7oym3Y-Swbm6MVvROPfU'
// }