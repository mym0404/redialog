# redialog

## 1.1.1

### Patch Changes

- 75eeac9: Manage screen-reader focus across portal dialogs with shared iOS and Android code. Hide normal content in all top-level hosts while a top-level dialog is active, including nested dialogs, and expose only the active dialog. Add optional accessibilityLabel, backdropAccessibilityLabel, initialFocusRef, and returnFocusRef to label dialogs and dismissible backdrops and configure initial focus and restoration after dismissal. Rename portalId to hostId and generate a stable ID for every host with useId() when omitted. Cache the active dialog selection and subscribe only to the accessibility conditions each component uses.

## 1.1.0

### Minor Changes

- edaa38f: Add `portalId` to `PortalHost`, `Portal`, and `Dialog` to target named hosts across the component tree. Support moving portals between hosts and waiting for a missing host to mount.
