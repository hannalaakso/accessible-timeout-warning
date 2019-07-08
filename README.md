# Accessible timeout warning ·

Timeout warning is a component that:

- Is shown after a period of inactivity
- Warns users before a session timeout that they’re about to time out
- Allows users to extend their session
- Offers alternate options if they don’t want to extend
- Requests user to take action and tells them how much time they have to do so
- Provides information to assistive technology so users with access needs are well supported

## User story

As an Assistive Technology (AT) user, I want to be informed that a modal dialog has opened, what its purpose is, and how to action / close it.

## Accessibility acceptance criteria

The modal dialog must:
1. Be focusable with a keyboard. (If an element eg. button triggers the dialog, that element must also be keyboard focusable.)
2. Inform user that an alert dialog has opened
3. Constrain focus to dialog
4. Return focus to element that had focus before the dialog was invoked.
5. Be possible to close. Be clear how to close. Examples of ways to close are pressing Esc and a close button.
6. Underlying page content must not look actionable.
7. Prevent user searching in the underlying page.
8. Prevent scrolling of the underlying page.
9. Should always be visible - regardless of scrolling, screen size or orientation changes.

Where multiple modals are open, above criteria apply to top-most one.

## Keyboard Interaction

- Screen reader users may not rely on the tab key to interact with the dialogue content.
- Screen readers have many keyboard commands for interacting with content and it's important that the way the dialogue is implemented doesn't prevent them from being usable.
- Could we use [this](https://www.paciellogroup.com/blog/2015/01/basic-screen-reader-commands-for-accessibility-testing/) as the list of commands for testing?

### Tab:
* Moves focus to the next focusable element inside the dialog.
* If focus is on the last element, moves focus to the first focusable element inside the dialog.

### Shift + Tab:
* Moves focus to the previous focusable element inside the dialog.
* If focus is on the first element, moves focus to the last focusable element inside the dialog.

### Escape:
* Closes the dialog.

## To run locally

Run `npm install`

Run `npm start`

## To integrate this component into your app

1. Include the markup from `app/views/includes/modal_dialog.html` on your page.

2. The script looks for a `#content` div on the page to set the `inert` attribute. Please change this to match name of your main container by overriding the selector property in your app
    ~~~
    var GOVUK = global.GOVUK || {};
    GOVUK.modalDialog.containerSelector = '.main-content';
    ~~~
    This indicates the active part of the page to screenreaders.

3. Include `sass/patterns/_modal-dialog.scss` as part of your SASS.

4. Include `/javascripts/dialog.polyfill.0.4.3.js` and `javascripts/modal-dialog.js` on your page or as part of your JavaScript bundle.

5. Initialise the JavaScript in `javascripts/application.js` with  `GOVUK.modalDialog.init()`
