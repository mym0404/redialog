# Verify TalkBack Independently of UI Automation

Decision date: 2026-10-31

## Observed Failure and Cause

The Android automation snapshot included views hidden from accessibility, and TalkBack stopped handling gestures while UI automation was connected. An enabled service in Settings did not establish that TalkBack was running: system diagnostics showed no bound TalkBack service and disabled touch exploration during automation.

Android's [UiAutomation API](https://developer.android.com/reference/android/app/UiAutomation#FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES) suppresses accessibility services by default unless the client explicitly opts out. Automation clients can also include views that ordinary screen-reader navigation excludes. Their tree is not a direct account of TalkBack's reachable controls.

## Decision and Recurrence Guard

Keep component accessibility assertions and automation-tree checks separate from live TalkBack evidence. For live testing, use an isolated device, disconnect clients that suppress accessibility services, and confirm that TalkBack is bound with touch exploration enabled. Verify the focus indicator during navigation and after opening or closing the dialog. Restore the device's previous accessibility settings afterward.

Verify the input path too: shell-injected gestures did not reproduce TalkBack navigation reliably in the tested emulator. Sending touchscreen events through the emulator controller produced the expected selection, double-tap activation, and swipe navigation while TalkBack remained bound. Use a real touchscreen input path when shell gestures do not behave as screen-reader gestures; do not treat an ordinary app click as proof of TalkBack activation.

Do not remove accessibility hiding merely because an automation snapshot still contains hidden nodes. Do not report TalkBack verification from enabled settings alone. If a future automation client claims concurrent screen-reader support, require evidence that its connection preserves the bound TalkBack service and real focus movement before combining these checks.
