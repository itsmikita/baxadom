(() => {
  let previousElement = null;

  document.body.addEventListener("mouseover", (event) => {
    const element = event.target;
    if (previousElement) {
      previousElement.style.outline = null;
    }
    element.style.outline = "2px solid red";
    previousElement = element;
  });

  document.body.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (previousElement) {
      previousElement.style.outline = null;

      if("" === previousElement.getAttribute("style")) {
        previousElement.removeAttribute("style");
      }

      const html = getElementHtml(previousElement);
      const css = getElementStyles(previousElement);

      console.log(css);
      console.log(html);

      previousElement = null;
    }
  });

  const getElementHtml = (element) => {
    return element.outerHTML;
  };

  const getElementStyles = (element) => {
    const computedStyles = window.getComputedStyle(element);
    const defaultStyles = getDefaultStyles(element.tagName);

    let selector = element.tagName.toLowerCase();
    const className =
      typeof element.className === "string"
        ? element.className
        : element.className.baseVal || "";
    if (className) {
      selector += "." + className.trim().split(/\s+/).join(".");
    }

    let css = `${selector} {`;

    for (let i = 0; i < computedStyles.length; i++) {
      const property = computedStyles[i];
      const value = computedStyles.getPropertyValue(property);
      if (value !== defaultStyles[property]) {
        css += `\n  ${property}: ${value};`;
      }
    }

    css += "\n}\n";

    Array.from(element.children).forEach((child) => {
      css += getElementStyles(child);
    });

    return css;
  };

  const getDefaultStyles = (tagName) => {
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
  };
})();
