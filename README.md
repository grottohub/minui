# minUI
A simplified, abstracted DOM interface.

__Note__: This is still very early in development, you will most likely encounter bugs and non-optimized features.

## Main Goals

1. Make business logic easy to read and understand at a glance
2. Maintain a flexible, yet simplistic API for DOM interfacing
3. Utilize only vanilla JS with no dependencies

## What minUI is

- A simple interface for the DOM
- A way to have core front-end code look clean and slim

## What minUI isn't

- The next React, Vue, Angular, etc.
- A feature-rich front-end library that deftly balances state, components, etc.
- Even though it may _look_ like jQuery at times, it really is very different

## Download

minUI is available via npm (will be working on CDN option soon):

```
npm i @grahamr/minui
```

If you're not using a build tool, you can import it like so:

```
import _ui from './node_modules/@grahamr/minui/app/setup.js';
```

If you're using `_ui` in a script directly referenced in HTML, make sure it is a module:

```
<script type='module' src='app.js'></script>
```

## Examples

### Vanilla JS Comparison

Goal: log 'clicked' when a button with a specific ID is pressed

minUI:

```
_ui.loaded(() => {
  _ui.click({id: 'btn'}, () => console.log('clicked'));
});
```

Vanilla:

```
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn').onclick = () => console.log('clicked');
});
```

Goal: run a validation function on input fields based on class if a user clicks outside of the input area

minUI:

```
function validation(event) { ... }

_ui.loaded(() => {
  _ui.focusout(validation, {class: 'validate'});
});
```

Vanilla (using event bubbling):

```
function validation(event) { ... }

document.addEventListener('focusout', (event) => {
  let clickedElement = event.target;
  // convert to array since we need collection methods
  let classList = Array.prototype.slice.call(clickedElement.classList);

  if (classList.includes('validate')) {
    validation(event);
  }
});
```

### General Examples

Detailed API docs coming soon

__Note__: When attaching events via `query`, minUI supports the combinators listed [here](https://www.w3schools.com/cssref/css_selectors.asp) up to attributes, and excluding `#id` and `*`. Use `id` instead when attaching by id.

```
const clickBtn = function clickButton() {
  // ... lots of complicated function code
  console.log('done with complicated function!');
};

_ui.loaded(() => {

  // single element
  _ui.click(clickBtn, {id: 'testBtn'});

  // multiple elements

  // via class
  _ui.click(clickBtn, {class: 'btn'});

  // via query selector
  _ui.click(clickBtn, {query: 'button.btn'});

  // you can swap argument order, too, for anonymous functions
  // (or if it's the order you prefer)
  _ui.click({id: 'testBtn'}, () => console.log('debug!'));

  // you can even specify how the event is attached (bubbling vs. per-element)
  // for collections, bubble is true by default,
  // false will apply it to individual elements
  _ui.click(clickBtn, {class: 'btn', bubble: false});

  // minUI also implements an internal event stack,
  // so you can inspect events you've created (very WIP)
  console.log(_ui.events());
  console.log(_ui.findEvents({query: 'btn'})); // filter by query selector
  console.log(_ui.findEvents({type: 'click'})); // filter by event type
  console.log(_ui.findEvents({fn: 'clickButton'})); // filter by function name

  // retrieving DOM nodes works just like it does when using an option object for applying events
  let testBtn = _ui.get({id: 'testBtn'}); // returns single element
  let buttons = _ui.get({class: 'btn'}); // returns array
  let buttons2 = _ui.get({query: 'button.btn'}); // returns array

  // for very specific elements, use query selectors
  let btn = _ui.get({query: 'div.container>button.btn.btn-warning'});

  // retrieve relational elements
  let parent = _ui.get({parentOf: {id: 'testBtn'}}); // parent element
  let child = _ui.get({childOf: {id: 'testDiv'}}); // first child
  let children = _ui.get({childrenOf: {id: 'testDiv'}}); // all children

  // retrieving properties of an element
  let btnProps = _ui.get({id: 'testBtn', props: ['value', 'disabled']});
  console.log(btnProps);

  // retrieving properties of a group of elements
  let allBtnProps = _ui.get({class: 'btn', props: ['id', 'value', 'disabled']});
  console.log(allBtnProps);

  // if an event doesn't exist on the API, add it
  _ui.defEvent('wheel');
  // to attach to the base, use document: true
  _ui.wheel({document: true}, () => console.log('whee!'));
});
```

### Modifying setup.js

This will be streamlined in the future, but:

I've only included a couple common events to be applied at initialization, if you want to add more in setup you can. Navigate to `node_modules/@grahamr/minui/app/setup.js`

```
import {minui as _ui} from '../core/core.js';

// this will probably have actual settings soon
let settings = {};

_ui.setup(settings, () => {
  // just add the events you want to the array
  _ui.defEvents([
    'click',
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

export default _ui;
```