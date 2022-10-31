import "../../styles/pages/base.css";
import { createImporter } from "react-state-toolkit";
import { APP_SLICE, USER_SLICE } from "../../consts/defaultSlices";
import { useSelector } from '../../stores/default';
import { Logo } from "../common/logo";

const { importAction, importSelector } = createImporter();
const { setFirstNameAction } = importAction(USER_SLICE, "setFirstNameAction");
const { setLastNameAction } = importAction(USER_SLICE, "setLastNameAction");
const { setErrorAction } = importAction(APP_SLICE, "setErrorAction");
const { firstNameSelector } = importSelector(USER_SLICE, "firstNameSelector");
const { lastNameSelector } = importSelector(USER_SLICE, "lastNameSelector");

export const ProfilePage = () => {
  const firstName = useSelector(firstNameSelector);
  const lastName = useSelector(lastNameSelector);
  return (
    <div className="page">
      <p>{"Profile Page"}</p>
      <Logo />
      <input
        type='text'
        placeholder='firstName'
        value={firstName}
        onChange={(e) => {
          try { setFirstNameAction(e.target.value); }
          catch (error) { setErrorAction(error); }
        }}
      />
      <input
        type='text'
        placeholder='lastName'
        value={lastName}
        onChange={(e) => {
          try { setLastNameAction(e.target.value); }
          catch (error) { setErrorAction(error); }
        }}
      />
    </div>
  );
};