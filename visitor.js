/** Visitor MongoDB API that enables communcation between the server and MongoDB database. */
'use strict'
const db = require('./db')
const COLLECTION = 'visitor'
const serialport = require('serialport')
//let serial

/** Function that calls the database function that checks the mongoDb database for the visitors credentials and returns result. */
exports.login = (username, password) => {
  return new Promise((success, fail) => {
    db.login(username, password).then(function (result) {
      success(result)
    })
  })
}

/** Function that calls the database function that creates a document in the visitor collection that contains a visitor's 
 * registering details. */
exports.save = (userid, password, firstName, microbitId, session) => {
  return new Promise((success, fail) => {
    let doc = { _id: userid, password: password, firstName: firstName, microbit: microbitId, visited_exhibits: session }
    db.save(COLLECTION, doc).then(success, fail)
  })
}

/** Function that calls the database function that creates a collection in the MongoDB database. */
exports.create = (collectionName) => {
  return new Promise((success, fail) => {
    db.create(collectionName).then(success, fail)
  })
}

/** Function that calls the database function that deletes specified collection in the MongoDb database. */
exports.drop = (collectionName) => {
  return new Promise((success, fail) => {
    db.drop(collectionName).then(success, fail)
  })
}

/** Function that calls the database function that inserts a new doucment in the specifed collection in the MongoDB database. */
exports.insert = (collectionName, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.insert(collectionName, doc, exhibitName).then(success, fail)
  })
}

/** Function that calls the database function that searches all collections in the MongoDB database for
 *  specified ID,  and if the ID is not present, insert a new document in the collection that
 *  contains the ID and exhibit name that is the same as the collection name.*/
exports.findInsert = (collectionName, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.findInsert(collectionName, doc, exhibitName).then(function (result) {
      console.log(result)
      exports.previousVisitor = result
    })
  })
}

/** Function that calls the database function that updates a MongoDB exhibit collection with 
 * the specifed serial ID.*/
exports.updateDocs = (collectionName, serial) => {
  return new Promise((success, fail) => {
    db.updateDocs(collectionName, serial).then(function (result) {
      success(result)
    })
  })
}

/** Function that calls the database function that updates a mongoDB document
 * with an exhibit name in the specifed collection.*/
exports.update = (collection_name, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.update(collectionName, doc, exhibitName).then(success, fail)
  })
}

/** Function that calls the database function that searches all collections, and if 
 * specified collection name does not exist, create the collection. */
exports.searchCreate = (collectionName) => {
  return new Promise((success, fail) => {
    db.searchCreate(collectionName).then(success, fail)
  })
}

/** Function that calls the database function that searches the MongoDB database.*/
exports.search = () => {
  return new Promise((success, fail) => {
    db.search().then(success, fail)
  })
}

/** Function that calls the database function that deletes all instances 
 * of the specified collection name. */
exports.deleteMany = (collectionName) => {
  return new Promise((success, fail) => {
    db.deleteMany(collectionName).then(success, fail)
  })
}

/** Function that calls the database function that deletes instances
 * of the specified doucment in the specified collection.*/
exports.deleteOne = (collectionName, doc) => {
  return new Promise((success, fail) => {
    db.deleteOne(collectionName, doc).then(success, fail)
  })
}

/** Function that calls the database function that finds the 
 * specified document in the specified collection and returns the 
 * result which is sent to the server.*/
exports.find = (collectionName, doc) => {
  return new Promise((success, fail) => {
    db.find(collectionName, doc).then(function (result) {
      if (result != false) {
        console.log("result " + result)
        success(result)
      } else {
        success(result)
      }
    })
  })
}

/** Function that calls the database function that finds the name of the 
 * visitor that is in possession of the currently connected remote micro:bit
 * if they have created an account. Name is returned to the server if found. */
exports.findName = (doc) => {
  return new Promise((success, fail) => {
    db.findName(doc).then(function (result) {
      if (result != false) {
        //  console.log("result " + result)
        success(result)
      } else {
        success(result)
      }
    })
  })
}


