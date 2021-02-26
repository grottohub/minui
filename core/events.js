export let eventStack;

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