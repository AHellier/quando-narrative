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
              alert(res.message)
            } else {
              alert('Failed: ' + res.message)
            }
          },
          error: () => {
            alert('Failed to find server ')
          }
        })
      }
    

    ;
})()