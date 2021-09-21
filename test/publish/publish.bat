@echo off
cd \github\aliconnect\aliconnect-%1
:start
cls
call npm publish --dry-run

set c=y
set /P c=Are you sure you want to continue[Y/N]?
if /I "%c%" EQU "N" goto :start

call npm publish --access public
pause
goto start


cd\github\aliconnect
:start
cls

goto start




php publish.php
pause
goto start

pause
call npm publish --dry-run
pause
goto start

call npm publish --access public
pause
goto start
