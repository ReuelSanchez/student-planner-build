# How to Build Your Android App (APK)

The build process is now almost fully automated. You no longer need to run `bubblewrap init` yourself.

## Step 1: Generate and Convert Your Signing Key

First, you need a digital signature for your app.

1.  **Generate Key:** Open a terminal in your project folder and run this command to create an `android.keystore` file.
    ```bash
    keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
    It will ask for a **password**. Remember this password!

2.  **Convert Key:** Go back to the Student Planner app (**Settings > Automated Android Build**) and use the **"Convert .keystore File to Secret"** tool. This will give you a long string of text. Copy it.

## Step 2: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **`KEY_STORE_PASSWORD`**: The password you created in Step 1.
2.  **`KEY_PASSWORD`**: The same password.
3.  **`KEY_STORE_BASE64`**: The long string of text you copied from the app.

## Step 3: Commit and Push

Unzip this project, commit all the files to your GitHub repository, and push them.

```bash
# (After unzipping)
git add .
git commit -m "Initial project setup for Android build"
git push
```

## Step 4: Run the Build

That's it!

1.  Go to your GitHub repository and click the **"Actions"** tab.
2.  Find the **"Build Android App"** workflow and click "Run workflow".
3.  When it finishes, you can download your `app-release-signed.apk` from the "Artifacts" section.
