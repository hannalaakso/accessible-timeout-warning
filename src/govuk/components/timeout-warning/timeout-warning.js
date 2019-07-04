import '../../vendor/polyfills/Function/prototype/bind'
import '../../vendor/polyfills/Element/prototype/classList'

function TimeoutWarning ($module) {
  this.$module = $module
  this.$lastFocusedEl = null
  // this.$openButton = document.querySelector('.openModal')
  this.$closeButton = $module.querySelector('.js-dialog-close')
  this.$cancelButton = $module.querySelector('.js-dialog-cancel')
  this.appOverlay = 'app-timeout-warning-overlay'
  this.timers = []
  // Timer specific markup. If these are not present, timeout and redirection are disabled
  this.$timer = $module.querySelector('#js-timeout-warning .timer')
  this.$accessibleTimer = $module.querySelector('#js-timeout-warning .at-timer')
  // Timer specific settings. If these are not set, timeout and redirection are disabled
  this.idleMinutesBeforeTimeOut = $module.getAttribute('data-minutes-idle-timeout')
  this.timeOutRedirectUrl = $module.getAttribute('data-url-redirect')
  this.minutesTimeOutModalVisible = $module.getAttribute('data-minutes-modal-visible')
  this.timeUserLastInteractedWithPage = ''
}

// Initialize component
TimeoutWarning.prototype.init = function () {
  // Check for module
  if (!this.$module) {
    return
  }

  if (this.$module) {
    // Native dialog is not supported by browser so use polyfill
    if (typeof HTMLDialogElement !== 'function') {
      window.dialogPolyfill.registerDialog(this.$module)
    }
    this.bindUIElements()
    this.escClose()

    if (this.isTimerSet()) {
      this.idleTimeOut()
    }
  }
}

TimeoutWarning.prototype.bindUIElements = function () {
  // setTimeout(this.openDialog.bind(this), 6000) //debug

  this.$openButton.addEventListener('click', this.openDialog.bind(this))

  this.$closeButton.addEventListener('click', this.closeDialog.bind(this))

  this.$module.addEventListener('keydown', this.escClose.bind(this))

  // this.$cancelButton.on('click', function (e) {
  //   e.preventDefault()
  // })
  // this.disableBackButtonWhenOpen()
}

TimeoutWarning.prototype.isDialogOpen = function () {
  return this.$module['open']
}

TimeoutWarning.prototype.isTimerSet = function () {
  return this.$timer &&
         this.$accessibleTimer &&
         this.idleMinutesBeforeTimeOut && this.minutesTimeOutModalVisible && this.timeOutRedirectUrl
}

TimeoutWarning.prototype.openDialog = function () {
  // TO DO: get last interactive time from server to see if modal should be opened
  if (!this.isDialogOpen()) {
    document.querySelector('body').classList.add(this.appOverlay)
    this.saveLastFocusedEl()
    this.makePageContentInert()
    // polyfill?
    this.$module.showModal()

    if (this.isTimerSet()) {
      this.startTimer()
    }

    // if (window.history.pushState) {
    //   window.history.pushState('', '') // This updates the History API to enable state to be "popped" to detect browser navigation for disableBackButtonWhenOpen
    // }
  }
}

TimeoutWarning.prototype.closeDialog = function () {
  if (this.isDialogOpen()) {
    document.querySelector('body').classList.remove(this.appOverlay)
    this.$module.close()
    this.setFocusOnLastFocusedEl()
    this.removeInertFromPageContent()

    if (this.isTimerSet()) {
      this.clearTimers()
    }
  }
}

TimeoutWarning.prototype.disableBackButtonWhenOpen = function () {
  window.addEventListener('popstate', function () {
    if (this.isDialogOpen()) {
      this.closeDialog()
    } else {
      window.history.go(-1)
    }
  })
}

TimeoutWarning.prototype.saveLastFocusedEl = function () {
  this.$lastFocusedEl = document.activeElement
  if (!this.$lastFocusedEl || this.$lastFocusedEl === document.body) {
    this.$lastFocusedEl = null
  } else if (document.querySelector) {
    this.$lastFocusedEl = document.querySelector(':focus')
  }
}

// Set focus back on last focused el when modal closed
TimeoutWarning.prototype.setFocusOnLastFocusedEl = function () {
  if (this.$lastFocusedEl) {
    window.setTimeout(function () {
      this.$lastFocusedEl.focus()
    }, 0)
  }
}

// Set page content to inert to indicate to screenreaders it's inactive
// NB: This will look for #content for toggling inert state
TimeoutWarning.prototype.makePageContentInert = function () {
  if (document.querySelector('#content')) {
    document.querySelector('#content').inert = true
    document.querySelector('#content').setAttribute('aria-hidden', 'true')
  }
}

// Make page content active when modal is not open
// NB: This will look for #content for toggling inert state
TimeoutWarning.prototype.removeInertFromPageContent = function () {
  if (document.querySelector('#content')) {
    document.querySelector('#content').inert = false
    document.querySelector('#content').setAttribute('aria-hidden', 'false')
  }
}

// Starts a timer. If modal not closed before time out + 4 seconds grace period, user is redirected.
TimeoutWarning.prototype.startTimer = function () {
  this.clearTimers() // Clear any other modal timers that might have been running
  var $module = this
  var $timer = this.$timer
  var $accessibleTimer = this.$accessibleTimer
  var minutes = this.minutesTimeOutModalVisible
  var timerRunOnce = false
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  var timers = this.timers

  if (minutes) {
    // TO DO: Contact server to find last active time, in case modal is open in another tab, and update time left here accordingly

    var seconds = 60 * minutes

    $timer.innerHTML = minutes + ' minute' + (minutes > 1 ? 's' : '');

    (function runTimer () {
      var minutesLeft = parseInt(seconds / 60, 10)
      var secondsLeft = parseInt(seconds % 60, 10)
      var timerExpired = minutesLeft < 1 && secondsLeft < 1

      var minutesText = minutesLeft > 0 ? '<span class="tabular-numbers">' + minutesLeft + '</span> minute' + (minutesLeft > 1 ? 's' : '') + '' : ' '
      var secondsText = secondsLeft >= 1 ? ' <span class="tabular-numbers">' + secondsLeft + '</span> second' + (secondsLeft > 1 ? 's' : '') + '' : ''
      var atMinutesNumberAsText = ''
      var atSecondsNumberAsText = ''

      try {
        atMinutesNumberAsText = this.numberToWords(minutesLeft) // Attempt to convert numerics into text as iOS VoiceOver ccassionally stalled when encountering numbers
        atSecondsNumberAsText = this.numberToWords(secondsLeft)
      } catch (e) {
        atMinutesNumberAsText = minutesLeft
        atSecondsNumberAsText = secondsLeft
      }

      var atMinutesText = minutesLeft > 0 ? atMinutesNumberAsText + ' minute' + (minutesLeft > 1 ? 's' : '') + '' : ''
      var atSecondsText = secondsLeft >= 1 ? ' ' + atSecondsNumberAsText + ' second' + (secondsLeft > 1 ? 's' : '') + '' : ''

      // Below string will get read out by screen readers every time the timeout refreshes (every 15 secs. See below).
      // Please add additional information in the modal body content or in below extraText which will get announced to AT the first time the time out opens
      var text = 'We will reset your application if you do not respond in ' + minutesText + secondsText + '.'
      var atText = 'We will reset your application if you do not respond in ' + atMinutesText
      if (atSecondsText) {
        if (minutesLeft > 0) {
          atText += ' and'
        }
        atText += atSecondsText + '.'
      } else {
        atText += '.'
      }
      var extraText = ' We do this to keep your information secure.'

      if (timerExpired) {
        $timer.innerHTML = 'You are about to be redirected'
        $accessibleTimer.innerHTML = 'You are about to be redirected'
        //TO DO: tell server to reset userlastinteractedwithpage
        if (window.localStorage) {
          window.localStorage.setItem('timeUserLastInteractedWithPage', '')
        }
        setTimeout($module.redirect, 4000)
      } else {
        seconds--

        $timer.innerHTML = text + extraText

        if (minutesLeft < 1 && secondsLeft < 20) {
          $accessibleTimer.setAttribute('aria-live', 'assertive')
        }

        if (!timerRunOnce) {
          // Read out the extra content only once. Don't read out on iOS VoiceOver which stalls on the longer text

          if (iOS) {
            $accessibleTimer.innerHTML = atText
          } else {
            $accessibleTimer.innerHTML = atText + extraText
          }
          timerRunOnce = true
        } else if (secondsLeft % 15 === 0) {
          // Update screen reader friendly content every 15 secs
          $accessibleTimer.innerHTML = atText
        }

        // JS doesn't allow resetting timers globally so timers need to be retained for resetting.
        timers.push(setTimeout(runTimer, 1000))
      }
    })()
  }
}

// Clears modal timer
TimeoutWarning.prototype.clearTimers = function () {
  for (var i = 0; i < this.timers.length; i++) {
    clearTimeout(this.timers[i])
  }
}

// Close modal when ESC pressed
TimeoutWarning.prototype.escClose = function (event) {
  // get the target element
  if (this.isDialogOpen() && event.keyCode === 27) {
    this.closeDialog()
  }
}

TimeoutWarning.prototype.idleTimeOut = function () {
  var idleMinutes = this.idleMinutesBeforeTimeOut
  var milliSeconds
  var timer

  this.checkIfShouldHaveTimedOut()

  if (idleMinutes) {
    milliSeconds = idleMinutes * 60000

    window.onload = resetTimer.bind(this)
    window.onmousemove = resetTimer.bind(this)
    window.onmousedown = resetTimer.bind(this) // Catches touchscreen presses
    window.onclick = resetTimer.bind(this) // Catches touchpad clicks
    window.onscroll = resetTimer.bind(this) // Catches scrolling with arrow keys
    window.onkeypress = resetTimer.bind(this)
    window.onkeyup = resetTimer.bind(this) // Catches Android keypad presses
  }

  function resetTimer () {
    clearTimeout(timer)

    // TO DO: tell server at intervals that user is active instead of storing last interaction time locally
    if (window.localStorage) {
      window.localStorage.setItem('timeUserLastInteractedWithPage', new Date())
    }

    timer = setTimeout(this.openDialog.bind(this), milliSeconds)
  }
}

// Do a timestamp comparison when the page regains focus to check if the user should have been timed out already
TimeoutWarning.prototype.checkIfShouldHaveTimedOut = function () {
  window.onfocus = function () {
    // Debugging tip: Above event doesn't kick in in Chrome if you have Inspector panel open and have clicked on it
    // as it is now the active element. Click on the window to make it active before moving to another tab.
    if (window.localStorage) {
      // TO DO: timeUsexrLastInteractedWithPage should in fact come from the server
      var timeUserLastInteractedWithPage = new Date(window.localStorage.getItem('timeUserLastInteractedWithPage'))

      var seconds = Math.abs((timeUserLastInteractedWithPage - new Date()) / 1000)

      // TO DO: use both idlemin and timemodalvisible
      if (seconds > this.idleMinutesBeforeTimeOut * 60) {

    //  if (seconds > 60) {
        this.redirect()
      }

      //   // TO DO: open modal if advised so by the server, tell modal how many seconds are left
      // else if () {
      //   this.openDialog.bind(this)
      // }
    }
  }
}
TimeoutWarning.prototype.redirect = function () {
  window.location.replace(this.timeOutRedirectUrl)
}
TimeoutWarning.prototype.numberToWords = function () {
  var string = n.toString()
  var units
  var tens
  var scales
  var start
  var end
  var chunks
  var chunksLen
  var chunk
  var ints
  var i
  var word
  var words = 'and'

  if (parseInt(string) === 0) {
    return 'zero'
  }

  /* Array of units as words */
  units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ]

  /* Array of tens as words */
  tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ]

  /* Array of scales as words */
  scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ]

  /* Split user arguemnt into 3 digit chunks from right to left */
  start = string.length
  chunks = []
  while (start > 0) {
    end = start
    chunks.push(string.slice((start = Math.max(0, start - 3)), end))
  }

  /* Check if function has enough scale words to be able to stringify the user argument */
  chunksLen = chunks.length
  if (chunksLen > scales.length) {
    return ''
  }

  /* Stringify each integer in each chunk */
  words = []
  for (i = 0; i < chunksLen; i++) {
    chunk = parseInt(chunks[i])

    if (chunk) {
      /* Split chunk into array of individual integers */
      ints = chunks[i].split('').reverse().map(parseFloat)

      /* If tens integer is 1, i.e. 10, then add 10 to units integer */
      if (ints[1] === 1) {
        ints[0] += 10
      }

      /* Add scale word if chunk is not zero and array item exists */
      if ((word = scales[i])) {
        words.push(word)
      }

      /* Add unit word if array item exists */
      if ((word = units[ints[0]])) {
        words.push(word)
      }

      /* Add tens word if array item exists */
      if ((word = tens[ ints[1] ])) {
        words.push(word)
      }

      /* Add hundreds word if array item exists */
      if ((word = units[ints[2]])) {
        words.push(word + ' hundred')
      }
    }
  }
  return words.reverse().join(' ')
}

export default TimeoutWarning
