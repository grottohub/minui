/**
 * @file
 * Provides abstracted user interface features, available on `_ui` object
 */

import {eventStack} from './events.js';

export let minui;

(function() {
  const UserInterface = (function() {
    let loadStates = {};

    // general helper methods, fairly straightforward

    const convertToArray = function convertToArray(item) {
      return Array.prototype.slice.call(item);
    };

    /**
     * Returns the desired properties from an HTMLElement as a key-value pair object
     * @param {HTMLElement} element - a HTMLElement object to select properties from
     * @param {Array} props - array containing property names to select
     * @returns {Object} - containing key-value pairs of retrieved props (includes undefined)
     */
    const getProps = function getProps(element, props) {
      let selectedProps = {};

      props.forEach((prop) => {
        selectedProps[prop] = element[prop];
      });

      return selectedProps;
    };

    /**
     * 
     * @param {Array} elements - array of HTMLElement objects to select properties from 
     * @param {Array} props - array containing property names to select
     * @returns {Array} - containing retrieved props for each element (includes undefined)
     */
    const getAllProps = function getAllProps(elements, props) {
      let allProps = [];

      elements.forEach((element) => {
        allProps.push(getProps(element, props));
      });

      return allProps;
    };

    /**
     * Returns an array of HTMLElements based on class, id, or CSS selector query
     * @param {Object} options - a key-value pair object for determining which document method to use
     * @returns {Array} - containing individual HTMLElement objects 
     */
    const getElements = function getElements(options) {
      if (options.id) {
        return [document.getElementById(options.id)];
      }

      else if (options.class) {
        return convertToArray(document.getElementsByClassName(options.class));
      }

      else if (options.query) {
        return convertToArray(document.querySelectorAll(options.query));
      }
    };

    /**
     * 
     * @param {Object} options - a key-value pair object for determining which internal retrieval method to use
     * @returns {*} - determined by internal methods and intent evaluated from options 
     */
    const getFromInterface = function getFromInterface(options) {
      let elements = getElements(options);
      
      if (options.id && options.props) {
        return getProps(elements[0], options.props);
      }

      else if (options.id) {
        return elements[0];
      }

      else if (options.props) {
        return getAllProps(element, options.props);
      }

      else {
        return elements;
      }
    };

    /**
     * 
     * @param {Function} fn - function to be applied to event listener
     * @param {Object} options - a key-value pair object for determining how to apply listeners
     * @returns {Boolean} - represents general success of event application
     */
    const applyEventListener = function applyEventListener(fn, options) {
      if (typeof fn !== 'function') {
        return false;
      }

      let eventType = options.ev ? options.ev : options.type,
          eventFn = fn,
          holder;

      if (options.ev) {
        document.addEventListener(options.ev, fn);
        holder = 'document';
        eventStack.add(holder, eventType, eventFn);
      }
      
      else {
        let elements = getElements(options);

        elements.forEach(element => {
          element.addEventListener(eventType, fn);
          holder = element.id ? element.id : options.class;
          eventStack.add(holder, eventType, eventFn);
        });
      }

      let eventAdded = {
        type: "fn",
        val: eventFn,
        existsOn: holder,
      };

      return eventStack.exists(eventAdded);
    };

    /**
     * 
     * @param {HTMLElement} element - HTMLElement to apply styles to 
     * @param {*} styles - a key-value pair object representing the desired styles
     * @returns {undefined}
     */
    const applyStyles = function applyStyles(element, styles) {
      for (var newStyle in styles) {
        element.style[newStyle] = styles[newStyle];
      }
    };

    return {
      loaded(fn) {
        applyEventListener(fn, {ev: 'DOMContentLoaded'});
      },

      get(options) {
        return getFromInterface(options);
      },

      events() {
        return eventStack.all();
      },

      findEvents(query) {
        return eventStack.find(query);
      },

      click(fn, options) {
        options.type = "click";
        return applyEventListener(fn, options);
      },

      focusout(fn, options) {
        options.type = "focusout";
        return applyEventListener(fn, options);
      },

      changeStyle(element, styles) {
        applyStyles(element, styles);
      },

      toggleClasses(element, classList) {
        classList.forEach(klass => element.classList.toggle(klass));
      },

      defLoadState(options) {
        loadStates[options.element] = {
          default: options.default,
          loading: options.loading,
          success: options.success,
          error: options.error,
        };
      },

      startLoad(elements) {
        let elementList = this.get({query: elements});

        elementList.forEach((element) => {
          element.className = '';
          element.classList.add(...loadStates[elements].loading);
        });
      },

      stopLoad(elements, successType) {
        let elementList = this.get({query: elements});

        elementList.forEach((element) => {
          element.classList.remove(...loadStates[elements].loading);
          element.classList.add(...loadStates[elements][successType]);
        });
      },

      init() {
        return this;
      }
    }
  })();

  minui = Object.create(UserInterface).init();
})();