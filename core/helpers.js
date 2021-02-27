export const toArray = function convertToArray(item) {
  return Array.prototype.slice.call(item);
};

export const addEv = function addEvent(...args) {
  args[0].addEventListener(args[1], args[2]);
  args[3].add(args[4], args[1], args[2]);
};

/**
 * Function factory for events that need to be bubbled
 * @param {Function} fn - function to be invoked
 * @param {string} triggerClass - class that event is triggered on
 * @returns {Function} function that invokes method when desired target triggers event
 */
export const bubblingFactory = function bubblingFactory(fn, triggerClass) {
  return function(event) {
    let clickedElement = event.target;
    let classList = toArray(clickedElement.classList);

    if (classList.includes(triggerClass)) {
      fn();
    }
  }
};