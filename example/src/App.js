import { memo } from 'react';
import logo from './logo.svg';
import './App.css';
import { createAction, createSelector, createSlice, createStore, createImporter } from "react-state-toolkit";

const { importAction } = createImporter();

const { setValueAction: setValueActionImportWrapper } = importAction("app", "setValue");

const { setValueAction, SET_VALUE_ACTION } = createAction({
  sliceName: "app",
  name: "setValue",
  func: (value) => value
});
const { valueSelector } = createSelector({
  sliceName: "app",
  name: "value",
  funcs: [(state) => state.app.value]
});

const slice = createSlice({
  name: "app",
  reducer: {
    [SET_VALUE_ACTION]: (state, action) => {
      state.value = action.payload;
    }
  },
  sliceSelectors: { valueSelector },
  initialState: { value: 0 }
});

const {
  useSelector
} = createStore({
  storeSlices: { slice }
});

const getNow = () => new Date().toISOString().split("T")[1];

const Child = ({title}) => (<div>{title} rendered at: {getNow()}</div>);
const MemoChild = memo(Child);

const App = () => {
  const value = useSelector(valueSelector);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{`Value is ${value}`}</p>
        <button
          className="App-button"
          onClick={() => setValueActionImportWrapper(value + 1)}
          >
          Increase Value - Action Sudo-Import Wrapper
        </button>
        <button
          className="App-button"
          onClick={() => setValueAction(value + 1)}
          >
          Increase Value - Action
        </button>
        <Child title="Non-memo child" />
        <MemoChild title="Memo child" />
      </header>
    </div>
  );
}

export default App;
