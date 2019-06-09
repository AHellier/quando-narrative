const fs = require('fs')
const dns = require('dns')

module.exports = (app, client_dir, static, join, success, fail) => {
  app.use('/client/media', static(join(client_dir, 'media')))
  app.use('/client/modules', static(join(client_dir, 'modules')))
  app.use('/client/lib', static(join(client_dir, 'lib')))
  app.use('/client/setup', static(join(client_dir, 'setup.html')))
  app.use('/client/client.css', static(join(client_dir, 'client.css')))
  app.use('/client/setup.css', static(join(client_dir, 'setup.css')))
  app.use('/client/client.js', static(join(client_dir, 'client.js')))
  app.use('/client/transparent.png', static(join(client_dir, 'transparent.png')))
  app.use('/client/deployed_js', static(join(client_dir, 'deployed_js')))
  app.use('/client/client.htm', static(join(client_dir, 'client.htm')))
  app.use('/client', static(join(client_dir, 'index.html')))

  app.get('/client/js/:filename', (req, res) => {
    let filename = req.params.filename
    fs.readFile(join(client_dir, 'client.htm'), 'utf8', (err, data) => {
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
    fs.readdir(join(client_dir, 'deployed_js'), (err, files) => {
      if (!err) {
        let js_files = []
        for(let i=0; i<files.length; i++) {
          if (files[i].endsWith(".js")) {
            js_files.push(files[i])
          }
        }
        dns.lookup(require('os').hostname(), (err, host_ip) => {
          success(res, {ip: host_ip, 'files': js_files})
        })
      } else {
        fail(res, 'Failed to retrieve contents of deployed_js folder')
      }
    })
  })
}