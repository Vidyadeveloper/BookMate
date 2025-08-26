import "../../../node_modules/@blaze-case-ai/blaze-engine/client/src/component/ux/blaze-field-group.js";
class RelativesSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._caseData = { relatives: [] };
    this._personModel = null;

    this._relativeTypes = [
      { value: "Parent", label: "Parent" },
      { value: "Sibling", label: "Sibling" },
      { value: "Spouse", label: "Spouse/Partner" },
      { value: "Child", label: "Child" },
      { value: "Other", label: "Other Relative" },
    ];

    this._fieldsToRender = ["firstName", "lastName", "phoneNumber"];
  }

  async connectedCallback() {
    const personModule = await import(
      "/node_modules/@blaze-case-ai/blaze-engine/core/data-model/person.js"
    );
    this._personModel = personModule.personModel;

    const attrString = this.getAttribute("attributes");
    const allAttrs = this._personModel?.attributes || [];

    try {
      this._fieldsToRender = attrString
        ? JSON.parse(attrString)
        : allAttrs
            .filter((attr) => attr.type !== "computed")
            .map((attr) => attr.id);
    } catch (e) {
      console.warn("Invalid attributes JSON:", attrString);
      this._fieldsToRender = allAttrs
        .filter((attr) => attr.type !== "computed")
        .map((attr) => attr.id);
    }

    this.render();
  }

  set caseData(data) {
    this._caseData = data || { relatives: [] };
    console.log("set caseData:", data);

    if (this._personModel) {
      this.render();
    }
  }

  // set caseData(data) {
  //   if (!data) return;

  //   this._caseData = { ...data };
  //   this._caseData.relatives = [];

  //   Object.keys(data).forEach((key) => {
  //     if (key.startsWith("relatives_")) {
  //       this._caseData.relatives.push({
  //         ...data[key],
  //         type: data[key].type || "Other",
  //       });
  //     }
  //   });

  //   console.log("Normalized relatives for UI:", this._caseData.relatives);

  //   if (this._personModel) this.render();
  // }

  get caseData() {
    console.log("Getting caseData:", this._caseData);
    return this._caseData;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="relatives-container">
        <div class="section-header">
          <h3>Family Members & Relations</h3>
        </div>
        <div id="relativesList">
          ${
            !this._caseData?.relatives?.length
              ? `<div class="empty-state">No relatives added yet</div>`
              : ""
          }
        </div>
        <blaze-button id="addRelative" label="Add Relative" class="add-relative">Add Relative></blaze-button>
      </div>
    `;

    this.renderRelativesList();
    this.setupEventListeners();
  }

  renderRelativesList() {
    const relativesList = this.shadowRoot.getElementById("relativesList");

    console.log("Full _caseData at render start:", this._caseData);

    // Ensure relatives array exists
    if (!this._caseData?.relatives?.length) {
      console.warn("No relatives to render!", this._caseData.relatives);
      return;
    }
    console.table(this._caseData?.relatives);

    console.warn("length ", this._caseData?.relatives?.length);

    relativesList.innerHTML = "";

    this._caseData.relatives.forEach((relative, index) => {
      console.log(`Rendering relative[${index}]:`, relative);

      const relativeItem = document.createElement("div");
      relativeItem.className = "relative-item";
      relativeItem.dataset.index = index;

      // Type selector
      const select = document.createElement("select");
      select.className = "relative-type";
      select.dataset.index = index;

      this._relativeTypes.forEach((type) => {
        const option = document.createElement("option");
        console.log(type);
        option.value = type.value;
        option.textContent = type.label;
        option.selected = relative.type === type.value;
        select.appendChild(option);
      });

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-relative";
      removeBtn.dataset.index = index;
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", "Remove relative");

      const header = document.createElement("div");
      header.id = "relative-header";
      header.appendChild(select);
      header.appendChild(removeBtn);
      relativeItem.appendChild(header);

      const formHTML = `
  <br>
    <blaze-field-group
      context="relatives_${index}"
      model='${JSON.stringify(this._personModel)}'
      data='${JSON.stringify({ relatives: { [index]: relative } })}'
    attributes='["firstName","lastName","phoneNumber"]'></blaze-field-group>
  `;

      relativeItem.innerHTML += formHTML;
      relativesList.appendChild(relativeItem);

      // ✅ Set fields manually after DOM insertion
      const fieldGroup = relativeItem.querySelector("blaze-field-group");
      if (fieldGroup) {
        fieldGroup.fields = this._fieldsToRender;
      }
    });
    console.log("Rendering relatives:", this._caseData.relatives);
  }

  // renderRelativesList() {
  //   const relativesList = this.shadowRoot.getElementById("relativesList");
  //   if (!relativesList) return;

  //   // Clear existing content
  //   relativesList.innerHTML = "";

  //   if (!this._caseData?.relatives?.length) {
  //     console.warn("No relatives to render!", this._caseData.relatives);
  //     return;
  //   }

  //   this._caseData.relatives.forEach((relative, index) => {
  //     // Insert the blaze-field-group HTML string
  //     relativesList.innerHTML += `
  //     <blaze-field-group
  //       context="relatives_${index}"
  //       attributes='["firstName","lastName","phoneNumber"]'>
  //     </blaze-field-group>
  //   `;

  //     // Grab the just-created element
  //     const fieldGroup = relativesList.querySelector(
  //       `blaze-field-group[context="relatives_${index}"]`
  //     );

  //     // Assign actual JS objects for model and data
  //     if (fieldGroup) {
  //       fieldGroup.model = this._personModel;
  //       fieldGroup.data = { relatives: { [index]: relative } };
  //     }
  //   });
  // }

  captureFormData() {
    const formData = {};

    // Capture data from each blaze-field-group
    const fieldGroups = this.shadowRoot.querySelectorAll("blaze-field-group");

    fieldGroups.forEach((group) => {
      if (typeof group.getFormData === "function") {
        const groupData = group.getFormData();
        Object.assign(formData, groupData);
      }
    });

    // Capture relative types from select elements
    const typeSelects = this.shadowRoot.querySelectorAll(".relative-type");
    typeSelects.forEach((select, index) => {
      // Convert the flat data structure to dot notation
      formData[`relatives.${index}.type`] = select.value;
    });

    return formData;
  }

  setupEventListeners() {
    this.shadowRoot
      .getElementById("addRelative")
      ?.addEventListener("click", () => {
        this._caseData.relatives = this._caseData.relatives || [];
        this._caseData.relatives.push({
          type: "Other",
          firstName: "",
          lastName: "",
          phoneNumber: "",
        });
        this.render();
      });

    this.shadowRoot.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-relative")) {
        const index = parseInt(e.target.dataset.index, 10);
        this._caseData.relatives.splice(index, 1);
        this.render();
      }
    });
  }
}

customElements.define("relatives-section", RelativesSection);
export default RelativesSection;

// import "../../../node_modules/@blaze-case-ai/blaze-engine/client/src/component/ux/blaze-field-group.js";
// class RelativesSection extends HTMLElement {
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" });
//     this._caseData = { relatives: [] };
//     this._personModel = null;

//     this._relativeTypes = [
//       { value: "Parent", label: "Parent" },
//       { value: "Sibling", label: "Sibling" },
//       { value: "Spouse", label: "Spouse/Partner" },
//       { value: "Child", label: "Child" },
//       { value: "Other", label: "Other Relative" },
//     ];

//     this._fieldsToRender = ["firstName", "lastName", "phoneNumber"];
//   }

//   async connectedCallback() {
//     const personModule = await import(
//       "/node_modules/@blaze-case-ai/blaze-engine/core/data-model/person.js"
//     );
//     this._personModel = personModule.personModel;

//     const attrString = this.getAttribute("attributes");
//     const allAttrs = this._personModel?.attributes || [];

//     try {
//       this._fieldsToRender = attrString
//         ? JSON.parse(attrString)
//         : allAttrs
//             .filter((attr) => attr.type !== "computed")
//             .map((attr) => attr.id);
//     } catch (e) {
//       console.warn("Invalid attributes JSON:", attrString);
//       this._fieldsToRender = allAttrs
//         .filter((attr) => attr.type !== "computed")
//         .map((attr) => attr.id);
//     }

//     this.render();
//   }

//   set caseData(data) {
//     this._caseData = data || { relatives: [] };
//     if (this._personModel) {
//       this.render();
//     }
//   }

//   get caseData() {
//     return this._caseData;
//   }

//   render() {
//     this.shadowRoot.innerHTML = `
//       <div class="relatives-container">
//         <div class="section-header">
//           <h3>Family Members & Relations</h3>
//         </div>
//         <div id="relativesList">
//           ${
//             !this._caseData?.relatives?.length
//               ? `<div class="empty-state">No relatives added yet</div>`
//               : ""
//           }
//         </div>
//         <blaze-button id="addRelative" label="Add Relative" class="add-relative">Add Relative></blaze-button>
//       </div>
//     `;

//     this.renderRelativesList();
//     this.setupEventListeners();
//   }

//   renderRelativesList() {
//     const relativesList = this.shadowRoot.getElementById("relativesList");
//     if (!this._caseData?.relatives?.length) return;

//     relativesList.innerHTML = "";

//     this._caseData.relatives.forEach((relative, index) => {
//       const relativeItem = document.createElement("div");
//       relativeItem.className = "relative-item";
//       relativeItem.dataset.index = index;

//       // Type selector
//       const select = document.createElement("select");
//       select.className = "relative-type";
//       select.dataset.index = index;

//       this._relativeTypes.forEach((type) => {
//         const option = document.createElement("option");
//         option.value = type.value;
//         option.textContent = type.label;
//         option.selected = relative.type === type.value;
//         select.appendChild(option);
//       });

//       // Remove button
//       const removeBtn = document.createElement("button");
//       removeBtn.className = "remove-relative";
//       removeBtn.dataset.index = index;
//       removeBtn.textContent = "×";
//       removeBtn.setAttribute("aria-label", "Remove relative");

//       const header = document.createElement("div");
//       header.id = "relative-header";
//       header.appendChild(select);
//       header.appendChild(removeBtn);
//       relativeItem.appendChild(header);

//       const formHTML = `
//   <br>
//     <blaze-field-group
//       context="relatives_${index}"
//       model='${JSON.stringify(this._personModel)}'
//       data='${JSON.stringify({ relatives: { [index]: relative } })}'
//     attributes='["firstName","lastName","phoneNumber"]'></blaze-field-group>
//   `;

//       relativeItem.innerHTML += formHTML;
//       relativesList.appendChild(relativeItem);

//       // ✅ Set fields manually after DOM insertion
//       const fieldGroup = relativeItem.querySelector("blaze-field-group");
//       if (fieldGroup) {
//         fieldGroup.fields = this._fieldsToRender;
//       }
//     });
//   }

//   setupEventListeners() {
//     this.shadowRoot
//       .getElementById("addRelative")
//       ?.addEventListener("click", () => {
//         this._caseData.relatives = this._caseData.relatives || [];
//         this._caseData.relatives.push({
//           type: "Other",
//           firstName: "",
//           lastName: "",
//           phoneNumber: "",
//         });
//         this.render();
//       });

//     this.shadowRoot.addEventListener("click", (e) => {
//       if (e.target.classList.contains("remove-relative")) {
//         const index = parseInt(e.target.dataset.index, 10);
//         this._caseData.relatives.splice(index, 1);
//         this.render();
//       }
//     });
//   }
// }

// customElements.define("relatives-section", RelativesSection);
// export default RelativesSection;
