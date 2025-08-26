class IntakeCloseCase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._caseData = null;
    this.render();
  }

  set caseData(data) {
    this._caseData = data;
    this.render();
  }

  get caseData() {
    return this._caseData;
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
      .completion-section { padding: 2rem; text-align: center; }
      .close-btn {
        background: #d82619ff;
        color: #fff;
        border: none;
        padding: 1rem 2rem;
        border-radius: 6px;
        font-size: 1.1rem;
        cursor: pointer;
      }
    </style>
    <div class="completion-section">
      <h2>Case Completion</h2>
      <p>All steps are finished. Click below to close the case.</p>
      <button class="close-btn">Close Case</button>
    </div>
  `;

    this.shadowRoot.querySelector(".close-btn").onclick = () => {
      this.dispatchEvent(
        new CustomEvent("formSubmitted", {
          detail: { closed: true },
        })
      );

      // Redirect to home
      window.location.href = "/";
    };
  }
}

customElements.define("intake-close-case", IntakeCloseCase);
export default IntakeCloseCase;
