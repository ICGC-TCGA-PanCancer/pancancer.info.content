google.load('visualization', '1', {'packages':['corechart']});

var repo_name, repos;
function drawAlignmentChart2() {
    loadRepos();

    var report_data_url = 'old.transfer_timing.json';

    var json = $.ajax({
        url: report_data_url,
        dataType:"text",
        async: false
    }).responseText;

    data = $.parseJSON(json);
    data = data["virginia"];

    var chart_data = new google.visualization.DataTable();
    chart_data.addColumn('string', 'Date');

    for (var i = 0; i < repos.length; i++) {
        chart_data.addColumn('number', repo_name[repos[i]]);
    }

    buildRows(data,chart_data);

    var colors = ["#C0C0C0","#808080","#000000","#FF0000","#800000","#FFFF00","#FFA500"];

    var options = {
        title: 'Data transfer rates',
        colors: colors,
        vAxis: {viewWindow: {min: 10, max: 100}, title: 'MB/s',logScale: true},
        hAxis: {title: 'Time (UTC)', slantedText: true, slantedTextAngle: 45},
        legend: { position: 'right'},
        width: '100%',
        height: 600,
        pointSize: 5,
        chartArea:{left:100,top:50,width:'65%',height:'70%'}
    };

    $('#line_chart').empty();
    var chart = new google.visualization.LineChart(document.getElementById('line_chart'));
    chart.draw(chart_data, options);
}

function buildRows(data,chart_data) {
    var total = 0;
    var months = [null, 'Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dates = Object.keys(data).sort();

    for (var i = 0; i < dates.length; i++) {
        date = dates[i];

        var row = new Array;
	var pretty_date = date.replace(/:\d+$/,'');
	matches = pretty_date.match(/\d{4}(\d{2})(\d{2})./);
	month = months[parseInt(matches[1])];
	day = matches[2];
	pretty_date = pretty_date.replace(/\d{8}\./,month+' '+day+' ');
        row.push(pretty_date);

        for (var j = 0; j < repos.length; j++) {
	    var date_data = data[date][repos[j]];
	    var num = 0;
	    if (date_data) {
		num = date_data["MB/s"] || 0;
	    }
	    if (num > 100) {
		num = 100;
	    }
            row.push(num);
        }

        chart_data.addRow(row);
    }
}

function loadRepos() {
    repo_name = {
        'cghub.ucsc.edu': 'Santa Cruz',
        'gtrepo-osdc-icgc.annailabs.com': 'Chicago (ICGC)',
        'gtrepo-dkfz.annailabs.com': 'Heidelberg',
        'gtrepo-ebi.annailabs.com': 'London',
        'gtrepo-etri.annailabs.com': 'Seoul',
        'gtrepo-riken.annailabs.com': 'Tokyo',
	'gtrepo-bsc.annailabs.com': 'Barcelona',
    }

    repos = [
        'gtrepo-osdc-icgc.annailabs.com',
	'gtrepo-bsc.annailabs.com',
	'gtrepo-dkfz.annailabs.com',
	'gtrepo-ebi.annailabs.com',
	'cghub.ucsc.edu',
	'gtrepo-etri.annailabs.com',
	'gtrepo-riken.annailabs.com'
    ];

    return (repo_name, repos);
}
