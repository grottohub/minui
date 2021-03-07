export let blueprints;

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