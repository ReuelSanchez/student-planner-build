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
  const [exportNumericProgress, setExportNumericProgress] = useState(0);

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
    setExportProgress('Initializing...');
    setExportNumericProgress(0);
    await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI to update
    
    try {
        const zip = new JSZip();
        const filePaths = [
            'index.html', 'index.css', 'manifest.json', 'sw.js',
            'types.ts', 'contexts/ThemeContext.tsx', 'constants.tsx',
            'services/geminiService.ts', 'services/notificationService.ts',
            'components/common/Spinner.tsx', 'components/common/Modal.tsx',
            'components/DayDetailModal.tsx', 'components/MonthlyCalendar.tsx',
            'components/AddAssignmentModal.tsx', 'components/AddCourseModal.tsx',
            'components/CourseDetailModal.tsx', 'components/ShareReceiverScreen.tsx',
            'components/DashboardScreen.tsx', 'components/ScheduleScreen.tsx',
            'components/GradesScreen.tsx', 'components/ScannerScreen.tsx',
            'components/SolverScreen.tsx', 'components/SettingsScreen.tsx',
            'components/AuthScreen.tsx', 'App.tsx', 'index.tsx',
        ];

        setExportProgress('Fetching source files...');
        setExportNumericProgress(5);
        const responses = await Promise.all(filePaths.map(path => fetch(path)));
        const fileContents: { [key: string]: string } = {};
        for (let i = 0; i < filePaths.length; i++) {
            if (!responses[i].ok) throw new Error(`Could not fetch ${filePaths[i]}`);
            fileContents[filePaths[i]] = await responses[i].text();
        }
        
        if (typeof Babel === 'undefined') throw new Error("Babel is not loaded.");
        const scriptPaths = filePaths.filter(p => p.endsWith('.ts') || p.endsWith('.tsx'));
        const transpiledFilePaths = [];
        const transpiledFiles: { [key: string]: string } = {};
        
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

            // Yield to main thread frequently to keep the UI responsive during heavy processing.
            if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 0));
        }

        setExportProgress('Creating application structure...');
        setExportNumericProgress(75);
        for(const path in transpiledFiles) {
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
        zip.file('icon-192.png', generatePlaceholderIcon(192, '192').split(',')[1], { base64: true });
        zip.file('icon-512.png', generatePlaceholderIcon(512, '512').split(',')[1], { base64: true });
        zip.file('maskable-icon-512.png', generatePlaceholderIcon(512, 'M', true).split(',')[1], { base64: true });
        const iconsFolder = zip.folder('icons');
        iconsFolder.file('shortcut-schedule-96.png', generatePlaceholderIcon(96, 'Sch').split(',')[1], { base64: true });
        iconsFolder.file('shortcut-grades-96.png', generatePlaceholderIcon(96, 'Grd').split(',')[1], { base64: true });
        iconsFolder.file('shortcut-scanner-96.png', generatePlaceholderIcon(96, 'Scan').split(',')[1], { base64: true });

        setExportProgress('Creating instructions...');
        setExportNumericProgress(95);
        const readmeContent = `# How to Build Your Android App (APK)

You're just a few steps away from getting your repository ready to build an APK with GitHub Actions!

## Step 1: Generate a Signing Key

First, you need a digital signature. Open a terminal and run this command in your project folder. It will create a file called \`android.keystore\`.

\`\`\`bash
keytool -genkey -v -keystore android.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
\`\`\`
It will ask for a **password**. Remember this password!

## Step 2: Host Your App Files

Bubblewrap needs your app to be on a public website. We'll use a free service for this.

1. Go to: **https://app.netlify.com/drop**
2. Drag the **entire unzipped folder** (the one this README is in) onto the website.
3. Netlify will upload it and give you a public URL (like \`https://some-name.netlify.app\`). **Copy this URL.**

## Step 3: Set up GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add three new secrets:

1.  **\`KEY_STORE_PASSWORD\`**: The password you created in Step 1.
2.  **\`KEY_PASSWORD\`**: The same password.
3.  **\`KEY_STORE_BASE64\`**: To get this value, go back to the Student Planner app, to **Settings > Prepare for Android Build**, and use the "Convert .keystore File to Secret" tool. It will generate the correct value for you to copy.

## Step 4: Initialize Your Android Project

This is a crucial one-time setup. It creates configuration files that GitHub Actions needs.

1.  **Run Bubblewrap Init:** In your terminal, run this command using your Netlify URL:
    \`\`\`bash
    bubblewrap init --manifest https://your-netlify-url.netlify.app/manifest.json
    \`\`\`
    (Press \`Enter\` to accept the defaults).

2.  **Commit the New Files:** This command created new files (\`twa-manifest.json\`, \`.bubblewrap/\`, etc.). You **must** commit all of them to your GitHub repository.
    \`\`\`bash
    git add .
    git commit -m "Add Bubblewrap project files"
    git push
    \`\`\`

## Step 5: Build Your App

You're all set!

1.  Go to your GitHub repository and click the **"Actions"** tab.
2.  Find the **"Build Android App"** workflow and click "Run workflow".
3.  When it's done, you can download your \`app-release-signed.apk\` from the "Artifacts" section.

## Troubleshooting

### My GitHub Action failed with "exit code 130"

This is the most common issue and it usually means the build process was interrupted. This can happen for a few reasons:

1.  **Missing Project Files:** The \`bubblewrap build\` command **failed to find the project files**. Did you run \`bubblewrap init\` locally and commit the new files (\`twa-manifest.json\`, \`.bubblewrap/\`, etc.) to your repository? This is the most common cause. Double-check your repository to ensure these files are present before running the Action.

2.  **GitHub Actions Timeout:** The build process, especially the first time, can be slow because it needs to download Android tools. If it takes longer than GitHub's default timeout, the job will be cancelled. If this happens consistently, it might be a temporary GitHub issue. Try running the workflow again.

3.  **Incorrect Secrets:** Double-check that your three secrets (\`KEY_STORE_PASSWORD\`, \`KEY_PASSWORD\`, \`KEY_STORE_BASE64\`) are correctly named and have the correct values, with no extra spaces or characters.
`;
      zip.file("README.md", readmeContent);

        setExportProgress('Packaging project...');
        setExportNumericProgress(98);
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "project.zip");
        
        setExportProgress('Build successful! Your download will start now.');
        setExportNumericProgress(100);

    } catch (error) {
        console.error("Failed to export project:", error);
        const errorMessage = `Build failed: ${error instanceof Error ? error.message : String(error)}`;
        setExportProgress(errorMessage);
    } finally {
        setIsExporting(false);
        setTimeout(() => setExportProgress(null), 5000); // Clear message after 5s
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
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Prepare for Android Build</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Follow these steps to generate the files and instructions needed to build your APK with GitHub Actions.
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
              
               {(isExporting || exportProgress) && (
                 <div className="pl-12 space-y-2">
                    {isExporting && (
                       <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                         <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${exportNumericProgress}%`, transition: 'width 0.2s' }}></div>
                       </div>
                    )}
                    {exportProgress && (
                      <p className={`text-sm text-center ${
                          !isExporting && exportProgress.toLowerCase().includes('fail')
                          ? 'text-red-600 dark:text-red-400'
                          : !isExporting && exportProgress.toLowerCase().includes('success')
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                          {exportProgress}
                      </p>
                    )}
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
            
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 dark:border-amber-500 space-y-2">
                 <h3 className="font-bold text-amber-900 dark:text-amber-100">Troubleshooting</h3>
                 <p className="text-sm text-amber-800 dark:text-amber-200">
                    If your GitHub Action build fails with an **"exit code 130"**, it usually means the build was interrupted. The most common reason is that the files generated by `bubblewrap init` were not committed to your repository. Please follow the exported README's instructions carefully.
                 </p>
            </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">About</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                This Student Digital Planner helps you organize your academic life. All your data is stored securely on your device.
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Version 2.1.0</p>
        </div>
      </div>
    </>
  );
};

export default SettingsScreen;
