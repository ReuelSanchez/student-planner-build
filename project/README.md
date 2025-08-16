# How to Build Your Android App (APK)

This project now includes the GitHub Actions workflow file needed to build your app! Getting your APK is easier than ever.

## Step 1: Generate and Convert Your Signing Key

First, you need a digital signature.

1.  **Generate Key:** Open a terminal in your project folder and run this command to create an `android.keystore` file.
    ```bash
    keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
    It will ask for a **password**. Remember this password!

2.  **Convert Key:** Go back to the Student Planner app (**Settings > Prepare for Android Build**) and use the **"Convert .keystore File to Secret"** tool. This will give you a long string of text. Copy it.

## Step 2: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **`KEY_STORE_PASSWORD`**: The password you created in Step 1.
2.  **`KEY_PASSWORD`**: The same password.
3.  **`KEY_STORE_BASE64`**: The long string of text you copied from the app.

## Step 3: Host Your App & Initialize Bubblewrap

Bubblewrap needs a live URL for your app's manifest.

1.  **Host Files:** Go to **https://app.netlify.com/drop** and drag the entire unzipped folder (the one this README is in) onto the website. Copy the public URL it gives you.

2.  **Initialize Project:** In your terminal, run the following command using your new URL. This creates essential Android project files.
    ```bash
    bubblewrap init --manifest https://your-netlify-url.netlify.app/manifest.json
    ```
    (Press `Enter` to accept the defaults for the questions).

## Step 4: Commit Everything and Push

This is the final step! The workflow file (`.github/workflows/build.yml`) is already in this project. You just need to commit it along with the new files from Bubblewrap.

```bash
git add .
git commit -m "Configure Android build"
git push
```

## Step 5: Run the Build

1.  Go to your GitHub repository and click the **"Actions"** tab.
2.  Find the **"Build Android App"** workflow and click "Run workflow".
3.  When it's done, you can download your `app-release-signed.apk` from the "Artifacts" section.
