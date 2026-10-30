# Domain Contracts

## Domain Glossary

- **Dialog**: an overlay controlled through imperative `show` and `hide` methods. Its presentation can be centered or a bottom sheet.
- **Dialog handle**: the ref and controls supplied by `useDialog`; `DialogHandle` exposes them through a render function.
- **Dialog parameters**: data passed to a typed `show` call and exposed to a custom dialog through `useDialogProps`.
- **Backdrop**: the layer behind dialog content, optionally pressable to dismiss the dialog.
- **Portal**: content rendered into a host instead of at the caller's location.
- **Portal host**: a destination that owns rendered portal content in its surrounding native layout.
- **Named host**: a mounted host addressed by `portalId`, independent of the caller's ancestor chain.

## Dialog Lifecycle

Showing a dialog makes its content available for rendering. Hiding starts dismissal; content remains mounted until hide completion, then unmounts. Parameterized dialogs retain their parameters during dismissal and clear them through the hide-end callback. Preserve that callback when composing dialog props.

Backdrop dismissal and Android hardware-back dismissal are independently configurable. A visible dialog consumes the Android back event when back-press dismissal is enabled.

## Portal Routing

- Without `portalId`, a `Portal` selects the nearest ancestor host and throws when none exists.
- Without an ID, a `Dialog` renders inline unless `portal` is enabled. Supplying `portalId` enables portal rendering by itself.
- Named IDs must be unique among mounted hosts in the same library runtime. Duplicate registration throws; unmounting a host releases its ID.
- An explicitly named destination never falls back to an ancestor. Missing hosts render no content until the destination mounts. Removal and later remounting follow the same rule.
- Changing a host's ID updates its registration. Changing a portal's destination removes its content from the old host and mounts it in the new one; child-local state can reset. An ordinary rerender of the same host must preserve child state.
- An unmounted portal must not leave content behind, including when unmount happens before deferred mounting completes. Removing one portal must not remove another portal sharing its host.
- Hosts render within their own native layout. Portal routing alone does not create a native modal, move accessibility focus, or trap focus.

The public API documentation and portal tests are the authoritative executable counterparts of these contracts.
