# compile_and_sync.ps1
$ErrorActionPreference = "Stop"

$workspaceRoot = "d:\Saarthi"
$projectRoot = "d:\Saarthi\Saarthi"
$tomcatLib = "C:\Users\mohit\Downloads\apache-tomcat-8.5.99-windows-x64\apache-tomcat-8.5.99\lib"
$webContent = "$projectRoot\backend\WebContent"
$frontendDist = "$projectRoot\frontend\dist"

$wtpSaarthi = "$workspaceRoot\.metadata\.plugins\org.eclipse.wst.server.core\tmp0\wtpwebapps\Saarthi"
$wtpRoot = "$workspaceRoot\.metadata\.plugins\org.eclipse.wst.server.core\tmp0\wtpwebapps\ROOT"
$buildClasses = "$projectRoot\build\classes"

Write-Host "1. Building classpath..."
$libJars = (Get-ChildItem -Path "$webContent\WEB-INF\lib\*.jar").FullName -join ";"
$tcJars = (Get-ChildItem -Path "$tomcatLib\*.jar").FullName -join ";"
$cp = "$libJars;$tcJars;$webContent\WEB-INF\classes"

Write-Host "2. Finding Java sources..."
$javaSources = (Get-ChildItem -Path "$projectRoot\backend\src" -Recurse -Filter "*.java").FullName
Write-Host "Found $($javaSources.Count) Java source files."

Write-Host "3. Compiling with javac..."
javac -encoding UTF-8 -d "$webContent\WEB-INF\classes" -cp $cp $javaSources
Write-Host "Compilation to $webContent\WEB-INF\classes completed successfully!"

Write-Host "4. Copying resources (.properties)..."
Copy-Item -Path "$projectRoot\backend\src\*.properties" -Destination "$webContent\WEB-INF\classes" -Force

Write-Host "5. Syncing classes to build/classes, src/main/webapp, and wtpwebapps..."
if (Test-Path $buildClasses) {
    Copy-Item -Path "$webContent\WEB-INF\classes\*" -Destination $buildClasses -Recurse -Force
    Write-Host "Synced to build/classes"
}

$srcWebApp = "$projectRoot\src\main\webapp"
if (Test-Path $srcWebApp) {
    New-Item -ItemType Directory -Force -Path "$srcWebApp\WEB-INF\classes" | Out-Null
    New-Item -ItemType Directory -Force -Path "$srcWebApp\WEB-INF\lib" | Out-Null
    Copy-Item -Path "$webContent\WEB-INF\classes\*" -Destination "$srcWebApp\WEB-INF\classes" -Recurse -Force
    Copy-Item -Path "$webContent\WEB-INF\web.xml" -Destination "$srcWebApp\WEB-INF\web.xml" -Force
    Copy-Item -Path "$webContent\WEB-INF\lib\*" -Destination "$srcWebApp\WEB-INF\lib" -Recurse -Force
    Write-Host "Synced classes, web.xml, lib to src/main/webapp"
}

if (Test-Path $wtpSaarthi) {
    New-Item -ItemType Directory -Force -Path "$wtpSaarthi\WEB-INF\classes" | Out-Null
    New-Item -ItemType Directory -Force -Path "$wtpSaarthi\WEB-INF\lib" | Out-Null
    Copy-Item -Path "$webContent\WEB-INF\classes\*" -Destination "$wtpSaarthi\WEB-INF\classes" -Recurse -Force
    Copy-Item -Path "$webContent\WEB-INF\web.xml" -Destination "$wtpSaarthi\WEB-INF\web.xml" -Force
    Copy-Item -Path "$webContent\WEB-INF\lib\*" -Destination "$wtpSaarthi\WEB-INF\lib" -Recurse -Force
    Write-Host "Synced classes, web.xml, lib to wtpwebapps/Saarthi"
}

if (Test-Path $wtpRoot) {
    New-Item -ItemType Directory -Force -Path "$wtpRoot\WEB-INF\classes" | Out-Null
    New-Item -ItemType Directory -Force -Path "$wtpRoot\WEB-INF\lib" | Out-Null
    Copy-Item -Path "$webContent\WEB-INF\classes\*" -Destination "$wtpRoot\WEB-INF\classes" -Recurse -Force
    Copy-Item -Path "$webContent\WEB-INF\web.xml" -Destination "$wtpRoot\WEB-INF\web.xml" -Force
    Copy-Item -Path "$webContent\WEB-INF\lib\*" -Destination "$wtpRoot\WEB-INF\lib" -Recurse -Force
    Write-Host "Synced classes, web.xml, lib to wtpwebapps/ROOT"
}

Write-Host "6. Syncing frontend dist to WebContent, wtpwebapps/Saarthi, and wtpwebapps/ROOT..."
if (Test-Path $frontendDist) {
    # Remove stale assets in ROOT and Saarthi
    Get-ChildItem -Path "$wtpRoot\assets\index-*.js", "$wtpRoot\assets\index-*.css" -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -Path "$wtpSaarthi\assets\index-*.js", "$wtpSaarthi\assets\index-*.css" -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -Path "$webContent\assets\index-*.js", "$webContent\assets\index-*.css" -ErrorAction SilentlyContinue | Remove-Item -Force

    Copy-Item -Path "$frontendDist\*" -Destination $webContent -Recurse -Force
    Copy-Item -Path "$frontendDist\*" -Destination $wtpSaarthi -Recurse -Force
    Copy-Item -Path "$frontendDist\*" -Destination $wtpRoot -Recurse -Force
    Write-Host "Synced frontend assets to all targets"
}

Write-Host "All compilation and synchronization steps completed successfully!"
