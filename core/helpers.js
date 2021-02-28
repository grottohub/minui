export const toArray = function convertToArray(item) {
  return Array.prototype.slice.call(item);
};

export const addEv = function addEvent(...args) {
  args[0].addEventListener(args[1], args[2]);
  args[3].add(args[4], args[1], args[2]);
};

export const isElement = function isElement(element) {
  return element instanceof Element || element instanceof HTMLElement;
};

/**
 * Function factory for events that need to be bubbled
 * @param {Function} fn - function to be invoked
 * @param {string} triggerOpts - elements selected by query that event is triggered on
 * @returns {Function} function that invokes method when desired target triggers event
 */
export const bubblingFactory = function bubblingFactory(fn, triggerOpts) {
  return function(event) {
    let clickedElement = event.target;
    let classList = toArray(clickedElement.classList);
    let trigger;

    if (triggerOpts.query) {
      let selectedElements = toArray(document.querySelectorAll(triggerOpts.query));

      trigger = selectedElements.includes(clickedElement);
    } else if (isElement(triggerOpts)) {
      trigger = clickedElement === triggerOpts;
    } else {
      trigger = classList.includes(triggerOpts.class);
    }
    

    if (trigger) {
      fn(event);
    }
  }
};