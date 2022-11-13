import { DEFAULT_STORE } from "../constants/store";
import { getStoresFactory } from "./stores";
import { getSlicesFactory } from "./slices";
import { getActionsFactory } from "./actions";
import { getSelectorsFactory } from "./selectors";
import { getImportersFactory } from "./importers";
import { getSubscriptionsFactory } from "./subscriptions";
import { getHooksValidator } from './hooks.validator';
import { getSelectorId, getSubscriptionIds } from "./ids";

let stores, slices, actions, actionsByType, actionsImports, selectors, selectorsImports;
let createStore, createSlice, createAction, createAsyncAction, createSelector, createImporter,
  createHookSubscription, recreateHookSubscription;
let validateUseSelector, validateUseSelectorMemo;
const reset = () => {
  stores = {};
  slices = {};
  actions = {};
  actionsByType = {};
  actionsImports = {};
  selectors = {};
  selectorsImports = {};

  ({ createStore } = getStoresFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSlice } = getSlicesFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({
    createAction,
    createAsyncAction
  } = getActionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createSelector } = getSelectorsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({ createImporter } = getImportersFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  ({
    createHookSubscription,
    recreateHookSubscription,
  } = getSubscriptionsFactory({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  }));
  const {
    validateUseSelector,
    validateUseSelectorMemo
  } = getHooksValidator({
    stores,
    slices,
    actions,
    actionsByType,
    actionsImports,
    selectors,
    selectorsImports,
  });
};
beforeEach(reset);

describe("useStoreState subscriptions factory", () => {
  test.todo("implement");
});

describe("useSelector", () => {
  describe("parameterless selector subscriptions factory", () => {
    test("Should be able to create new parameterless selector subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "valueSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const { valueSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [(state) => state[sliceName].value]
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [valueSelector],
        initialState: { value: 0 }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: valueSelector.__selectorId,
        selectorStoreName: valueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual(0);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
    });

    test("Should be able to create already subscribed selector subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "valueSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const { valueSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [(state) => ({ ...state[sliceName].value })]
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [valueSelector],
        initialState: { value: { valueObj: true } }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: valueSelector.__selectorId,
        selectorStoreName: valueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ valueObj: true });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: valueSelector.__selectorId,
        selectorStoreName: valueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
    });

    test("Should be able to create already subscribed selector subscription with different selector subscription present", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "valueSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const { valueSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [(state) => ({ ...state[sliceName].value })]
      });
      const otherSelectorName = "otherValueSelector";
      const otherSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: otherSelectorName });
      const { subscriptionId: otherSubscriptionId } = getSubscriptionIds({ selectorId: otherSelectorId, params });
      const { otherValueSelector } = createSelector({
        sliceName,
        name: otherSelectorName,
        funcs: [(state) => ({ ...state[sliceName].otherValue })]
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [valueSelector, otherValueSelector],
        initialState: { value: { valueObj: true }, otherValue: { otherValueObj: true } }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: valueSelector.__selectorId,
        selectorStoreName: valueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ valueObj: true });
      const otherSelectorHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: otherValueSelector.__selectorId,
        selectorStoreName: otherValueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: valueSelector.__selectorId,
        selectorStoreName: valueSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof otherSelectorHookHandle.id).toEqual("symbol");
      expect(otherSelectorHookHandle.selectorId).toEqual(otherSelectorId);
      expect(otherSelectorHookHandle.subscriptionId).toEqual(otherSubscriptionId);
      expect(otherSelectorHookHandle.paramsId).toEqual(paramsId);
      expect(otherSelectorHookHandle.requiresRender).toEqual(false);
      expect(otherSelectorHookHandle.value).toEqual(null);
      expect(otherSelectorHookHandle.setSelected).toEqual(null);
      expect(typeof otherSelectorHookHandle.unsubscribe).toEqual("function");

      const { subscription: otherSubscription } = otherSelectorHookHandle;
      expect(otherSubscription).not.toEqual(undefined);
      expect(otherSubscription).not.toEqual(subscription);
      expect(otherSubscription.selectorId).toEqual(otherSelectorId);
      expect(otherSubscription.id).toEqual(otherSubscriptionId);
      expect(otherSubscription.paramsId).toEqual(paramsId);
      expect(otherSubscription.params).toEqual(params);

      expect(typeof otherSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(otherSubscription.memoOnArgs).toEqual(false);
      expect(otherSubscription.keepMemo).toEqual(false);
      expect(typeof otherSubscription.arg.getParams).toEqual("function");
      expect(otherSubscription.triggers.size).toEqual(1);
      expect(otherSubscription.triggers.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
      expect(otherSubscription.holders).toEqual(new Map());
      expect(otherSubscription.associatedSubscriptions).toEqual(new Map());
      expect(otherSubscription.funcs.length).toEqual(1);
      expect(otherSubscription.lastArgs).toEqual([]);
      expect(otherSubscription.lastSelected).toEqual({ otherValueObj: true });
      expect(otherSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof otherSubscription.onSelectedChange).toEqual("function");
      expect(typeof otherSubscription.onStateChange).toEqual("function");
      expect(typeof otherSubscription.selectFunc).toEqual("function");

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription: nextSubscription } = nextHookHandle;
      expect(nextSubscription).toEqual(subscription);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, otherSelectorHookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, otherSelectorHookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSubscription.id)).toEqual(otherSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([subscription.id, otherSubscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([subscription, otherSubscription]);
    });

    test("Should be able to create new selector subscription with new associated subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users) => {
            const [user] = Object.values(users);
            return { ...user };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([{
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      }]);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing associated subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users) => {
            const [user] = Object.values(users);
            return { ...user };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing associated subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users) => {
            const [user] = Object.values(users);
            return { ...user };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ name: "user1" });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(associatedSubscription.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscription.id).toEqual(associatedSubscriptionId);
      expect(associatedSubscription.paramsId).toEqual(paramsId);
      expect(associatedSubscription.params).toEqual(params);

      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(2);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed associated selector subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users) => {
            const [user] = Object.values(users);
            return { ...user };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const nextAssociatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextAssociatedSubscriptionHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextAssociatedSubscriptionHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new 2nd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active } = users[key];
              acc[key] = { name, active };
              return acc;
            }, {})
        ],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          activeUsersSelector,
          (users, activeUsers) => {
            const [activeUser] = Object.values(activeUsers);
            return { ...users[activeUser.name] };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(2);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(3);
      expect(subscription.lastArgs).toEqual([
        {
          user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
          user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
          user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
        },
        {
          user1: { name: "user1", active: true },
          user3: { name: "user3", active: true },
        }]);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs).toEqual([{
        user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      }]);
      expect(associated2ndSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new 2nd layer associated subscription, associated with existing subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active } = users[key];
              acc[key] = { name, active };
              return acc;
            }, {})
        ],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          activeUsersSelector,
          (users, activeUsers) => {
            const [activeUser] = Object.values(activeUsers);
            return { ...users[activeUser.name] };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(2);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(3);
      expect(subscription.lastArgs.length).toEqual(2);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastArgs[1]).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing 2nd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active } = users[key];
              acc[key] = { name, active };
              return acc;
            }, {})
        ],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          activeUsersSelector,
          (users, activeUsers) => {
            const [activeUser] = Object.values(activeUsers);
            return { ...users[activeUser.name] };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associated2ndSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: activeUsersSelector.__selectorId,
        selectorStoreName: activeUsersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associated2ndSubscriptionSelected = associated2ndSubscriptionHookHandle.subscription.lastSelected;
      const associatedSubscriptionSelected = associated2ndSubscriptionHookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated2ndSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(2);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(3);
      expect(subscription.lastArgs.length).toEqual(2);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastArgs[1]).toBe(associated2ndSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associated2ndSubscriptionHookHandle.id).toEqual("symbol");
      expect(associated2ndSubscriptionHookHandle.selectorId).toEqual(associated2ndSelectorId);
      expect(associated2ndSubscriptionHookHandle.subscriptionId).toEqual(associated2ndSubscriptionId);
      expect(associated2ndSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associated2ndSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associated2ndSubscriptionHookHandle.value).toEqual(null);
      expect(associated2ndSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associated2ndSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(associated2ndSubscriptionHookHandle.subscription).toEqual(associated2ndSubscription);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers.size).toEqual(1);
      expect(associated2ndSubscription.triggers.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toBe(associated2ndSubscriptionSelected);
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
      expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing 2nd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active } = users[key];
              acc[key] = { name, active };
              return acc;
            }, {})
        ],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          activeUsersSelector,
          (users, activeUsers) => {
            const [activeUser] = Object.values(activeUsers);
            return { ...users[activeUser.name] };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associated2ndSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associated2ndSubscriptionId).lastSelected;
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated2ndSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(subscriptionSelected).toEqual({ name: "user1", active: true, lastLogin: "2022-11-12T12:07:44.893Z" });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(2);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(3);
      expect(subscription.lastArgs.length).toEqual(2);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastArgs[1]).toBe(associated2ndSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associated2ndSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associated2ndSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toBe(associated2ndSubscriptionSelected);
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new 3rd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "adminUserSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const associated3rdSelectorName = "adminUsersSelector";
      const associated3rdSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated3rdSelectorName });
      const { subscriptionId: associated3rdSubscriptionId } = getSubscriptionIds({ selectorId: associated3rdSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active, admin } = users[key];
              acc[key] = { name, active, admin };
              return acc;
            }, {})
        ],
      });
      const { adminUsersSelector } = createSelector({
        sliceName,
        name: associated3rdSelectorName,
        funcs: [
          activeUsersSelector,
          usersSelector,
          (activeUsers, users) => Object.keys(activeUsers).reduce(
            (acc, key) => {
              if (activeUsers[key].admin)
                acc[key] = users[key];
              return acc;
            }, {})
        ],
      });
      const { adminUserSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          adminUsersSelector,
          (adminUsers) => {
            const [adminUser] = Object.values(adminUsers);
            return { ...adminUser };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, adminUsersSelector, adminUserSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(3);
      expect(subscription.associatedSubscriptions.has(associated3rdSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([
        {
          user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
        }
      ]);
      expect(subscription.lastSelected).toEqual({ name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated3rdSubscription = subscription.associatedSubscriptions.get(associated3rdSubscriptionId);
      expect(typeof associated3rdSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated3rdSubscription.memoOnArgs).toEqual(false);
      expect(associated3rdSubscription.keepMemo).toEqual(false);
      expect(typeof associated3rdSubscription.arg.getParams).toEqual("function");
      expect(associated3rdSubscription.triggers).toEqual(new Map());
      expect(associated3rdSubscription.holders.size).toEqual(1);
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.associatedSubscriptions.size).toEqual(2);
      expect(associated3rdSubscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.funcs.length).toEqual(3);
      expect(associated3rdSubscription.lastArgs).toEqual([
        {
          user1: { name: "user1", active: true, admin: false },
          user3: { name: "user3", active: true, admin: true },
        },
        {
          user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
          user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
          user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
        }
      ]);
      expect(associated3rdSubscription.lastSelected).toEqual({
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated3rdSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated3rdSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated3rdSubscription.onStateChange).toEqual("function");
      expect(typeof associated3rdSubscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs).toEqual([{
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      }]);
      expect(associated2ndSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscription.id)).toEqual(associated3rdSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, associated3rdSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, associated3rdSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new 3rd layer associated subscription chain, associated with new subscription, associated with existing subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "adminUserSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const associated3rdSelectorName = "adminUsersSelector";
      const associated3rdSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated3rdSelectorName });
      const { subscriptionId: associated3rdSubscriptionId } = getSubscriptionIds({ selectorId: associated3rdSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active, admin } = users[key];
              acc[key] = { name, active, admin };
              return acc;
            }, {})
        ],
      });
      const { adminUsersSelector } = createSelector({
        sliceName,
        name: associated3rdSelectorName,
        funcs: [
          activeUsersSelector,
          usersSelector,
          (activeUsers, users) => Object.keys(activeUsers).reduce(
            (acc, key) => {
              if (activeUsers[key].admin)
                acc[key] = users[key];
              return acc;
            }, {})
        ],
      });
      const { adminUserSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          adminUsersSelector,
          (adminUsers) => {
            const [adminUser] = Object.values(adminUsers);
            return { ...adminUser };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, adminUsersSelector, adminUserSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(3);
      expect(subscription.associatedSubscriptions.has(associated3rdSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([
        {
          user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
        }
      ]);
      expect(subscription.lastSelected).toEqual({ name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated3rdSubscription = subscription.associatedSubscriptions.get(associated3rdSubscriptionId);
      expect(typeof associated3rdSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated3rdSubscription.memoOnArgs).toEqual(false);
      expect(associated3rdSubscription.keepMemo).toEqual(false);
      expect(typeof associated3rdSubscription.arg.getParams).toEqual("function");
      expect(associated3rdSubscription.triggers).toEqual(new Map());
      expect(associated3rdSubscription.holders.size).toEqual(1);
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.associatedSubscriptions.size).toEqual(2);
      expect(associated3rdSubscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.funcs.length).toEqual(3);
      expect(associated3rdSubscription.lastArgs.length).toEqual(2);
      expect(associated3rdSubscription.lastArgs[0]).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      expect(associated3rdSubscription.lastArgs[1]).toBe(associatedSubscriptionSelected);
      expect(associated3rdSubscription.lastSelected).toEqual({
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated3rdSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated3rdSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated3rdSubscription.onStateChange).toEqual("function");
      expect(typeof associated3rdSubscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscription.id)).toEqual(associated3rdSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, associated3rdSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, associated3rdSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new 3rd layer associated subscription chain, associated with existing subscription 2nd layer subscription", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "adminUserSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const associated3rdSelectorName = "adminUsersSelector";
      const associated3rdSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated3rdSelectorName });
      const { subscriptionId: associated3rdSubscriptionId } = getSubscriptionIds({ selectorId: associated3rdSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active, admin } = users[key];
              acc[key] = { name, active, admin };
              return acc;
            }, {})
        ],
      });
      const { adminUsersSelector } = createSelector({
        sliceName,
        name: associated3rdSelectorName,
        funcs: [
          activeUsersSelector,
          usersSelector,
          (activeUsers, users) => Object.keys(activeUsers).reduce(
            (acc, key) => {
              if (activeUsers[key].admin)
                acc[key] = users[key];
              return acc;
            }, {})
        ],
      });
      const { adminUserSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          adminUsersSelector,
          (adminUsers) => {
            const [adminUser] = Object.values(adminUsers);
            return { ...adminUser };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, adminUsersSelector, adminUserSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associated2ndSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: activeUsersSelector.__selectorId,
        selectorStoreName: activeUsersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associated2ndSubscriptionSelected = associated2ndSubscriptionHookHandle.subscription.lastSelected;
      const associatedSubscriptionSelected = associated2ndSubscriptionHookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated2ndSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(3);
      expect(subscription.associatedSubscriptions.has(associated3rdSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([
        {
          user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
        }
      ]);
      expect(subscription.lastSelected).toEqual({ name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated3rdSubscription = subscription.associatedSubscriptions.get(associated3rdSubscriptionId);
      expect(typeof associated3rdSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated3rdSubscription.memoOnArgs).toEqual(false);
      expect(associated3rdSubscription.keepMemo).toEqual(false);
      expect(typeof associated3rdSubscription.arg.getParams).toEqual("function");
      expect(associated3rdSubscription.triggers).toEqual(new Map());
      expect(associated3rdSubscription.holders.size).toEqual(1);
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.associatedSubscriptions.size).toEqual(2);
      expect(associated3rdSubscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.funcs.length).toEqual(3);
      expect(associated3rdSubscription.lastArgs.length).toEqual(2);
      expect(associated3rdSubscription.lastArgs[0]).toBe(associated2ndSubscriptionSelected);
      expect(associated3rdSubscription.lastArgs[1]).toBe(associatedSubscriptionSelected);
      expect(associated3rdSubscription.lastSelected).toEqual({
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated3rdSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated3rdSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated3rdSubscription.onStateChange).toEqual("function");
      expect(typeof associated3rdSubscription.selectFunc).toEqual("function");

      expect(typeof associated2ndSubscriptionHookHandle.id).toEqual("symbol");
      expect(associated2ndSubscriptionHookHandle.selectorId).toEqual(associated2ndSelectorId);
      expect(associated2ndSubscriptionHookHandle.subscriptionId).toEqual(associated2ndSubscriptionId);
      expect(associated2ndSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associated2ndSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associated2ndSubscriptionHookHandle.value).toEqual(null);
      expect(associated2ndSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associated2ndSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(associated2ndSubscriptionHookHandle.subscription).toEqual(associated2ndSubscription);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers.size).toEqual(1);
      expect(associated2ndSubscription.triggers.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect(associated2ndSubscription.holders.size).toEqual(1);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toBe(associated2ndSubscriptionSelected);
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
      expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscription.id)).toEqual(associated3rdSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, associated3rdSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, associated3rdSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing 3rd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "adminUserSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const associated3rdSelectorName = "adminUsersSelector";
      const associated3rdSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated3rdSelectorName });
      const { subscriptionId: associated3rdSubscriptionId } = getSubscriptionIds({ selectorId: associated3rdSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active, admin } = users[key];
              acc[key] = { name, active, admin };
              return acc;
            }, {})
        ],
      });
      const { adminUsersSelector } = createSelector({
        sliceName,
        name: associated3rdSelectorName,
        funcs: [
          activeUsersSelector,
          usersSelector,
          (activeUsers, users) => Object.keys(activeUsers).reduce(
            (acc, key) => {
              if (activeUsers[key].admin)
                acc[key] = users[key];
              return acc;
            }, {})
        ],
      });
      const { adminUserSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          adminUsersSelector,
          (adminUsers) => {
            const [adminUser] = Object.values(adminUsers);
            return { ...adminUser };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, adminUsersSelector, adminUserSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associated3rdSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUsersSelector.__selectorId,
        selectorStoreName: adminUsersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associated3rdSubscriptionSelected = associated3rdSubscriptionHookHandle.subscription.lastSelected;
      const associated2ndSubscriptionSelected = associated3rdSubscriptionHookHandle.subscription.associatedSubscriptions.get(associated2ndSubscriptionId).lastSelected;
      const associatedSubscriptionSelected = associated3rdSubscriptionHookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated2ndSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      expect(associated3rdSubscriptionSelected).toEqual({
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(3);
      expect(subscription.associatedSubscriptions.has(associated3rdSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associated3rdSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associated3rdSubscriptionHookHandle.id).toEqual("symbol");
      expect(associated3rdSubscriptionHookHandle.selectorId).toEqual(associated3rdSelectorId);
      expect(associated3rdSubscriptionHookHandle.subscriptionId).toEqual(associated3rdSubscriptionId);
      expect(associated3rdSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associated3rdSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associated3rdSubscriptionHookHandle.value).toEqual(null);
      expect(associated3rdSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associated3rdSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associated3rdSubscription = subscription.associatedSubscriptions.get(associated3rdSubscriptionId);
      expect(associated3rdSubscriptionHookHandle.subscription).toEqual(associated3rdSubscription);
      expect(typeof associated3rdSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated3rdSubscription.memoOnArgs).toEqual(false);
      expect(associated3rdSubscription.keepMemo).toEqual(false);
      expect(typeof associated3rdSubscription.arg.getParams).toEqual("function");
      expect(associated3rdSubscription.triggers.size).toEqual(1);
      expect(associated3rdSubscription.triggers.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
      expect(associated3rdSubscription.holders.size).toEqual(1);
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.associatedSubscriptions.size).toEqual(2);
      expect(associated3rdSubscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.funcs.length).toEqual(3);
      expect(associated3rdSubscription.lastArgs.length).toEqual(2);
      expect(associated3rdSubscription.lastArgs[0]).toBe(associated2ndSubscriptionSelected);
      expect(associated3rdSubscription.lastArgs[1]).toBe(associatedSubscriptionSelected);
      expect(associated3rdSubscription.lastSelected).toBe(associated3rdSubscriptionSelected);
      expect(associated3rdSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated3rdSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated3rdSubscription.onStateChange).toEqual("function");
      expect(typeof associated3rdSubscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect([...associated2ndSubscription.holders.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
      expect([...associated2ndSubscription.holders.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toBe(associated2ndSubscriptionSelected);
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
      expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscription.id)).toEqual(associated3rdSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, associated3rdSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, associated3rdSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing 3rd layer associated subscription chain", () => {
      const params = [];
      const sliceName = "testSlice";
      const selectorName = "adminUserSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const associated2ndSelectorName = "activeUsersSelector";
      const associated2ndSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated2ndSelectorName });
      const { subscriptionId: associated2ndSubscriptionId } = getSubscriptionIds({ selectorId: associated2ndSelectorId, params });
      const associated3rdSelectorName = "adminUsersSelector";
      const associated3rdSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associated3rdSelectorName });
      const { subscriptionId: associated3rdSubscriptionId } = getSubscriptionIds({ selectorId: associated3rdSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { activeUsersSelector } = createSelector({
        sliceName,
        name: associated2ndSelectorName,
        funcs: [
          usersSelector,
          (users) => Object.keys(users).reduce(
            (acc, key) => {
              if (!users[key].active) return acc;
              const { name, active, admin } = users[key];
              acc[key] = { name, active, admin };
              return acc;
            }, {})
        ],
      });
      const { adminUsersSelector } = createSelector({
        sliceName,
        name: associated3rdSelectorName,
        funcs: [
          activeUsersSelector,
          usersSelector,
          (activeUsers, users) => Object.keys(activeUsers).reduce(
            (acc, key) => {
              if (activeUsers[key].admin)
                acc[key] = users[key];
              return acc;
            }, {})
        ],
      });
      const { adminUserSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          adminUsersSelector,
          (adminUsers) => {
            const [adminUser] = Object.values(adminUsers);
            return { ...adminUser };
          }
        ],
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [activeUsersSelector, usersSelector, adminUsersSelector, adminUserSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
            user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
            user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associated3rdSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associated3rdSubscriptionId).lastSelected;
      const associated2ndSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associated2ndSubscriptionId).lastSelected;
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false, lastLogin: "2022-11-12T12:07:44.893Z" },
        user2: { name: "user2", active: false, admin: false, lastLogin: "2022-11-12T13:07:44.893Z" },
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(associated2ndSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true, admin: false },
        user3: { name: "user3", active: true, admin: true },
      });
      expect(associated3rdSubscriptionSelected).toEqual({
        user3: { name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" },
      });
      expect(subscriptionSelected).toEqual({ name: "user3", active: true, admin: true, lastLogin: "2022-11-13T12:07:44.893Z" });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: adminUserSelector.__selectorId,
        selectorStoreName: adminUserSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(3);
      expect(subscription.associatedSubscriptions.has(associated3rdSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associated3rdSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associated3rdSubscription = subscription.associatedSubscriptions.get(associated3rdSubscriptionId);
      expect(typeof associated3rdSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated3rdSubscription.memoOnArgs).toEqual(false);
      expect(associated3rdSubscription.keepMemo).toEqual(false);
      expect(typeof associated3rdSubscription.arg.getParams).toEqual("function");
      expect(associated3rdSubscription.triggers).toEqual(new Map());
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associated3rdSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associated3rdSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associated3rdSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated3rdSubscription.associatedSubscriptions.size).toEqual(2);
      expect(associated3rdSubscription.associatedSubscriptions.has(associated2ndSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated3rdSubscription.funcs.length).toEqual(3);
      expect(associated3rdSubscription.lastArgs.length).toEqual(2);
      expect(associated3rdSubscription.lastArgs[0]).toBe(associated2ndSubscriptionSelected);
      expect(associated3rdSubscription.lastArgs[1]).toBe(associatedSubscriptionSelected);
      expect(associated3rdSubscription.lastSelected).toBe(associated3rdSubscriptionSelected);
      expect(associated3rdSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated3rdSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated3rdSubscription.onStateChange).toEqual("function");
      expect(typeof associated3rdSubscription.selectFunc).toEqual("function");

      const associated2ndSubscription = subscription.associatedSubscriptions.get(associated2ndSubscriptionId);
      expect(typeof associated2ndSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associated2ndSubscription.memoOnArgs).toEqual(false);
      expect(associated2ndSubscription.keepMemo).toEqual(false);
      expect(typeof associated2ndSubscription.arg.getParams).toEqual("function");
      expect(associated2ndSubscription.triggers).toEqual(new Map());
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associated2ndSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associated2ndSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associated2ndSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associated2ndSubscription.associatedSubscriptions.size).toEqual(1);
      expect(associated2ndSubscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(associated2ndSubscription.funcs.length).toEqual(2);
      expect(associated2ndSubscription.lastArgs.length).toEqual(1);
      expect(associated2ndSubscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(associated2ndSubscription.lastSelected).toBe(associated2ndSubscriptionSelected);
      expect(associated2ndSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associated2ndSubscription.onSelectedChange).toEqual("function");
      expect(typeof associated2ndSubscription.onStateChange).toEqual("function");
      expect(typeof associated2ndSubscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[paramsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscription.id)).toEqual(associated3rdSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscription.id)).toEqual(associated2ndSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, associated2ndSubscription.id, associated3rdSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, associated2ndSubscription, associated3rdSubscription, subscription]);
    });
  });

  describe("parameterized selector subscriptions factory", () => {
    test("Should be able to create new selector subscription", () => {
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: [] });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          (state, { getParams }) => {
            const [userId] = getParams();
            return { ...state[sliceName].users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userName",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
    });

    test("Should be able to create already subscribed selector subscription with the same param", () => {
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: [] });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          (state, { getParams }) => {
            const [userId] = getParams();
            return { ...state[sliceName].users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userName",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
    });

    test("Should be able to create already subscribed selector subscription with different param", () => {
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: [] });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const otherParams = ["user2"];
      const {
        subscriptionId: otherSubscriptionId,
        paramsId: otherParamsId,
      } = getSubscriptionIds({ selectorId, params: otherParams });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          (state, { getParams }) => {
            const [userId] = getParams();
            return { ...state[sliceName].users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userName",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params: otherParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");


      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(otherSubscriptionId);
      expect(nextHookHandle.paramsId).toEqual(otherParamsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription: otherSubscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(otherSubscription.selectorId).toEqual(selectorId);
      expect(otherSubscription.id).toEqual(otherSubscriptionId);
      expect(otherSubscription.paramsId).toEqual(otherParamsId);
      expect(otherSubscription.params).toEqual(otherParams);

      expect(typeof otherSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(otherSubscription.memoOnArgs).toEqual(false);
      expect(otherSubscription.keepMemo).toEqual(false);
      expect(typeof otherSubscription.arg.getParams).toEqual("function");
      expect(otherSubscription.triggers.size).toEqual(1);
      expect(otherSubscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect(otherSubscription.holders).toEqual(new Map());
      expect(otherSubscription.associatedSubscriptions).toEqual(new Map());
      expect(otherSubscription.funcs.length).toEqual(1);
      expect(otherSubscription.lastArgs).toEqual([]);
      expect(otherSubscription.lastSelected).toEqual({ name: "user2" });
      expect(otherSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof otherSubscription.onSelectedChange).toEqual("function");
      expect(typeof otherSubscription.onStateChange).toEqual("function");
      expect(typeof otherSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSubscription.id)).toEqual(otherSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([subscription.id, otherSubscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([subscription, otherSubscription]);
    });

    test("Should be able to recreate subscription with different param when subscription is not held by other hooks", () => {
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: [] });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const newParams = ["user2"];
      const { subscriptionId: newSubscriptionId, paramsId: newParamsId } = getSubscriptionIds({ selectorId, params: newParams });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          (state, { getParams }) => {
            const [userId] = getParams();
            return { ...state[sliceName].users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userName",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const preRecreateSubscription = hookHandle.subscription;
      recreateHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        hookHandle,
        params: newParams,
        validateSubscription: validateUseSelector,
      });


      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(newSubscriptionId);
      expect(hookHandle.paramsId).toEqual(newParamsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(preRecreateSubscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(newSubscriptionId);
      expect(subscription.paramsId).toEqual(newParamsId);
      expect(subscription.params).toEqual(newParams);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual({ name: "user2" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
    });

    test("Should be able to recreate subscription with different param when subscription is held by other hooks", () => {
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: [] });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const newParams = ["user2"];
      const { subscriptionId: newSubscriptionId, paramsId: newParamsId } = getSubscriptionIds({ selectorId, params: newParams });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          (state, { getParams }) => {
            const [userId] = getParams();
            return { ...state[sliceName].users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userName",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const preRecreateSubscription = hookHandle.subscription;
      const preRecreateSubscriptionSelected = hookHandle.subscription.lastSelected;
      expect(preRecreateSubscriptionSelected).toEqual({ name: "user1" });
      const originalParamHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      recreateHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        hookHandle,
        params: newParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof originalParamHookHandle.id).toEqual("symbol");
      expect(originalParamHookHandle.selectorId).toEqual(selectorId);
      expect(originalParamHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(originalParamHookHandle.paramsId).toEqual(paramsId);
      expect(originalParamHookHandle.requiresRender).toEqual(false);
      expect(originalParamHookHandle.value).toEqual(null);
      expect(originalParamHookHandle.setSelected).toEqual(null);
      expect(typeof originalParamHookHandle.unsubscribe).toEqual("function");

      const { subscription: originalParamSubscription } = originalParamHookHandle;
      expect(originalParamSubscription).not.toEqual(hookHandle.subscription);
      expect(originalParamSubscription.selectorId).toEqual(selectorId);
      expect(originalParamSubscription.id).toEqual(subscriptionId);
      expect(originalParamSubscription.paramsId).toEqual(paramsId);
      expect(originalParamSubscription.params).toEqual(params);

      expect(typeof originalParamSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(originalParamSubscription.memoOnArgs).toEqual(false);
      expect(originalParamSubscription.keepMemo).toEqual(false);
      expect(typeof originalParamSubscription.arg.getParams).toEqual("function");
      expect(originalParamSubscription.triggers.size).toEqual(1);
      expect(originalParamSubscription.triggers.get(originalParamHookHandle.id)).toEqual(originalParamHookHandle);
      expect(originalParamSubscription.holders).toEqual(new Map());
      expect(originalParamSubscription.associatedSubscriptions).toEqual(new Map());
      expect(originalParamSubscription.funcs.length).toEqual(1);
      expect(originalParamSubscription.lastArgs).toEqual([]);
      expect(originalParamSubscription.lastSelected).toBe(preRecreateSubscriptionSelected);
      expect(originalParamSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof originalParamSubscription.onSelectedChange).toEqual("function");
      expect(typeof originalParamSubscription.onStateChange).toEqual("function");
      expect(typeof originalParamSubscription.selectFunc).toEqual("function");

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(newSubscriptionId);
      expect(hookHandle.paramsId).toEqual(newParamsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(preRecreateSubscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(newSubscriptionId);
      expect(subscription.paramsId).toEqual(newParamsId);
      expect(subscription.params).toEqual(newParams);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions).toEqual(new Map());
      expect(subscription.funcs.length).toEqual(1);
      expect(subscription.lastArgs).toEqual([]);
      expect(subscription.lastSelected).toEqual({ name: "user2" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(originalParamHookHandle.id)).toEqual(originalParamHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, originalParamHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, originalParamHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(originalParamSubscription.id)).toEqual(originalParamSubscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([originalParamSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([originalParamSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new associated parameterless subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: noParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => state[sliceName].users],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userId",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([{
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      }]);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing associated parameterless subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: noParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userId",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: noParams,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing associated parameterless subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: noParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userId",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: noParams,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ name: "user1" });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(noParamsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(associatedSubscription.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscription.id).toEqual(associatedSubscriptionId);
      expect(associatedSubscription.paramsId).toEqual(noParamsId);
      expect(associatedSubscription.params).toEqual(noParams);

      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(2);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed associated parameterless selector subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: noParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userId",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });
      const nextAssociatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: noParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextAssociatedSubscriptionHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextAssociatedSubscriptionHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to recreate selector subscription with associated parameterless subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const params = ["user1"];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const newParams = ["user2"];
      const { subscriptionId: newSubscriptionId, paramsId: newParamsId } = getSubscriptionIds({ selectorId, params: newParams });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: noParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [(state) => ({ ...state[sliceName].users })],
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature: "userId",
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1" },
            user2: { name: "user2" },
            user3: { name: "user3" },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      const preRecreateSubscription = hookHandle.subscription;
      let associatedSubscription = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId);
      const associatedSubscriptionSelectedPreRecreate = associatedSubscription.lastSelected;
      expect(associatedSubscriptionSelectedPreRecreate).toEqual({
        user1: { name: "user1" },
        user2: { name: "user2" },
        user3: { name: "user3" },
      });

      recreateHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        hookHandle,
        params: newParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(newSubscriptionId);
      expect(hookHandle.paramsId).toEqual(newParamsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(preRecreateSubscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(newSubscriptionId);
      expect(subscription.paramsId).toEqual(newParamsId);
      expect(subscription.params).toEqual(newParams);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelectedPreRecreate);
      expect(subscription.lastSelected).toEqual({ name: "user2" });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelectedPreRecreate);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new associated parameterized (matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [userId, active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([{
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      }]);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing associated parameterized (matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [userId, active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing associated parameterized (matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [userId, active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ name: "user1", active: true });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(paramsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(associatedSubscription.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscription.id).toEqual(associatedSubscriptionId);
      expect(associatedSubscription.paramsId).toEqual(paramsId);
      expect(associatedSubscription.params).toEqual(params);

      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(2);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed associated parameterized (matching-signature) selector subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [userId, active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const nextAssociatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextAssociatedSubscriptionHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextAssociatedSubscriptionHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to recreate selector subscription with associated parameterized (matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const newParams = ["user2", true];
      const { subscriptionId: newSubscriptionId, paramsId: newParamsId } = getSubscriptionIds({ selectorId, params: newParams });
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params });
      const { subscriptionId: newAssociatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: newParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [userId, active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: true },
            user3: { name: "user3", active: false },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      const preRecreateSubscription = hookHandle.subscription;
      const associatedSubscription = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId);
      const associatedSubscriptionSelectedPreRecreate = associatedSubscription.lastSelected;
      expect(associatedSubscriptionSelectedPreRecreate).toEqual({
        user1: { name: "user1", active: true },
        user2: { name: "user2", active: true },
      });

      recreateHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        hookHandle,
        params: newParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(newSubscriptionId);
      expect(hookHandle.paramsId).toEqual(newParamsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(preRecreateSubscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(newSubscriptionId);
      expect(subscription.paramsId).toEqual(newParamsId);
      expect(subscription.params).toEqual(newParams);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(newAssociatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).not.toBe(associatedSubscriptionSelectedPreRecreate);
      expect(subscription.lastArgs[0]).toEqual(associatedSubscriptionSelectedPreRecreate);
      expect(subscription.lastSelected).toEqual({ name: "user2", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const newAssociatedSubscription = subscription.associatedSubscriptions.get(newAssociatedSubscriptionId);
      expect(typeof newAssociatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof newAssociatedSubscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(newAssociatedSubscription.memoOnArgs).toEqual(false);
      expect(newAssociatedSubscription.keepMemo).toEqual(false);
      expect(typeof newAssociatedSubscription.arg.getParams).toEqual("function");
      expect(newAssociatedSubscription.triggers).toEqual(new Map());
      expect(newAssociatedSubscription.holders.size).toEqual(1);
      expect(newAssociatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(newAssociatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(newAssociatedSubscription.funcs.length).toEqual(1);
      expect(newAssociatedSubscription.lastArgs).toEqual([]);
      expect(newAssociatedSubscription.lastSelected).not.toBe(associatedSubscriptionSelectedPreRecreate);
      expect(newAssociatedSubscription.lastSelected).toEqual(associatedSubscriptionSelectedPreRecreate);
      expect(newAssociatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof newAssociatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof newAssociatedSubscription.onStateChange).toEqual("function");
      expect(typeof newAssociatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(newAssociatedSubscription.id)).toEqual(newAssociatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([newAssociatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([newAssociatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with new associated parameterized (non-matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorParamsSignature = "active";
      const associatedSelectorParams = [true];
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: associatedSelectorParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature: associatedSelectorParamsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
        paramsMappers: { [associatedSelectorParamsSignature]: ([userId, active]) => [active] }
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs).toEqual([{
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      }]);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[associatedSelectorParamsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create new selector subscription with existing associated parameterized (non-matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorParamsSignature = "active";
      const associatedSelectorParams = [true];
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: associatedSelectorParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature: associatedSelectorParamsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
        paramsMappers: { [associatedSelectorParamsSignature]: ([userId, active]) => [active] }
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: associatedSelectorParams,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[associatedSelectorParamsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toEqual(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed selector subscription with existing associated parameterized (non-matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorParamsSignature = "active";
      const associatedSelectorParams = [true];
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const { subscriptionId: associatedSubscriptionId, paramsId: associatedSubscriptionParamsId } = getSubscriptionIds({ selectorId: associatedSelectorId, params: associatedSelectorParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature: associatedSelectorParamsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
        paramsMappers: { [associatedSelectorParamsSignature]: ([userId, active]) => [active] }
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const associatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: associatedSelectorParams,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = associatedSubscriptionHookHandle.subscription.lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const subscriptionSelected = hookHandle.subscription.lastSelected;
      expect(subscriptionSelected).toEqual({ name: "user1", active: true });
      const nextHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      expect(typeof nextHookHandle.id).toEqual("symbol");
      expect(nextHookHandle.id).not.toEqual(hookHandle.id);
      expect(nextHookHandle.selectorId).toEqual(selectorId);
      expect(nextHookHandle.subscriptionId).toEqual(subscriptionId);
      expect(nextHookHandle.paramsId).toEqual(paramsId);
      expect(nextHookHandle.requiresRender).toEqual(false);
      expect(nextHookHandle.value).toEqual(null);
      expect(nextHookHandle.setSelected).toEqual(null);
      expect(typeof nextHookHandle.unsubscribe).toEqual("function");

      const { subscription } = nextHookHandle;
      expect(subscription).toEqual(hookHandle.subscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(2);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.triggers.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...subscription.triggers.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...subscription.triggers.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toBe(subscriptionSelected);
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      expect(typeof associatedSubscriptionHookHandle.id).toEqual("symbol");
      expect(associatedSubscriptionHookHandle.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscriptionHookHandle.subscriptionId).toEqual(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.paramsId).toEqual(associatedSubscriptionParamsId);
      expect(associatedSubscriptionHookHandle.requiresRender).toEqual(false);
      expect(associatedSubscriptionHookHandle.value).toEqual(null);
      expect(associatedSubscriptionHookHandle.setSelected).toEqual(null);
      expect(typeof associatedSubscriptionHookHandle.unsubscribe).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(associatedSubscriptionHookHandle.subscription).toEqual(associatedSubscription);
      expect(associatedSubscription.selectorId).toEqual(associatedSelectorId);
      expect(associatedSubscription.id).toEqual(associatedSubscriptionId);
      expect(associatedSubscription.paramsId).toEqual(associatedSubscriptionParamsId);
      expect(associatedSubscription.params).toEqual(associatedSelectorParams);

      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[associatedSelectorParamsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(2);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.holders.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...associatedSubscription.holders.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
      expect([...associatedSubscription.holders.values()]).toEqual([hookHandle, nextHookHandle]);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id, nextHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle, nextHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to create already subscribed associated parameterized (non-matching-signature) selector subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const associatedSelectorParamsSignature = "active";
      const associatedSelectorParams = [true];
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const {
        subscriptionId: associatedSubscriptionId,
        paramsId: associatedSubscriptionParamsId,
      } = getSubscriptionIds({ selectorId: associatedSelectorId, params: associatedSelectorParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature: associatedSelectorParamsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
        paramsMappers: { [associatedSelectorParamsSignature]: ([userId, active]) => [active] }
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: false },
            user3: { name: "user3", active: true },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });
      const associatedSubscriptionSelected = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId).lastSelected;
      expect(associatedSubscriptionSelected).toEqual({
        user1: { name: "user1", active: true },
        user3: { name: "user3", active: true },
      });
      const nextAssociatedSubscriptionHookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: usersSelector.__selectorId,
        selectorStoreName: usersSelector.__storeName,
        params: associatedSelectorParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(subscriptionId);
      expect(hookHandle.paramsId).toEqual(paramsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(undefined);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(subscriptionId);
      expect(subscription.paramsId).toEqual(paramsId);
      expect(subscription.params).toEqual(params);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelected);
      expect(subscription.lastSelected).toEqual({ name: "user1", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      const associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId)
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[associatedSelectorParamsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers.size).toEqual(1);
      expect(associatedSubscription.triggers.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelected);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].triggersStack.get(nextAssociatedSubscriptionHookHandle.id)).toEqual(nextAssociatedSubscriptionHookHandle);
      expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextAssociatedSubscriptionHookHandle.id]);
      expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextAssociatedSubscriptionHookHandle]);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });

    test("Should be able to recreate selector subscription with associated parameterized (non-matching-signature) subscription", () => {
      const noParams = [];
      const { paramsId: noParamsId } = getSubscriptionIds({ selectorId: "", params: noParams });
      const paramsSignature = "userId/active";
      const params = ["user1", true];
      const sliceName = "testSlice";
      const selectorName = "userSelector";
      const selectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName });
      const { subscriptionId, paramsId } = getSubscriptionIds({ selectorId, params });
      const newParams = ["user2", true];
      const { subscriptionId: newSubscriptionId, paramsId: newParamsId } = getSubscriptionIds({ selectorId, params: newParams });
      const associatedSelectorParamsSignature = "active";
      const associatedSelectorParams = [true];
      const associatedSelectorName = "usersSelector";
      const associatedSelectorId = getSelectorId({ storeName: DEFAULT_STORE, sliceName, selectorName: associatedSelectorName });
      const {
        subscriptionId: associatedSubscriptionId,
        paramsId: associatedSubscriptionParamsId,
      } = getSubscriptionIds({ selectorId: associatedSelectorId, params: associatedSelectorParams });
      const { usersSelector } = createSelector({
        sliceName,
        name: associatedSelectorName,
        funcs: [
          (state, { getParams }) => Object.entries(state[sliceName].users).reduce(
            (acc, [name, user]) => {
              const [active] = getParams();
              if (user.active === active)
                acc[name] = user;
              return acc;
            }, {}
          )
        ],
        isParameterized: true,
        paramsSignature: associatedSelectorParamsSignature,
      });
      const { userSelector } = createSelector({
        sliceName,
        name: selectorName,
        funcs: [
          usersSelector,
          (users, { getParams }) => {
            const [userId] = getParams();
            return { ...users[userId] };
          }
        ],
        isParameterized: true,
        paramsSignature,
        paramsMappers: { [associatedSelectorParamsSignature]: ([userId, active]) => [active] }
      });
      const slice = createSlice({
        name: sliceName,
        reducer: {},
        sliceSelectors: [usersSelector, userSelector],
        initialState: {
          users: {
            user1: { name: "user1", active: true },
            user2: { name: "user2", active: true },
            user3: { name: "user3", active: false },
          }
        }
      });
      createStore({
        storeSlices: { slice }
      });
      const hookHandle = createHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        params,
        validateSubscription: validateUseSelector,
      });

      const preRecreateSubscription = hookHandle.subscription;
      let associatedSubscription = hookHandle.subscription.associatedSubscriptions.get(associatedSubscriptionId);
      const associatedSubscriptionSelectedPreRecreate = associatedSubscription.lastSelected;
      expect(associatedSubscriptionSelectedPreRecreate).toEqual({
        user1: { name: "user1", active: true },
        user2: { name: "user2", active: true },
      });

      recreateHookSubscription({
        storeName: DEFAULT_STORE,
        selectorId: userSelector.__selectorId,
        selectorStoreName: userSelector.__storeName,
        hookHandle,
        params: newParams,
        validateSubscription: validateUseSelector,
      });

      expect(typeof hookHandle.id).toEqual("symbol");
      expect(hookHandle.selectorId).toEqual(selectorId);
      expect(hookHandle.subscriptionId).toEqual(newSubscriptionId);
      expect(hookHandle.paramsId).toEqual(newParamsId);
      expect(hookHandle.requiresRender).toEqual(false);
      expect(hookHandle.value).toEqual(null);
      expect(hookHandle.setSelected).toEqual(null);
      expect(typeof hookHandle.unsubscribe).toEqual("function");

      const { subscription } = hookHandle;
      expect(subscription).not.toEqual(preRecreateSubscription);
      expect(subscription.selectorId).toEqual(selectorId);
      expect(subscription.id).toEqual(newSubscriptionId);
      expect(subscription.paramsId).toEqual(newParamsId);
      expect(subscription.params).toEqual(newParams);

      expect(typeof subscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof subscription.paramsMappers[paramsSignature]).toEqual("function");
      expect(subscription.memoOnArgs).toEqual(false);
      expect(subscription.keepMemo).toEqual(false);
      expect(typeof subscription.arg.getParams).toEqual("function");
      expect(subscription.triggers.size).toEqual(1);
      expect(subscription.triggers.get(hookHandle.id)).toEqual(hookHandle);
      expect(subscription.holders).toEqual(new Map());
      expect(subscription.associatedSubscriptions.size).toEqual(1);
      expect(subscription.associatedSubscriptions.has(associatedSubscriptionId)).toEqual(true);
      expect(subscription.funcs.length).toEqual(2);
      expect(subscription.lastArgs.length).toEqual(1);
      expect(subscription.lastArgs[0]).toBe(associatedSubscriptionSelectedPreRecreate);
      expect(subscription.lastSelected).toEqual({ name: "user2", active: true });
      expect(subscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof subscription.onSelectedChange).toEqual("function");
      expect(typeof subscription.onStateChange).toEqual("function");
      expect(typeof subscription.selectFunc).toEqual("function");

      associatedSubscription = subscription.associatedSubscriptions.get(associatedSubscriptionId);
      expect(typeof associatedSubscription.paramsMappers[noParamsId]).toEqual("function");
      expect(typeof associatedSubscription.paramsMappers[associatedSelectorParamsSignature]).toEqual("function");
      expect(associatedSubscription.memoOnArgs).toEqual(false);
      expect(associatedSubscription.keepMemo).toEqual(false);
      expect(typeof associatedSubscription.arg.getParams).toEqual("function");
      expect(associatedSubscription.triggers).toEqual(new Map());
      expect(associatedSubscription.holders.size).toEqual(1);
      expect(associatedSubscription.holders.get(hookHandle.id)).toEqual(hookHandle);
      expect(associatedSubscription.associatedSubscriptions).toEqual(new Map());
      expect(associatedSubscription.funcs.length).toEqual(1);
      expect(associatedSubscription.lastArgs).toEqual([]);
      expect(associatedSubscription.lastSelected).toBe(associatedSubscriptionSelectedPreRecreate);
      expect(associatedSubscription.lastStateVersion).toEqual(stores[DEFAULT_STORE].stateVersion);
      expect(typeof associatedSubscription.onSelectedChange).toEqual("function");
      expect(typeof associatedSubscription.onStateChange).toEqual("function");
      expect(typeof associatedSubscription.selectFunc).toEqual("function");

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
      expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(subscription.id)).toEqual(subscription);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscription.id)).toEqual(associatedSubscription);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscription.id, subscription.id]);
      expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscription, subscription]);
    });
  });
});


describe("useSelectorMemo subscriptions factory", () => {
  test.todo("implement");
});