import '../styles/frame.css';
import { memo } from "react";
import { Loader } from "./loader";
import { Header } from "./header";
import { ErrorModal } from "./modals/errorModal";
import { Navigator } from "./navigator";

export const Frame = memo(() => (
  <div className="frame-container">
    <Loader />
    <Header />
    <Navigator />
    <ErrorModal />
  </div>
));