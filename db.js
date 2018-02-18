
'use strict'
const mongodb = require('mongodb')

const host = '127.0.0.1'
const port = 27017
const db_name = 'quando'
const mongo_uri = `mongodb://${host}:${port}`

let cached_db = null

function getDB() {
  return new Promise((success, fail) => {
    if (cached_db) {
      success(cached_db)
    } else {
      mongodb.MongoClient.connect(mongo_uri, (err, client) => {
        if (err == null) {
          cached_db = client.db(db_name)
          success(cached_db)
        } else {
          fail(Error('Failed connection with error = ' + err))
        }
      })
    }
  })
}

function collection(name) {
  return new Promise((success, fail) => {
    getDB().then((db) => {
      success(db.collection(name))
    }, fail)
  })
}

exports.save = (collection_name, doc) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.save(doc, (err, doc) => {
        if (err) {
          fail(err)
        } else {
          success() // could return doc.result.upserted[0]._id ?!
        }
      })
    }, fail)
  })
}

exports.getArray = (collection_name, query, fields, options) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      options.projection = fields
      _collection.find(query, options).toArray((err, array) => {
        if (err) {
          fail(err)
        } else {
          success(array)
        }
      })
    }, fail)
  })
}

exports.remove = (collection_name, query, options) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.remove(query, options, (err, removed_count) => {
        if (err) {
          fail(err)
        }
        if (removed_count == 0) {
          fail(Error('No Scripts to Remove')) // needs fixing...
        } else {
          success()
        }
      })
    }, fail)
  })
}

exports.create = (collection_name) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      database.createCollection(collection_name, function (err, res) {
        if (err) throw err
        console.log("Collection created!")
        db.close();
        success()
      })
    })
  })
}

exports.drop = (collection_name) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      database.collection(collection_name).drop(function (err, del) {
        if (err) console.log("collection" + collection_name +" does not exist")
        if (del) console.log( collection_name+ " deleted");
        db.close();
        success()
      })
    })
  })
}


exports.insert = (collection_name, doc, exhibitName) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      var document = { _id: doc, exhibit: exhibitName }
      database.collection(collection_name).insertOne(document, function (err, res) {
        if (err) console.log("document already exists")
        console.log("1 document inserted")
        db.close();
        success()
      })
    })
  })
}

exports.searchCreate = (collection_name) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      database.listCollections().toArray(function (err, collInfos) {
        if (err) throw err
        //  console.log(collInfos);
        for (var i = 0; i < collInfos.length; i++) {
          var index = -1
          if (collInfos[i].name == collection_name) {
            index = i
            break
          }
        }
        //console.log(index)
        if (index == -1) {
          exports.create(collection_name)
        } else {
          console.log("Collection already exists")
        }
        success()
      })
    })
  })
}

exports.search = () => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      database.listCollections().toArray(function (err, collInfos) {
        if (err) throw err
        //console.log(collInfos)
        console.log(collInfos)
        success()
      })
    })
  })
}

exports.findInsert = (collection_name, doc, exhibitName) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      database.collection(collection_name).findOne({ _id: doc }, function (err, result) {
        if (err) {
          throw err
        } else if (result == null) {
          exports.insert(collection_name, doc, exhibitName)
          success(false)
        } else {
          console.log("Document already exists in collection")
          exports.update(collection_name, doc, exhibitName)
          success(true)
        }
        db.close()
      })
    })
  })
}

exports.update = (collection_name, doc, exhibitName) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      var prevDoc = { _id: doc, exhibit: exhibitName }
      var newDoc = { _id: doc, exhibit: exhibitName }
      database.collection(collection_name).updateOne(prevDoc, newDoc, function (err, res) {
        if (err) throw err
        console.log("1 document updated")
        db.close()
        success()
      })
    })
  })
}

exports.remove = (collection_name, query, options) => {
  return new Promise((success, fail) => {
    collection(collection_name).then((_collection) => {
      _collection.remove(query, options, (err, removed_count) => {
        if (err) {
          fail(err)
        }
        if (removed_count == 0) {
          fail(Error('No Scripts to Remove')) // needs fixing...
        } else {
          success()
        }
      })
    }, fail)
  })
}

exports.deleteMany = (collection_name) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      var allDocuments = { _id: /^R/ }
      database.collection(collection_name).deleteMany(allDocuments, function (err, obj) {
        if (err) throw err
        console.log(obj.result.n + " document(s) deleted")
        db.close()
        success()
      })
    })
  })
}

exports.deleteOne = (collection_name, doc) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      var document = { _id: doc }
      database.collection(collection_name).deleteOne(document, function (err, obj) {
        if (err) console.log("document doesn't exist")
        console.log("1 document deleted")
        db.close()
      })
    })
  })
}

exports.updateDocs = (collection_name, serial) => {
  return new Promise((success, fail) => {
    mongodb.MongoClient.connect(mongo_uri, function (err, db) {
      if (err) throw err
      var database = db.db("quando")
      collection(collection_name).then((_collection) => {
        database.collection(collection_name).findOne({ _id: serial }, function (err, result) {
          if (err) {
            throw err
          }
          if (result != null) {
            console.log("visitor ID already exists in:" + collection_name)
            //  var returned = "B" + result._id
            success(true)
          } else {
            console.log(result)
            console.log("Document does not exist in:" + collection_name)
            exports.insert(collection_name, serial, collection_name);
            success(false)
          }
          db.close()
        })
      }, fail)
    })
  })
}