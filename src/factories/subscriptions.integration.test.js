import { DEFAULT_STORE } from "../constants/store";
import { NO_PARAMS_SIGNATURE } from "../constants/selectors";
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

describe("useStoreState", () => {
  test.todo("implement");
});

describe("useSelector", () => {
  describe("using parameterless selector", () => {
    test("Should be able to unsubscribe parameterless selector subscription", () => {
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
      hookHandle.unsubscribe();

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
    });

    describe("Should be able to unsubscribe multiple hooks for the same parameterless selector subscription", () => {
      let hookHandle, nextHookHandle;
      beforeEach(() => {
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
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: valueSelector.__selectorId,
          selectorStoreName: valueSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        nextHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: valueSelector.__selectorId,
          selectorStoreName: valueSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 order", () => {
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });

    describe("Should be able to unsubscribe hook subscribed to one selector subscription without effecting different selector subscription", () => {
      let hookHandle, otherSelectorHookHandle, nextHookHandle;
      beforeEach(() => {
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
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: valueSelector.__selectorId,
          selectorStoreName: valueSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        otherSelectorHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: otherValueSelector.__selectorId,
          selectorStoreName: otherValueSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        nextHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: valueSelector.__selectorId,
          selectorStoreName: valueSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 -> 3 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([otherSelectorHookHandle.id, nextHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([otherSelectorHookHandle, nextHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([nextHookHandle.subscription.id, otherSelectorHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([nextHookHandle.subscription, otherSelectorHookHandle.subscription]);
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 3 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([otherSelectorHookHandle.id, nextHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([otherSelectorHookHandle, nextHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([nextHookHandle.subscription.id, otherSelectorHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([nextHookHandle.subscription, otherSelectorHookHandle.subscription]);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 3 -> 1 order", () => {
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 -> 3 order", () => {
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, nextHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, nextHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 2 -> 1 order", () => {
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, otherSelectorHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, otherSelectorHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([hookHandle.subscription.id, otherSelectorHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([hookHandle.subscription, otherSelectorHookHandle.subscription]);
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 1 -> 2 order", () => {
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([hookHandle.id, otherSelectorHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([hookHandle, otherSelectorHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([hookHandle.subscription.id, otherSelectorHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([hookHandle.subscription, otherSelectorHookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(otherSelectorHookHandle.id)).toEqual(otherSelectorHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(otherSelectorHookHandle.subscription.id)).toEqual(otherSelectorHookHandle.subscription);
        otherSelectorHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });

    test("Should be able to unsubscribe selector subscription with associated subscription", () => {
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
      hookHandle.unsubscribe();

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
    });

    describe("Should be able to unsubscribe selector subscription with hook subscribed to associated subscription", () => {
      let associatedSubscriptionHookHandle, hookHandle;
      beforeEach(() => {
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
        associatedSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: usersSelector.__selectorId,
          selectorStoreName: usersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: userSelector.__selectorId,
          selectorStoreName: userSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });

    test("Should be able to unsubscribe selector subscription with 2nd layer associated subscription chain", () => {
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
      hookHandle.unsubscribe();

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
    });

    describe("Should be able to unsubscribe selector subscription with hooks subscribed to 2nd layer associated subscription chain", () => {
      let associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle;
      beforeEach(() => {
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
        associatedSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: usersSelector.__selectorId,
          selectorStoreName: usersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        associated2ndSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: activeUsersSelector.__selectorId,
          selectorStoreName: activeUsersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: userSelector.__selectorId,
          selectorStoreName: userSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 -> 3 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 3 -> 2 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 -> 3 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 3 -> 1 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 2 -> 1 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 1 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });

    test("Should be able to unsubscribe selector subscription with 3rd layer associated subscription chain", () => {
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
      hookHandle.unsubscribe();

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
    });

    describe("Should be able to unsubscribe selector subscription with hooks subscribed to 3rd layer associated subscription chain", () => {
      let associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle;
      beforeEach(() => {
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
        associatedSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: usersSelector.__selectorId,
          selectorStoreName: usersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        associated2ndSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: activeUsersSelector.__selectorId,
          selectorStoreName: activeUsersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        associated3rdSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: adminUsersSelector.__selectorId,
          selectorStoreName: adminUsersSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: adminUserSelector.__selectorId,
          selectorStoreName: adminUserSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 -> 3 -> 4 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 2 -> 4 -> 3 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 4 -> 3 -> 2 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 4 -> 2 -> 3 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 3 -> 4 -> 2 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 1 -> 3 -> 2 -> 4 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });

      test("in 2 -> 1 -> 3 -> 4 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 -> 4 -> 3 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 3 -> 1 -> 4 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 3 -> 4 -> 1 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 4 -> 1 -> 3 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 4 -> 3 -> 1 order", () => {
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });

      test("in 3 -> 1 -> 2 -> 4 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 1 -> 4 -> 2 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 2 -> 1 -> 4 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 2 -> 4 -> 1 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 4 -> 1 -> 2 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 3 -> 4 -> 2 -> 1 order", () => {
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(4);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, hookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, hookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });

      test("in 4 -> 1 -> 2 -> 3 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 4 -> 1 -> 3 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 4 -> 2 -> 3 -> 1 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 4 -> 2 -> 1 -> 3 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 4 -> 3 -> 2 -> 1 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 4 -> 3 -> 1 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(3);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(3);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated3rdSubscriptionHookHandle.id)).toEqual(associated3rdSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id, associated3rdSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle, associated3rdSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated3rdSubscriptionHookHandle.subscription.id)).toEqual(associated3rdSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id, associated3rdSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription, associated3rdSubscriptionHookHandle.subscription]);
        associated3rdSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(2);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect([...stores[DEFAULT_STORE].triggersStack.keys()]).toEqual([associatedSubscriptionHookHandle.id, associated2ndSubscriptionHookHandle.id]);
        expect([...stores[DEFAULT_STORE].triggersStack.values()]).toEqual([associatedSubscriptionHookHandle, associated2ndSubscriptionHookHandle]);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(associated2ndSubscriptionHookHandle.id)).toEqual(associated2ndSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associated2ndSubscriptionHookHandle.subscription.id)).toEqual(associated2ndSubscriptionHookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, associated2ndSubscriptionHookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, associated2ndSubscriptionHookHandle.subscription]);
        associated2ndSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });
  });

  describe("using parameterized selector", () => {
    test("Should be able to unsubscribe parameterized selector subscription", () => {
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
      hookHandle.unsubscribe();

      expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
      expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
    });

    describe("Should be able to unsubscribe from parameterized selector without effecting same parameterized selector, different param value subscription", () => {
      let hookHandle, nextHookHandle;
      beforeEach(() => {
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
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: userSelector.__selectorId,
          selectorStoreName: userSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
        nextHookHandle = createHookSubscription({
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
      });
      test("in 1 -> 2 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(nextHookHandle.id)).toEqual(nextHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(nextHookHandle.subscription.id)).toEqual(nextHookHandle.subscription);
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 order", () => {
        nextHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });

    describe("Should be able to create new selector subscription with existing associated parameterless subscription", () => {
      let associatedSubscriptionHookHandle, hookHandle;
      beforeEach(() => {
        const noParams = [];
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
        associatedSubscriptionHookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: usersSelector.__selectorId,
          selectorStoreName: usersSelector.__storeName,
          params: noParams,
          validateSubscription: validateUseSelector,
        });
        hookHandle = createHookSubscription({
          storeName: DEFAULT_STORE,
          selectorId: userSelector.__selectorId,
          selectorStoreName: userSelector.__storeName,
          params,
          validateSubscription: validateUseSelector,
        });
      });
      test("in 1 -> 2 order", () => {
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(2);
        expect(stores[DEFAULT_STORE].triggersStack.get(hookHandle.id)).toEqual(hookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(hookHandle.subscription.id)).toEqual(hookHandle.subscription);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.keys()]).toEqual([associatedSubscriptionHookHandle.subscription.id, hookHandle.subscription.id]);
        expect([...stores[DEFAULT_STORE].subscriptionsMatrix.values()]).toEqual([associatedSubscriptionHookHandle.subscription, hookHandle.subscription]);
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
      test("in 2 -> 1 order", () => {
        hookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(1);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(1);
        expect(stores[DEFAULT_STORE].triggersStack.get(associatedSubscriptionHookHandle.id)).toEqual(associatedSubscriptionHookHandle);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.get(associatedSubscriptionHookHandle.subscription.id)).toEqual(associatedSubscriptionHookHandle.subscription);
        associatedSubscriptionHookHandle.unsubscribe();
        expect(stores[DEFAULT_STORE].triggersStack.size).toEqual(0);
        expect(stores[DEFAULT_STORE].subscriptionsMatrix.size).toEqual(0);
      });
    });
  });
});

describe("useSelectorMemo", () => {
  test.todo("implement");
});