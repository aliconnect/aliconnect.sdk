@echo off
:start
cls
php publish.php
pause
goto start

call npm publish --dry-run
pause

call npm publish --access public
pause
