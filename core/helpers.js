import {parser} from './parser.js';

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
 * @param {string} triggerOpts - elements selected by query that event is triggered on
 * @returns {Function} function that invokes method when desired target triggers event
 */
export const bubblingFactory = function bubblingFactory(fn, triggerOpts) {
  return function(event) {
    let clickedElement = event.target;
    let classList = toArray(clickedElement.classList);
    let trigger;

    if (triggerOpts.query) {
      let req = parser.convert(triggerOpts.query),
          tags = Object.keys(req.tags),
          tagVals = Object.values(req.tags);

      if (tags.length === 0) {
        classList.sort();
        trigger = req.classList.sort().every((klass, idx) => {
          classList[idx] === klass;
        });
      } else {
        if (tagVals.every(val => typeof val === 'boolean')) {
          trigger = tags.includes(clickedElement.tagName.toLowerCase());
        } else if (tagVals[0].parent) {
          trigger = tags.some((_, idx) => {
            return tagVals[idx].parent === clickedElement.parentElement.tagName.toLowerCase();
          });
        } else if (tagVals[0].prevSibling) {
          if (tags.includes(clickedElement.tagName.toLowerCase())) {
            trigger = tags.some((_, idx) => {
              if (clickedElement.previousElementSibling) {
                return tagVals[idx].prevSibling === clickedElement.previousElementSibling.tagName.toLowerCase();
              } else {
                return false;
              }
            });
          } else {
            trigger = false;
          }
        }
      }
    } else {
      trigger = classList.includes(triggerOpts.class);
    }

    if (trigger) {
      fn(event);
    }

    parser.clear();
  }
};