# public/.well-known/

Digital Asset Links / Universal Links statement files. Both are spec-defined,
third-party-parsed formats (Google Play / Apple) - keep them to their plain
documented shape, no extra sibling keys, no comments embedded in the JSON.

## assetlinks.json (Android App Links)

**OWNER ACTION (pixel-fix F-53R6, not fixable by an agent):** Play Console >
[app] > Setup > App integrity > App signing > App signing key certificate >
"SHA-256 certificate fingerprint". Paste that colon-separated hex value into
`sha256_cert_fingerprints` in `assetlinks.json` (or run
`keytool -list -v -keystore <release.keystore>` against the real
release-signing keystore and copy its SHA256 line).

Until the `REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE` placeholder is replaced,
Android App Links verification for BOTH `/invite` and `/u` silently fails -
not a crash, just a fallback to an app-picker chooser instead of a direct
open.

(Fix-round r2, F53-N5: this note previously lived as a non-spec `comment`
key inside the JSON statement object itself - moved here so the file stays
a plain, spec-shaped two-key statement with zero risk of an unknown-key
rejection by Google's verifier the moment the real fingerprint is pasted in.)

## apple-app-site-association (iOS Universal Links)

No owner action pending; configured via `associatedDomains: applinks:crumbify.co.uk`
in the app's `app.json` (app repo).
