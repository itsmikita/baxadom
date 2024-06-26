(function() {
  let previousElement = null;

  document.body.addEventListener('mouseover', function(event) {
      const element = event.target;
      if (previousElement) {
          previousElement.style.outline = null;
      }
      element.style.outline = '2px solid red';
      previousElement = element;
  });

  document.body.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      if (previousElement) {
          const htmlContent = getElementHtml(previousElement);
          const cssContent = getElementStyles(previousElement);

          console.log('Element\'s HTML:\n', htmlContent);
          console.log('Element\'s CSS:\n', cssContent);

          previousElement.style.outline = null;
          previousElement = null;
      }
  });

  function getElementHtml(element) {
      return element.outerHTML;
  }

  function getElementStyles(element) {
      const computedStyles = window.getComputedStyle(element);
      const defaultStyles = getDefaultStyles(element.tagName);

      let selector = element.tagName.toLowerCase();
      const className = (typeof element.className === 'string' ? element.className : element.className.baseVal || '');
      if (className) {
          selector += '.' + className.trim().split(/\s+/).join('.');
      }

      let css = `${selector} {`;

      for (let i = 0; i < computedStyles.length; i++) {
          const property = computedStyles[i];
          const value = computedStyles.getPropertyValue(property);
          if (value !== defaultStyles[property]) {
              css += `\n  ${property}: ${value};`;
          }
      }

      css += '\n}\n';

      Array.from(element.children).forEach(child => {
          css += getElementStyles(child);
      });

      return css;
  }

  function getDefaultStyles(tagName) {
      const defaultElement = document.createElement(tagName);
      document.body.appendChild(defaultElement);
      const defaultStyles = window.getComputedStyle(defaultElement);
      const styles = {};
      for (let i = 0; i < defaultStyles.length; i++) {
          const property = defaultStyles[i];
          const value = defaultStyles.getPropertyValue(property);
          styles[property] = value;
      }
      document.body.removeChild(defaultElement);
      return styles;
  }
})();
