@echo off
:start
cls
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
