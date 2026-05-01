const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * @param {string} content - The raw HTML string.
 * @returns {string} - The sanitized HTML string.
 */
const sanitize = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content);
};

module.exports = { sanitize };
