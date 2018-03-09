(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: ubit must be included after quando_browser')
  }
  var self = quando.ubit = {}
  self.last_gesture = ''
  var lastProximity = ''
  var lastSerial = ''

  function dispatch_gesture(gesture_name) {
    if (gesture_name != self.last_gesture) {
      self.last_gesture = gesture_name
      quando.dispatch_event(gesture_name)
    }
  }

  self.ubitForward = function (callback, destruct = true) {
    quando.add_handler('ubitForward', callback, destruct)
  }

  self.ubitBackward = function (callback, destruct = true) {
    quando.add_handler('ubitBackward', callback, destruct)
  }

  self.ubitUp = function (callback, destruct = true) {
    quando.add_handler('ubitUp', callback, destruct)
  }

  self.ubitDown = function (callback, destruct = true) {
    quando.add_handler('ubitDown', callback, destruct)
  }

  self.ubitLeft = function (callback, destruct = true) {
    quando.add_handler('ubitLeft', callback, destruct)
  }

  self.ubitRight = function (callback, destruct = true) {
    quando.add_handler('ubitRight', callback, destruct)
  }

  self.ubitA = function (callback, destruct = true) {
    quando.add_handler('ubitA', callback, destruct)
  }

  self.ubitB = function (callback, destruct = true) {
    quando.add_handler('ubitB', callback, destruct)
  }

  self.ubitPaired = function (callback, destruct = true) {
    quando.add_handler('ubitPaired', callback, destruct)
  }

  self.ubitConnected = function (callback, destruct = true) {
    quando.add_handler('ubitConnected', callback, destruct)
  }

  self.ubitDisconnected = function (callback, destruct = true) {
    quando.add_handler('ubitDisconnected', callback, destruct)
  }

  self.ubitClose = function (callback, destruct = true) {
    quando.add_handler('ubitClose', callback, destruct)
  }

  self.ubitFar = function (callback, destruct = true) {
    quando.add_handler('ubitFar', callback, destruct)
  }

  self.ubitSerial = function (callback, destruct = true) {
    quando.add_handler('ubitSerial', callback, destruct)
  }

  self.ubitVisitor = function (callback, destruct = true) {
    quando.add_handler('ubitVisitor', callback, destruct)
  }

  function _handleAngle(event, callback, extras, destruct = true) {
    var scale = quando.new_angle_scaler(extras.mid_angle, extras.plus_minus, extras.inverted)
    quando.add_scaled_handler(event, callback, scale, destruct)
  }

  self.handleRoll = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitRoll', callback, extras, destruct)
  }

  self.handlePitch = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitPitch', callback, extras, destruct)
  }

  self.handleHeading = function (callback, extras = {}, destruct = true) {
    _handleAngle('ubitHeading', callback, extras, destruct)
  }

  self.handleMagX = function (callback, extras = {}, destruct = true) {
    var scale = quando.new_scaler(extras.mid_angle - extras.plus_minus, extras.mid_angle + extras.plus_minus,
      extras.inverted)
    quando.add_scaled_handler("ubitMagX", callback, scale, destruct)
  }

  self.handleMagY = function (callback, extras = {}, destruct = true) {
    var scale = quando.new_scaler(extras.mid_angle - extras.plus_minus, extras.mid_angle + extras.plus_minus,
      extras.inverted)
    quando.add_scaled_handler("ubitMagY", callback, scale, destruct)
  }


  
  
  quando.socket.on('ubit', function (data) {
    console.log(data)
    dispatch_gesture('ubitPaired')
    if (data.Connected == 'true') {
      dispatch_gesture('ubitConnected')
    } else if (data.Disconnected == 'true') {
      dispatch_gesture('ubitDisconnected')
    }
    if (data.ir) {
      quando.idle_reset()
    } else if (data.orientation) {
      quando.idle_reset() // this is only received when the orientation changes
      if (data.orientation == 'forward') {
        dispatch_gesture('ubitForward')
      } else if (data.orientation == 'backward') {
        dispatch_gesture('ubitBackward')
      } else if (data.orientation == 'up') {
        dispatch_gesture('ubitUp')
      } else if (data.orientation == 'down') {
        dispatch_gesture('ubitDown')
      } else if (data.orientation == 'left') {
        dispatch_gesture('ubitLeft')
      } else if (data.orientation == 'right') {
        dispatch_gesture('ubitRight')
      } else if (data.orientation == '') { // this is the micro bit started
        last_gesture = ''
      }
    } else if (data.button) {
      quando.idle_reset()
      if (data.button == 'a') {
        quando.dispatch_event('ubitA')
      }
      if (data.button == 'b') {
        quando.dispatch_event('ubitB')
      }
    } else if (data.mag_x || data.mag_y) {
      quando.dispatch_event('ubitMagX', { 'detail': data.mag_x })
      quando.dispatch_event('ubitMagY', { 'detail': data.mag_y })
      quando.idle_reset()
    } else if (data.heading) {
      quando.dispatch_event('ubitHeading', { 'detail': data.heading })
      quando.idle_reset()
    } else if (data.roll || data.pitch) {
      if (data.roll) {
        var roll = data.roll * 180 / Math.PI
        if (roll < 0) {
          roll += 360
        }
        quando.dispatch_event('ubitRoll', { 'detail': roll })
      }
      if (data.pitch) {
        var pitch = data.pitch * 180 / Math.PI
        if (pitch < 0) {
          pitch += 360
        }
        quando.dispatch_event('ubitPitch', { 'detail': pitch })
      }
      quando.idle_reset()
    } else if (data.proximity) {
     // if (data.proximity != lastProximity) {
        if (data.proximity == 'close') {
          dispatch_gesture('ubitClose')
          lastProximity = 'close'
        } else if (data.proximity == 'far') {
          dispatch_gesture('ubitFar')
          lastProximity = 'far'
    //   }
      }
    } else if (data.serial) {
      if (data.serial != lastSerial) {
        dispatch_gesture('ubitSerial')
      }
    }else if (data.visitor) {
      if (data.visitor == 'false'){
        dispatch_gesture('ubitVisitor')
        lastProximity = ''
      } 
    }
  })
})()
