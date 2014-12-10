#!/bin/bash

GITROOT=`echo ~/gitroot`

# Create local gitroot folder
mkdir $GITROOT

# Install Base Dependencies
sudo add-apt-repository -y ppa:rquillo/ansible
sudo apt-get update
sudo apt-get -y install git
sudo apt-get -y install python-software-properties
sudo apt-get -y install ansible

# Pull down the configuration Repo
cd $GITROOT
git clone https://github.com/niall-byrne/pancancer.info.config.git

# Extend ansible to handle cpan installations
mkdir $GITROOT/pancancer.info.config/provisioning/library
cd $GITROOT/pancancer.info.config/provisioning/library
wget https://raw.githubusercontent.com/ansible/ansible-modules-extras/317654dba5cae905b5d6eed78f5c6c6984cc2f02/packaging/language/cpanm.py

# Execute the playbook
cd $GITROOT/pancancer.info.config/provisioning
ansible-playbook -i inventory site.yml

