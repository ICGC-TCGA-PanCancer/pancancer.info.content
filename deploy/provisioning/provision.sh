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
git clone https://github.com/ICGC-TCGA-PanCancer/pancancer.info.content.git

# Execute the playbook
cd $GITROOT/pancancer.info.content/deploy/provisioning
ansible-playbook -i inventory site.yml

