# Workspace: confirm user changes asynchronously (deferred `onBeforeModelChange`)

Follow-up to #819.

## Use case

- Confirm before closing a tab with unsaved changes, using the app's own dialog ("Save changes before closing? Save / Discard / Cancel").
- Ask before moving a tab into a workspace that will migrate its data, or before accepting a large tabset.
- Check with a server before allowing a change (e.g. permissions, or whether a document is locked by someone else).

## Today

`onBeforeModelChange` (#819) is synchronous: it returns `true` to allow a change or `false` to block it. To confirm asynchronously, the app blocks the change, shows its dialog, and then makes the change itself with the imperative API, e.g.:

```tsx
<Workspace
  onBeforeModelChange={({ reason, removedTabs }) => {
    const dirty = removedTabs.filter((tab) => tab.data.isDirty);
    if (reason !== "close" || dirty.length === 0) {
      return true;
    }

    confirmClose(dirty).then((confirmed) => {
      if (confirmed) {
        // Closing a tabset removes all of its tabs (not only the dirty ones)
        for (const tab of removedTabs) {
          workspaceRef.current?.closeTab(tab.id);
        }
      }
    });

    return false;
  }}
/>
```

This works for closing, but has rough edges:

- The app has to redo each kind of change itself. The callback receives the full next `model`, but `setModel(model)` is reported as a "set-model" change (not the original reason), and the model it was computed from goes stale if anything changed while the dialog was open. Closing is easy to redo with `closeTab`; a drop or a resize needs the equivalent imperative calls.
- The redone change is reported with `isUserInteraction: false` (and isn't passed to `onBeforeModelChange`), so it looks different from the change the user made.
- Nothing shows that a change is pending, e.g. a tab whose close is waiting for the dialog.
- The model can change while the dialog is open (the user keeps working, or other code changes it), so the original change may not make sense any more.

## Proposal

Let the callback **defer** a change: `defer()` blocks it now and returns a handle that the app later uses to apply or cancel it.

```tsx
<Workspace
  onBeforeModelChange={(change) => {
    if (change.reason !== "close" || !change.canDefer) {
      return true;
    }

    const dirty = change.removedTabs.filter((tab) => tab.data.isDirty);
    if (dirty.length === 0) {
      return true;
    }

    const pending = change.defer();
    showUnsavedChangesDialog(dirty).then((choice) => {
      if (choice === "cancel") {
        pending.cancel();
      } else {
        pending.apply();
      }
    });

    return false;
  }}
/>
```

### API sketch

```ts
type BeforeModelChangeArgs<TabData, TabsetData> = {
  // ...existing fields (model, prevModel, reason, removedTabs, sourceInfo, sourceWorkspaceId)

  /** Whether this change can be deferred (see below) */
  canDefer: boolean;

  /** Blocks the change now; it can be applied later with the returned handle */
  defer: () => PendingModelChange;
};

type PendingModelChange = {
  /**
   * Applies the change, reported to onModelChanged with its original reason and isUserInteraction: true.
   * Returns false (and does nothing) if it can no longer be applied (see "Open questions").
   */
  apply: () => boolean;

  /** Discards the change (clearing any pending state) */
  cancel: () => void;
};
```

While a change is pending, the tabs and tabsets it affects could be marked, e.g. with `data-tab-pending` and `useParentTabState().isPending`, so the UI can show it (and a second close of the same tab could be ignored).

## Open questions

These are why this was split out of #819:

1. **Re-applying against a changed model.** If the model changes while a change is pending, should `apply()` redo the change on the current model (e.g. close the same tab ids, or move the same tab to the same target), or fail if the model differs at all? Redoing it is friendlier, but needs a description of each change (an operation, not a model snapshot). That's a larger internal refactor of how user changes are made: today they're `(prev) => next` functions.
2. **Which changes can be deferred.** Closes are the main case. Drops into another workspace probably can't be (the drag has ended, and the source workspace expects an answer when the drop happens; see `dragGroup`). Separator resizes are visually done already. Should deferring them snap back and then jump forward on `apply()`?
3. **Several pending changes.** Can more than one change be pending at a time? If so, in what order are they applied, and what happens when one conflicts with another (e.g. two pending closes of tabsets that share tabs)?
4. **Unmounting.** What happens to a pending change if the Workspace unmounts or `setModel` replaces the model? Probably cancel it automatically.
5. **Pending UI.** Is a `data-*` attribute plus a state hook enough, or should a pending change also block other interactions with the affected tabs?

## Alternatives

- Keep the synchronous callback only, and document the "block, then redo it with the imperative API" pattern (above). This may be enough if most async confirmations are for closing.
- Add a narrower `onBeforeTabClose(tabs): boolean | Promise<boolean>` prop just for closing, which avoids most of the open questions.
