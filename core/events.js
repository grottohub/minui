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

    const addToFnStack = function addToFnStack(holder, type, fnName) {
      if (events[holder] === undefined) {
        initEventHolder(holder);
      }

      if (events[holder][type] === undefined) {
        initEventType(holder, type);
      }

      events[holder][type].push(fnName);
    }

    const filterEvents = function filterEvents(query, type) {
      let filteredEvents = [],
          eventHolders = Object.keys(events);

      eventHolders.forEach((holder) => {
        let eventTypes = Object.keys(events[holder]),
            eventFns = Object.values(events[holder]),
            foundEvent = {};

        foundEvent[holder] = events[holder];
        
        if (type === 'event') {
          if (eventTypes.includes(query)) {
            filteredEvents.push(foundEvent);
          }
        }

        else if (type === 'fn') {
          if (eventFns[0].includes(query)) {
            filteredEvents.push(foundEvent);
          }
        }
      });

      return filteredEvents;
    };

    const findEvents = function findEvent(query) {
      if (query.elementData) {
        return events[query.elementData];
      }

      else {
        return filterEvents(query.val, query.type);
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
        
        foundEvents.forEach((holder) => {
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