@echo off

set params=%*
set cmd=build
set themePath=%~dp0settings.yml


for %%i in (%*) do (
	if %%i==server (
		set cmd=server
	)
	if %%i==upgrade (
		set cmd=upgrade
	)
)


if %cmd% EQU server (
	goto server
) else if %cmd% EQU upgrade (
	goto upgrade
) else (
	goto build
)


:build
	echo build start
	echo --------------
	liquidluck build -v -s %themePath%
	echo --------------
	echo build end
	goto end
	
:server
	echo server start
	echo --------------
	liquidluck server -s %themePath%
	goto end

:upgrade
	echo upgrade start
	echo --------------
	easy_install -U liquidluck
	liquidluck install alipay/arale -g
	echo --------------
	echo upgrade end
	goto end

:end
	