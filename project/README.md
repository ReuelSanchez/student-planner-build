# How to Build Your Android App (APK)

**IMPORTANT:** The most common build error (`exit code 130`) is caused by using an outdated workflow file. Please follow these steps carefully.

## Step 1: Export and Update Your Project

1.  Click **"Export Project Files"** in the app. This downloads a `project.zip`.
2.  Unzip the file.
3.  **Replace ALL the old project files in your repository with these new files.** This is especially important for `.github/workflows/build.yml`.

## Step 2: Validate Your Workflow (Recommended)

To be sure you've updated correctly, use the **"Validate Workflow File"** tool in the app's settings. Paste the content of your new `build.yml` file into it to confirm it's correct. This can save you a lot of time debugging!

## Step 3: Generate and Convert Your Signing Key

1.  **Generate Key:** Open a terminal in your project folder and run this command to create an `android.keystore` file.
    ```bash
    keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
    It will ask for a **password**. Remember this password!

2.  **Convert Key:** Use the **"Convert .keystore File to Secret"** tool in the app. This will give you a long string of text. Copy it.

## Step 4: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **`KEY_STORE_PASSWORD`**: The password you created.
2.  **`KEY_PASSWORD`**: The same password.
3.  **`KEY_STORE_BASE64`**: The long string of text you copied from the app.

## Step 5: Commit, Push, and Run

1.  Commit all the new files to your GitHub repository and push them.
2.  Go to the **"Actions"** tab, find the **"Build Android App"** workflow, and click "Run workflow".
3.  Download your APK from the "Artifacts" section.
