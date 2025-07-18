#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting portable .exe build process...\n');

// Function to run commands with proper error handling
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check if directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Main build process
async function buildPortable() {
  try {
    // Ensure build directory exists
    ensureDir('build');
    
    // Check if icon files exist, if not create placeholder
    const iconFiles = ['build/icon.ico', 'build/icon.png', 'build/icon.icns'];
    iconFiles.forEach(iconPath => {
      if (!fs.existsSync(iconPath)) {
        console.log(`⚠️  Warning: ${iconPath} not found. Please add application icons for better branding.`);
      }
    });

    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    if (fs.existsSync('out')) {
      fs.rmSync('out', { recursive: true, force: true });
    }
    console.log('✅ Cleanup completed\n');

    // Install dependencies
    runCommand('npm ci', 'Installing dependencies');

    // Build Next.js application and export static files
    runCommand('npm run build:export', 'Building Next.js application and exporting static files');

    // Verify the out directory was created
    if (!fs.existsSync('out')) {
      throw new Error('Next.js export failed - out directory not found');
    }

    // Build portable .exe
    runCommand('npm run build:portable', 'Building portable .exe file');

    // Check if build was successful
    const distDir = 'dist';
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      const portableExe = files.find(file => file.includes('portable') && file.endsWith('.exe'));
      
      if (portableExe) {
        const filePath = path.join(distDir, portableExe);
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log('🎉 BUILD SUCCESSFUL!\n');
        console.log('📋 Build Summary:');
        console.log(`   📁 Output Directory: ${path.resolve(distDir)}`);
        console.log(`   📄 Portable Executable: ${portableExe}`);
        console.log(`   📏 File Size: ${fileSizeMB} MB`);
        console.log(`   📍 Full Path: ${path.resolve(filePath)}\n`);
        
        console.log('🚀 Your portable .exe is ready for distribution!');
        console.log('   • No installation required');
        console.log('   • Can be run from any location');
        console.log('   • All dependencies included\n');
        
        console.log('💡 Next Steps:');
        console.log('   1. Test the .exe on a clean Windows machine');
        console.log('   2. Add application icons in the build/ directory for branding');
        console.log('   3. Consider code signing for security (optional)');
        console.log('   4. Create a release package with documentation\n');
      } else {
        console.error('❌ Portable .exe file not found in dist directory');
        console.log('Available files:', files);
      }
    } else {
      console.error('❌ dist directory not found - build may have failed');
    }

  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Run the build process
buildPortable(); 