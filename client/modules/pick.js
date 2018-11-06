(() => {
  let quando = this['quando']
  if (!quando) {
      alert('Fatal Error: pick.js must be included after quando_browser')
  }
  let self = quando.pick = {}

  function _pick(val, arr) {
    if (val === false) {
      val = 0.5
    }
    let i = Math.floor(val * arr.length)
    if (i == arr.length) {
      i--
    }
    arr[i]()
  }


  self.random = (arr) => {
    let r = Math.random()
    _pick(r, arr)
  }
})()