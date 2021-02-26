import {minui as _ui} from '../core/core.js';

let settings = {};

_ui.setup(settings, () => {
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