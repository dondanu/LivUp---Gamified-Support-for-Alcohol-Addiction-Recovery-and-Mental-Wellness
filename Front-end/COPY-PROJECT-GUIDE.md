# Guide: Copying React Native Project to Another Location

This guide helps you copy your React Native project to another folder without encountering "Destination Path Too Long" errors on Windows.

## Quick Start

### Method 1: Using Scripts (Recommended)

1. **Clean the project first:**
   ```powershell
   .\clean-for-copy.ps1
   ```

2. **Copy the project:**
   ```powershell
   .\copy-project.ps1 -DestinationPath "C:\Projects\MyApp"
   ```

3. **Set up the new project:**
   ```powershell
   cd "C:\Projects\MyApp"
   .\setup-new-project.ps1
   ```

### Method 2: Manual Copy (If Scripts Don't Work)

1. **Clean build artifacts:**
   - Delete `android\app\build` folder
   - Delete `android\app\.cxx` folder
   - Delete `android\build` folder
   - Delete `android\.gradle` folder
   - Delete `node_modules` folder (will reinstall)

2. **Use a shorter destination path:**
   - Instead of: `C:\Users\YourName\Desktop\VeryLongFolderName\Project`
   - Use: `C:\Projects\MyApp` or `D:\MyApp`

3. **Copy using Windows File Explorer:**
   - Select all files and folders
   - Copy to the new location
   - If you get path length errors, use Method 3

### Method 3: Enable Windows Long Path Support

1. **Run as Administrator:**
   ```powershell
   .\Enable-LongPathSupport.ps1
   ```

2. **Restart your computer** (required for changes to take effect)

3. **Now you can copy the project normally**

## Why This Happens

Windows has a 260-character path length limit (MAX_PATH). React Native projects can have very deeply nested folders, especially in:
- `node_modules` (can have paths 300+ characters long)
- `android\app\build` (build artifacts with long paths)
- `android\app\.cxx` (CMake build files)

## Solutions

### Solution 1: Clean Before Copying
- Remove build folders and `node_modules`
- These can be regenerated after copying
- Significantly reduces path length

### Solution 2: Use Shorter Paths
- Place project in a short path like `C:\Projects\App`
- Avoid deep folder structures
- Avoid long folder names

### Solution 3: Enable Long Path Support
- Windows 10/11 supports paths up to 32,767 characters
- Requires registry change and restart
- One-time setup, works for all future projects

### Solution 4: Use robocopy
- Built-in Windows tool that handles long paths better
- Used by the `copy-project.ps1` script
- More reliable than File Explorer for deep folders

## After Copying

1. **Navigate to the new project folder:**
   ```powershell
   cd "C:\Projects\MyApp"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Clean and rebuild:**
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   ```

4. **Run the app:**
   ```powershell
   npx react-native run-android
   ```

## Troubleshooting

### "Destination Path Too Long" Error

**Option A: Clean and copy again**
```powershell
.\clean-for-copy.ps1
.\copy-project.ps1 -DestinationPath "C:\ShortPath\App"
```

**Option B: Enable long path support**
```powershell
# Run as Administrator
.\Enable-LongPathSupport.ps1
# Restart computer
# Then copy normally
```

**Option C: Use a shorter destination path**
- Move to root: `C:\MyApp`
- Use short names: `C:\App` instead of `C:\MyVeryLongProjectName`

### "Module Not Found" After Copying

```powershell
# Reinstall dependencies
npm install

# Clear Metro cache
npx react-native start --reset-cache
```

### Build Errors After Copying

```powershell
# Clean Android build
cd android
.\gradlew clean
cd ..

# Rebuild
npx react-native run-android
```

## Best Practices

1. **Always clean before copying** - Removes build artifacts that aren't needed
2. **Use short project paths** - Prevents path length issues
3. **Enable long path support** - One-time setup for all projects
4. **Use version control** - Git handles long paths better than Windows Explorer
5. **Keep node_modules in .gitignore** - Always reinstall in new location

## Scripts Included

- `clean-for-copy.ps1` - Cleans build artifacts before copying
- `copy-project.ps1` - Copies project using robocopy (handles long paths)
- `setup-new-project.ps1` - Sets up project after copying (installs deps)
- `Enable-LongPathSupport.ps1` - Enables Windows long path support (Admin required)

## Notes

- Build folders (`android/app/build`, `android/app/.cxx`) are excluded from copy
- `node_modules` is excluded from copy (will be reinstalled)
- All scripts are PowerShell scripts (`.ps1`)
- Long path support requires Administrator privileges and a restart

## Need Help?

If you continue to experience issues:
1. Check that the destination path is short enough
2. Ensure you've cleaned build artifacts
3. Try enabling long path support
4. Use robocopy directly if scripts don't work
5. Consider using Git to clone the project instead of copying

