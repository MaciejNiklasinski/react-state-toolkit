<h2>Description:</h2>

React global store based exclusively on build-in React hooks, useState and useEffect. General structure inspired by @reduxjs/toolkit.

<h2>Improvements:</h2>

<h3>Dispatch</h3>
No more dispatch!<br/>
All actions created using either createAction or createAsyncAction are self-dispatchable.<br/>

<h3>Circular imports</h3>
Strict creation/registration order policy.<br/>
All store elements actions/selectors/slices must be created following creation order/rules.
 - Actions and slice-registered selectors must be created before their slice.
 - Store-registered selectors must be created before their store.
 - Slice must be created before their store.
 - Slice must register all actions by having action handler in the reducer object, or action type passed to noHandlerTypes.
 - Slice must register all slice selectors by passing them to sliceSelectors.
 - Store must be created after all actions/selectors/slices.
 - Store must register all slices by passing them to storeSlices.
 - Store must register all store selectors not registered directly in any of the slices, by passing them to storeSelectors.

No more circular imports!<br/>
Thanks to strict creation/registration policy all store actions/selectors which will ever be valid for the store, have been created and registered within the store on creation and are immediately available through store getActions/getSelectors functions. That allows(and its recommended) to abandon usage of standard, prone-to-be-circular imports within actions, selectors and store-aware components. All actions and selectors are being invoked with an extra storeArg. Selector storeArg obj will consist of only getSelectors function while action storeArg will also contain getActions and getState functions.

Only use imports to:
 - Import all action types into the slice file.
 - Import all slice-selectors (and store-selectors to be slice-registered) into the slice file.
 - Import all slices into the store file.
 - Import the store file wherever you need a store-aware component. Get access to getSelectors/getActions.

<h3>Re-throw rejected action error</h3>
Whenever async action throws an error and completes rejected, after processing REJECTED action handler the error will be re-thrown back to action caller. This is unlike in @reduxjs/toolkit with redux-thunk, where if thunk action promise has thrown an error, the error is not re-thrown to action dispatcher, instead it is returned as error property of action result. This I believe is highly counter-intuitive as well as requires this awful snippet being anywhere error has to be re-thrown:

const { payload, error } = await dispatch(someThunkAction());<br/>
if (error) { throw error; }