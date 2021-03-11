export let blueprints;

(function () {
  const Blueprints = (function () {
    let allBlueprints = {};

    const createElement = function createElementFromBlueprint(blueprint, content) {
      let element = document.createElement(blueprint.tag);
      allBlueprints[blueprint.props.blueprint] = blueprint;
      
      Object.keys(blueprint.props).forEach(prop => {
        element[prop] = blueprint.props[prop];
      });

      if (blueprint.attr) {
        Object.keys(blueprint.attr).forEach(attribute => {
          element.setAttribute(attribute, blueprint.attr[attribute]);
        });
      }

      // console.log(blueprint.content);
      // console.log(content);
      if (blueprint.content) {
        content.forEach((data, idx) => {
          let blueprintName = blueprint.props.blueprint;
          
          if (typeof data === "string") {
            element[blueprint.content[idx]] = data;
          } 
          
          else if (data[blueprintName]) {
            data[blueprintName].forEach((childData, idx) => {
              element[blueprint.content[idx]] = childData;
            });
          }
        });
      }

      element.classList.add(...blueprint.classes);

      if (blueprint.children) {
        let children = blueprint.children.map(child => createElement(child, content));

        children.forEach(child => element.appendChild(child));
      }

      return element;
    };

    const createFragment = function createFragmentForBlueprint(blueprint, content) {
      let element = createElement(blueprint, content),
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
      make(blueprint, content) {
        return createFragment(blueprint, content);
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