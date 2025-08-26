class FinalizeReview extends HTMLElement {
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
    const client = this._caseData?.client || {};
    const relations = Object.entries(this._caseData || {})
      .filter(
        ([key]) => key.startsWith("relative_") || key.startsWith("relatives_")
      )
      .map(([_, value]) => value)
      .filter((rel) => Object.values(rel).some((v) => v)); // only non-empty

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
          text-align: center;
        }

        h2 {
          font-size: 1.4rem;
          margin-bottom: 1rem;
          color: #1a237e;
        }

        .summary-block {
          background: #ffffff;
          padding: 0.8rem 1rem;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          text-align: left;
          margin: 0 auto 1rem auto;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0d47a1;
          margin-bottom: 0.5rem;
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
          font-size: 0.9rem;
          color: #1a237e;
          margin-bottom: 0.4rem;
        }

        .no-relations {
          font-style: italic;
          font-size: 0.85rem;
          color: #888;
        }

        .finalize-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.7rem 1.5rem;
          font-size: 0.95rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 0.75rem;
          transition: background 0.2s ease;
        }

        .finalize-btn:hover {
          background: #0056b3;
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
        <h2>Ready to finalize the review?</h2>
        <div class="summary-block">
          <div class="section-title">Client</div>
          <div class="review-field">Name: ${client.firstName || ""} ${
      client.lastName || ""
    }</div>
          <div class="review-field">BSN: ${client.bsn || ""}</div>
          <div class="review-field">DOB: ${client.dateOfBirth || ""}</div>
          <div class="review-field">Phone: ${client.countryCode || ""} ${
      client.phoneNumber || ""
    }</div>

          <div class="section-title" style="margin-top: 0.75rem;">Relations</div>
          ${
            relations.length === 0
              ? `<div class="no-relations">No relations added.</div>`
              : relations
                  .map(
                    (rel, i) => `
                <div class="relation-block">
                  <div class="relation-header">Relation #${i + 1}</div>
                  <div class="review-field">Name: ${rel.firstName || ""} ${
                      rel.lastName || ""
                    }</div>
                  <div class="review-field">BSN: ${rel.bsn || ""}</div>
                  <div class="review-field">DOB: ${rel.dateOfBirth || ""}</div>
                  <div class="review-field">Phone: ${rel.countryCode || ""} ${
                      rel.phoneNumber || ""
                    }</div>
                </div>
              `
                  )
                  .join("")
          }
        </div>
        <p style="font-size: 0.85rem; margin: 0.75rem 0;">All details have been reviewed.</p>
        <button class="finalize-btn">Finalize Review</button>
      </div>
    `;

    this.shadowRoot.querySelector(".finalize-btn").onclick = () => {
      this.dispatchEvent(
        new CustomEvent("formSubmitted", {
          detail: { finalized: true },
        })
      );
    };
  }
}

customElements.define("intake-finalize-review", FinalizeReview);
export default FinalizeReview;
