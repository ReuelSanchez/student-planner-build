import React, { useState, useRef } from 'react';
import Modal from './common/Modal.js';

// Make JSZip and saveAs available from the global scope (loaded via CDN in index.html)

const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false
}) => /*#__PURE__*/React.createElement("label", {
  className: "relative inline-flex items-center cursor-pointer"
}, /*#__PURE__*/React.createElement("input", {
  type: "checkbox",
  checked: checked,
  onChange: onChange,
  disabled: disabled,
  className: "sr-only peer"
}), /*#__PURE__*/React.createElement("div", {
  className: "w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"
}));
const SettingsScreen = ({
  notificationsEnabled,
  onSetNotificationsEnabled
}) => {
  const [permissionStatus] = useState(Notification.permission);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportNumericProgress, setExportNumericProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [keystoreSecret, setKeystoreSecret] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const [isValidatorModalOpen, setIsValidatorModalOpen] = useState(false);
  const [userWorkflowContent, setUserWorkflowContent] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const handleToggleChange = async () => {
    if (!notificationsEnabled) {
      // User is trying to enable
      if (Notification.permission === 'granted') {
        onSetNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onSetNotificationsEnabled(true);
        } else {
          onSetNotificationsEnabled(false);
        }
      }
    } else {
      // User is trying to disable
      onSetNotificationsEnabled(false);
    }
  };
  const generatePlaceholderIcon = (size, text, isMaskable = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.fillRect(0, 0, size, size);
    if (isMaskable) {
      const circleRadius = size * 0.4;
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, circleRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = `bold ${size / 4}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    return canvas.toDataURL('image/png');
  };
  const getCorrectWorkflowContent = () => `name: Build Android App

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Bubblewrap and HTTP Server
      run: |
        npm install -g @bubblewrap/cli
        npm install -g http-server

    - name: Start local server for PWA files
      run: http-server . &

    - name: Wait for server to be ready
      run: sleep 5
      
    - name: Initialize Bubblewrap Project
      # This step creates the twa-manifest.json and other Android project files
      # by fetching the manifest from the local server. This automates the manual
      # 'bubblewrap init' step that was previously required.
      run: bubblewrap init --manifest http://127.0.0.1:8080/manifest.json

    - name: Decode Keystore
      run: echo "$\{{ secrets.KEY_STORE_BASE64 }}" | base64 --decode > android.keystore
      env:
        KEY_STORE_BASE64: $\{{ secrets.KEY_STORE_BASE64 }}

    - name: Build the Android App
      # The 'yes' command automatically answers 'y' to any prompts from the build tool.
      run: yes | bubblewrap build --skipPwaValidation --keystore android.keystore
      env:
        KEY_STORE_PASSWORD: $\{{ secrets.KEY_STORE_PASSWORD }}
        KEY_PASSWORD: $\{{ secrets.KEY_PASSWORD }}

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: student-planner-apk
        path: app-release-signed.apk
`;
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress('Initializing...');
    setExportNumericProgress(0);
    await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI to update

    try {
      const zip = new JSZip();
      const filePaths = ['index.html', 'index.css', 'manifest.json', 'sw.js', 'types.ts', 'contexts/ThemeContext.tsx', 'constants.tsx', 'services/geminiService.ts', 'services/notificationService.ts', 'components/common/Spinner.tsx', 'components/common/Modal.tsx', 'components/DayDetailModal.tsx', 'components/MonthlyCalendar.tsx', 'components/AddAssignmentModal.tsx', 'components/AddCourseModal.tsx', 'components/CourseDetailModal.tsx', 'components/ShareReceiverScreen.tsx', 'components/DashboardScreen.tsx', 'components/ScheduleScreen.tsx', 'components/GradesScreen.tsx', 'components/ScannerScreen.tsx', 'components/SolverScreen.tsx', 'components/SettingsScreen.tsx', 'components/AuthScreen.tsx', 'App.tsx', 'index.tsx'];
      setExportProgress('Fetching source files...');
      setExportNumericProgress(5);
      const responses = await Promise.all(filePaths.map(path => fetch(path)));
      const fileContents = {};
      for (let i = 0; i < filePaths.length; i++) {
        if (!responses[i].ok) throw new Error(`Could not fetch ${filePaths[i]}`);
        fileContents[filePaths[i]] = await responses[i].text();
      }
      if (typeof Babel === 'undefined') throw new Error("Babel is not loaded.");
      const scriptPaths = filePaths.filter(p => p.endsWith('.ts') || p.endsWith('.tsx'));
      const transpiledFilePaths = [];
      const transpiledFiles = {};
      for (let i = 0; i < scriptPaths.length; i++) {
        const path = scriptPaths[i];
        const progress = 10 + Math.round((i + 1) / scriptPaths.length * 60);
        setExportProgress(`Transpiling (${i + 1}/${scriptPaths.length}): ${path}`);
        setExportNumericProgress(progress);
        let code = fileContents[path];
        code = code.replace(/from '(\.\.?\/[^']*)(\.tsx|\.ts)';/g, "from '$1.js';");
        const transformed = Babel.transform(code, {
          presets: ['react', 'typescript'],
          filename: path
        }).code;
        const newPath = path.replace(/\.tsx?$/, '.js');
        transpiledFiles[newPath] = transformed;
        transpiledFilePaths.push(newPath);
        if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }
      setExportProgress('Creating application structure...');
      setExportNumericProgress(75);
      for (const path in transpiledFiles) {
        zip.file(path, transpiledFiles[path]);
      }
      const originalHtml = fileContents['index.html'];
      const importMapMatch = originalHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/s);
      const importMap = importMapMatch ? importMapMatch[0] : '';
      const productionHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Student Digital Planner</title><link rel="manifest" href="manifest.json" /><meta name="theme-color" content="#0284c7" /><link rel="apple-touch-icon" href="icon-192.png"><script src="https://cdn.tailwindcss.com"></script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="index.css"><script>if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.documentElement.classList.add('dark'); document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f172a'); } else { document.documentElement.classList.remove('dark'); document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0284c7'); }</script><style> body { font-family: 'Inter', sans-serif; } </style><script> tailwind.config = { darkMode: 'class' } </script>${importMap}</head><body><div id="root"></div><script type="module" src="index.js"></script><script>if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js'); }); }</script></body></html>`;
      zip.file('index.html', productionHtml);
      let swJs = fileContents['sw.js'];
      const precacheAssets = ['./', 'index.html', 'index.css', 'manifest.json', ...transpiledFilePaths, 'icon-192.png', 'icon-512.png', 'maskable-icon-512.png', 'icons/shortcut-schedule-96.png', 'icons/shortcut-grades-96.png', 'icons/shortcut-scanner-96.png'];
      swJs = swJs.replace(/const PRECACHE_ASSETS = \[[\s\S]*?\];/, `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 4)};`);
      zip.file('sw.js', swJs);
      zip.file('index.css', fileContents['index.css']);
      zip.file('manifest.json', fileContents['manifest.json']);
      setExportProgress('Generating assets...');
      setExportNumericProgress(85);
      zip.file('icon-192.png', generatePlaceholderIcon(192, '192').split(',')[1], {
        base64: true
      });
      zip.file('icon-512.png', generatePlaceholderIcon(512, '512').split(',')[1], {
        base64: true
      });
      zip.file('maskable-icon-512.png', generatePlaceholderIcon(512, 'M', true).split(',')[1], {
        base64: true
      });
      const iconsFolder = zip.folder('icons');
      iconsFolder.file('shortcut-schedule-96.png', generatePlaceholderIcon(96, 'Sch').split(',')[1], {
        base64: true
      });
      iconsFolder.file('shortcut-grades-96.png', generatePlaceholderIcon(96, 'Grd').split(',')[1], {
        base64: true
      });
      iconsFolder.file('shortcut-scanner-96.png', generatePlaceholderIcon(96, 'Scan').split(',')[1], {
        base64: true
      });
      setExportProgress('Creating build files...');
      setExportNumericProgress(95);
      zip.file('.github/workflows/build.yml', getCorrectWorkflowContent());
      const readmeContent = `# How to Build Your Android App (APK)

**IMPORTANT:** The most common build error (\`exit code 130\`) is caused by using an outdated workflow file. Please follow these steps carefully.

## Step 1: Export and Update Your Project

1.  Click **"Export Project Files"** in the app. This downloads a \`project.zip\`.
2.  Unzip the file.
3.  **Replace ALL the old project files in your repository with these new files.** This is especially important for \`.github/workflows/build.yml\`.

## Step 2: Validate Your Workflow (Recommended)

To be sure you've updated correctly, use the **"Validate Workflow File"** tool in the app's settings. Paste the content of your new \`build.yml\` file into it to confirm it's correct. This can save you a lot of time debugging!

## Step 3: Generate and Convert Your Signing Key

1.  **Generate Key:** Open a terminal in your project folder and run this command to create an \`android.keystore\` file.
    \`\`\`bash
    keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
    \`\`\`
    It will ask for a **password**. Remember this password!

2.  **Convert Key:** Use the **"Convert .keystore File to Secret"** tool in the app. This will give you a long string of text. Copy it.

## Step 4: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **\`KEY_STORE_PASSWORD\`**: The password you created.
2.  **\`KEY_PASSWORD\`**: The same password.
3.  **\`KEY_STORE_BASE64\`**: The long string of text you copied from the app.

## Step 5: Commit, Push, and Run

1.  Commit all the new files to your GitHub repository and push them.
2.  Go to the **"Actions"** tab, find the **"Build Android App"** workflow, and click "Run workflow".
3.  Download your APK from the "Artifacts" section.
`;
      zip.file("README.md", readmeContent);
      setExportProgress('Packaging project...');
      setExportNumericProgress(98);
      const content = await zip.generateAsync({
        type: "blob"
      });
      saveAs(content, "project.zip");
      setIsExporting(false);
      setExportProgress('Build successful! Your download will start now.');
      setExportNumericProgress(100);
      setIsInstructionModalOpen(true);
    } catch (error) {
      console.error("Failed to export project:", error);
      const errorMessage = `Build failed: ${error instanceof Error ? error.message : String(error)}`;
      setExportProgress(errorMessage);
      setIsExporting(false);
    } finally {
      setTimeout(() => setExportProgress(null), 5000);
    }
  };
  const handleKeystoreFileChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result;
      const base64String = dataUrl.split(',')[1];
      if (base64String) {
        setKeystoreSecret(base64String);
        setIsSecretModalOpen(true);
        setCopyButtonText('Copy to Clipboard');
      } else {
        alert('Could not read the file. Please ensure it is a valid keystore file.');
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  const handleCopySecret = () => {
    navigator.clipboard.writeText(keystoreSecret).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };
  const handleValidateWorkflow = () => {
    if (!userWorkflowContent.trim()) {
      setValidationResult('empty');
      return;
    }
    // The key is the 'yes' command which prevents the interactive prompt.
    if (userWorkflowContent.includes('run: yes | bubblewrap build')) {
      setValidationResult('valid');
    } else {
      setValidationResult('invalid');
    }
  };
  const handleCopyCorrectWorkflow = () => {
    navigator.clipboard.writeText(getCorrectWorkflowContent()).then(() => {
      alert('Correct workflow content copied to clipboard!');
      setIsValidatorModalOpen(false);
    });
  };
  const isToggleDisabled = permissionStatus === 'denied';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Modal, {
    isOpen: isSecretModalOpen,
    onClose: () => setIsSecretModalOpen(false),
    title: "Your GitHub Secret"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Copy this value and save it as a new GitHub secret named ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded text-sky-600 dark:text-sky-400"
  }, "KEY_STORE_BASE64"), "."), /*#__PURE__*/React.createElement("textarea", {
    readOnly: true,
    value: keystoreSecret,
    className: "w-full h-32 p-2 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleCopySecret,
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700"
  }, copyButtonText))), /*#__PURE__*/React.createElement(Modal, {
    isOpen: isInstructionModalOpen,
    onClose: () => setIsInstructionModalOpen(false),
    title: "Export Successful! Next Steps"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 text-sm text-slate-700 dark:text-slate-300"
  }, /*#__PURE__*/React.createElement("p", null, "Your project has been exported as ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded"
  }, "project.zip"), "."), /*#__PURE__*/React.createElement("ol", {
    className: "list-decimal list-inside space-y-2"
  }, /*#__PURE__*/React.createElement("li", null, "Unzip the downloaded file."), /*#__PURE__*/React.createElement("li", null, "**Replace all old files** in your repository with the new ones."), /*#__PURE__*/React.createElement("li", null, "Follow the instructions in the new ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono"
  }, "README.md"), " file.")), /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-sky-50 dark:bg-sky-500/10 rounded-lg text-sky-800 dark:text-sky-200"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold"
  }, "Workflow is Now Automated!"), /*#__PURE__*/React.createElement("p", null, "The new ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono text-xs"
  }, "build.yml"), " file handles everything. If you still have issues, use the new **Workflow Validator** tool.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsInstructionModalOpen(false),
    className: "w-full mt-2 py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg"
  }, "Got It"))), /*#__PURE__*/React.createElement(Modal, {
    isOpen: isValidatorModalOpen,
    onClose: () => setIsValidatorModalOpen(false),
    title: "Workflow Validator"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Paste the content of your ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded"
  }, ".github/workflows/build.yml"), " file here to check if it's correct."), /*#__PURE__*/React.createElement("textarea", {
    value: userWorkflowContent,
    onChange: e => setUserWorkflowContent(e.target.value),
    placeholder: "Paste your workflow YAML content here...",
    className: "w-full h-40 p-2 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleValidateWorkflow,
    className: "w-full py-2 bg-sky-600 text-white font-semibold rounded-lg"
  }, "Validate File"), validationResult === 'valid' && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium"
  }, "\u2705 Your workflow file is up-to-date! You are ready to build."), validationResult === 'invalid' && /*#__PURE__*/React.createElement("div", {
    className: "p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200 rounded-lg text-sm space-y-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold"
  }, "\u274C Your workflow file is outdated!"), /*#__PURE__*/React.createElement("p", null, "This is the likely cause of the ", /*#__PURE__*/React.createElement("code", {
    className: "font-mono text-xs"
  }, "exit code 130"), " error. The build command is missing the part that auto-confirms prompts."), /*#__PURE__*/React.createElement("button", {
    onClick: handleCopyCorrectWorkflow,
    className: "w-full py-2 bg-red-600 text-white font-semibold rounded-lg"
  }, "Copy Correct Workflow")), validationResult === 'empty' && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-center text-amber-600 dark:text-amber-400"
  }, "Please paste your workflow content into the box."))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100"
  }, "Enable Notifications"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "Get reminders for classes and assignments.")), /*#__PURE__*/React.createElement(ToggleSwitch, {
    checked: notificationsEnabled && permissionStatus === 'granted',
    onChange: handleToggleChange,
    disabled: isToggleDisabled
  })), isToggleDisabled && /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs text-center text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg"
  }, "Notification permissions are blocked in your browser settings.")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "Generate APK Build Workflow"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400 mb-4"
  }, "A 3-step process to package your app and generate a reliable, automated GitHub workflow to build your APK.")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold"
  }, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-slate-800 dark:text-slate-100"
  }, "Export Project & Workflow"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400 mb-3"
  }, "Compiles your app and bundles it with the correct GitHub workflow file."), /*#__PURE__*/React.createElement("button", {
    onClick: handleExport,
    disabled: isExporting,
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400"
  }, isExporting ? 'Building...' : 'Export Project Files'))), (isExporting || exportProgress) && /*#__PURE__*/React.createElement("div", {
    className: "pl-12 space-y-2"
  }, isExporting && /*#__PURE__*/React.createElement("div", {
    className: "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-sky-600 h-2.5 rounded-full",
    style: {
      width: `${exportNumericProgress}%`
    }
  })), exportProgress && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-center text-slate-500 dark:text-slate-400"
  }, exportProgress))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold"
  }, "2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-slate-800 dark:text-slate-100"
  }, "Validate Workflow File"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400 mb-3"
  }, "If your build fails, paste your workflow file here to diagnose the issue. This tool can fix the `exit code 130` error."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setValidationResult(null);
      setUserWorkflowContent('');
      setIsValidatorModalOpen(true);
    },
    className: "w-full py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
  }, "Open Workflow Validator")))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold"
  }, "3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-slate-800 dark:text-slate-100"
  }, "Prepare Signing Key & Secrets"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400 mb-3"
  }, "Generate an `android.keystore` file (see README) and use this tool to convert it into a secret for GitHub."), /*#__PURE__*/React.createElement("input", {
    type: "file",
    ref: fileInputRef,
    className: "hidden",
    onChange: handleKeystoreFileChange,
    accept: ".keystore,*"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => fileInputRef.current?.click(),
    className: "w-full py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
  }, "Convert .keystore File to Secret"))))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "About"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "This Student Digital Planner helps you organize your academic life. All your data is stored securely on your device."), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-xs text-slate-400 dark:text-slate-500"
  }, "Version 2.5.0"))));
};
export default SettingsScreen;