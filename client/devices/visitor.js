(function () {
  var quando = this['quando']
  if (!quando) {
  //  alert('Fatal Error: ubit must be included after quando_browser')
  }

  var self = quando.visitor = {}
  self.last_gesture = ''
  function dispatch_gesture(gesture_name) {
    if (gesture_name != self.last_gesture) {
      self.last_gesture = gesture_name
      quando.dispatch_event(gesture_name)
    }
  }
  self.visitorReturn = function (callback, destruct = true) {
    quando.add_handler('visitorReturn', callback, destruct)
  }

  self.visitorFirst = function (callback, destruct = true) {
    quando.add_handler('visitorFirst', callback, destruct)
  }

  self.visitorEntry = function (callback, destruct = true, website) {
    quando.add_handler('visitorEntry', callback, destruct)
  }

  self.visitorExit = function (callback, destruct = true, website) {
    quando.add_handler('visitorExit', callback, destruct)
  }

  quando.socket.on("visitor", function (visitorData) {
    if (visitorData.previousVisitor == 'true') {
      dispatch_gesture('visitorReturn')
      self.last_gesture = ''
    } else if (visitorData.previousVisitor == 'false') {
      dispatch_gesture('visitorFirst')
      self.last_gesture = ''
    }
    quando.idle_reset()
    if (visitorData.state == 'entry'){
      dispatch_gesture('visitorEntry')
    }else if (visitorData.state == 'exit'){
      dispatch_gesture('visitorExit')
      self.last_gesture = ''
    }
    quando.idle_reset()
  })
})()

function emailFunc() {
  var new_Email = document.getElementById('email').value;
  if (new_Email != "") {
    alert("The email address: '" + new_Email + "' has been accepted.\n\n We hope you enjoy your visit!")
    setTimeout("window.close()", 3000)
  } else {
    alert("Please enter a valid email address.")
  }
}

function clearFunc() {
  document.getElementById('email').value = "";
}