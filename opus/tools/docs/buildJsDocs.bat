@echo off

SET conf=jsdoc.conf
SET source=../../
SET tools=tools/docs
SET jsdoc=%tools%/jsdoc-toolkit

REM JsDocToolkit (apparently) depends on CWD, so we CD to source/ and then back

cd %source%
java -jar %jsdoc%/jsrun.jar %jsdoc%/app/run.js -c=%tools%/%conf%
cd %tools%