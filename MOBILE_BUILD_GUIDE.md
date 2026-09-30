# 📱 Community Emergency Response Platform (CERP) — Mobile Application Guide

This project is now fully optimized and ready to be built, tested, and deployed as a **Mobile Application** on **Android**, **iOS**, and **Progressive Web App (PWA)** platforms.

---

## 🎨 1. Built-in Role-Based Mobile UIs (Matching Presentation Slide)

The mobile app includes all 6 role interfaces as designed:

1. **🟦 Resident App (`RESIDENT`)**:
   - One-Tap **SOS Panic Button** with sound siren & location trigger.
   - Quick Tiles: My Incidents, Guardians List, Emergency Contacts, Community announcements.
   - Live incident tracking & status updates.

2. **🟩 Guardian App (`GUARDIAN`)**:
   - Real-time incoming SOS notification banner with resident info ("Ravi Kumar needs assistance").
   - GPS Location preview card & `[ Accept Incident ]` / `[ Decline ]` buttons.
   - Direct resident emergency message box & instant chat interface.

3. **🟧 Volunteer App (`VOLUNTEER`)**:
   - **Online / Offline Availability Toggle Switch**.
   - Nearby emergency incidents feed (Fall alert, Security concern, Medical) with `[ Accept ]` button.
   - Active response tracker & turn-by-turn map navigation.

4. **🟪 Security Officer App (`SECURITY`)**:
   - On-ground security dashboard with live alert feeds.
   - Guard dispatching, patrol status updates, and team intercom communication.

5. **🟨 Society Admin App (`SOCIETY_ADMIN`)**:
   - Green Valley Apartments metrics (Residents, Responders, Security Staff, Active Incidents).
   - Resident/Guard management, emergency protocol settings & audit logs.

6. **🟪 Platform Admin App (`PLATFORM_ADMIN`)**:
   - Multi-society platform metrics (24 Societies, 1,482 Users, 56 Active Incidents, 98% Response Rate).
   - Platform escalation rules, Twilio/Firebase configuration & system-wide analytics.

---

## 📲 2. How to Test Mobile App in Browser / PWA

### Step A: Run Frontend Development Server
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser. 
- Open Chrome DevTools (`F12`), toggle **Mobile Device Emulation** (`Ctrl + Shift + M`), and select **iPhone 14 Pro** or **Pixel 7**.
- Use the **Role Simulator Dropdown** in the header to switch between all 6 role screens live!

### Step B: Install as Progressive Web App (PWA) on Phone
1. Open the hosted URL or local server IP on your phone's Chrome or Safari browser.
2. Tap **Share / Options** -> **"Add to Home Screen"**.
3. Launch the app directly from your home screen as a standalone full-screen mobile app.

---

## 🤖 3. How to Build Native Android App (`.apk`) via Capacitor

### Prerequisites:
- Node.js installed
- Android Studio installed on your computer

### Steps:
1. Open terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Build web assets:
   ```bash
   npm run build
   ```
3. Add Android platform:
   ```bash
   npx cap add android
   ```
4. Copy web assets to Android:
   ```bash
   npx cap copy
   ```
5. Open in Android Studio:
   ```bash
   npx cap open android
   ```
6. In **Android Studio**, click **Build** -> **Build APK(s)** to generate your native `.apk` file for mobile phones!

---

## 🍎 4. How to Build Native iOS App (`.ipa`) via Capacitor

### Prerequisites:
- macOS computer with **Xcode** installed

### Steps:
```bash
cd frontend
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap copy
npx cap open ios
```
In **Xcode**, select your connected iPhone or Simulator and press **Run (Cmd + R)**.

---

## 🛠️ Summary of Created / Modified Files

- [`frontend/capacitor.config.json`](file:///c:/Users/user/Desktop/Web%20based%20community%20emergency%20response%20platform/frontend/capacitor.config.json): Capacitor mobile config.
- [`frontend/public/manifest.json`](file:///c:/Users/user/Desktop/Web%20based%20community%20emergency%20response%20platform/frontend/public/manifest.json): PWA web manifest.
- [`frontend/src/views/DashboardView.jsx`](file:///c:/Users/user/Desktop/Web%20based%20community%20emergency%20response%20platform/frontend/src/views/DashboardView.jsx): Dynamic 6-role mobile interface views matching the slide design.
- [`frontend/src/api/client.js`](file:///c:/Users/user/Desktop/Web%20based%20community%20emergency%20response%20platform/frontend/src/api/client.js): Updated demo credentials & color themes for all 6 roles.
- [`frontend/package.json`](file:///c:/Users/user/Desktop/Web%20based%20community%20emergency%20response%20platform/frontend/package.json): Added `mobile:build`, `mobile:android`, `mobile:ios` scripts.
