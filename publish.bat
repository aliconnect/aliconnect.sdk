@echo off
:start
cls
php publish.php

call npm publish --dry-run
pause

call npm publish --access public
pause
