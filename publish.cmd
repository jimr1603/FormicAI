@echo off
goto %1
goto end
:master
call grunt --server=screeps
:omega
call grunt --server=sp1
:delata
call grunt --server=sp2
:beta
call grunt --server=cogd
:alpha
call grunt --server=atanner
:end
