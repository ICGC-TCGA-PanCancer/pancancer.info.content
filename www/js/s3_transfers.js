// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
      
var projects, repos, timestamp, jobType, months, metadata,colorMap;
var type = 3;

loadData = function(typeNum) {
    type = typeNum;
    metadata;
    if (typeNum == 2) {
	metadata = 's3_metadata/BWA';
    } 
    else if (typeNum == 1) {
	metadata = 's3_metadata/Sanger-VCF';
    }
    else if (typeNum == 3) {
	metadata = 's3_metadata/Dkfz_embl-VCF';
    }

    $.getJSON(metadata+'/latest/projects.json', function(data) {projects = data});
    $.getJSON(metadata+'/latest/repos.json', function(data) {repos = data});
    $.getJSON(metadata+'/latest/timestamp.json', function(data) {timestamp = data[0]});
    jobType = ['backlog', 'queued', 'verifying', 'downloading', 'uploading', 'failed', 'retry','suppressed','completed'];
    categories = ['expected_to_be_transferred',
		  'both_transferred', 
		  'normal_transferred_tumor_not',
		  'tumor_transferred_normal_not', 
		  'both_not_transferred'];
    category_name = {'expected_to_be_transferred':'expected to<br>be transfered',
                     'both_transferred':'both transferred<br>&nbsp;',
                     'normal_transferred_tumor_not':'normal transferred,<br>tumor not',
                     'tumor_transferred_normal_not':'tumor transferred,<br>normal not',
                     'both_not_transferred':'neither transferred<br>&nbsp;'}
    months = ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    colorMap = {
	'queued':'#3366cc', 
	'verifying':'#dc3912', 
	'downloading':'#ff9900',
	'uploading':'#dd4477',
	'failed':'#990099',
	'completed':'#109618',
	'suppressed':'#ff0000',
	'retry':'#ffa500'
    };
}

loadData(type);

updateTransferTable = function(type) {
    var jFile = metadata+'/latest/'+type+'s.json';
    var typeArray;
    $.getJSON(jFile, function(data) {
	typeArray = data;
	var jsonFile = metadata+'/latest/'+type+'_counts.json';
	//console.log(jsonFile);
	var table = $('#transfers_'+type);
	var headerText = type == 'project' ? 'Project' : 'Repository';
	
	table.empty();
	
	$.getJSON(jsonFile, function(today_data) {
	    var rows = [];
	    var cols = [];

	    $.each(jobType, function(i, type) {
		key  = type + '-jobs';
		job_data = today_data[key] || {};
		cols[i] = [];
		total = 0;
		for(var j=0;j<typeArray.length;j++) {
		    project = typeArray[j];
		    project_data = job_data[project] || 0;
		    cols[i].push(project_data);
		    total += project_data;
		}
		cols[i].push(total);
 	    });
	    
	    var rows = []
	    var header = [headerText];
	    var tbody = $('<tbody>')
	    var tr = $('<tr>');
	    $.each(header.concat(jobType), function(i,col_head) {
		$('<th>').html(col_head).appendTo(tr);
	    });
	    $('<th>').html('Total').appendTo(tr);
	    tbody.append(tr);
	    
	    for (var i=0;i < cols[0].length;i++) {
		var row = $('<tr>');
		var contents = typeArray[i];
		if (!contents) {
		    contents = 'Total';
		}
		$('<th>').html(contents).appendTo(row);
		var row_total = 0;
		$.each(cols, function(j,col) {
		    cell = $('<td>');
		    cell.css('padding-left','20px');
		    cell.html(col[i]).appendTo(row);
		    row_total += col[i];
		});
		var cell = $('<td>');
		cell.css('padding-left','20px');
		cell.html(row_total).appendTo(row);
		
		tbody.append(row);
	    }
	    table.append(tbody);
	});
    });
}


updateHistoryTable = function() {
    var jsonFile = metadata+"/latest/hist_counts.json";
    var table = $('#history');
    var tbody = $('<tbody>')
    var tr = $('<tr>');

    table.empty();
    var totals = [];

    $.getJSON(jsonFile, function(data) {
        tr = $('<tr>');
	$('<th>').html('Date').appendTo(tr)
        $.each(jobType, function(i,cell) {
            $('<th>').html(cell).appendTo(tr);
        });
	$('<th>').html('<font color="red">Total</font>').appendTo(tr)
        tr.appendTo(tbody);

	var dates = Object.keys(data).sort();
	var chartDates = Object.keys(data).sort();
	dates.reverse();

	$.each(dates.slice(0,7), function(i,date) {
	    tr = $('<tr>');
	    $('<td>').html(date).appendTo(tr);
	    date_data = data[date];
	    total = 0;
	    $.each(jobType, function(i,job) {
		count = date_data[job+'-jobs'] || 0;
		$('<td>').html(count).appendTo(tr);
		total = total + count;
	    });
	    $('<td>').html('<font color="red">'+total+'</font>').appendTo(tr);
	    tr.appendTo(tbody);
	});
	tbody.appendTo(table);

	$.each(chartDates, function(i,date) {
	    date_data = data[date];
	    var total = 0;
	    totals.push([date,date_data['completed-jobs']]);
	});
	
	updateHistoryChart(totals);
    });
	      
    table.append(tbody);
    
}

updateProjectStatusTable = function() {
    var jsonFile = "gnos_metadata/latest/reports/s3_transfer_summary/donor.json";
    var table = $('#transfers_project_status');
    var tbody = $('<tbody>')
    var totals = {};

    table.empty();

    // Only for BWA 
    if (type != 2) {
	$('#project_status').css('display','none');
    }
    else {
	$('#project_status').css('display','inline');
    }

    $.each(categories, function(i,category) {
	totals[category] = 0;
    });

    $.getJSON(jsonFile, function(data) {
	tr = $('<tr>');
	$('<th>').html('Project').appendTo(tr);
	$.each(categories, function(i,category) {
	    cell = category_name[category];
	    $('<th>').html(cell).appendTo(tr);
	});
//	$('<th>').html('Total').appendTo(tr);
	tr.appendTo(tbody);

	data.sort(function(a,b) {
	    return parseInt(b['expected_to_be_transferred']) - parseInt(a['expected_to_be_transferred']);
	});

	$.each(data, function(i,row) {
	    tr = $('<tr>');

	    h1 = row["project"];
	    $('<th>').html(h1).appendTo(tr);
	    
	    $.each(categories, function(i,category) {
		cell = $('<td>');
		count = row[category] || 0;
		file = [h1,category,'donors.txt'].join('.');
		link = $('<a>');
		link.html(count);
		link.attr('href','gnos_metadata/latest/reports/s3_transfer_summary/'+file);
		link.attr('target','project_count');
		link.appendTo(cell);
		cell.css('padding-left','50px');
		cell.appendTo(tr);
		totals[category] += count;
	    });

//	    $('<td>').html(row_total).appendTo(tr);
	    tr.appendTo(tbody);
	});

	tr = $('<tr>');
	$('<th>').html('Total').appendTo(tr);
	$.each(categories, function(i,category) {
	    cell = $('<td>');
	    cell.css('padding-left','50px');
	    cell.html(totals[category]).appendTo(tr);
	});

	tr.appendTo(tbody);
    });

    table.append(tbody);
}

updateHistoryChart = function(rows) {
    var table = new google.visualization.DataTable();

    table.addColumn('string','Date');
    table.addColumn('number','Completed');

    $.each(rows, function(i,row) {
	var date = row[0];
	var count = row[1];
	var date_obj = new Date(date);
	var date_string = date_obj.getDate()+1 + '-' + months[date_obj.getMonth()];
	table.addRow([date_string,count]);
    });

    var options = {
	legend: { position: 'none'},
        vAxis: {viewWindow: {min: 0}},
        hAxis: {slantedText: true, slantedTextAngle: 45},
        width: '100%',
	height: 300,
	pointSize: 5,
	chartArea:{left:50,top:20,width:'75%',height:'70%'},
        theme: 'material'
    };

    var chart = new google.visualization.LineChart(document.getElementById('history_chart'));
    chart.draw(table,options);
}

updatePieChart = function() {
    var jsonFile = metadata+"/latest/hist_counts.json";

    $.getJSON(jsonFile, function(all_data) {
	var dates = Object.keys(all_data).sort();
        var today = dates.pop();

	// Update header
	$('#date_status').html('S3 transfers as of '+timestamp);

        data = all_data[today];

	var table = new google.visualization.DataTable();
	table.addColumn('string','Status');
	table.addColumn('number','Count');
	
	var sliceColors = [];
	$.each(jobType, function(i,key) {
	    val = data[key+'-jobs'];
	    if (val > 0) {
		if (key != 'backlog') {
		    table.addRow([key,val]);
		    sliceColors.push(colorMap[key]);
		    //console.log(key+' '+val);
		}
	    }
	});

        var options = {
	    width: '100%',
	    is3D: true,
	    pieSliceText: 'value',
            height: 500,
	    chartArea:{left:50,top:50,width:'75%',height:'80%'},
	    theme: 'material',
	    colors: sliceColors,
	    sliceVisibilityThreshold:0
        };
	

        var chart = new google.visualization.PieChart(document.getElementById('pie'));
	
        chart.draw(table, options);
	
    });
}

updateLineChart = function() {
    $('#transfer_rates').css('display','none');
    return true;
    if (metadata.match('Dkfz')) {
        $('#transfer_rates').css('display','none');
        return true;
    }
    else {
        $('#transfer_rates').css('display','inline');
    }
    var jsonFile = metadata+"/latest/timing.json";

    $.getJSON(jsonFile, function(data) {
	var download_data = data['download'];
	var upload_data = data['upload'];
	addTableData(download_data,'Average download speed by GNOS repository','line1');
	addTableData(upload_data,'Average upload speed by GNOS repository','line2');	
    });
}

addTableData = function(data,dataType,div_id) {
    var table = new google.visualization.DataTable();

    table.addColumn('string','Date');
    $.each(repos, function(i, repo) {
	table.addColumn('number',repo);
    });

    var dates = Object.keys(data).sort();
    $.each(dates, function(i, date) {
	var repo_data = data[date];
	var date_obj = new Date(date);
	var date_string = date_obj.getDate()+1 + '-' + months[date_obj.getMonth()];
	var row = [date_string];

	$.each(repos, function(i, repo) {
	    var sum = 0;
	    var ave = null;
	    var values = repo_data[repo];
	    
	    if (values && values.length > 0) {
		$.each(values, function(i, value) {
		    sum += value;
		});
		ave = sum/values.length;
	    }
	    
	    if (div_id == 'line2' && type != 2 && ave > 70) {
		ave = 70;
	    }
	    if (div_id == 'line2' && type == 2 && ave > 150) {
                ave = 150;
            }

	    row.push(ave);
	});
	table.addRow(row);
    });

    var options = {
        title: dataType,
        vAxis: {viewWindow: {min: 0}, title: 'MB/s'},
        hAxis: {slantedText: true, slantedTextAngle: 45},
        legend: { position: 'right'},
        width: '100%',
	height: 300,
        pointSize: 10,
	pointShape: 'square',
        chartArea:{left:50,top:20,width:'75%',height:'70%'},
	theme: 'material'
    };

    var chart = new google.visualization.ScatterChart(document.getElementById(div_id));
    chart.draw(table,options);
}

loadS3Page = function(typeNum) {
    loadData(typeNum);
    updateTransferTable('project');
    updateTransferTable('repo');
    updatePieChart();
    updateLineChart();
    updateHistoryTable();
    updateProjectStatusTable();
}
