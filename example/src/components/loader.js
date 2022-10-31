import "../styles/loader.css"
import { createImporter } from "react-state-toolkit";
import { APP_SLICE } from "../consts/defaultSlices";
import { useSelector } from '../stores/default';

const { importSelector } = createImporter({});
const { loadingSelector } = importSelector(APP_SLICE, "loadingSelector");

export const Loader = () => {
  const loading = useSelector(loadingSelector);
  return loading ? <div className="loader-container">
    <div className="loader-spinner" />
    Loading - Please Wait
  </div> : null;
}