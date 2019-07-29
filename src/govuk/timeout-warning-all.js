import { nodeListForEach } from './common';
import TimeoutWarning from './components/timeout-warning/timeout-warning';

function initAll(options) {
  // Set the options to an empty object by default if no options are passed.
  options = typeof options !== 'undefined' ? options : {};

  // Allow the user to initialise GOV.UK Frontend in only certain sections of the page
  // Defaults to the entire document if nothing is set.
  var scope = typeof options.scope !== 'undefined' ? options.scope : document;

  var $timeoutWarnings = scope.querySelectorAll(
    '[data-module="govuk-timeout-warning"]'
  );
  nodeListForEach($timeoutWarnings, function($timeoutWarning) {
    new TimeoutWarning($timeoutWarning).init();
  });
}

export { initAll, TimeoutWarning };
