// intake-registration-relations.js
import "./relatives-section.js";

class IntakeRegistrationRelations extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._caseData = null;
    this._stepId = "relations";
    this._observer = null;
  }

  connectedCallback() {
    this.render();
    this._observeRelativesSection();
    this.addEventListener("relativesUpdated", this.handleUpdate.bind(this));
  }

  set caseData(data) {
    this._caseData = data;
    // Assign to relatives-section only after DOM is rendered
    if (this.shadowRoot.querySelector("relatives-section")) {
      this._assignCaseDataToRelativesSection();
    }
  }

  get caseData() {
    return this._caseData;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; }
        .form-container { background: #fff; padding: 2rem; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); max-width: 800px; border: 1px solid #e5e7eb; }
        .header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
        h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem 0; }
      </style>

      <div class="form-container">
        <div class="header">
          <h2>Relations Information</h2>
          <p class="subtitle">Add family members or other relations</p>
        </div>
        <relatives-section></relatives-section>
      </div>
    `;

    // Assign caseData if it was set before render
    this._assignCaseDataToRelativesSection();
  }

  _observeRelativesSection() {
    if (this._observer) return; // already observing
    this._observer = new MutationObserver(() => {
      this._assignCaseDataToRelativesSection();
    });
    this._observer.observe(this.shadowRoot, { childList: true, subtree: true });
  }

  _assignCaseDataToRelativesSection() {
    const relativesSection = this.shadowRoot.querySelector("relatives-section");
    if (!relativesSection || !this._caseData) return;

    // Normalize relatives into an array
    const relatives = [];

    // Include any existing "relatives" array
    if (Array.isArray(this._caseData.relatives)) {
      relatives.push(...this._caseData.relatives);
    }

    // Include any "relative_0", "relative_1", ... or "relatives_0", "relatives_1" keys
    Object.keys(this._caseData).forEach((key) => {
      if (key.startsWith("relative_") || key.startsWith("relatives_")) {
        const value = this._caseData[key];
        if (value) relatives.push(value);
      }
    });

    // Assign normalized array to the section
    relativesSection.caseData = { relatives };

    console.log(
      "Assigned relatives to relatives-section:",
      relativesSection.caseData
    );
  }

  handleUpdate(event) {
    const updatedRelatives = event.detail;
    const flattened = {};
    updatedRelatives.forEach((rel, i) => {
      flattened[`relative_${i}`] = rel;
    });

    this.dispatchEvent(
      new CustomEvent("caseDataUpdated", {
        detail: {
          stepId: this._stepId,
          data: flattened,
        },
      })
    );
  }
}

customElements.define(
  "intake-registration-relations",
  IntakeRegistrationRelations
);

export default IntakeRegistrationRelations;
