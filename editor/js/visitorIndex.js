(() => {
    let self = this['visitorIndex'] = {}
    let _userid = null
    let _content = ''
    let _deploy = ''
    let _remote_list = []
    let _remote_list_index = false
    let PREFIX = 'quando_'
  
    function _encodeXml (str) {
      return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;')
    }


    self.handle_visitor_login = () => {
        let visitorid = $('#visitorId').val()
        let visitorpassword = $('#visitor').val()
        $.ajax({
          url: '/loginVisitor',
          type: 'POST',
          data: { 'visitorid': visitorid, 'visitorpassword': visitorpassword },
          success: (res, status, xhr) => {
            if (res.success) {
              swal({
                type: 'success',
                title: 'Login Successful',
                html: res.message,
                footer: 'If you need assistance, please contact a member of staff.',
                })
            } else {
              swal({
                type: 'error',
                title: 'Login Failed',
                text: res.message,
                footer: 'If you need assistance, please contact a member of staff.',
              })
            }
          },
          error: () => {
            alert('Failed to find server ')
          }
        })
      }

      self.handle_visitor_register = () => {
        let firstName = $('#firstName').val()
        let emailAddress = $('#email').val()
        let password = $('#password').val()
        $.ajax({
          url: '/create_visitor',
          type: 'POST',
          data: { 'firstName': firstName, 'email': emailAddress, 'password' : password},
          success: (res, status, xhr) => {
            if (res.success) {
              swal({
                type: 'success',
                title: 'Registration Successful',
                text: res.message,
                footer: 'If you need assistance, please contact a member of staff.',})
            } else {
           swal({
              type: 'error',
              title: 'Registration Failed',
              text: res.message,
              footer: 'If you need assistance, please contact a member of staff.',
            })
          }
          },
          error: () => {
            alert('Failed to find server ')
          }
        })
      }

      self.handle_visitor_update = () => {
        let visitorid = $('#visitorId').val()
        let visitorpassword = $('#visitor').val()
        $.ajax({
          url: '/updateVisitor',
          type: 'POST',
          data: { 'visitorid': visitorid, 'visitorpassword': visitorpassword },
          success: (res, status, xhr) => {
            if (res.success) {
              swal({
                type: 'success',
                title: 'Login Successful',
                html: res.message,
                footer: 'If you need assistance, please contact a member of staff.',
                })
            } else {
              swal({
                type: 'error',
                title: 'Login Failed',
                text: res.message,
                footer: 'If you need assistance, please contact a member of staff.',
              })
            }
          },
          error: () => {
            alert('Failed to find server ')
          }
        })
      }
    
    

    ;
})()