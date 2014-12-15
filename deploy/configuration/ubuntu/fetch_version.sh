#!/bin/bash

# A silly method of determining the Ubuntu Version across all releases
egrep -o DISTRIB_RELEASE=[0-9]+.[0-9]+ /etc/lsb-release | egrep -o [0-9]+.[0-9]+

