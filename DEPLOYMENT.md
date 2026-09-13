# Hostinger deployment

This project deploys the contents of `dist` to the existing site's
`public_html` folder. The site-specific FTP account opens directly inside
`public_html`, so the workflow's remote directory is `./`. The domain, DNS,
and Firebase video collection stay on their existing services.

## Connection settings

In GitHub Settings → Secrets and variables → Actions, add repository secrets:

- `FTP_SERVER`: Hostinger server address without `ftp://`.
- `FTP_USERNAME`: the site's FTP username.
- `FTP_PASSWORD`: the FTP password.

The workflow uses encrypted FTPS on port 21 with certificate verification.
If connecting by IP produces a certificate hostname error, obtain the
matching FTPS hostname from Hostinger and add it as the repository variable
`FTPS_HOSTNAME`. Do not disable certificate verification.

Public Firebase and App Check configuration comes from the existing checked-in
deployment ZIP. Override any `VITE_FIREBASE_*` setting or
`VITE_RECAPTCHA_SITE_KEY` with a repository variable if the project changes.
These values are included in the browser bundle; FTP credentials remain secrets.

## First deployment

1. Download a backup of the existing `public_html`, including `.htaccess`.
2. In GitHub Actions, select **Deploy to Hostinger** → **Run workflow**.
3. Choose `main` and leave **Upload to the live website** unchecked. This
   builds and previews the file changes without uploading them.
4. Confirm the site-specific FTP account opens directly in the existing
   website's `public_html` root.
5. Run again with **Upload to the live website** checked to deploy.
6. Check the homepage, actual video playback, activities on an unwatched
   story, and a direct `/video/ang-ama` URL. Clear Hostinger cache if needed.

The workflow preserves `.htaccess` and does not wipe the destination folder.
On later deployments it synchronizes files it manages, including removing
obsolete managed assets. Files from the old manual deployment that it never
managed remain in place.

## Later updates

Commit and push changes to `main`, then manually run the workflow with upload
checked. Automatic deployment on push is not enabled yet; enable it after
the first deployment works. When adding a `push` trigger, also change
`dry-run` to `${{ github.event_name == 'workflow_dispatch' && !inputs.deploy }}`
so push-triggered runs upload and manual preview runs still work.

Vite rebuilds the application, so an edit may produce newly named JS/CSS
bundles rather than an upload of only the edited source file. The deployment
action compares build files against its previous deployment state.
