# Pilot login instructions

## Where to sign in

1. Open **https://eos-pilot.rtbea.com.au/login** in a current desktop browser.
2. Confirm the address bar shows `eos-pilot.rtbea.com.au`. Do not use Production, Vercel `*.vercel.app` URLs, or any other RTB host.

## Founder / operator account

- **Email:** `silvestre.berso@rtbea.com.au`
- **Password:** the founder’s own platform password (not shared in this pack).
- **Tenant you should land in:** RTB Engineering Pilot LAUNCH-1.
- **Workspace:** RTB Engineering (Default Workspace).

If you cannot remember the password, use **Forgot password** on the login page. The reset link returns to the Engineering OS custom domain. Do **not** request a reset “just to test” if you can already sign in.

## How to sign in (password path)

The login screen has two email fields. For this pilot, use **password Sign In**, not SSO.

1. Ignore **Work email**, **Continue with organization SSO**, and **Continue with Microsoft** unless an operator explicitly tells you to use SSO.
2. In the lower **Email** field, enter `silvestre.berso@rtbea.com.au`.
3. In **Password**, enter the founder password.
4. Click **Sign In** (the solid button under the password field).
5. You should land on Command Centre (`/engineering`).

Do not click SSO first. `rtbea.com.au` can look like an organisation domain; this pilot’s certified path is password sign-in.

## Logout and login again

1. Click **Sign out** in the left sidebar (or header).
2. Confirm you are back on `/login`.
3. Sign in again with the same password path.

## Forgot-password path (only if needed)

1. From login, open **Forgot password** (`/forgot-password`).
2. Enter the founder email and click **Send reset link**.
3. Use the email that arrives. The link must return to `eos-pilot.rtbea.com.au`, not a break-glass or other-tenant host.
4. Set a new password and sign in with **Sign In**, not SSO.

Copy on this page may mention “Canonical Auth recovery”. That is internal wording, not a different product. Report it as LOW if it confuses you; do not treat it as a blocker.

## Do not

- Do not create an account via **Create one** / `/signup`.
- Do not sign in with Yahoo (`sberso2003@yahoo.com`) or any Worley identity.
- Do not accept a tenant switch into any tenant other than RTB Engineering Pilot LAUNCH-1.
- Do not start a trial, convert a subscription, or issue extra seats “to fix” access.
- Do not use Production.
