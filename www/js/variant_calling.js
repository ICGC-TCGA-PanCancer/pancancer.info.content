
// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});

var repo_name, repos, repos2, repos3, chicago, months;
loadRepos();

var params = getSearchParameters();
var workflow = params["workflow"] || 'Sanger';
function selectVariantWorkflow(wf) {
    workflow = wf.value;
    loadVariantWorkflow();
}

function loadVariantWorkflow() {
    var wf = workflow || 'Sanger';
    setVariantHeaders(wf);
    loadVariantTable1();
    drawVariantChart1(wf);
    loadVariantTable2();
    drawVariantChart2(wf);
}

function setVariantHeaders(wf) {
    $("#head1").html('Donors with '+ wf  +' Variant Calls (Live)');
    $("#head2").html(wf+' Variant Calls by Compute Sites');
}
      
function drawVariantChart1(workflow) {
    
    var url = workflow == 'Sanger' ? 'gnos_metadata/latest/reports/sanger_summary_counts/summary_counts.json'
	: workflow == 'DKFZ/EMBL'   ? 'gnos_metadata/latest/reports/embl-dkfz_summary_counts/summary_counts.json'
	:                        'gnos_metadata/latest/reports/summary_counts/summary_counts.json'; 

    var jsonData = $.ajax({
        url: url,
        dataType:"text",
          async: false
    }).responseText;
    
    data = $.parseJSON(jsonData)
      
    // Create our data table out of JSON data loaded from server.
    var chart_data = new google.visualization.DataTable();
    chart_data.addColumn('date', 'Date');
    chart_data.addColumn('number', '# donor to be called');
    chart_data.addColumn('number', '# donor called');
    var count_called_as_of_last_week = 0;
    for ($i = 1; $i < data.length; $i++) {
	//console.log(data[$i]);
	var local_time = realTime(data[$i][0]);
	chart_data.addRow([local_time, data[$i][1], data[$i][2]]);
    }


    var options = {
        title: workflow+' workflow variant calling progress',
        curveType: 'function',
        legend: { position: 'bottom' },
        width: '100%',
        height: 300,
        pointSize: 6,
    };
    
    // Instantiate and draw our chart, passing in some options.
    $('#chart_div').empty();
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(chart_data, options);
}

function loadVariantTable1() {

    $("table[name='x12'] tbody").empty();
    
    loadRepos();

    var report_data_url = "gnos_metadata/latest/reports/gnos_repo_summary/";

    var json = workflow == 'Sanger' ? 'live_sanger_variant_called_donors.repos.json'
        : workflow == 'DKFZ/EMBL'   ? 'live_embl-dkfz_variant_called_donors.repos.json'
	:                        'live_sanger_variant_called_donors.repos.json';

    var wf = workflow == 'Sanger' ? 'sanger' : 'embl-dkfz';


    $.getJSON(report_data_url + json,
    function (json) {
        var total = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var tr;

        for (var i = 0; i < repos.length; i++) {
	    var rname = repo_name[repos[i]];
	    if (rname.match(/Heidelberg \(Open/)) {
		rname = 'Heidelberg';
	    }
            if (json[repos[i]] == undefined) {
                continue;
            }
            tr = $('<tr/>');
            tr.append("<td>" + rname 
                             + " ("
                             + (json[repos[i]]['_ori_count'].length == 0 ? 0 : json[repos[i]]['_ori_count'][0])
                             + ")"
                             + "</td>");
            total[0] += (json[repos[i]]['_ori_count'].length == 0 ? 0 : json[repos[i]]['_ori_count'][0]);
            
            for (var j = 0; j < repos.length; j++) {
                var aligned_donors = json[repos[i]][repos[j]] == undefined ? 0 : json[repos[i]][repos[j]][0];
                var aligned_donors_url = report_data_url
                                         + 'live_'+wf+'_variant_called_donors.'
                                         + repos[i] + "." + repos[j] + ".txt";
                tr.append("<td>" + (aligned_donors == 0 ? "" : "<a href='" + aligned_donors_url + "'>")
                                 + aligned_donors
                                 + (aligned_donors == 0 ? "" : "</a>")
                                 + "</td>");
                total[j+1] += aligned_donors;
            }
            $("table[name='x12']").append(tr);
        }

        for (var i = 0; i < json.length; i++) {
            for (var j = 0; j < ctypes.length; j++) {
                total[j] += json[i][ctypes[j]][0];
            }
        }
        tr = $('<tr/>');
        tr.append("<td><font color=\"red\">[Total ("+total[0]+")]</font></td>");
        for (var i = 1; i < total.length; i++) {
            tr.append("<td>" + total[i] + "</td>");
        }
        $("table[name='x12']").append(tr);

        tfoot = $('<tfoot/>');
        //tfoot.append('<tr><td colspan="50">*Report processed: ' + json[0]['timestamp'] + '</td></tr>');
        $("table[name='x12']").append(tfoot);
    });
}
	     


function loadVariantTable2() {

    var report_data_url = workflow == 'Sanger' ? 'gnos_metadata/latest/reports/sanger_summary_counts/hist_summary_site_counts.json'
        : workflow == 'DKFZ/EMBL'   ? 'gnos_metadata/latest/reports/embl-dkfz_summary_counts/hist_summary_site_counts.json'
        :                        'gnos_metadata/latest/reports/summary_counts/hist_summary_site_counts.json';

    table_header_x1();
    $("table[name='x1'] tbody").empty();


    $.getJSON(report_data_url,
    function (json) {
        var tr;

        for (var i = 0; i < json.length; i++) {
            date = json[i][0];
            counts = json[i][1];
            total = 0;

            tr = $('<tr/>');
            tr.append("<td>" + date + "</td>");

            for (var j = 0; j < repos2.length; j++) {
                count = counts[repos2[j]] == undefined ? 0 : counts[repos2[j]]
                tr.append("<td>" + count + "</td>");
                total += count;
            }
            tr.append("<td><font color='red'>" + total + "</font></td>");
            $("table[name='x1']").append(tr);
            if (i >= 7) break;
        }

        tfoot = $('<tfoot/>');
        $("table[name='x1']").append(tfoot);
    });
}

function drawVariantChart2(workflow) {
    loadRepos();

    var report_data_url = workflow == 'Sanger' ? 'gnos_metadata/latest/reports/sanger_summary_counts/hist_summary_site_counts.json'
        : workflow == 'DKFZ/EMBL'   ? 'gnos_metadata/latest/reports/embl-dkfz_summary_counts/hist_summary_site_counts.json'
        :                        'gnos_metadata/latest/reports/summary_counts/hist_summary_site_counts.json';

    //console.log(report_data_url);
    var json2 = $.ajax({
        url: report_data_url,
        dataType:"text",
        async: false
    }).responseText;

    data2 = $.parseJSON(json2)
    data2.reverse();


    if (data2.length < 8) {
        $('#thead0').html(workflow+' Variant Calls by Compute Sites: Insufficient data for cumulative plot');
	$('#chart_div2').empty();
	$('#total').empty();
	$('#thead1').empty();
	$('#thead2').empty();
	$('#cumulative_table').empty();
	for (i=0;i<repos3.length;i++) {
	    $('#'+repos3[i]).empty();
	}
        return 1;
    }


    cumulative_table();

    var chart_data = new google.visualization.DataTable();
    chart_data.addColumn('string', 'Date');

    for (var i = 0; i < repos3.length; i++) {
	chart_data.addColumn('number', repo_name[repos3[i]]);
    }


    // only historic data for Sanger
    if (workflow == 'Sanger') {
	var json1 = $.ajax({
            url: '/gnos_metadata/vc_cumulative_static.json',
            dataType:"text",
            async: false
	}).responseText;

	data1 = $.parseJSON(json1)

	buildRows(data1,chart_data);
    }


    buildRows(data2,chart_data);

    var colors = ["#C0C0C0","#808080","#000000","#FF0000","#800000","#FFFF00",
		  "#808000","#00FF00","#008000","#00FFFF","#008080","#0000FF",
		  "#000080","#FF00FF","#800080"];

    var today = realTime(data2[data2.length-1][0]);

    var today_counts = data2[data2.length-1].pop(); 
    var last_week_counts = data2[data2.length-8].pop();

    var today_total = 0;
    var last_week_total = 0;
    for (var i = 0; i < repos3.length; i++) {
	var count = 0;
	var last_count = 0;
        if (repos3[i] == 'pdc') {
	    for (var j = 0;j < chicago.length;j++) {
                num1 = today_counts[chicago[j]] || 0;
		num2 = last_week_counts[chicago[j]] || 0;
                count += parseInt(num1);
		last_count += parseInt(num2);
	    }
        }
        else {
            count = parseInt(today_counts[repos3[i]] || 0);
	    last_count =  parseInt(last_week_counts[repos3[i]] || 0);
        }

	today_total += count;
	last_week_total += last_count;
	
	diff = count - last_count;
	if (diff > 0) {
	    diff = "+"+diff;
	}

	$('#'+repos3[i]).html('&nbsp;'+count.toString()+ " ("+diff+")");
	//console.log(document.getElementById(cumulative_table));
	//console.log($('#cumulative_table').html());
    }
    
    diff = today_total - last_week_total;
    if (diff > 0) {
	diff = "+"+diff;
    }
    dateString = months[today.getMonth()] + ' ' + today.getDate();

    $('#total').html('&nbsp;'+today_total.toString()+ " ("+diff+")");
    $('#thead0').html(workflow+' Variant Calls by Compute Sites (Total: '+today_total+' as of '+dateString+')');
    $('#thead1').html(workflow+' Variant Calling Site');
    $('#thead2').html('Completed Donors as of '+dateString+' (change from last week)');
    
    var options = {
	colors: colors,
	vAxis: {viewWindow: {min: 0}, title: '# donors'},
	hAxis: {slantedText: true, slantedTextAngle: 45},
        legend: { position: 'right'},
        width: '100%',
        height: 700,
        pointSize: 5,
	chartArea:{left:50,top:50,width:'75%',height:'80%'}
    };

    $('#chart_div2').empty();
    var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));
    chart.draw(chart_data, options);
}

function buildRows(data,chart_data) {
    var total = 0;

    for (var i = 0; i < data.length; i++) {
        date = realTime(data[i][0]);

        counts = data[i][1];
        total = 0;

        dateString = date.getDate() + '-' + months[date.getMonth()];

	var row = new Array;
        row.push(dateString);

        for (var j = 0; j < repos3.length; j++) {
	    var count = 0;
	    if (repos3[j] == 'pdc') {
		for (var k = 0;k < chicago.length;k++) {
		    num = counts[chicago[k]] == undefined ? 0 : counts[chicago[k]];
		    count += parseInt(num);
		}
	    }
	    else {
		count = parseInt(counts[repos3[j]] == undefined ? 0 : counts[repos3[j]]);
	    }
            row.push(count);
            total += count;
	}
	chart_data.addRow(row);
    } 

    return total;
}

function realTime(date) {
    var utc_time = new Date(date + 'T03:01:01');
    return new Date(utc_time.valueOf() + utc_time.getTimezoneOffset() * 60000);    
}

function loadRepos() {
    months = ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    repo_name = {
	'aws_ireland': 'AWS Ireland',
	'aws_oregon': 'AWS Oregon',
	'bsc': 'Barcelona',
	'pdc': 'Chicago',
	'pdc1_1': 'Chicago(PDC1.1)',
	'pdc2_0': 'Chicago(PDC2.0)',
	'osdc-icgc': 'Chicago(ICGC)',
	'osdc-tcga': 'Chicago(TCGA)',
	'dkfz': 'Heidelberg',
        'dkfz_hpc': 'Heidelberg (HPC)',
	'ebi': 'London',
	'ucsc': 'Santa Cruz',
	'cghub': 'Santa Cruz',
	'etri': 'Seoul',
	'tokyo': 'Tokyo',
	'riken': 'Tokyo',
	'oicr': 'Toronto',
	'idash': 'San Diego',
	'sanger': 'Cambridge'
    }

    repos = ['bsc', 'osdc-icgc', 'osdc-tcga', 'dkfz',
	     'ebi', 'cghub', 'etri', 'riken'
		];

    if (workflow == 'Sanger') {
	repos2 = [ "aws_ireland", "aws_oregon", "bsc", "sanger", "pdc1_1", "pdc2_0",
		   "dkfz", "ebi", "idash", "ucsc", "etri", "tokyo", "oicr" ]

	repos3 = [ "aws_ireland", "aws_oregon", "bsc", "sanger", "pdc",
		   "dkfz", "ebi", "idash", "ucsc", "etri", "tokyo", "oicr" ]

	chicago = [ "pdc(1.1+2.0)", "pdc1_1", "pdc2_0" ]
    }
    else if (workflow == 'DKFZ/EMBL') {
	repos2 = ["aws_ireland","bsc","sanger","dkfz","dkfz_hpc"];
	repos3 = repos2;
	repo_name['dkfz'] = 'Heidelberg (OpenStack)';
    }

}

function table_header_x1() {
    var sanger_h = ' \
<th nowrap>Date <br/>(recent 8 days)</th> \
<th>AWS Ireland</th> \
<th>AWS Oregon</th> \
<th>Barcelona</th> \
<th>Cambridge</th> \
<th>Chicago (PDC1.1)</th> \
<th>Chicago (PDC2.0)</th> \
<th>Heidelberg</th> \
<th>London</th> \
<th>San Diego</th> \
<th>Santa Cruz</th> \
<th>Seoul</th> \
<th>Tokyo</th> \
<th>Toronto</th> \
<th><font color="red">[Total]</font></th>';

    var dkfz_h = ' \
<th nowrap>Date <br/>(recent 8 days)</th> \
<th>AWS Ireland</th> \
<th>Barcelona</th> \
<th>Cambridge</th> \
<th>Heidelberg<br>(OpenStack)</th> \
<th>Heidelberg<br>(HPC)</th> \
<th><font color="red">[Total]</font></th>';

    $('#x1h').html(workflow == 'Sanger' ? sanger_h : dkfz_h);
}

function cumulative_table() {
    var sanger_t = '\
<table id="rounded-corner"> \
  <tr><th id="thead1"></th><th id="thead2"></th></tr> \
  <tr><td>AWS Ireland</td><td id="aws_ireland"></td></tr> \
  <tr><td>AWS Oregon</td><td id="aws_oregon"></td></tr> \
  <tr><td>Barcelona</td><td id="bsc"></td></tr> \
  <tr><td>Cambridge</td><td id="sanger"></td></tr> \
  <tr><td>Chicago</td><td id="pdc"></td></tr> \
  <tr><td>Heidelberg</td><td id="dkfz"></td></tr> \
  <tr><td>London</td><td id="ebi"></td></tr> \
  <tr><td>San Diego</td><td id="idash"></td></tr> \
  <tr><td>Santa Cruz</td><td id="ucsc"></td></tr> \
  <tr><td>Seoul</td><td id="etri"></td></tr> \
  <tr><td>Tokyo</td><td id="tokyo"></td></tr> \
  <tr><td>Toronto</td><td id="oicr"></td></tr> \
  <tr><td><b>Total</b></td><td id="total"></td></tr> \
</table>';

    var dkfz_t = '\
<table id="rounded-corner"> \
    <tr><th id="thead1"></th><th id="thead2"></th></tr> \
    <tr><td>AWS Ireland</td><td id="aws_ireland"></td></tr> \
    <tr><td>Barcelona</td><td id="bsc"></td></tr> \
    <tr><td>Cambridge</td><td id="sanger"></td></tr> \
    <tr><td>Heidelberg (OpenStack)</td><td id="dkfz"></td></tr> \
    <tr><td>Heidelberg (HPC)</td><td id="dkfz_hpc"></td></tr> \
</table>';

    $('#cumulative_table').html(workflow == 'Sanger' ? sanger_t : dkfz_t);
    //console.log($('#cumulative_table').html());
}