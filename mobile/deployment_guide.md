# Mobile App Deployment Guide

This guide explains how to deploy your Expo app to the **Google Play Store** and **Firebase App Distribution** using EAS (Expo Application Services).

## Prerequisites

1.  **Expo Account**: Ensure you are logged in to your Expo account (`npx expo login`).
2.  **EAS CLI**: Install the EAS CLI globally if you haven't already:
    ```bash
    npm install -g eas-cli
    ```
3.  **Google Play Developer Account**: You need a developer account to publish apps on the Play Store.

---

## Part 1: Firebase Configuration

Since you want to use Firebase, you need to set up a Firebase project and link it to your app.

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click **Add project** and follow the setup steps.

2.  **Add an Android App**:
    *   In your Firebase project settings, click the **Android** icon to add an app.
    *   **Android package name**: Enter `com.timepokerrs.app` (this matches your `app.json`).
    *   **App nickname**: (Optional) e.g., "TimePoker Mobile".
    *   Click **Register app**.

3.  **Download Config File**:
    *   Download the `google-services.json` file.
    *   **IMPORTANT**: Place this file in the `mobile/` directory of your project (next to `app.json`).

4.  **App Distribution Setup**:
    *   In the Firebase Console, go to **App Distribution** (under the "Release & Monitor" menu).
    *   Click **Get Started**.

---

## Part 2: Building for Firebase (Preview)

We have configured a `preview` profile in `eas.json` for internal testing via Firebase App Distribution.

1.  **Build the APK**:
    Run the following command in the `mobile/` directory:
    ```bash
    eas build --profile preview --platform android
    ```

2.  **Upload to Firebase**:
    *   Once the build finishes, download the `.apk` file from the Expo dashboard.
    *   Upload it to the **App Distribution** dashboard in Firebase.
    *   Add testers (email addresses) to invite them to test the app.

---

## Part 3: Building for Google Play Store (Production)

When you are ready to release to the public, use the `production` profile.

1.  **Build the App Bundle (.aab)**:
    Run the following command:
    ```bash
    eas build --profile production --platform android
    ```

2.  **Submit to Play Store**:
    *   You can manually upload the `.aab` file to the Google Play Console.
    *   OR, you can submit directly using EAS Submit:
        ```bash
        eas submit --platform android
        ```
        (You will need to provide your Google Play Service Account key for this).

---

## Summary of Commands

| Goal | Command | Output |
| :--- | :--- | :--- |
| **Test Locally** | `npx expo start --android` | Runs on Emulator/Device |
| **Build for Firebase** | `eas build --profile preview --platform android` | `.apk` file |
| **Build for Play Store** | `eas build --profile production --platform android` | `.aab` file |

> [!TIP]
> **Firebase Backend**: If you want to use Firebase for Authentication or Database, you will need to install the Firebase JS SDK (`npm install firebase`) and initialize it in your code using the config values from the Firebase Console. This guide focuses on **deployment**.
