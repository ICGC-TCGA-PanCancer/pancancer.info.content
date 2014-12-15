#!/bin/bash

GITROOT=`echo ~/gitroot`

# Get password for encrypted files
echo "Enter the encryption password:"
read cached_creds
export cached_creds

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

unset cached_creds