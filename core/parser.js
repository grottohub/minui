export let parser;

(function () {
  const QueryParser = (function() {
    const regex = {
      inside: /(?<=[a-zA-Z])\s(?=[a-zA-Z])/g,
    };

    let requirements = {
      classList: [],
      tags: {},
    };

    const flatStr = function flattenString(str) {
      let descendant = regex.inside.test(str);

      if (descendant) {
        return str.replace(/\s/g, '_');
      }

      return str.replace(/\s/g, '');
    };

    const getClasses = function getClasses(str) {
      str.split('.').forEach((klass, idx) => {
        if (idx === 0 && klass !== '') {
          requirements.tags[klass] = true;
          return;
        }
        requirements.classList.push(klass);
      });
    };

    const getTags = function getTags(str) {
      let elements;

      if (str.includes('_')) {
        elements = str.split('_');
        requirements.tags[elements[1]] = {inside: elements[0]};
      } else if (str.includes(',')) {
        str.split(',').forEach((element) => {
          requirements.tags[element] = true;
        });
      } else if (str.includes('>')) {
        elements = str.split('>');
        requirements.tags[elements[1]] = {parent: elements[0]};
      } else if (str.includes('+')) {
        elements = str.split('+');
        requirements.tags[elements[1]] = {prevSibling: elements[0]};
      } else if (str.includes('~')) {
        elements = str.split('~');
        requirements.tags[elements[1]] = {prevSibling: elements[0]};
      } else {
        requirements.tags[str] = true;
      }
    };

    return {
      convert(str) {
        str = flatStr(str);
        if (str.includes('.')) {
          getClasses(str);
        } else {
          getTags(str);
        }
        
        return requirements;
      },

      clear() {
        requirements = {
          classList: [],
          tags: {}
        }
      },

      init() {
        return this;
      }
    }
  })();

  parser = Object.create(QueryParser).init();
})();