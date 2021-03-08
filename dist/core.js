let _ui;

(function () {
  let blueprints, eventStack;

  const toArray = function convertToArray(item) {
    return Array.prototype.slice.call(item);
  };
  
  const addEv = function addEvent(...args) {
    args[0].addEventListener(args[1], args[2]);
    args[3].add(args[4], args[1], args[2]);
  };
  
  const isElement = function isElement(element) {
    return element instanceof Element || element instanceof HTMLElement;
  };
  
  /**
   * Function factory for events that need to be bubbled
   * @param {Function} fn - function to be invoked
   * @param {string} triggerOpts - elements selected by query that event is triggered on
   * @returns {Function} function that invokes method when desired target triggers event
   */
  const bubblingFactory = function bubblingFactory(fn, triggerOpts) {
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

  // blueprints
  (function () {
    const Blueprints = (function () {
      let allBlueprints = {};
  
      const createElement = function createElementFromBlueprint(blueprint) {
        let element = document.createElement(blueprint.tag);
        allBlueprints[blueprint.attr.blueprint] = blueprint;
        
        Object.keys(blueprint.attr).forEach(attribute => {
          element[attribute] = blueprint.attr[attribute];
        });
  
        element.classList.add(...blueprint.classes);
  
        return element;
      };
  
      const createFragment = function createFragmentForBlueprint(blueprint) {
        let element = createElement(blueprint),
            fragment = new DocumentFragment();
  
        fragment.appendChild(element);
  
        return fragment;
      };
  
      const activateState = function activateBlueprintState(element, state) {
        let blueprint = allBlueprints[element.blueprint],
            allStates = Object.keys(blueprint.states);
  
        allStates.forEach(current => element.classList.remove(...blueprint.states[current]));
  
        element.classList.add(...blueprint.states[state]);
      };
  
      return {
        make(blueprint) {
          return createFragment(blueprint);
        },
  
        state(element, state) {
          activateState(element, state);
        },
  
        init() {
          return this;
        }
      }
    })();
  
    blueprints = Object.create(Blueprints).init();
  })();

  // eventstack
  (function() {
    const EventStack = (function () {
      let events = {};
  
      /**
       * Initializes a new event holder to attach events to
       * @param {string} holder - represents what the event is defined on 
       */
      const initEventHolder = function initEventHolder(holder) {
        events[holder] = {};
      };
  
      /**
       * Initializes a new function stack for a specific event holder
       * @param {string} holder - represents what the event is defined on
       * @param {string} type - type of event being applied 
       */
      const initEventType = function initEventType(holder, type) {
        events[holder][type] = [];
      }
  
      /**
       * Adds a function to the event stack
       * @param {string} holder - represents what the event is defined on
       * @param {string} type - type of event being applied
       * @param {Function} fn - the function being invoked during / applied to event
       */
      const addToFnStack = function addToFnStack(holder, type, fn) {
        if (events[holder] === undefined) {
          initEventHolder(holder);
        }
  
        if (events[holder][type] === undefined) {
          initEventType(holder, type);
        }
  
        events[holder][type].push(fn);
      }
  
      /**
       * Filters matching events into a new object
       * @param {string} fn - the function name to search for
       * @param {string} type - the event type to search for
       * @returns {object} object containing events matching the query
       */
      const filterEvents = function filterEvents(fn, type) {
        let filteredEvents = {},
            eventHolders = Object.keys(events);
  
        eventHolders.forEach((holder) => {
          let eventTypes = Object.keys(events[holder]),
              eventFns = Object.values(events[holder])[0].map(eventFn => eventFn.name),
              foundEvent = {};
  
          foundEvent[holder] = events[holder];
          
          if(eventTypes.includes(type)) {
            filteredEvents[holder] = foundEvent[holder];
          } else if (eventFns.includes(fn)) {
            filteredEvents[holder] = foundEvent[holder];
          }
        });
  
        return filteredEvents;
      };
  
      /**
       * Finds an event(s) in the event stack
       * @param {*} query - key-value query object
       */
      const findEvents = function findEvent(query) {
        if (query.query) {
          return events[query.query];
        }
  
        else {
          return filterEvents(query.fn, query.type);
        }
      };
  
      return {
        /**
         * Retrieves all events on the event stack
         */
        all() {
          return events;
        },
  
        /**
         * Adds a new event to the event stack
         * @param {string} title - what the event is being attached to
         * @param {string} type - the type of event that would be triggered
         * @param {Function} fn - the function being invoked during / applied to event
         */
        add(title, type, fn) {
          addToFnStack(title, type, fn);
        },
  
        /**
         * Finds events currently on the stack
         * @param {*} query - key-value pair query object
         */
        find(query) {
          return findEvents(query);
        },
  
        /**
         * Determines if event exists on the stack
         * @param {*} query key-value pair query object
         */
        exists(query) {
          let foundEvents = findEvents(query),
              eventExists;
          
          Object.keys(foundEvents).forEach((holder) => {
            eventExists = Object.keys(holder)[0] === query.existsOn;
          });
  
          return eventExists;
        },
  
        init() {
          return this;
        }
      }
    })();
  
    eventStack = Object.create(EventStack).init();
  })();

  // core
  (function() {
    /**
     * Prototype that minUI is constructed from
     * @constructor
     */
    const UserInterface = (function() {
      let settings = {};
      let loadStates = {};
  
      /**
       * Returns the desired properties from an HTMLElement as a key-value pair object
       * @param {HTMLElement} element - a HTMLElement object to select properties from
       * @param {string[]} props - array containing property names to select
       * @returns {Object} object containing key-value pairs of retrieved props (includes undefined)
       */
      const getProps = function getProperties(element, props) {
        let selectedProps = {};
  
        props.forEach((prop) => {
          selectedProps[prop] = element[prop];
        });
  
        return selectedProps;
      };
  
      /**
       * Returns an array of properties for given elements
       * @param {HTMLElement[]} elements - array of HTMLElement objects to select properties from 
       * @param {string[]} props - array containing property names to select
       * @returns {Array} containing retrieved props for each element (includes undefined)
       */
      const getAllProps = function getAllProperties(elements, props) {
        return elements.map((element) => {
          getProps(element, props);
        });
      };
  
      /**
       * Returns an array of HTMLElements based on class, id, or CSS selector query
       * @param {Object} options - a key-value pair object for determining which document method to use
       * @returns {HTMLElement[]} containing individual HTMLElement objects 
       */
      const getElem = function getElements(options) {
        if (options.id) {
          return [document.getElementById(options.id)];
        }
  
        else if (options.class) {
          return toArray(document.getElementsByClassName(options.class));
        }
  
        else if (options.query) {
          return toArray(document.querySelectorAll(options.query));
        }
      };
  
      /**
       *  Determines which retrieval method to use
       * @param {Object} options - a key-value pair object for determining which internal retrieval method to use
       * @returns {*} data structure determined by internal methods and intent evaluated from options 
       */
      const getFromUI = function getFromInterface(options) {
        let elemOpts = options,
            parent = options.parentOf,
            child = options.childOf,
            children = options.childrenOf;
  
        if (parent) {
          elemOpts = options.parentOf;
        } else if (child) {
          elemOpts = options.childOf;
        } else if (children) {
          elemOpts = options.childrenOf;
        }
  
        let elements = getElem(elemOpts);
  
        if (parent) {
          return elements[0].parentElement;
        } else if (child) {
          return elements[0].firstElementChild;
        } else if (children) {
          return toArray(elements[0].children);
        }
        
        if (options.id && options.props) {
          return getProps(elements[0], options.props);
        }
  
        else if (options.id) {
          return elements[0];
        }
  
        else if (options.props) {
          return getAllProps(elements, options.props);
        }
  
        else {
          return elements;
        }
      };
  
      /**
       * General event listening applicator
       * @param {Function} fn - function to be applied to event listener
       * @param {Object} options - a key-value pair object for determining how to apply listeners
       * @returns {Boolean} represents general success of event application
       */
      const applyEventListener = function applyEventListener(fn, options) {
        if (typeof fn !== 'function') {
          return false;
        }
  
        let eventType = options.ev ? options.ev : options.evType,
            holder = 'document';
  
        if (!options.id && (options.document || options.bubble)) {
          let eventFn = options.bubble ? bubblingFactory(fn, options) : fn;
          addEv(document, eventType, eventFn, eventStack, holder);
        }
        
        else {
          let elements = isElement(options) ? [options] : getElem(options);
          holder = options.class ? options.class : options.query;
          if (options.id !== undefined && options.id !== '') holder = options.id;
  
          elements.forEach(element => {
            addEv(element, eventType, fn, eventStack, holder);
          });
        }
  
        let eventAdded = {
          type: "fn",
          val: fn,
          existsOn: holder,
        };
  
        return eventStack.exists(eventAdded);
      };
  
      /**
       * Creates dynamic event methods on prototype
       * @param {*} thisArg - represents `this`, aka the prototype
       * @param {string} eventName - the event being defined on the prototype
       */
      const attachEvents = function attachEvents(thisArg, eventName) {
        const eventFactory = function eventFactory() {
          /**
           * Blueprint used with event factory @see defEvent
           * @param {(Function|Object)} fn - function to apply to event or
           * @param {(Function|Object)} options - options object containing event info
           */
          return function eventBlueprint(...args) {
            let fn, options;
  
            if (typeof args[0] === 'function') {
              fn = args[0];
              options = args[1];
            } else {
              fn = args[1];
              options = args[0];
            }
  
            if (!isElement(options) && options.bubble === undefined) options.bubble = true;
            options.evType = eventName;
            return applyEventListener.call(thisArg, fn, options);
          }
        };
  
        Object.getPrototypeOf(thisArg)[eventName] = eventFactory();
      };
  
      return {
        /**
         * Setup method typically used once for defining event methods and other settings
         * @param {*} newSettings - key-pair object of setting values
         * @param {Function} fn - function to execute during setup
         */
        setup(newSettings, fn) {
          settings = newSettings;
          fn();
        },
  
        /**
         * Applies given function to `DOMContentLoaded` event
         * @param {Function} fn - function to be applied once the DOM is loaded
         */
        loaded(fn) {
          applyEventListener(fn, {ev: 'DOMContentLoaded', document: true});
        },
  
        /**
         * Retrieve information from the DOM
         * @param {*} options - key-pair object
         * @param {string} options.id - id of HTMLElement
         * @param {string} options.class - class of HTMLElement(s)
         * @param {string} options.query - CSS selector query
         * @param {string[]} options.props - desired props to retrieve from HTMLElement(s)
         */
        get(options) {
          return getFromUI(options);
        },
  
        /**
         * Retrieve all events from current event stack
         */
        events() {
          return eventStack.all();
        },
  
        /**
         * Filter for specific events from event stack
         * @param {*} query - key-value object
         * @param {string} query.query - CSS selector query (WIP)
         * @param {string} query.type - type of event to look for (e.g. 'click')
         * @param {string} query.fn - name of function to find in event stack
         */
        findEvents(query) {
          return eventStack.find(query);
        },
  
        /**
         * Defines a new event on the prototype, allowing you to invoke `_ui.{eventName()}`
         * @param {string} eventName - type of event to be defined
         */
        defEvent(eventName) {
          attachEvents(this, eventName);
        },
  
        /**
         * Defines multiple new events on the prototype, allowing you to invoke `_ui.{eventName()}`
         * @param {string[]} events - types of events to be defined
         */
        defEvents(events) {
          events.forEach(event => this.defEvent(event), this);
        },
  
        /**
         * Update styling for a HTMLElement
         * @param {HTMLElement} element - a HTMLElement to update styles for
         * @param {*} styles - key-value pair representing style values
         */
        changeStyle(element, styles) {
          for (var newStyle in styles) {
            element.style[newStyle] = styles[newStyle];
          }
        },
  
        /**
         * Toggles classes on a desired element
         * @param {HTMLElement} element - desired element to update
         * @param {string[]} classList - array of classes to toggle on `element`
         */
        toggleClasses(element, classList) {
          classList.forEach(klass => element.classList.toggle(klass));
        },
  
        make(blueprint) {
          return blueprints.make(blueprint);
        },
  
        state(element, state) {
          if (!isElement(element)) {
            let bpElement = this.get(element);
          }
          blueprints.state(bpElement, state);
        },
  
        init() {
          return this;
        }
      }
    })();
  
    minui = Object.create(UserInterface).init();

    let settings = {};

    minui.setup(settings, () => {
      minui.defEvents([
        'click',
        'change',
        'keypress',
        'keydown',
        'keyup',
        'focus',
        'focusin',
        'focusout',
        'blur',
        'mouseenter',
        'mouseleave'
      ]);
    });

    _ui = minui;
  })();
})();