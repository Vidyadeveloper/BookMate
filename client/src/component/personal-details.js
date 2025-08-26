// import "./blaze-field-group.js";
import "../../../node_modules/@blaze-case-ai/blaze-engine/client/src/component/ux/blaze-field-group.js";
import { personModel } from "/node_modules/@blaze-case-ai/blaze-engine/core/data-model/person.js";
class PersonalDetails extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.context = this.getAttribute("context") || "person";
    this.autogenerate = this.getAttribute("autogenerate") !== "false";
    this._caseData = null;
    this.personModel = personModel; // Use the preloaded model

    // ADD THESE INITIALIZATIONS
    this._debounceTimer = null;
    this._cachedAutoAttrs = null;
  }

  async connectedCallback() {
    // const personModule = await import(
    //   "/node_modules/@blaze-case-ai/blaze-engine/core/data-model/person.js"
    // );
    // this.personModel = personModule.personModel;

    this.renderComponent();

    // Populate form if caseData is already set
    if (this._caseData) {
      this.populateForm();
    }

    // Native submit (Enter key, etc.) → ask parent to save (no fetch here)
    this.shadowRoot.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitForm();
    });
  }

  renderComponent() {
    this.shadowRoot.innerHTML = `
      <form id="personalForm">
        <blaze-field-group context="${this.context}"></blaze-field-group>
      </form>
    `;

    const formEl = this.shadowRoot.querySelector("blaze-field-group");
    if (!formEl) return;

    let selectedAttrs = [];

    if (this.autogenerate) {
      // Use cached filter if possible
      if (!this._cachedAutoAttrs) {
        this._cachedAutoAttrs =
          this.personModel?.attributes.filter(
            (attr) => attr.type !== "computed"
          ) || [];
      }
      selectedAttrs = this._cachedAutoAttrs;
    } else {
      const fieldsAttr = this.getAttribute("attributes");
      if (fieldsAttr) {
        try {
          const fieldsToRender = JSON.parse(fieldsAttr);
          // Create a Set for faster lookup
          const fieldsSet = new Set(fieldsToRender);
          selectedAttrs =
            this.personModel?.attributes.filter((attr) =>
              fieldsSet.has(attr.id)
            ) || [];
        } catch (e) {
          console.warn("Invalid attributes JSON:", fieldsAttr);
        }
      }
    }
    formEl.model = this.personModel;
    formEl.fields = selectedAttrs;
    formEl.data = this._caseData || {};
  }

  // renderComponent() {
  //   this.shadowRoot.innerHTML = `
  //     <form id="personalForm">
  //       <blaze-field-group context="${this.context}"></blaze-field-group>
  //     </form>
  //   `;

  //   const formEl = this.shadowRoot.querySelector("blaze-field-group");
  //   if (!formEl) return;

  //   let selectedAttrs = [];

  //   if (this.autogenerate) {
  //     selectedAttrs =
  //       this.personModel?.attributes.filter(
  //         (attr) => attr.type !== "computed"
  //       ) || [];
  //   } else {
  //     const fieldsAttr = this.getAttribute("attributes");
  //     const allAttrs = this.personModel?.attributes || [];

  //     try {
  //       const fieldsToRender = JSON.parse(fieldsAttr);
  //       selectedAttrs = allAttrs.filter((attr) =>
  //         fieldsToRender.includes(attr.id)
  //       );
  //     } catch (e) {
  //       console.warn("Invalid attributes JSON:", fieldsAttr);
  //     }
  //   }

  //   formEl.model = this.personModel;
  //   formEl.fields = selectedAttrs;
  //   formEl.data = this._caseData || {};
  // }

  // Capture form data from blaze-field-group
  captureFormData() {
    const formEl = this.shadowRoot.querySelector("blaze-field-group");
    if (!formEl || typeof formEl.getFormData !== "function") return {};

    return formEl.getFormData(); // returns { context: { ...fields } }
  }

  // Populate form with external data
  populateForm() {
    const formEl = this.shadowRoot.querySelector("blaze-field-group");
    if (formEl) {
      formEl.data = this._caseData || {};
    }
  }

  // Optional: manually set form fields
  setFormData(data) {
    const formEl = this.shadowRoot.querySelector("blaze-field-group");
    if (formEl) {
      formEl.data = { [this.context]: data };
    }
  }

  // Setter for caseData
  set caseData(value) {
    this._caseData = value;
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    this._debounceTimer = setTimeout(() => {
      this.populateForm();
      this._debounceTimer = null;
    }, 50); // 50ms delay
    console.log(this._caseData + "  this._caseData ");
    // this.populateForm();
  }

  get caseData() {
    return this._caseData;
  }
}

customElements.define("personal-details", PersonalDetails);
export { PersonalDetails };
