import {minui} from './core/core.js';

let settings = {
  preferAnonymous: false,
};

minui.setup(settings, () => {
  minui.defEvent('click');
  minui.defEvent('focusout');
});

export {minui as _ui};