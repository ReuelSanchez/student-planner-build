# How to Build Your Android App (APK)

You're just a few steps away from creating an APK file for the Google Play Store! This package now includes placeholder icons, so you can build immediately.

## Step 1: Host Your App Files

The Bubblewrap tool needs your app to be on a public website. We'll use a free and simple service for this.

1.  Go to the website: https://app.netlify.com/drop
2.  Drag the **entire unzipped folder** you got from this export onto the Netlify website.
3.  Wait for it to upload. Netlify will give you a public URL for your site, like `https://some-cool-name.netlify.app`. **Copy this URL!**

## Step 2: Run Bubblewrap

Now, go back to your command prompt where you were running Bubblewrap.

1.  Run the initialization command again, but this time, use your new Netlify URL:
    ```bash
    bubblewrap init --manifest https://your-new-netlify-url.netlify.app/manifest.json
    ```
    (Replace the URL with the one you copied from Netlify).

2.  Bubblewrap will now ask you a series of questions. For most of them, you can just press `Enter` to accept the default.

3.  Once it's done, run the build command:
    ```bash
    bubblewrap build
    ```

That's it! Bubblewrap will create the `app-release-signed.apk` file in your current directory, which you can install on your phone for testing. You can replace the placeholder icons later with your own designs.