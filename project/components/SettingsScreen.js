import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Modal from './common/Modal.tsx';

// Make JSZip and saveAs available from the global scope (loaded via CDN in index.html)
declare var JSZip: any;
declare var saveAs: any;
declare var Babel: any;

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
  </label>
);

interface SettingsScreenProps {
  notificationsEnabled: boolean;
  onSetNotificationsEnabled: (enabled: boolean) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ notificationsEnabled, onSetNotificationsEnabled }) => {
  const [permissionStatus] = useState<NotificationPermission>(Notification.permission);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [keystoreSecret, setKeystoreSecret] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  const handleToggleChange = async () => {
    if (!notificationsEnabled) { // User is trying to enable
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
    } else { // User is trying to disable
      onSetNotificationsEnabled(false);
    }
  };
  
    const generatePlaceholderIcon = (size: number, text: string, isMaskable = false): string => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
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

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress('Initializing build...');
    try {
        const zip = new JSZip();

        // 1. Define all source files
        const filePaths = [
            'index.html', 'index.css', 'manifest.json', 'sw.js',
            'types.ts',
            'contexts/ThemeContext.tsx',
            'constants.tsx',
            'services/geminiService.ts',
            'services/notificationService.ts',
            'components/common/Spinner.tsx',
            'components/common/Modal.tsx',
            'components/DayDetailModal.tsx',
            'components/MonthlyCalendar.tsx',
            'components/AddAssignmentModal.tsx',
            'components/AddCourseModal.tsx',
            'components/CourseDetailModal.tsx',
            'components/ShareReceiverScreen.tsx',
            'components/DashboardScreen.tsx',
            'components/ScheduleScreen.tsx',
            'components/GradesScreen.tsx',
            'components/ScannerScreen.tsx',
            'components/SolverScreen.tsx',
            'components/SettingsScreen.tsx',
            'components/AuthScreen.tsx',
            'App.tsx',
            'index.tsx',
        ];

        // 2. Fetch all file contents sequentially to show progress
        const fileContents: { [key: string]: string } = {};
        for (const [index, path] of filePaths.entries()) {
            setExportProgress(`Fetching source files (${index + 1}/${filePaths.length})...`);
            const res = await fetch(path);
            if (!res.ok) throw new Error(`Could not fetch ${path}`);
            fileContents[path] = await res.text();
        }

        // 3. Transpile each TS/TSX file individually
        if (typeof Babel === 'undefined') throw new Error("Babel is not loaded.");
        
        const scriptPaths = filePaths.filter(p => p.endsWith('.ts') || p.endsWith('.tsx'));
        const transpiledFilePaths = [];

        for (const [index, path] of scriptPaths.entries()) {
            setExportProgress(`Transpiling scripts (${index + 1}/${scriptPaths.length})...`);
            // Add a small delay to allow UI to update and prevent browser from freezing
            await new Promise(resolve => setTimeout(resolve, 10)); 
            
            let code = fileContents[path];
            code = code.replace(/from '(\.\.?\/[^']*)(\.tsx|\.ts)';/g, "from '$1.js';");
            
            const transformed = Babel.transform(code, {
                presets: ['react', 'typescript'],
                filename: path
            }).code;

            const newPath = path.replace(/\.tsx?$/, '.js');
            zip.file(newPath, transformed);
            transpiledFilePaths.push(newPath);
        }

        // 4. Create a production-ready index.html
        setExportProgress('Creating application structure...');
        const originalHtml = fileContents['index.html'];
        const importMapMatch = originalHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/s);
        const importMap = importMapMatch ? importMapMatch[0] : '';
        
        const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Digital Planner</title>
    <link rel="manifest" href="manifest.json" />
    <meta name="theme-color" content="#0284c7" />
    <link rel="apple-touch-icon" href="icon-192.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="index.css">
    <script>
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f172a');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0284c7');
      }
    </script>
    <style> body { font-family: 'Inter', sans-serif; } </style>
    <script> tailwind.config = { darkMode: 'class' } </script>
    ${importMap}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="index.js"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js');
        });
      }
    </script>
</body>
</html>`;
        zip.file('index.html', productionHtml);

        // 5. Update Service Worker to cache all new JS files and icons
        let swJs = fileContents['sw.js'];
        const precacheAssets = ['./', 'index.html', 'index.css', 'manifest.json', ...transpiledFilePaths, 'icon-192.png', 'icon-512.png', 'maskable-icon-512.png', 'icons/shortcut-schedule-96.png', 'icons/shortcut-grades-96.png', 'icons/shortcut-scanner-96.png'];
        const newAssetsList = `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 2)};`;
        swJs = swJs.replace(
            /const PRECACHE_ASSETS = \[[^\]]*\];/,
            newAssetsList
        );
        zip.file('sw.js', swJs);
        
        // 6. Add other static files
        zip.file('index.css', fileContents['index.css']);
        zip.file('manifest.json', fileContents['manifest.json']);
        
        // 7. Generate and add placeholder icons
        setExportProgress('Generating assets...');
        const icon192 = generatePlaceholderIcon(192, '192').split(',')[1];
        const icon512 = generatePlaceholderIcon(512, '512').split(',')[1];
        const maskableIcon512 = generatePlaceholderIcon(512, 'M', true).split(',')[1];
        zip.file('icon-192.png', icon192, { base64: true });
        zip.file('icon-512.png', icon512, { base64: true });
        zip.file('maskable-icon-512.png', maskableIcon512, { base64: true });

        const iconsFolder = zip.folder('icons');
        const shortcutSchedule = generatePlaceholderIcon(96, 'Sch').split(',')[1];
        const shortcutGrades = generatePlaceholderIcon(96, 'Grd').split(',')[1];
        const shortcutScanner = generatePlaceholderIcon(96, 'Scan').split(',')[1];
        iconsFolder.file('shortcut-schedule-96.png', shortcutSchedule, { base64: true });
        iconsFolder.file('shortcut-grades-96.png', shortcutGrades, { base64: true });
        iconsFolder.file('shortcut-scanner-96.png', shortcutScanner, { base64: true });

        // 8. Add README.md with updated instructions
        setExportProgress('Creating instructions...');
        const readmeContent = `# How to Build Your Android App (APK)

You're just a few steps away from creating an APK file for the Google Play Store!

## Step 1: Generate a Signing Key

First, you need a digital signature for your app. Open a command prompt or terminal and run this command. It will create a file called \`android.keystore\`.

\`\`\`bash
keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

It will ask you to create a **password**. Remember this password! You can use the same one for both the "keystore password" and the "key password".

## Step 2: Host Your App Files

The Bubblewrap tool needs your app to be on a public website. We'll use a free and simple service for this.

1.  Go to: **https://app.netlify.com/drop**
2.  Drag the **entire unzipped folder** (the one this README is in) onto the Netlify website.
3.  Wait for it to upload. Netlify will give you a public URL, like \`https://some-cool-name.netlify.app\`. **Copy this URL!**

## Step 3: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **KEY_STORE_PASSWORD**: The password you created in Step 1.
2.  **KEY_PASSWORD**: The same password you created in Step 1.
3.  **KEY_STORE_BASE64**: To get this value, go back to the Student Planner web app, to **Settings > Build for Android**, and use the "Convert .keystore File to Secret" tool. It will generate the correct value for you to copy.

## Step 4: Run Bubblewrap

Now, go back to your command prompt where your \`android.keystore\` file is.

1.  Run the initialization command, using your new Netlify URL:
    \`\`\`bash
    bubblewrap init --manifest https://your-netlify-url.netlify.app/manifest.json
    \`\`\`
    (Press \`Enter\` to accept the defaults for most questions).

2.  Finally, run the build command:
    \`\`\`bash
    bubblewrap build
    \`\`\`

That's it! Bubblewrap will create the \`app-release-signed.apk\` file, which you can install on your phone.`;
      
      zip.file("README.md", readmeContent);

        // 9. Generate ZIP and save
        setExportProgress('Packaging project...');
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "project.zip");
        
        setIsExporting(false);
        setExportProgress('Build successful! Your download will start now.');
        setTimeout(() => setExportProgress(null), 5000); // Clear message after 5s

    } catch (error) {
        console.error("Failed to export project:", error);
        const errorMessage = `Build failed: ${error instanceof Error ? error.message : String(error)}`;
        setExportProgress(errorMessage);
        setIsExporting(false); // Stop spinner on error
    }
  };

  const handleKeystoreFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
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
      if (!navigator.clipboard) {
          alert('Clipboard API not available. Please copy the text manually.');
          return;
      }
      navigator.clipboard.writeText(keystoreSecret).then(() => {
          setCopyButtonText('Copied!');
          setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
      }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy to clipboard.');
      });
  };

  const isToggleDisabled = permissionStatus === 'denied';

  return (
    <>
      <Modal isOpen={isSecretModalOpen} onClose={() => setIsSecretModalOpen(false)} title="Your GitHub Secret">
        <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Copy this value and save it as a new GitHub secret named <code className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded text-sky-600 dark:text-sky-400">KEY_STORE_BASE64</code>.
            </p>
            <textarea
                readOnly
                value={keystoreSecret}
                className="w-full h-32 p-2 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md"
            />
            <button
                onClick={handleCopySecret}
                className="w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700"
            >
                {copyButtonText}
            </button>
            <div className="text-sm p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-800 dark:text-amber-200">
                <h4 className="font-semibold">Don't Forget!</h4>
                <p>You also need to create secrets for <code className="font-mono">KEY_STORE_PASSWORD</code> and <code className="font-mono">KEY_PASSWORD</code> using the password you set when creating the keystore file.</p>
            </div>
        </div>
      </Modal>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Enable Notifications</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get reminders for classes and assignments.</p>
            </div>
            <ToggleSwitch checked={notificationsEnabled && permissionStatus === 'granted'} onChange={handleToggleChange} disabled={isToggleDisabled} />
          </div>
          {permissionStatus === 'denied' && (
              <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  Notification permissions are blocked. You'll need to enable them in your browser settings to receive reminders.
              </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Build for Android</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Follow these steps to generate your APK file for the Google Play Store.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Export Project Files</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">This compiles your app into a production-ready format and includes a README with instructions.</p>
                  <button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className="w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                      {isExporting ? 'Building...' : 'Export Project Files'}
                  </button>
                </div>
              </div>
              
              {exportProgress && (
                <div className="flex items-center justify-center gap-2 pl-12">
                  {isExporting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600 dark:border-sky-400"></div>
                  )}
                  <p className={`text-sm ${
                    !isExporting && exportProgress.toLowerCase().includes('fail')
                      ? 'text-red-600 dark:text-red-400'
                      : !isExporting && exportProgress.toLowerCase().includes('success')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {exportProgress}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">2</div>
                 <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Prepare Your Signing Key</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Your Android app needs a digital signature. Follow the instructions in the exported README to generate an `android.keystore` file, then use this tool to convert it into a secret for GitHub Actions.
                  </p>
                  <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleKeystoreFileChange}
                      accept=".keystore,*"
                  />
                  <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  >
                      Convert .keystore File to Secret
                  </button>
                </div>
              </div>
            </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">About</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                This Student Digital Planner helps you organize your academic life. All your data is stored securely on your device.
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Version 1.8.0 (Production Build)</p>
        </div>
      </div>
    </>
  );
};

export default SettingsScreen;

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
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // 1. Define all source files
      const filePaths = ['index.html', 'index.css', 'manifest.json', 'sw.js', 'types.ts', 'contexts/ThemeContext.tsx', 'constants.tsx', 'services/geminiService.ts', 'services/notificationService.ts', 'components/common/Spinner.tsx', 'components/common/Modal.tsx', 'components/DayDetailModal.tsx', 'components/MonthlyCalendar.tsx', 'components/AddAssignmentModal.tsx', 'components/AddCourseModal.tsx', 'components/CourseDetailModal.tsx', 'components/ShareReceiverScreen.tsx', 'components/DashboardScreen.tsx', 'components/ScheduleScreen.tsx', 'components/GradesScreen.tsx', 'components/ScannerScreen.tsx', 'components/SolverScreen.tsx', 'components/SettingsScreen.tsx', 'components/AuthScreen.tsx', 'App.tsx', 'index.tsx'];

      // 2. Fetch all file contents
      const fileContents = {};
      await Promise.all(filePaths.map(path => fetch(path).then(res => {
        if (!res.ok) throw new Error(`Could not fetch ${path}`);
        return res.text();
      }).then(content => {
        fileContents[path] = content;
      })));

      // 3. Transpile each TS/TSX file individually
      if (typeof Babel === 'undefined') throw new Error("Babel is not loaded.");
      const scriptPaths = filePaths.filter(p => p.endsWith('.ts') || p.endsWith('.tsx'));
      const transpiledFilePaths = [];
      for (const path of scriptPaths) {
        let code = fileContents[path];

        // Rewrite import paths to point to .js files, maintaining the module graph
        code = code.replace(/from '(\.\.?\/[^']*)(\.tsx|\.ts)';/g, "from '$1.js';");

        // Transpile
        const transformed = Babel.transform(code, {
          presets: ['react', 'typescript'],
          filename: path
        }).code;
        const newPath = path.replace(/\.tsx?$/, '.js');
        zip.file(newPath, transformed);
        transpiledFilePaths.push(newPath);
      }

      // 4. Create a production-ready index.html that loads the transpiled entrypoint
      const originalHtml = fileContents['index.html'];
      const importMapMatch = originalHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/s);
      const importMap = importMapMatch ? importMapMatch[0] : '';
      const productionHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Digital Planner</title>
    <link rel="manifest" href="manifest.json" />
    <meta name="theme-color" content="#0284c7" />
    <link rel="apple-touch-icon" href="icon-192.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="index.css">
    <script>
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f172a');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0284c7');
      }
    </script>
    <style> body { font-family: 'Inter', sans-serif; } </style>
    <script> tailwind.config = { darkMode: 'class' } </script>
    ${importMap}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="index.js"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js');
        });
      }
    </script>
</body>
</html>`;
      zip.file('index.html', productionHtml);

      // 5. Update Service Worker to cache all new JS files and icons
      let swJs = fileContents['sw.js'];
      const precacheAssets = ['./', 'index.html', 'index.css', 'manifest.json', ...transpiledFilePaths, 'icon-192.png', 'icon-512.png', 'maskable-icon-512.png', 'icons/shortcut-schedule-96.png', 'icons/shortcut-grades-96.png', 'icons/shortcut-scanner-96.png'];
      const newAssetsList = `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 2)};`;
      swJs = swJs.replace(/const PRECACHE_ASSETS = \[[^\]]*\];/, newAssetsList);
      zip.file('sw.js', swJs);

      // 6. Add other static files
      zip.file('index.css', fileContents['index.css']);
      zip.file('manifest.json', fileContents['manifest.json']);

      // 7. Generate and add placeholder icons
      const icon192 = generatePlaceholderIcon(192, '192').split(',')[1];
      const icon512 = generatePlaceholderIcon(512, '512').split(',')[1];
      const maskableIcon512 = generatePlaceholderIcon(512, 'M', true).split(',')[1];
      zip.file('icon-192.png', icon192, {
        base64: true
      });
      zip.file('icon-512.png', icon512, {
        base64: true
      });
      zip.file('maskable-icon-512.png', maskableIcon512, {
        base64: true
      });
      const iconsFolder = zip.folder('icons');
      const shortcutSchedule = generatePlaceholderIcon(96, 'Sch').split(',')[1];
      const shortcutGrades = generatePlaceholderIcon(96, 'Grd').split(',')[1];
      const shortcutScanner = generatePlaceholderIcon(96, 'Scan').split(',')[1];
      iconsFolder.file('shortcut-schedule-96.png', shortcutSchedule, {
        base64: true
      });
      iconsFolder.file('shortcut-grades-96.png', shortcutGrades, {
        base64: true
      });
      iconsFolder.file('shortcut-scanner-96.png', shortcutScanner, {
        base64: true
      });

      // 8. Add README.md with updated instructions
      const readmeContent = `# How to Build Your Android App (APK)

You're just a few steps away from creating an APK file for the Google Play Store! This package now includes placeholder icons, so you can build immediately.

## Step 1: Host Your App Files

The Bubblewrap tool needs your app to be on a public website. We'll use a free and simple service for this.

1.  Go to the website: https://app.netlify.com/drop
2.  Drag the **entire unzipped folder** you got from this export onto the Netlify website.
3.  Wait for it to upload. Netlify will give you a public URL for your site, like \`https://some-cool-name.netlify.app\`. **Copy this URL!**

## Step 2: Run Bubblewrap

Now, go back to your command prompt where you were running Bubblewrap.

1.  Run the initialization command again, but this time, use your new Netlify URL:
    \`\`\`bash
    bubblewrap init --manifest https://your-new-netlify-url.netlify.app/manifest.json
    \`\`\`
    (Replace the URL with the one you copied from Netlify).

2.  Bubblewrap will now ask you a series of questions. For most of them, you can just press \`Enter\` to accept the default.

3.  Once it's done, run the build command:
    \`\`\`bash
    bubblewrap build
    \`\`\`

That's it! Bubblewrap will create the \`app-release-signed.apk\` file in your current directory, which you can install on your phone for testing. You can replace the placeholder icons later with your own designs.`;
      zip.file("README.md", readmeContent);
      const content = await zip.generateAsync({
        type: "blob"
      });
      saveAs(content, "project.zip");
    } catch (error) {
      console.error("Failed to export project:", error);
      alert(`An error occurred during the build process: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };
  const isToggleDisabled = permissionStatus === 'denied';
  return /*#__PURE__*/React.createElement("div", {
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
  })), permissionStatus === 'denied' && /*#__PURE__*/React.createElement("p", {
    className: "mt-3 text-xs text-center text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg"
  }, "Notification permissions are blocked. You'll need to enable them in your browser settings to receive reminders.")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "Build for Android"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400 mb-4"
  }, "This will compile your app into a production-ready format. Download the ZIP, follow the README instructions to host it, and then use Bubblewrap to create your APK."), /*#__PURE__*/React.createElement("button", {
    onClick: handleExport,
    disabled: isExporting,
    className: "w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
  }, isExporting ? 'Building Project...' : 'Export Project Files')), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
  }, "About"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 dark:text-slate-400"
  }, "This Student Digital Planner helps you organize your academic life. All your data is stored securely on your device."), /*#__PURE__*/React.createElement("p", {
    className: "mt-2 text-xs text-slate-400 dark:text-slate-500"
  }, "Version 1.7.0 (Production Build)")));
};
export default SettingsScreen;
