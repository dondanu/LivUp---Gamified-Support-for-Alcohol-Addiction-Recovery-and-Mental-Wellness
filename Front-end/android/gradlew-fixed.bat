@echo off
REM Clear problematic environment variables
set JAVA_TOOL_OPTIONS=
set _JAVA_OPTIONS=
set JAVA_OPTS=
set GRADLE_OPTS=
set CLASSPATH=

REM Run gradlew with cleared environment
call gradlew.bat %*

