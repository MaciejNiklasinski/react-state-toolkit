<h2>Description:</h2>

React global store based exclusively on React build-in hooks useEffect, useMemo, useRef and useState. General structure inspired by @reduxjs/toolkit.

<h2>Installation:</h2>

<code>yarn add react-state-toolkit</code><br/>

<h2>Improvements:</h2>

<h3>Dispatch</h3>
No more dispatch!<br/>
Working with redux there is dispatch everywhere. Personally I never perceived any value in having it and I am of the opinion that code can be much cleaner if dispatch will be obfuscated behind the action. In react-state-toolkit there is no dispatch visible for the action caller! All actions created using either createAction or createAsyncAction are self-dispatchable.<br/>

<h3>Strict creation/registration policy requirements/order</h3>
If it built, it works!<br/>
Working with redux or redux with @reduxjs/toolkit, is prone to time-consuming debugging of errors caused by simple mistakes like for example forgetting to create/assign action handler for newly created action. Strict creation/registration policy should prevent that! Store creation follows a very strict set of rules which throws descriptive errors whenever any of them is violated. This should cause majority of aforementioned issues to be flagged by such error preventing application from building entirely.<br/><br/>

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

<h3>Sudo actions/selectors imports</h3>
No more broken circular imports!<br/>
Thanks to strict creation/registration policy all store actions/selectors which will ever be valid for the store, have been created and registered within the store on creation and are immediately available through store getActions/getSelectors functions. That allows (and its recommended) to substitute usage of standard, prone-to-be-circular esm imports when importing actions or selectors into actions, selectors and store-aware components files, with sudo-import via store created importer importAction/importSelector functions. Using these will ensure imports validation (descriptive errors on either import attempt or store creation) and will also allow for safe circular imports.<br/><br/>

Only import actions/selectors using standard esm import to:
<ul>
  <li>Import all action types into the slice file.</li>
  <li>Import all slice-selectors (and store-selectors to be slice-registered) into the slice file.</li>
  <li>Import all slices into the store file.</li>
  <li>Import the store file wherever you need a store-aware component. Get access to getSelectors/getActions.</li>
</ul>

Use store importer importAction/importSelector sudo-import functions to:
<ul>
  <li>Import to action file.</li>
  <li>Import to selector file.</li>
  <li>Import to store-aware component.</li>
</ul>

<h3>Re-throw rejected action error</h3>
When working with @redux/toolkit with redux-thunk combination, one of highly counter-intuitive problems is the fact that REJECTED thunk actions do not throw an error back to dispatcher. Instead the promise will resolve with status "fulfilled" and returned action result will contain error property. This I believe is highly counter-intuitive as well as requires this awful snippet to handle it with re-throw:<br/><br/>

<pre><code>const { payload, error } = await dispatch(someThunkAction());
if (error) { throw error; }</code></pre><br/><br/>

Actions created with createAction and createAsyncAction will rethrow the error back to the caller! (After processing REJECTED action handler if such registered for async acton) And can be handle as shown:<br/><br/>

<pre><code>try {
  const { payload } = await someAction();
  return payload;
} catch (error) {
  console.log(error);
  throw error;
}</code></pre>