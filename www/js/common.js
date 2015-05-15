$('document').ready(function(){
    $("#pancancer-header").load("/v2/header.html");
});

// Google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-34523087-2', 'pancancer.info');
ga('create', 'UA-52348443-1', 'auto', {'name': 'newTracker'});
ga('send', 'pageview');
ga('newTracker.send', 'pageview');


function appendToHeader(url) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src  = url;
    $("head").append(s);
}

// Loads dependent javascript on request
function loadJS(js) {
    if (typeof(js) != 'object'){
	js = [js];
    }
    for (var i = 0; i < js.length; i++) {
        appendToHeader('/js/'+js[i]+'.js');
    }
}


// For getting GET params
function getSearchParameters() {
    var prmstr = decodeURIComponent(window.location.search.slice(1));
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1].replace(/'|"/g,'');
    }
    return params;
}

