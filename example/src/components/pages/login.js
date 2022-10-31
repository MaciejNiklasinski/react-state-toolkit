import "../../styles/pages/base.css";
import { useState } from "react";
import { createImporter } from "react-state-toolkit";
import { LOGGED_IN } from "../../consts/appStatus";
import { USER_SLICE, APP_SLICE } from "../../consts/defaultSlices";
import { useSelector } from '../../stores/default';
import { Logo } from "../common/logo";

const { importAction, importSelector } = createImporter();
const { statusSelector } = importSelector(APP_SLICE, "statusSelector");
const { firstNameSelector } = importSelector(USER_SLICE, "firstNameSelector");
const { logInAction } = importAction(USER_SLICE, "logInAction");
const { logOutAction } = importAction(USER_SLICE, "logOutAction");

export const LoginPage = () => {
  const status = useSelector(statusSelector);
  const firstName = useSelector(firstNameSelector);
  const [username, setUsername] = useState();
  const onChange = ({ target }) => setUsername(target.value);
  return (
    <div className="page">
      <p>Login Page</p>
      <Logo />
      {status !== LOGGED_IN
        ? <input type='text' placeholder='username' onChange={onChange} value={username} />
        : <p>Welcome {firstName}</p>}
      {status !== LOGGED_IN
        ? <button
          className="page-button"
          onClick={() => logInAction(username)}
        >
          Log In
        </button>
        : <button
          className="page-button"
          onClick={() => logOutAction()}
        >
          Log Out
        </button>}
    </div>
  );
};
