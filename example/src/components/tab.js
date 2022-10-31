import "../styles/tab.css";
import { createImporter } from "react-state-toolkit";
import { NAVIGATION_STORE } from "../consts/stores";
import { TABS_SLICE } from "../consts/navigationSlices";
import { useNavigationSelector } from "../stores/navigation";

const { importNavigationAction, importNavigationSelector } = createImporter({ storeName: NAVIGATION_STORE });
const { setActiveTabAction } = importNavigationAction(TABS_SLICE, "setActiveTabAction");
const { activeTabSelector } = importNavigationSelector(TABS_SLICE, "activeTabSelector");

export const Tab = ({ tab }) => {
  const activeTab = useNavigationSelector(activeTabSelector);
  let className = "tab-container";
  if (tab === activeTab)
    className += " active-tab-container";
  return (
    <div
      className={className}
      onClick={() => setActiveTabAction(tab)}
    >
      {tab}
    </div>
  );
};