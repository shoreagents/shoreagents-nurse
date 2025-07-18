# Building Portable .exe for Distribution

This guide explains how to create a portable .exe file for the ShoreAgents Nurse Application.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Windows** (for building Windows executables)

## Quick Build

### Option 1: Automated Build Script (Recommended)
```bash
npm run build:portable-script
```

This will:
1. Clean previous builds
2. Install dependencies
3. Build and export the Next.js application
4. Create the portable .exe file
5. Show build summary

### Option 2: Manual Build Steps
```bash
# 1. Install dependencies
npm ci

# 2. Build and export Next.js app
npm run build:export

# 3. Build portable executable
npm run build:portable
```

## Build Outputs

After successful build, you'll find:

- **📁 `dist/`** - Contains all build outputs
- **📄 `ShoreAgents Nurse App-1.0.0-portable.exe`** - Your portable executable
- **📄 `ShoreAgents Nurse App Setup 1.0.0.exe`** - Installer version (if built with build:all)

## Portable .exe Features

✅ **No installation required** - Can run directly  
✅ **Self-contained** - All dependencies included  
✅ **Portable** - Can be copied to any Windows machine  
✅ **Database included** - Uses local storage, no external DB needed  
✅ **Offline capable** - Works without internet connection  

## File Size

Expected file size: ~150-200 MB (includes Node.js runtime and all dependencies)

## Distribution

The portable .exe can be:
- 📧 **Emailed** to users
- 💾 **Copied to USB drives**
- 🌐 **Downloaded from websites**
- 📦 **Distributed via file sharing**

## Testing

Before distribution, test the .exe on:
1. ✅ Clean Windows 10/11 machine
2. ✅ Machine without Node.js installed
3. ✅ Different user accounts
4. ✅ Different Windows versions (if needed)

## Advanced Build Options

### Build All Formats
```bash
npm run build:all
```
Creates both portable .exe and installer.

### Build Only Installer
```bash
npm run build:installer
```
Creates traditional Windows installer.

### Build for Development Testing
```bash
npm run dev
```
Runs in development mode for testing.

## Customization

### Application Icons
Add custom icons in `build/` directory:
- `icon.ico` - Windows icon
- `icon.png` - Linux icon  
- `icon.icns` - macOS icon

### Application Metadata
Edit `package.json`:
```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your app description",
  "author": "Your Name"
}
```

### Build Configuration
Edit the `build` section in `package.json` for advanced options.

## Troubleshooting

### Build Fails
1. Delete `node_modules/` and run `npm ci`
2. Delete `out/` and `dist/` directories
3. Check Node.js version compatibility

### Large File Size
- File size is normal for Electron apps
- Consider using installer version for distribution
- Antivirus may flag large .exe files (false positive)

### App Won't Start
1. Check Windows Defender/antivirus settings
2. Ensure all dependencies are included
3. Test on different Windows versions

## Code Signing (Optional)

For production distribution, consider code signing:
1. Obtain a code signing certificate
2. Configure electron-builder with certificate
3. Sign the executable to avoid security warnings

## Support

For build issues:
1. Check console output for specific errors
2. Verify all dependencies are installed
3. Ensure Windows compatibility
4. Test with clean project clone

## Production Checklist

Before distributing:
- [ ] Test on clean Windows machine
- [ ] Verify all features work
- [ ] Check file size is reasonable
- [ ] Test startup performance
- [ ] Verify no console errors
- [ ] Include usage documentation
- [ ] Consider code signing
- [ ] Create release notes 