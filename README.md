<h2>Description:</h2>

React global store based exclusively on build-in React hooks, useState and useEffect. General structure inspired by @reduxjs/toolkit.

<h2>Improvements:</h2>

<h3>Dispatch</h3>
No more dispatch!<br/>
All actions created using either createAction or createAsyncAction are self-dispatchable.<br/>

<h3>Circular imports</h3>
Strict creation/registration order policy.<br/>
All store elements actions/selectors/slices must be created following creation order/rules:
<ul>
  <li>Actions and slice-registered selectors must be created before their slice.</li>
  <li>Store-registered selectors must be created before their store.</li>
  <li>Slice must be created before their store.</li>
  <li>Slice must register all actions by having action handler in the reducer object, or action type passed to noHandlerTypes.</li>
  <li>Slice must register all slice selectors by passing them to sliceSelectors.</li>
  <li>Store must be created after all actions/selectors/slices.</li>
  <li>Store must register all slices by passing them to storeSlices.</li>
  <li>Store must register all store selectors not registered directly in any of the slices, by passing them to storeSelectors.</li>
</ul>

No more circular imports!<br/>
Thanks to strict creation/registration policy all store actions/selectors which will ever be valid for the store, have been created and registered within the store on creation and are immediately available through store getActions/getSelectors functions. That allows (and its recommended) to abandon usage of standard, prone-to-be-circular esm imports within actions, selectors and store-aware components files.

Only import actions/selectors using standard esm import to:
<ul>
  <li>Import all action types into the slice file.</li>
  <li>Import all slice-selectors (and store-selectors to be slice-registered) into the slice file.</li>
  <li>Import all slices into the store file.</li>
  <li>Import the store file wherever you need a store-aware component. Get access to getSelectors/getActions.</li>
</ul>

Use store importAction/importSelector to:
<ul>
  <li>Import to action file.</li>
  <li>Import to selector file.</li>
  <li>Import to store-aware component.</li>
</ul>

<h3>Re-throw rejected action error</h3>
Whenever async action throws an error and completes rejected, after processing REJECTED action handler the error will be re-thrown back to action caller. This is unlike in @reduxjs/toolkit with redux-thunk, where if thunk action promise has thrown an error, the error is not re-thrown to action dispatcher, instead it is returned as error property of action result. This I believe is highly counter-intuitive as well as requires this awful snippet being anywhere error has to be re-thrown:<br/>

const { payload, error } = await dispatch(someThunkAction());<br/>
if (error) { throw error; }