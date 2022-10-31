import { memo } from "react";
import { createImporter } from "react-state-toolkit";
import { TABS_SLICE } from "../consts/navigationSlices";
import { NAVIGATION_STORE } from "../consts/stores";
import { TABS } from "../consts/tabs";
import { useNavigationSelector } from "../stores/navigation";
import { LoginPage } from "./pages/login";
import { ProfilePage } from "./pages/profile";

const { importNavigationSelector } = createImporter({ storeName: NAVIGATION_STORE });
const { activeTabSelector } = importNavigationSelector(TABS_SLICE, "activeTabSelector");

export const Navigator = memo(() => {
  const activeTab = useNavigationSelector(activeTabSelector);
  switch (activeTab) {
    case TABS.LOGIN: return (<LoginPage />);
    case TABS.PROFILE: return (<ProfilePage />);
    default: throw new Error(`Unknown navigator active tab ${activeTab}`);
  }
});