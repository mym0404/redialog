# Check Expo Go's Android Local-Network Permission

Decision date: 2026-10-31

## Observed Failure and Cause

On a fresh Android 17 emulator, Expo Go displayed `Failed to download remote update` while Metro was reachable from the host and ADB port forwarding was configured. Expo Go's declared `ACCESS_LOCAL_NETWORK` runtime permission was denied. Granting that permission and reloading made the same project load without source or Metro configuration changes.

[Android's local-network permission documentation](https://developer.android.com/privacy-and-security/local-network-permission) explains the permission requirement for apps targeting Android 17 or later. The native container owns this permission; changing dialog code cannot repair a denied development-server connection.

## Decision and Recurrence Guard

When a fresh Android device cannot download an Expo development project, check the container's local-network permission alongside the server URL and port forwarding before changing project dependencies, update configuration, or bundling code. Grant only the permission needed for the requested development connection. Use a supported settings interface; do not grant all permissions to bypass a loading failure.

Treat the permission as the cause only when a reload succeeds after changing it, or native diagnostics establish the denied connection. If the error persists with permission granted, investigate the actual network or update error instead.
