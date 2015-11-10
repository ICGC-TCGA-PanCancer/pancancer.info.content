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

    var options = {
        title: 'Daily average transfer rates',
        vAxis: {viewWindow: {min: 0, max: 100}, title: 'MB/s'},//,logScale: true},
        hAxis: {slantedText: true, slantedTextAngle: 45},
        legend: { position: 'right'},
        width: '100%',
        height: 600,
        pointSize: 5,
	theme: 'material',
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


    var day_counts = {};
    $.each(dates, function(i,date) {
        var day = date.split('.')[0];
        $.each(repos, function(i,repo) {
            var date_data = data[date][repo];
            var num = null;
            if (date_data) {
                num = date_data["MB/s"];
                if (num && num > 100) {
                    num = 100;
                }
            }
            if (num) {
                if (!day_counts[day]){day_counts[day] = {}}
                if (!day_counts[day][repo]){day_counts[day][repo] = []}
                day_counts[day][repo].push(num);
            }
        });
    });

    var days = Object.keys(day_counts).sort();
    $.each(days, function(i, date) {
        var row = new Array;
	var pretty_date = date.replace(/:\d+$/,'');
	matches = pretty_date.match(/\d{4}(\d{2})(\d{2})/);
	month = months[parseInt(matches[1])];
	day = matches[2];
	pretty_date = pretty_date.replace(/\d+/,month+' '+day+' ');
        row.push(pretty_date);

	$.each(repos, function(j,repo) {
	    var date_data = day_counts[date][repo];
	    var num = 0;
	    if (date_data) {
		$.each(date_data,function(){num+=parseFloat(this) || 0;});
		num /= date_data.length;
	    }
	    if (!num) {num = null} 
            row.push(num);
        });

        chart_data.addRow(row);
    });
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
