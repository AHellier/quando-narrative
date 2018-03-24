'use strict'
const express = require('express')
const app = express()
const fs = require('fs')
const formidable = require('formidable')
const morgan = require('morgan')
const session = require('express-session')
const body_parser = require('body-parser')
const script = require('./script')
const client_deploy = './client/deployed_js/'
var fileNames = fs.readdirSync('./client/deployed_js/');
const user = require('./user')
const visitor = require('./visitor')
const mongo_store = require('connect-mongo')(session)
const path = require('path')
const swal = require('sweetalert2')
const router = express.Router()

const http = require('http').Server(app)
const io = require('socket.io')(http)
const ubit = require('./ubit')

let connected = false
var microbit_id = null
var remoteMicrobit = 1
var connectedMicroBit = 1
let filename = null
let exhibitsList = ""
let exhibits = []

let server = http.listen(process.env.PORT || 80, () => {
  let host = process.env.IP || server.address().address
  let port = server.address().port
  console.log('Quando Server listening at http://%s:%s', host, port)
})

const MEDIA_FOLDER = path.join(__dirname, 'client', 'media')
const MEDIA_MAP = {
  'video': ['ogg', 'ogv', 'mp4', 'webm'],
  'audio': ['mp3'],
  'images': ['bmp', 'jpg', 'jpeg', 'png'],
  'objects': ['gltf', 'glb'],
  // 'objects': ['obj', 'mtl'],
}
{
  let upload = []
  Object.keys(MEDIA_MAP).map((key) => { upload = upload.concat(MEDIA_MAP[key]) })
  MEDIA_MAP['UPLOAD'] = upload
}

app.use(morgan('dev'))
// Static for Editor
app.use('/editor', express.static(path.join(__dirname, 'editor')))
app.use('/blockly', express.static(path.join(__dirname, 'blockly')))
app.use('/closure-library', express.static(path.join(__dirname, 'closure-library')))

app.use(session({
  secret: 'quando_secret',
  resave: false, // i.e. only save when changed
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // name: may need this later - if sessions exist for clients...
    httpOnly: false
  },
  store: new mongo_store({ url: 'mongodb://127.0.0.1/quando' })
}))

app.use('/', (req, res, next) => {
  //   console.log(">>" + JSON.stringify(req.session.user))
  next()
})

app.get('/login', (req, res) => {
  if ((req.session) && (req.session.user)) {
    res.json({ 'success': true, 'userid': req.session.user.id })
  } else {
    res.json({ 'success': false, 'message': 'Not Logged In' })
  }
})

app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.post('/login', (req, res) => {
  let body = req.body
  console.log(body)
  if (body.userid && body.password) {
    user.getOnIdPassword(body.userid, body.password).then((result) => {
      req.session.user = result
      res.json({ 'success': true })
    }, (err) => {
      res.json({ 'success': false, 'message': 'Login Failed, please try again' + err })
    })
  } else {
    res.json({ 'success': false, 'message': 'Need UserId and password' })
  }
})

app.post('/loginVisitor', (req, res) => {
  let body = req.body
  console.log(body.visitorid)
  console.log(body.visitorpassword)
  if (body.visitorid && body.visitorpassword) {
    visitor.login(body.visitorid, body.visitorpassword).then((result) => {
      if(result != false) { 
        req.session.user = result
        console.log("result" +result)
        var splitResult = result.split("-")
        var name = splitResult[0]
        var visitedExhibits = splitResult.slice(1)
        var finalExhibits = String(visitedExhibits).split(",")
        var fileList = fileNames

        for (var i = 0; i < fileList.length; i++) {
          for(var j = 0; j < finalExhibits.length; j++){
            if(finalExhibits[j] == fileList[i]){
              console.log("Removing previously visited exhibit from recommendations...")
               delete fileList[i]
             
            }
          }
      }
        console.log(String(fileList))
        console.log(String(fileList).replace(/,/g, '<br>'))
        res.json({
          'success': true, 'message': "Welcome back " + name + '! <br> <br>' + " Here is a list of exhibits you visited last time: <br> <br>" 
          + String(visitedExhibits).replace(/,/g, '').replace(/_.js/g, '').replace(/.js/g, '<br>').replace(/_/g, ' ') +"<br> <br>"
          + "Why not visit the exhibits you didn't see last time? Here is a list of exhibits you missed last time and newly opened exhibits: <br> <br>"
          + String(fileList).replace(/,/g, '').replace(/.js/g, '<br>').replace(/_/g, ' ') +'<br> <br> We hope you enjoy your visit!'
        })
      } else {
        res.json({ 'success': false, 'message': 'Please enter a valid username (your email address) and password.' })
      }
    }, (err) => {
      res.json({ 'success': false, 'message': 'Login Failed, please try again' + err })
    })
  }else {
      res.json({ 'success': false, 'message': 'Please enter a valid username (your email address) and password.' })
    }
})

app.delete('/login', (req, res) => {
  delete req.session.user
  res.json({ 'success': true, 'message': 'Logged Out' })
})

app.post('/script', (req, res) => {
  script.save(req.body.name, req.body.id, req.body.userid, req.body.script).then(
    (doc) => { res.json({ 'success': true }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/names/:userid', (req, res) => {
  script.getNamesOnOwnerID(req.params.userid).then(
    (list) => { res.json({ 'success': true, 'list': list }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.get('/script/id/:id', (req, res) => {
  let id = req.params.id
  script.getOnId(id).then(
    (result) => { res.json({ 'success': true, 'doc': result }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.delete('/script/id/:id', (req, res) => {
  let id = req.params.id
  let userid = req.session.user.id
  script.deleteOnId(userid, id).then(
    (doc) => { res.json({ 'success': true }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.delete('/script/name/:name', (req, res) => {
  let name = encodeURI(req.params.name)
  let userid = req.session.user.id
  script.deleteAllOnName(userid, name).then(
    (doc) => { res.json({ 'success': true }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.delete('/script/tidy/:tidy', (req, res) => {
  let tidy = JSON.parse(req.params.tidy)
  let userid = req.session.user.id
  script.tidyOnIdName(userid, tidy.id, tidy.name).then(
    (doc) => { res.json({ 'success': true }) },
    (err) => { res.json({ 'success': false, 'message': err }) })
})

app.put('/script/deploy/:filename', (req, res) => {
  let filename = req.params.filename + '.js'
  let script = req.body.javascript
  fs.writeFile(client_deploy + filename, script, (err) => {
    if (!err) {
      res.json({ 'success': true })
      io.emit('deploy', { script: filename })
    } else {
      res.json({ 'success': false, 'message': 'Failed to deploy script' })
    }
  })
})

/*app.get('/create_user', (req, res) => {
  if ((req.session) && (req.session.user)) {
    res.json({ 'success': true, 'message': 'New user created'})
  } else {
    res.json({ 'success': false, 'message': 'User not created' })
  }
})*/


app.post('/create_user', (req, res) => {
  var body = req.body
  console.log(body)
  if (body.userid && body.password) {
    user.save(body.userid, body.password, null).then((result) => {
      req.session.user = result
      res.json({ 'success': true })
    }, (err) => {
      res.json({ 'success': false, 'message': 'Creating user failed, please try again' + err })
    })
  } else {
    res.json({ 'success': false, 'message': 'Need User Id and password' })
  }
})

app.post('/create_visitor', (req, res) => {
  var body = req.body
  console.log(body)
  console.log(body.firstName)
  console.log(body.email)
  console.log(exhibits)
  for (var j = 0; j < exhibits.length; j++) {
    console.log(exhibits[j])
  }
  if ((body.email != '') && (body.firstName != '') && (body.password != '')) {
    visitor.save(body.email, body.password, body.firstName, remoteMicrobit, exhibits).then((result) => {
      res.json({'success': true, 'message': "Welcome " +body.firstName + "!\n\nYou've successfully registered!"})
      console.log("Visitor successfully registered")
    }, (err) => {
      console.log("Visitor registration failed")
      res.json({'success': true, 'message': "Visitor registration failed. Please contract a member of staff."})
    })
  } else {
    console.log("Invalid email address")
    res.json({'success': false, 'message': "Please fill in all required fields."})
  }
})


let reported = false
function ubit_error(err) {
  if (!reported && err) {
    console.log(err)
    reported = true
    console.log("Micro:Bit disconnected")
    if (filename != null) {
      // visitor.drop(filename)
      // visitor.deleteMany(connectedMicroBit)
      remoteMicrobit = 1
      connectedMicroBit = 1
      visitor.previousVisitor = null
    }
    io.emit('ubit', { Disconnected: 'true' })
    connected = false
  }
  setTimeout(() => { ubit.get_serial(ubit_error, ubit_success) }, 1000)
  // Checks every second for plugged in micro:bit
  //  console.log("checking for microbit")
}

function ubit_success(serial) {
  reported = false
  connected = true
  let orientation = false
  // let proximity = false;
  let lastRemoteMicrobit = null
  let checked = false
  let compared = false
  let buttonCount = 0

  io.emit('ubit', { Connected: 'true' })
  serial.on('data', (data) => {
    try {
      let ubit = JSON.parse(data)
      if (ubit.serial != undefined) {
        microbit_id = ubit.serial
      }
      if (ubit && io) {
        console.log(data)
        if (microbit_id == lastRemoteMicrobit) {
          if (checked == true) {
            checked = false
            compared = true
          }
          if ((visitor.previousVisitor == true) && (compared == true)) {
            console.log("Returning visitor")
            io.emit("visitor", { previousVisitor: 'true' })
            io.emit("visitor", { state: 'entry' })
            visitor.previousVisitor = null
            compared = false
            writeExhibit(serial)
          } else if ((visitor.previousVisitor == false) && (compared == true)) {
            console.log("Visiting for the first time")
            io.emit("visitor", { previousVisitor: 'false' })
            io.emit("visitor", { state: 'entry' })
            visitor.previousVisitor = null
            compared = false
          }
          if (ubit.Paired) {
            console.log("Micro:Bit Paired")
            // io.emit('ubit', { 'proximity': ubit.Paired })
          }
          if ((ubit.button_a) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { button: 'a' })
            buttonCount += 1
            console.log(buttonCount)
            if (buttonCount == 2) {
              for (var i = 0; i < fileNames.length; i++) {
                if (remoteMicrobit != 1) {
                  console.log(fileNames[i])
                  visitor.deleteOne(fileNames[i], remoteMicrobit)
                  buttonCount = 0
                  //  visitor.drop(fileNames[i])
                }
              }
            }
          }
          if ((ubit.button_b) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { button: 'b' })
            buttonCount = 0
          }
          if ((ubit.ir) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { ir: true })
            buttonCount = 0
          }
          if ((ubit.mag_x) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { 'mag_x': ubit.mag_x, 'mag_y': ubit.mag_y })
            buttonCount = 0
            // console.log(ubit.mag_x, ubit.mag_y)
          }
          if ((ubit.orientation) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { 'orientation': ubit.orientation })
            buttonCount = 0
          }
          if ((ubit.heading) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { 'heading': ubit.heading })
            buttonCount = 0
          }
          if ((ubit.roll_pitch) && (lastRemoteMicrobit == microbit_id)) {
            let roll = ubit.roll_pitch[0]
            let pitch = ubit.roll_pitch[1]
            io.emit('ubit', { 'roll': roll, 'pitch': pitch })
            buttonCount = 0
          }
          if ((ubit.proximity) && (lastRemoteMicrobit == microbit_id)) {
            io.emit('ubit', { 'proximity': ubit.proximity })

          }
        }
        if ((ubit.serial) && (lastRemoteMicrobit == null)) {
          io.emit('ubit', { 'serial': ubit.serial })
          if (ubit.serial != undefined) {
            microbit_id = ubit.serial
            if (microbit_id.charAt(0) == "C") {
              connectedMicroBit = microbit_id
              //visitor.searchCreate(connectedMicroBit)
              // visitor.search(connectedMicroBit)
            }
            else if (microbit_id.charAt(0) == "R") {
              remoteMicrobit = microbit_id
              // console.log("MICROBIT R")
              io.emit('visitor', { 'identity': 1 })
              if (remoteMicrobit != lastRemoteMicrobit) {
                visitor.findInsert(filename, remoteMicrobit, filename)
                for (var i = 0; i < fileNames.length; i++) {
                  visitor.find(fileNames[i], remoteMicrobit)
                  visitor.find(fileNames[i], remoteMicrobit).then(result => {
                    if (result != false) {
                      console.log(result)
                      // console.log('{exhibit' + ':' + '"'+result+'"}')
                      io.emit('visitor', { 'exhibit': '"' + result + '"' })
                      exhibitsList += result + ","
                      exhibits = exhibitsList.split(",")
                      console.log("exhibits: " + exhibits)
                    }
                  })
                }
                visitor.findName(remoteMicrobit)
                visitor.findName(remoteMicrobit).then(result => {
                  if (result != false) {
                    let name = result
                    console.log("name:", name)
                  }
                })
                lastRemoteMicrobit = remoteMicrobit
                checked = true
              }
            } else if (microbit_id.charAt(0) == "T") {
              remoteMicrobit = microbit_id
              //  console.log("MICROBIT T")
              io.emit('visitor', { 'identity': 2 })
              if (remoteMicrobit != lastRemoteMicrobit) {
                visitor.findInsert(filename, remoteMicrobit, filename)
                for (var i = 0; i < fileNames.length; i++) {
                  visitor.find(fileNames[i], remoteMicrobit)
                  visitor.find(fileNames[i], remoteMicrobit).then(result => {
                    if (result != false) {
                      console.log(result)
                      // console.log('{exhibit' + ':' + '"'+result+'"}')
                      io.emit('visitor', { 'exhibit': '"' + result + '"' })
                      exhibitsList += result + ","
                      exhibits = exhibitsList.split(",")
                    }
                  })
                }
                visitor.findName(remoteMicrobit)
                visitor.findName(remoteMicrobit).then(result => {
                  if (result != false) {
                    let name = result
                    console.log("name:", name)
                  }
                })
                lastRemoteMicrobit = remoteMicrobit
                checked = true
              }
            }
          }
        }
        if ((ubit.exhibit) && (lastRemoteMicrobit == remoteMicrobit)) {
          visitor.updateDocs(ubit.exhibit, remoteMicrobit)
        }
        if (ubit.visitor) {
          io.emit('ubit', { 'visitor': ubit.visitor })
          io.emit("visitor", { state: 'exit' })
          lastRemoteMicrobit = null
          remoteMicrobit = 1
          microbit_id = null
          exhibitsList = ""
          compared = false
        }
      }
    } catch (err) {
      console.log(err + ':' + data)
      connected = false
    }
  })
  serial.on('disconnect', ubit_error)
}

ubit.get_serial(ubit_error, ubit_success)

app.get('/file/type/*', (req, res) => {
  let filename = req.params[0]
  let media = path.basename(filename)
  let folder = filename.substring(0, filename.length - media.length)
  let folderpath = path.join(MEDIA_FOLDER, folder)
  let suffixes = MEDIA_MAP[media] // these are the relevant filename endings - excluding the '.'
  fs.readdir(folderpath, (err, files) => {
    if (!err) {
      let filelist = files.toString().split(',')
      let filtered = []
      let folders = []
      for (let i in filelist) {
        let stat = fs.statSync(path.join(folderpath, filelist[i]))
        if (stat.isDirectory()) {
          folders.push(filelist[i])
        } else {
          for (let s in suffixes) {
            if (filelist[i].toLowerCase().endsWith('.' + suffixes[s])) {
              filtered.push(filelist[i])
            }
          }
        }
      }
      res.json({ 'success': true, 'files': filtered, 'folders': folders })
    } else {
      res.json({ 'success': false, 'message': 'Failed to retrieve contents of folder' })
    }
  })
})

app.post('/file/upload/*', (req, res) => {
  let filename = req.params[0]
  let media = path.basename(filename)
  let folder = filename.substring(0, filename.length - media.length)
  let form = new formidable.IncomingForm()
  form.multiples = true
  form.uploadDir = path.join(MEDIA_FOLDER, folder)
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.json({ 'success': false, 'message': 'failed to upload' })
    } else {
      res.json({ 'success': true })
    }
  })
  form.on('fileBegin', (name, file) => {
    const [fileName, fileExt] = file.name.split('.')
    file.path = path.join(form.uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
  })
  form.on('file', (field, file) => {
    fs.rename(file.path, path.join(form.uploadDir, file.name))
  })
  form.on('error', (err) => {
    res.json({ 'success': false, 'message': 'an error has occured with form upload' + err })
  })
  form.on('aborted', (err) => {
    res.json({ 'success': false, 'message': 'Upload cancelled by browser' })
  })
})

// Static for client
let client_dir = path.join(__dirname, 'client')
app.use('/client/media', express.static(path.join(client_dir, 'media')))
app.use('/client/devices', express.static(path.join(client_dir, 'devices')))
app.use('/client/lib', express.static(path.join(client_dir, 'lib')))
app.use('/client/setup', express.static(path.join(client_dir, 'setup.html')))
app.use('/client/client.css', express.static(path.join(client_dir, 'client.css')))
app.use('/client/setup.css', express.static(path.join(client_dir, 'setup.css')))
app.use('/client/quando_browser.js', express.static(path.join(client_dir, 'quando_browser.js')))
app.use('/client/transparent.png', express.static(path.join(client_dir, 'transparent.png')))
app.use('/client/favicon.ico', express.static(path.join(client_dir, 'favicon.ico')))
app.use('/client/deployed_js', express.static(path.join(client_dir, 'deployed_js')))

app.get('/client/js/:filename', (req, res) => {
  filename = req.params.filename
  console.log(filename)
  if (filename != null) {
    visitor.searchCreate(filename)
  }
  fs.readFile('./client/client.htm', 'utf8', (err, data) => {
    if (err) {
      res.redirect('/client/setup')
    } else {
      res.write(data.replace(/\[\[TITLE\]\]/,
        filename.replace(/\.js/, '')).replace(/\[\[DEPLOYED_JS\]\]/, filename))
      res.end()
    }
  })
})

app.get('/client/js', (req, res) => {
  fs.readdir(path.join(__dirname, 'client', 'deployed_js'), (err, files) => {
    if (!err) {
      require('dns').lookup(require('os').hostname(), (err, add, fam) => {
        res.json({ 'success': true, ip: add, 'files': files })
      })
    } else {
      res.json({
        'success': false,
        'message': 'Failed to retrieve contents of deployed_js folder'
      })
    }
  })
})

function writeExhibit(serial) {
  var message = filename
  var write = false
  if (write == false) {
    serial.write(message, function (err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written:' + message);
    });
    write = true;
  }
}
//}

app.use('/client', express.static(path.join(client_dir, 'index.html')))
app.get('/visitorRegister', function (req, res) {
  res.sendFile(path.join(__dirname + '/client/visitorRegister.html'));
});
app.use('/client', express.static(path.join(client_dir, 'index.html')))
app.get('/visitorLogin', function (req, res) {
  res.sendFile(path.join(__dirname + '/client/visitorLogin.html'));
});