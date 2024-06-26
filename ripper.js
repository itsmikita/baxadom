(function() {
    // Function to highlight the hovered element
    function highlightElement(event) {
        event.target.style.outline = '2px solid red';
    }

    // Function to remove the highlight from the element
    function unhighlightElement(event) {
        event.target.style.outline = '';
    }

    // Function to capture click event on the highlighted element
    function captureClick(event) {
        // Prevent further propagation to avoid multiple captures
        event.stopPropagation();
        event.preventDefault();

        // Remove the event listeners to avoid conflicts
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('mouseout', unhighlightElement);
        document.removeEventListener('click', captureClick);

        // Process the clicked element
        processElement(event.target);
    }

    // Function to process the clicked element and its children
    function processElement(element) {
        const styles = extractStylesFromStylesheets(element);
        const customProperties = extractCustomProperties(element);
        const groupedStyles = groupStyles(styles, customProperties);
        const sortedCSS = sortCSS(groupedStyles);
        const html = element.outerHTML;

        // Output the result in the console
        console.log('<style>\n' + sortedCSS + '\n</style>\n' + html);
    }

    // Function to extract styles of an element and its children from stylesheets
    function extractStylesFromStylesheets(element) {
        const styles = {};
        const elements = [element].concat(Array.from(element.querySelectorAll('*')));
        const styleSheets = Array.from(document.styleSheets);

        styleSheets.forEach(sheet => {
            try {
                const rules = Array.from(sheet.cssRules || []);
                rules.forEach(rule => {
                    if (rule instanceof CSSStyleRule) {
                        elements.forEach(el => {
                            if (el.matches(rule.selectorText)) {
                                const tagName = el.tagName.toLowerCase();
                                const className = (typeof el.className === 'string') ? `.${el.className.split(' ').join('.')}` : '';
                                const selector = `${tagName}${className}`;

                                if (!styles[selector]) {
                                    styles[selector] = {};
                                }

                                for (let i = 0; i < rule.style.length; i++) {
                                    const styleName = rule.style[i];
                                    styles[selector][styleName] = rule.style.getPropertyValue(styleName);
                                }
                            }
                        });
                    }
                });
            } catch (e) {
                console.warn("Could not access stylesheet: ", sheet.href, e);
            }
        });

        return styles;
    }

    // Function to extract custom properties (CSS variables) from the elements
    function extractCustomProperties(element) {
        const customProperties = {};
        const elements = [element].concat(Array.from(element.querySelectorAll('*')));

        elements.forEach(el => {
            const computedStyles = window.getComputedStyle(el);
            for (let i = 0; i < computedStyles.length; i++) {
                const styleName = computedStyles[i];
                if (styleName.startsWith('--')) {
                    customProperties[styleName] = computedStyles.getPropertyValue(styleName);
                }
            }
        });

        return customProperties;
    }

    // Function to group styles and custom properties
    function groupStyles(styles, customProperties) {
        const rootProperties = customProperties;
        const groupedStyles = {};

        for (const selector in styles) {
            for (const styleName in styles[selector]) {
                if (!styleName.startsWith('--')) {
                    if (!groupedStyles[selector]) {
                        groupedStyles[selector] = {};
                    }
                    groupedStyles[selector][styleName] = styles[selector][styleName];
                }
            }
        }

        return { root: rootProperties, others: groupedStyles };
    }

    // Function to sort CSS by tag name and class name
    function sortCSS(styles) {
        let cssString = ':root {\n';
        for (const prop in styles.root) {
            cssString += `  ${prop}: ${styles.root[prop]};\n`;
        }
        cssString += '}\n\n';

        const sortedSelectors = Object.keys(styles.others).sort();

        sortedSelectors.forEach(selector => {
            cssString += `${selector} {\n`;
            for (const prop in styles.others[selector]) {
                cssString += `  ${prop}: ${styles.others[selector][prop]};\n`;
            }
            cssString += '}\n\n';
        });

        return cssString;
    }

    // Add event listeners to start the highlighting and capturing process
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('mouseout', unhighlightElement);
    document.addEventListener('click', captureClick);
})();
