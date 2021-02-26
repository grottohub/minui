export let eventStack;

(function() {
  const EventStack = (function () {
    let events = {};

    const initEventHolder = function initEventHolder(holder) {
      events[holder] = {};
    };

    const initEventType = function initEventType(holder, type) {
      events[holder][type] = [];
    }

    const addToFnStack = function addToFnStack(holder, type, fn) {
      if (events[holder] === undefined) {
        initEventHolder(holder);
      }

      if (events[holder][type] === undefined) {
        initEventType(holder, type);
      }

      events[holder][type].push(fn);
    }

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

    const findEvents = function findEvent(query) {
      if (query.query) {
        return events[query.query];
      }

      else {
        return filterEvents(query.fn, query.type);
      }
    };

    return {
      all() {
        return events;
      },

      add(title, type, fnName) {
        addToFnStack(title, type, fnName);
      },

      find(query) {
        return findEvents(query);
      },

      exists(query) {
        let foundEvents = findEvents(query),
            eventExists;
        
        Object.keys(foundEvents).forEach((holder) => {
          eventExists = Object.keys(holder)[0] === query.existsOn ? true : false;
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