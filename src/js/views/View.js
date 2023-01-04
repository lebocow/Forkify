import icons from 'url:../../img/icons.svg';

/**
 * A class responsible for rendering data into the DOM.
 */
export default class View {
  /**
   * The data that the view is currently rendering.
   * @private
   */
  _data;

  /**
   * Renders the provided data into the DOM.
   *
   * @param {Object|Array} data - The data to render.
   * @param {boolean} [render=true] - If true, the data will be rendered into the DOM immediately. If false, the method will return the generated markup as a string but will not render it into the DOM.
   * @return {string} - The generated markup if `render` is false.
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;

    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
  }

  /**
   * Updates the current view with new data.
   *
   * @param {Object|Array} data - The updated data to render.
   */
  update(data) {
    // Store data and generate new markup
    this._data = data;
    const newMarkup = this._generateMarkup();
    // Create new DOM element from markup
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // Select all child elements of new and current DOM elements
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // Update text and attributes of current elements if necessary
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      if (!newEl.isEqualNode(curEl)) {
        // Update text content if necessary
        if (newEl.firstChild?.nodeValue.trim() !== '') {
          curEl.textContent = newEl.textContent;
        }

        // Update attributes if necessary
        Array.from(newEl.attributes).forEach(attr => {
          curEl.setAttribute(attr.name, attr.value);
        });
      }
    });
  }

  /**
   * Clears the content of the current view.
   * @private
   */
  _clear() {
    this._parentElement.innerHTML = ``;
  }

  /**
   * Renders a spinner into the DOM.
   */
  renderSpinner() {
    const markup = `    
      <div class="spinner">
          <svg>
              <use href="${icons}#icon-loader"></use>
          </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
  }

  /**
   * Renders an error message into the DOM.
   *
   * @param {string} [message] - The error message to display. If not provided, a default error message will be used.
   */
  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div> 
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
  }

  /**
   * Renders a message into the DOM.
   *
   * @param {string} [message] - The message to display. If not provided, a default message will be used.
   */
  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div> 
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
  }
}
