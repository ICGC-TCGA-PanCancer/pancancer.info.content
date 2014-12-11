pancancer.info.content
======================

Content for the pancancer.info website, organized for deployment.

To deploy the website in a new Ubuntu environment:
```
curl https://raw.githubusercontent.com/ICGC-TCGA-PanCancer/pancancer.info.content/master/install.sh | sh
```


If your environment doesn't have enough ram to give 8 gigs to elasticsearch, you can try the following to work
with a smaller elasticsearch heap:
```
sudo sed "s/ES_HEAP_SIZE=8g/#ES_HEAP_SIZE=8g/" -i /etc/init.d/elasticsearch && sudo service elasticsearch restart
```
