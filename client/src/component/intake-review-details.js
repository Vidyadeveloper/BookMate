class ReviewDetails extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._caseData = null;
    this.render();
  }

  set caseData(data) {
    this._caseData = data;
    console.log("setthis._caseData", this._caseData);
    this.render();
  }

  get caseData() {
    console.log("get._caseData", this._caseData);

    return this._caseData;
  }

  render() {
    const personal = this._caseData?.client || {};
    console.log("get._caseData", personal);
    const relations = Object.entries(this._caseData || {})
      .filter(
        ([key]) => key.startsWith("relative_") || key.startsWith("relatives_")
      )
      .map(([_, value]) => value);

    console.log(relations + " relations");
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background: #f9fbfd;
          color: #333;
          border-radius: 8px;
          width: 100%;
          max-width: 750px;
          height: 520px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .content {
          height: 100%;
          overflow-y: auto;
          padding: 1rem;
          box-sizing: border-box;
        }

        .review-section {
          background: #fff;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #0d47a1;
        }

        .review-field {
          font-size: 0.85rem;
          margin-bottom: 0.35rem;
        }

        .relation-block {
          background: #e9f2ff;
          border-left: 3px solid #1976d2;
          border-radius: 5px;
          padding: 0.6rem 0.75rem;
          margin-bottom: 0.6rem;
        }

        .relation-header {
          font-weight: 600;
          color: #1a237e;
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        .no-relations {
          font-style: italic;
          font-size: 0.85rem;
          color: #888;
        }

        .content::-webkit-scrollbar {
          width: 6px;
        }

        .content::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
      </style>

      <div class="content">
        <div class="review-section">
          <div class="section-title">Personal Details is</div>
          <div class="review-field">here First Name: ${
            personal.firstName || ""
          }</div>
          <div class="review-field">Last Name: ${personal.lastName || ""}</div>
          <div class="review-field">BSN: ${personal.bsn || ""}</div>
          <div class="review-field">Date of Birth: ${
            personal.dateOfBirth || ""
          }</div>
          <div class="review-field">Country Code: ${
            personal.countryCode || ""
          }</div>
          <div class="review-field">Phone Number: ${
            personal.phoneNumber || ""
          }</div>
        </div>

        <div class="review-section">
          <div class="section-title">Relations show</div>
          ${
            relations.length === 0
              ? `<div class="no-relations">No relations added.</div>`
              : relations
                  .map(
                    (rel, i) => `
                <div class="relation-block">
                  <div class="relation-header">Relation #${i + 1}</div>
                  <div class="review-field">First Name: ${
                    rel.firstName || ""
                  }</div>
                  <div class="review-field">Last Name: ${
                    rel.lastName || ""
                  }</div>
                  <div class="review-field">BSN: ${rel.bsn || ""}</div>
                  <div class="review-field">Date of Birth: ${
                    rel.dateOfBirth || ""
                  }</div>
                  <div class="review-field">Country Code: ${
                    rel.countryCode || ""
                  }</div>
                  <div class="review-field">Phone Number: ${
                    rel.phoneNumber || ""
                  }</div>
                </div>
              `
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  }
}

customElements.define("intake-review-details", ReviewDetails);
export default ReviewDetails;
