import "../styles/header.css";
import { TABS } from "../consts/tabs";
import { Tab } from "./tab";

export const Header = () => (
  <header className="header-container">
    {Object.values(TABS).map((tab) => (<Tab key={tab} tab={tab} />))}
  </header>
);