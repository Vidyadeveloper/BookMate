import "./personal-details.js";

class IntakeRegistrationPersonal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    fetch(
      "/node_modules/@blaze-case-ai/blaze-engine/client/style/floating-label.css"
    )
      .then((response) => response.text())
      .then((css) => {
        this.shadowRoot.innerHTML = `
          <style>${css}</style>
          <personal-details context="client"></personal-details>
        `;
        this._assignCaseDataToPersonalDetails();
        this._observePersonalDetails();
        this.shadowRoot.addEventListener(
          "formSubmitted",
          this.handleSubmit.bind(this)
        );
      });

    this._caseData = null;
  }

  set caseData(data) {
    this._caseData = data;
    this._assignCaseDataToPersonalDetails();
  }

  get caseData() {
    return this._caseData;
  }

  _observePersonalDetails() {
    const observer = new MutationObserver(() => {
      this._assignCaseDataToPersonalDetails();
    });
    observer.observe(this.shadowRoot, { childList: true, subtree: true });
  }

  _assignCaseDataToPersonalDetails() {
    const personalDetailsComponent =
      this.shadowRoot.querySelector("personal-details");
    if (personalDetailsComponent && this._caseData) {
      personalDetailsComponent.caseData = this._caseData;
    }
  }

  handleSubmit(event) {
    const formData = event.detail; // { client: { ... } }
    this.dispatchEvent(new CustomEvent("formSubmitted", { detail: formData }));
  }
}

customElements.define(
  "intake-registration-personal",
  IntakeRegistrationPersonal
);
export default IntakeRegistrationPersonal;
