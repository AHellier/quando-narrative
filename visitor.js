'use strict'
const db = require('./db')
const COLLECTION = 'visitor'
const serialport = require('serialport')

let serial


exports.save = (userid, password, firstName, microbitId, session) => {
  return new Promise((success, fail) => {
    let doc = { _id: userid, password: password, firstName: firstName, microbit: microbitId, session_route: session }
    db.save(COLLECTION, doc).then(success, fail)
  })
}

exports.create = (collectionName) => {
  return new Promise((success, fail) => {
    db.create(collectionName).then(success, fail)
  })
}

exports.drop = (collectionName) => {
  return new Promise((success, fail) => {
    db.drop(collectionName).then(success, fail)
  })
}

exports.insert = (collectionName, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.insert(collectionName, doc, exhibitName).then(success, fail)
  })
}

exports.findInsert = (collectionName, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.findInsert(collectionName, doc, exhibitName).then(function (result) {
     // console.log(result)
      exports.previousVisitor = result
    })
  })
}

exports.updateDocs = (collectionName, serial) => {
  return new Promise((success, fail) => {
    db.updateDocs(collectionName, serial).then(function (result) {
      // if(success){
    // console.log(result)
     // if (serialId != null) {
     //   exports.serialId = result
        success()
   //   }
      //  }
    })
  })
}

exports.update = (collection_name, doc, exhibitName) => {
  return new Promise((success, fail) => {
    db.update(collectionName, doc, exhibitName).then(success, fail)
  })
}

exports.searchCreate = (collectionName) => {
  return new Promise((success, fail) => {
    db.searchCreate(collectionName).then(success, fail)
  })
}

exports.search = () => {
  return new Promise((success, fail) => {
    db.search().then(success, fail)
  })
}

exports.deleteMany = (collectionName) => {
  return new Promise((success, fail) => {
    db.deleteMany(collectionName).then(success, fail)
  })
}

exports.deleteOne = (collectionName, doc) => {
  return new Promise((success, fail) => {
    db.deleteOne(collectionName, doc).then(success, fail)
  })
}

