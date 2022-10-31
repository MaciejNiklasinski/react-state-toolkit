import "../../styles/modals/base.css";
import { memo } from "react";
import { createImporter } from "react-state-toolkit";
import { APP_SLICE } from "../../consts/defaultSlices";
import { useSelector } from "../../stores/default";

const { importAction, importSelector } = createImporter();
const { setErrorAction } = importAction(APP_SLICE, "setErrorAction");
const { errorSelector } = importSelector(APP_SLICE, "errorSelector");

export const ErrorModal = memo(() => {
  const error = useSelector(errorSelector);
  return error ? (
    <div className="modal-container">
      <div className="modal-header">
        Error:
      </div>
      <div className="modal-content">
        <div className="modal-message">
          {error.message}
        </div>
        <div className="modal-buttons-container">
          <button
            className="modal-button"
            onClick={() => setErrorAction(null)}
          >Ok</button>
        </div>
      </div>
    </div>
  ) : null;
});