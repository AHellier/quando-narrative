(function () {
  var quando = this['quando']

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

  quando.socket.on("visitor", function (visitorData) {

    if (visitorData.previousVisitor == true) {
      dispatch_gesture('visitorReturn')
    } else if (visitorData.previousVisitor == false) {
      dispatch_gesture('visitorFirst')
    }
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