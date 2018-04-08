/** Visitor API that is used to establish communication between the client and the server. */
(function () {
  var quando = this['quando']
  if (!quando) {
    //  alert('Fatal Error: ubit must be included after quando_browser')
  }
  var self = quando.visitor = {}
  var exhibitName = ''
  self.last_gesture = ''
  function dispatch_gesture(gesture_name) {
    if (gesture_name != self.last_gesture) {
      self.last_gesture = gesture_name
      quando.dispatch_event(gesture_name)
    }
  }

  /** Prototype function that was created for future work. Not currently used */
  function _handleExhibit(event, callback, exhibit, destruct = true) {
    var exhibitName = quando.new_exhibit(exhibit.name)
    quando.add_exhibit_handler(event, callback, exhibitName, destruct)
  }

  /** Callback function that is executed when a visitor returns
   *  to an interactive exhibit Visitor personalisation.. */
  self.visitorReturn = function (callback, destruct = true) {
    quando.add_handler('visitorReturn', callback, destruct)
  }

  /** Callback function that is executed when a visitor interacts with an exhibit 
   * for the first time. Visitor personalisation.  */
  self.visitorFirst = function (callback, destruct = true) {
    quando.add_handler('visitorFirst', callback, destruct)
  }

  /**Callback function that is executed when a visitor interacts with an exhibit. 
   * Used to deploy a login/register page. */
  self.visitorEntry = function (callback, destruct = true) {
    quando.add_handler('visitorEntry', callback, destruct)
  }

  /**Callback function that is executed when a visitor leaves an exhibit. 
   * Used to exit a login/register page. */
  self.visitorExit = function (callback, destruct = true) {
    quando.add_handler('visitorExit', callback, destruct)
  }

  self.visitorExhibit = function (callback, destruct = true) {
    quando.add_handler('visitorExhibit', callback, destruct)
  }

  /**Callback function executed when a remote micro:bit with an 
   * identity of 1 interacts with the exhibit. Visitor identification
   * and personalisation.  */
  self.visitorIdentity1 = function (callback, destruct = true) {
    quando.add_handler('visitorIdentity1', callback, destruct)
  }

  /**Callback function executed when a remote micro:bit with an 
    * identity of 2 interacts with the exhibit. Visitor identification
    * and personalisation.  */
  self.visitorIdentity2 = function (callback, destruct = true) {
    quando.add_handler('visitorIdentity2', callback, destruct)
  }

  /**Callback function that is executed when the A button 
   * on a remote micro:bit is pressed 3 time simultaneously.
   Visitor personalisation. */
  self.visitorDelete = function (callback, destruct = true) {
    quando.add_handler('visitorDelete', callback, destruct)
  }

  /**Socket.IO function that enables communication with the server. */
  quando.socket.on("visitor", function (visitorData) {
    //alert (visitorData.exhibit)
    if (visitorData.previousVisitor == 'true') {
      dispatch_gesture('visitorReturn')
      self.last_gesture = ''
    } else if (visitorData.previousVisitor == 'false') {
      dispatch_gesture('visitorFirst')
      self.last_gesture = ''
    }
    quando.idle_reset()
    if (visitorData.state == 'entry') {
      dispatch_gesture('visitorEntry')
    } else if (visitorData.state == 'exit') {
      dispatch_gesture('visitorExit')
      self.last_gesture = ''
    } else if (visitorData.state == 'delete') {
      dispatch_gesture('visitorDelete')
    }
    quando.idle_reset()
    if (visitorData.exhibit) {
      quando.dispatch_event('visitorExhibits ', { 'name': visitorData.exhibit })
      //  if(quando.new_exhibit == visitorData.exhibit){
      //  dispatch_gesture('visitorExhibit')
      // }
    }
    if (visitorData.selectedExhibit) {
      // dispatch_gesture('visitorExhibit')
    }
    if (visitorData.identity == 1) {
      dispatch_gesture('visitorIdentity1')
    } else if (visitorData.identity == 2) {
      dispatch_gesture('visitorIdentity2')
    }
  })
})()

//no longer being used
function emailFunc() {
  var new_Email = document.getElementById('email').value;
  if (new_Email != "") {
    alert("The email address: '" + new_Email + "' has been accepted.\n\n We hope you enjoyed your visit!")
    setTimeout("window.close()", 3000)
  } else {
    alert("Please enter a valid email address.")
  }
}

//no longer being used
function usernameFunc() {
  var new_username = document.getElementById('visitorId').value;
  var new_password = document.getElementById('visitor').value;
  if ((new_username == "") || (new_password == "")) {
    alert("Please enter your username (email address) and password.")
  } else {
  }
}

/**Function that clears inputted values on login page. */
function clearFunc() {
  document.getElementById('visitor').value = "";
  document.getElementById('visitorId').value = "";
}

/**Function that clears inputted values on register page. */
function clearRegisterFunc() {
  document.getElementById('firstName').value = "";
  document.getElementById('email').value = "";
  document.getElementById('password').value = "";
}