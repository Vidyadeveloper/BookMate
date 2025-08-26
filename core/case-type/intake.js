const BlazeCase = require("@blaze-case-ai/blaze-engine/core/case-type/blaze-case");

class IntakeCase extends BlazeCase {
  constructor() {
    super(
      "intake", // Unique identifier for the Intake case type
      "Intake Process", // Human-readable label for the Intake case type
      [
        {
          id: "registration",
          label: "Registration",
          steps: [
            {
              id: "personal",
              label: "Personal",
              status: "in_progress",
              view: "intake-registration-personal",
            },
            {
              id: "relations",
              label: "Relations",
              status: "pending_validation",
              view: "intake-registration-relations",
            },
          ],
        },
        {
          id: "review",
          label: "Review",
          steps: [
            {
              id: "review_details",
              label: "Review Details",
              status: "under_review",
              view: "intake-review-details",
            },
            {
              id: "finalize_review",
              label: "Finalize Review",
              status: "review_completed",
              view: "intake-finalize-review",
            },
          ],
        },
        {
          id: "completion",
          label: "Completion",
          steps: [
            {
              id: "close_case",
              label: "Close Case",
              status: "completed",
              view: "intake-close-case",
            },
          ],
        },
      ]
    );
  }

  // Optionally, override or extend any methods specific to IntakeCase
}

module.exports = new IntakeCase();
