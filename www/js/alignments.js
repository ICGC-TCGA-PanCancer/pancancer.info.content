// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
      

var months;
var repo_name = {
    'bsc': 'Barcelona',
    'osdc-icgc': 'Chicago(ICGC)',
    'osdc-tcga': 'Chicago(TCGA)',
    'dkfz': 'Heidelberg',
    'ebi': 'London',
    'cghub': 'Santa Cruz',
    'etri': 'Seoul',
    'riken': 'Tokyo'
}
var aln_repos = ['bsc', 'osdc-icgc', 'dkfz',
              'ebi', 'cghub', 'etri', 'riken'
            ];


updateTable = function(ele,jsonFile) {
    var table = document.getElementsByName(ele);
    var json_data;
    var cell_1 = [];
    var cell_2 = [];
    var cell_3 = [];
    var val_1 = [];
    var val_2 = [];
    var val_3 = [];
    var total_1 = 0;
    var total_2 = 0;
    var total_3 = 0;


    d3.json(jsonFile, function(error, json) {
        json_data = json;

        var arr =[];

        for (var i = 0; i < json_data.length; i++){


            cell_1[i] = table[0].rows[1].cells[i+1];
            val_1[i] = cell_1[i].firstChild.data;
            cell_1[i].firstChild.data = ''+json_data[i].align;
            total_1 += json_data[i].align;

            cell_2[i] = table[0].rows[2].cells[i+1];
            val_2[i] = cell_2[i].firstChild.data;
            cell_2[i].firstChild.data = ''+json_data[i].remaining;
            total_2 += json_data[i].remaining;

            cell_3[i] = table[0].rows[3].cells[i+1];
            val_3[i] = cell_3[i].firstChild.data;
            cell_3[i].firstChild.data = ''+json_data[i].total_unalign;
            total_3 += json_data[i].total_unalign;

        }

        cell_1[9] = table[0].rows[1].cells[9];
        cell_2[9] = table[0].rows[2].cells[9];
        cell_3[9] = table[0].rows[3].cells[9];


        cell_1[9].firstChild.data = '' + total_1;
        cell_2[9].firstChild.data = '' + total_2;
        cell_3[9].firstChild.data = '' + total_3;

        cell_1[10] = table[0].rows[1].cells[9];
        cell_2[10] = table[0].rows[2].cells[9];
        cell_1[11] = table[0].rows[1].cells[10];
        cell_2[11] = table[0].rows[2].cells[10];

        var ave_1 = (total_1/total_3)*100;
        var num_1 = ave_1.toFixed(2);
        var ave_2 = (total_2/total_3)*100;
        var num_2 = ave_2.toFixed(2);

        cell_1[11].firstChild.data = '' + num_1;
        cell_2[11].firstChild.data = '' + num_2;

    });
}

updateLiveTable = function(ele) {
    loadRepos();
    var jsonFile = "gnos_metadata/latest/reports/specimen_alignment_summary/summary_site_counts.json";
    
    var table = document.getElementsByName(ele);
    var json_data;
    var cell_1 = [];
    var cell_2 = [];
    var cell_3 = [];
    var val_1 = [];
    var val_2 = [];
    var val_3 = [];
    var total_1 = 0;
    var total_2 = 0;
    var total_3 = 0;

    d3.json(jsonFile, function(error, json) {
        json_data = json;
        var arr =[];
        for (var i = 0; i < aln_repos.length; i++){
	    var site_data = json_data[aln_repos[i]];

	    if (!site_data && aln_repos[i] == 'riken') {
		site_data = json_data['tokyo'];
	    }


	    var aligned = 0;
	    var total = 0;
	    var unaligned = 0;
	    if (site_data) {
		aligned   = parseInt(site_data['aligned'] || 0);
		total     = parseInt(site_data['total'] || 0);
		unaligned = parseInt(site_data['unaligned'] || 0);
	    }

	    if (unaligned != total - aligned || (aligned + unaligned) != total) {
		console.log("Something is fishy here.  The numbers don't add up: "+aligned+" "+unaligned+" "+total);
	    }

            cell_1[i] = table[0].rows[1].cells[i+1];
            val_1[i] = cell_1[i].firstChild.data;
            cell_1[i].firstChild.data = ''+aligned;
            total_1 += aligned;

            cell_2[i] = table[0].rows[2].cells[i+1];
            val_2[i] = cell_2[i].firstChild.data;
            cell_2[i].firstChild.data = ''+unaligned;
            total_2 += unaligned;

            cell_3[i] = table[0].rows[3].cells[i+1];
            val_3[i] = cell_3[i].firstChild.data;
            cell_3[i].firstChild.data = ''+total;
            total_3 += total;

        }

        cell_1[8] = table[0].rows[1].cells[8];
        cell_2[8] = table[0].rows[2].cells[8];
        cell_3[8] = table[0].rows[3].cells[8];


        cell_1[8].firstChild.data = '' + total_1;
        cell_2[8].firstChild.data = '' + total_2;
        cell_3[8].firstChild.data = '' + total_3;

        cell_1[9] = table[0].rows[1].cells[8];
        cell_2[9] = table[0].rows[2].cells[8];
        cell_1[9] = table[0].rows[1].cells[9];
        cell_2[9] = table[0].rows[2].cells[9];

        var ave_1 = (total_1/total_3)*100;
        var num_1 = ave_1.toFixed(2);
        var ave_2 = (total_2/total_3)*100;
        var num_2 = ave_2.toFixed(2);

        cell_1[9].firstChild.data = '' + num_1;
        cell_2[9].firstChild.data = '' + num_2;

    });
}



var makeMap = function(mapContainer,mapData) {
    var colors = d3.scale.category10();

    var mC = document.getElementById(mapContainer);
    if (!mC) {
        alert('element '+mapContainer+' not found!');
        return '<pre>Error: map container '+mapContainer+' not found</pre>';
    }


     //basic map config with custom fills, mercator projection
    var map = new Datamap({
        scope: 'world',
        element: mC,
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false,
            highlightFillColor: '#ABDDA4',
        },
        projection: 'mercator',
        fills: {defaultFill: "#ABDDA4",
                gt50: colors(Math.random() * 20),
                gt60: "#63AFD0",
                gt70: "#0772A1",}
    })

    var json_data;

    d3.json(mapData, function(error, json) {
        json_data = json;
        map.bubbles(json_data, {
            popupTemplate: function(geo, data) {
		return "<div class='hoverinfo'>"+data.name+"<br/>Aligned: " + data.aligned + " Total: " +data.total+ "</div>";
            }
	});
    });
}


function loadAlignmentTable1() {
// GNOS summary donor table, for aligned BAM synchronization and variant calling status
    var report_data_url = "gnos_metadata/latest/reports/gnos_repo_summary/";
    var sanger_variant_data = {}
    $.getJSON(report_data_url + "live_sanger_variant_called_donors.repos.json", function(data){
        sanger_variant_data = data
    });
    
    $.getJSON(report_data_url + "live_alignment_completed_donors.repos.json",
	      function (json) {
		  var total = [0, 0, 0, 0, 0, 0, 0, 0];
		  var tr;
		  
		  for (var i = 0; i < Object.keys(json).length; i++) {
		      if (!json[aln_repos[i]]) {
			  continue;
		      }
		      tr = $('<tr/>');
		      tr.append("<td>" + repo_name[aln_repos[i]]
				+ " ("
				+ json[aln_repos[i]]['_ori_count'][0]
				+ ")"
				+ "</td>");
		      
		      total[0] += json[aln_repos[i]]['_ori_count'][0];
		      
		      for (var j = 0; j < aln_repos.length; j++) {
			  var aligned_donors = json[aln_repos[i]][aln_repos[j]] == undefined ? 0 : json[aln_repos[i]][aln_repos[j]][0];
			  var aligned_donors_url = report_data_url
                              + "live_alignment_completed_donors."
                              + aln_repos[i] + "." + aln_repos[j] + ".txt";
			  tr.append("<td>" + (aligned_donors == 0 ? "" : "<a href='" + aligned_donors_url + "'>")
                                    + aligned_donors
				    + (aligned_donors == 0 ? "" : "</a>")
				    + "</td>");
			  total[j+1] += aligned_donors;
		      }
		      $("table[name='x10']").append(tr);
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
		  $("table[name='x10']").append(tr);
		  
		  tfoot = $('<tfoot/>');
		  
		  $("table[name='x10']").append(tfoot);
	      });
}



// Total Donor Info table
function loadAlignmentTable2() {
    var report_data_url = "gnos_metadata/latest/reports/donors_alignment_summary/"; 
    $.getJSON(report_data_url + "donor.json",
    function (json) {
        var t_both_aligned = 0;
        var t_normal_aligned_tumor_not = 0;
        var t_tumor_aligned_normal_not = 0;
        var t_both_not = 0;
        var t_normal_aligned_tumor_missing = 0;
        var t_normal_unaligned_tumor_missing = 0;
        var t_tumor_aligned_normal_missing = 0;
        var t_tumor_unaligned_normal_missing = 0;
        var ctypes = ['both_aligned', 'normal_aligned_tumor_not', 'tumor_aligned_normal_not',
                      'both_not', 'normal_aligned_tumor_missing', 'normal_unaligned_tumor_missing',
                      'tumor_aligned_normal_missing', 'tumor_unaligned_normal_missing'
                     ];
        var total = [0, 0, 0, 0, 0, 0, 0, 0];
        var tr;
        for (var i = 0; i < json.length; i++) {
            for (var j = 0; j < ctypes.length; j++) {
                total[j] += json[i][ctypes[j]];
            }
        }
        tr = $('<tr/>');
        tr.append("<td><font color=\"red\">[Total]</font></td>");
        for (var i = 0; i < total.length; i++) {
            tr.append("<td>" + total[i] + "</td>");
        }
        $("table[name='x9']").append(tr);

        for (var i = 0; i < json.length; i++) {
            tr = $('<tr/>');
            tr.append("<td>" + json[i].project + "</td>");
            
            for (var j = 0; j < ctypes.length; j++) {
                var cell_value = json[i][ctypes[j]] == 0 ? 0
                   : "<a href='" + report_data_url + json[i]['project'] + "." + ctypes[j] + ".donors.txt'>" + json[i][ctypes[j]] + "</a>";
                tr.append("<td>" + cell_value + "</td>");
                total[j] += json[i][ctypes[j]];
            }
            $("table[name='x9']").append(tr);
        }


        tfoot = $('<tfoot/>');
        tfoot.append('<tr><td colspan="50">*Report processed: ' + json[0]['timestamp'] + '</td></tr>');
        $("table[name='x9']").append(tfoot);
    });
}


// GNOS summary specimen table, for aligned BAM synchronization
function loadAlignmentTable3() {
    var report_data_url = "gnos_metadata/latest/reports/gnos_repo_summary/"; 
    $.getJSON(report_data_url + "live_alignment_completed_donors.repos.json",
    function (json) {
        var total = [0, 0, 0, 0, 0, 0, 0, 0];
        var tr;

        for (var i = 0; i < Object.keys(json).length; i++) {
            tr = $('<tr/>');
            tr.append("<td>" + repo_name[aln_repos[i]]
                             + " ("
                             + (json[aln_repos[i]]['_ori_count'][1] + json[aln_repos[i]]['_ori_count'][2])
                             + ")"
                             + "</td>");
            //tr.append("<td>" + (json[aln_repos[i]]['_ori_count'][1] + json[aln_repos[i]]['_ori_count'][2])+ "</td>");
            total[0] += json[aln_repos[i]]['_ori_count'][1] + json[aln_repos[i]]['_ori_count'][2];
            
            for (var j = 0; j < aln_repos.length; j++) {
                var cell_value = json[aln_repos[i]][aln_repos[j]] == undefined ? 0 : (json[aln_repos[i]][aln_repos[j]][1] + json[aln_repos[i]][aln_repos[j]][2]);
                tr.append("<td>" + cell_value + "</td>");
                total[j+1] += cell_value;
            }
            $("table[name='x11']").append(tr);
        }

        for (var i = 0; i < json.length; i++) {
            for (var j = 0; j < ctypes.length; j++) {
                total[j] += json[i][ctypes[j]][1] + json[i][ctypes[j]][2];
            }
        }
        tr = $('<tr/>');
        tr.append("<td><font color=\"red\">[Total ("+total[0]+")]</font></td>");
        for (var i = 1; i < total.length; i++) {
            tr.append("<td>" + total[i] + "</td>");
        }
        $("table[name='x11']").append(tr);

        tfoot = $('<tfoot/>');
        //tfoot.append('<tr><td colspan="50">*Report processed: ' + json[0]['timestamp'] + '</td></tr>');
        $("table[name='x11']").append(tfoot);
    });
}

function train1Table() {
    var table = document.getElementsByName("x");
    var table2 = document.getElementsByName("x9");
    var table3 = document.getElementsByName("x3");
    var json_data;
    var json_data2;
    var json_data3;
    var cell_1 = [];
    var cell_2 = [];
    var cell_3 = [];
    var cell_4 = [];
    var cell_5 = [];
    var cell_6 = [];
    var val_1 = [];
    var val_2 = [];
    var val_3 = [];
    var val_4 = [];
    var val_5 = [];
    var val_6 = [];
    var total_1 = 0;
    var total_2 = 0;
    var total_3 = 0;
    var total_4 = 0;
    var total_5 = 0;
    var total_6 = 0;
    var total_7 = 0;
    var total_8 = 0;
    var total_9 = 0;
    
    d3.json("train1.json", function(error, json) {
	json_data = json;
	var arr =[];
        //for (var i = 1,j = 0; i < json_data.length/2 + 2, j < json_data.length; i++, j+=2){
	for (var i = 0; i < json_data.length; i++){
	    
            cell_1[i] = table[0].rows[1].cells[i+1];
            val_1[i] = cell_1[i].firstChild.data;
            cell_1[i].firstChild.data = ''+json_data[i].train_1_align;
            total_1 += json_data[i].train_1_align;
	    
            cell_2[i] = table[0].rows[2].cells[i+1];
            val_2[i] = cell_2[i].firstChild.data;
            cell_2[i].firstChild.data = ''+json_data[i].remaining;
            total_2 += json_data[i].remaining;
	    
            cell_3[i] = table[0].rows[3].cells[i+1];
            val_3[i] = cell_3[i].firstChild.data;
            cell_3[i].firstChild.data = ''+json_data[i].total_unalign;
            total_3 += json_data[i].total_unalign;
	}
	
	cell_1[8] = table[0].rows[1].cells[8];
	cell_2[8] = table[0].rows[2].cells[8];
	cell_3[8] = table[0].rows[3].cells[8];
	
	cell_1[8].firstChild.data = '' + total_1;
	cell_2[8].firstChild.data = '' + total_2;
	cell_3[8].firstChild.data = '' + total_3;
	
	cell_1[9] = table[0].rows[1].cells[9];
	
	var ave = (total_1/total_3)*100;
	var num = ave.toFixed(2);
	
	cell_1[9].firstChild.data = '' + num;
	
    });
}

function train1Map() {
    var colors = d3.scale.category10();

    //basic map config with custom fills, mercator projection
    var map2 = new Datamap({
        scope: 'world',
        element: document.getElementById('container2'),
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false,
            highlightFillColor: '#ABDDA4',
        },
        projection: 'mercator',
        fills: {defaultFill: "#ABDDA4",
                gt50: colors(Math.random() * 20),
                gt60: "#63AFD0",
                gt70: "#0772A1",}
    })
    
    //bubbles, custom popup on hover template
    map2.bubbles([
	{name: "Chicago", total: '0', aligned: '0', latitude: 41.891519, longitude: -87.629159, radius: 6, fillKey: 'gt60'},
	{name: "Chicago", total: '0', aligned: '0', latitude: 41.891519, longitude: -87.629159, radius: 6, fillKey: 'gt70'},
	
	{name: "Barcelona", total: '2', aligned: '2', latitude: 41.378691, longitude: 2.175547, radius: 15, fillKey: 'gt60'},
	{name: "Barcelona", total: '2', aligned: '2', latitude: 41.378691, longitude: 2.175547, radius: 15, fillKey: 'gt70'},
	
	{name: "Tokyo", total: '0', aligned: '0', latitude: 35.684219, longitude: 139.755020, radius: 6, fillKey: 'gt60'},
	{name: "Tokyo", total: '0', aligned: '0', latitude: 35.684219, longitude: 139.755020, radius: 6, fillKey: 'gt70'},

	{name: "Seoul", total: '0', aligned: '0', latitude: 37.553397, longitude: 126.980624, radius: 6, fillKey: 'gt60'},
	{name: "Seoul", total: '0', aligned: '0', latitude: 37.553397, longitude: 126.980624, radius: 6, fillKey: 'gt70'},

	{name: "Heidelberg", total: '0', aligned: '0', latitude: 49.403159, longitude: 8.676061, radius: 6, fillKey: 'gt60'},
	{name: "Heidelberg", total: '0', aligned: '0', latitude: 49.403159, longitude: 8.676061, radius: 6, fillKey: 'gt70'},

	{name: "London", total: '144', aligned: '144', latitude: 51.507919, longitude: -0.123571, radius: 20, fillKey: 'gt60'},
	{name: "London", total: '144', aligned: '144', latitude: 51.507919, longitude: -0.123571, radius: 20, fillKey: 'gt70'},

	{name: "Santa Cruz", total: '670', aligned: '670', latitude: 36.971944, longitude: -122.026389, radius: 30, fillKey: 'gt70'},

     ]
		 , {
		     popupTemplate: function(geo, data) {
			 return "<div class='hoverinfo'>"+data.name+"<br/>Aligned: " + data.aligned + " Total: " +data.total+ "</div>";
		     }
		 });
}


function cumulative_table() {
    var t = '\
<table class="rounded-corner" style="float:left"> \
  <tr><th id="thead1"></th><th id="thead2"></th></tr> \
  <tr><td>AWS Ireland</td><td id="aws_ireland"></td></tr> \
  <tr><td>Chicago (PDC2.0)</td><td id="pdc2_0"></td></tr> \
  <tr><td>London</td><td id="ebi"></td></tr> \
  <tr><td>Seoul</td><td id="etri"></td></tr> \
  <tr><td>Tokyo</td><td id="riken"></td></tr> \
  <tr><td>Toronto</td><td id="oicr"></td></tr> \
  <tr><td>Unassigned</td><td id="unassigned"></td></tr> \
  <tr><td><b>Total</b></td><td id="total"></td></tr> \
</table>';

    $('#cumulative_table').html(t);
}

function table_header_site() {
    var h = '\
<th nowrap>Date <br/>(recent 8 days)</th> \
<th>AWS Ireland</th> \
<th>Chicago<br>(PDC2.0)</th> \
<th>London</th> \
<th>Seoul</th> \
<th>Tokyo</th> \
<th>Toronto</th> \
<th>Unassigned</th> \
<th><font color="red">[Total]</font></th>';

    $('#site_alignments_header').html(h);
}


function drawAlignmentChart2() {
    loadRepos();

    var report_data_url = 'gnos_metadata/latest/reports/specimen_alignment_summary/hist_summary_site_counts.json';

    var json2 = $.ajax({
        url: report_data_url,
        dataType:"text",
        async: false
    }).responseText;

    data = $.parseJSON(json2)
    data.reverse();

    cumulative_table();

    var chart_data = new google.visualization.DataTable();
    chart_data.addColumn('string', 'Date');

    for (var i = 0; i < aln_repos_chart.length; i++) {
        chart_data.addColumn('number', repo_name[aln_repos_chart[i]]);
    }

    buildRows(data,chart_data);

    var colors = ["#C0C0C0","#808080","#000000","#FF0000","#800000","#FFFF00",
                  "#808000","#00FF00","#008000","#00FFFF","#008080","#0000FF",
                  "#000080","#FF00FF","#800080"];

    var today = realTime(data[data.length-1][0]);

    var today_counts = data[data.length-1].pop();
    var last_week_counts = data.length < 8 ? data[0].pop() : data[data.length-8].pop();

    var today_total = 0;
    var last_week_total = 0;
    for (var i = 0; i < aln_repos.length; i++) {
        //console.log(aln_repos[i]);
	var site_data = today_counts[aln_repos[i]];
        if (!site_data && aln_repos[i] == 'riken') {
            site_data = today_counts['tokyo'];
        }


	var count;
	if (site_data) {
	    count = parseInt(site_data['aligned'] || 0);
	}
	else {
	    count = 0;
	}

	var last_week_data = last_week_counts[aln_repos[i]];
        var last_count = 0;
	if (last_week_data) {
            last_count =  parseInt(last_week_data['aligned'] || 0);
	}
        today_total += count;
        last_week_total += last_count;

        diff = count - last_count;
        if (diff > 0) {
            diff = "+"+diff;
        }

	//console.log(aln_repos[i]+' '+today_total);
        $('#'+aln_repos[i]).html('&nbsp;'+count.toString()+ " ("+diff+")");
    }

    diff = today_total - last_week_total;
    if (diff > 0) {
        diff = "+"+diff;
    }
    dateString = months[today.getMonth()] + ' ' + today.getDate();

    $('#total').html('&nbsp;'+today_total.toString()+ " ("+diff+")");
    $('#thead0').html('Current Status ('+dateString+')');
    $('#thead1').html('Alignment Site');
    $('#thead2').html('Completed Specimens as of '+dateString+' (change from last week)');

    var options = {
	title: 'Alignments by site',
        colors: colors,
        vAxis: {viewWindow: {min: 0}, title: 'Specimens'},
        hAxis: {slantedText: true, slantedTextAngle: 45},
        legend: { position: 'right'},
        width: '100%',
        height: 500,
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

        for (var j = 0; j < aln_repos_chart.length; j++) {
	    //console.log(aln_repos_chart[j]);
	    var site_data = counts[aln_repos_chart[j]];

	    if (!site_data && aln_repos_chart[j] == 'riken') {
		site_data = counts['tokyo'];
	    }

	    var count;
	    if (site_data) {
		count = site_data['aligned'] || 0;
		count = parseInt(site_data['aligned']);
	    }
	    else {
		count = 1;
	    }
	    row.push(count);
	    total += count;
	}
    
	chart_data.addRow(row);
    }

    return total;
}


function loadSiteAlignmentTable() {

    var report_data_url = 'gnos_metadata/latest/reports/specimen_alignment_summary/hist_summary_site_counts.json';

    table_header_site();

    $.getJSON(report_data_url,
	      function (json) {
		  var tr;

		  for (var i = 0; i < json.length; i++) {
		      date = json[i][0];
		      counts = json[i][1];
		      total = 0;

		      tr = $('<tr/>');
		      tr.append("<td>" + date + "</td>");

		      for (var j = 0; j < aln_repos.length; j++) {
			  var site_data = counts[aln_repos[j]];
		
			  if (!site_data && aln_repos[j] == 'riken') {
			      site_data = counts['tokyo'];
			  }

			  var count = 0;
			  if (site_data) {
			      count = site_data['aligned'] || 0;
			      count = parseInt(site_data['aligned']);
			  }

			  tr.append("<td>" + count + "</td>");
			  total += count;
		      }
		      tr.append("<td><font color='red'>" + total + "</font></td>");
		      $("#site_alignments").append(tr);
		      if (i >= 7) break;
		  }

		  tfoot = $('<tfoot/>');
		  $("table[name='x1']").append(tfoot);
	      });
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
        'pdc1_1': 'Chicago (PDC1.1)',
        'pdc2_0': 'Chicago (PDC2.0)',
        'osdc-icgc': 'Chicago (ICGC)',
        'osdc-tcga': 'Chicago (TCGA)',
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
        'sanger': 'Cambridge',
	'unassigned': 'Unassigned'
    }

    aln_repos_chart = ['aws_ireland','pdc2_0', 'ebi', 'etri', 'oicr', 'riken'];
    aln_repos = ['aws_ireland','pdc2_0', 'ebi', 'etri', 'riken','oicr','unassigned'];
 }


function drawCumulativeTotalChart() {

    var url = 'gnos_metadata/latest/reports/specimen_alignment_summary/hist_summary_site_counts.json';

    var jsonData = $.ajax({
        url: url,
        dataType:"text",
        async: false
    }).responseText;

    data = $.parseJSON(jsonData);
    data.reverse();

    var chart_data = new google.visualization.DataTable();
    chart_data.addColumn('string', 'Date');
    chart_data.addColumn('number', 'Total');

    for (var i = 0; i < data.length; i++) {
        date = realTime(data[i][0]);

        counts = data[i][1];
        total = 0;

        dateString = date.getDate() + '-' + months[date.getMonth()];

        var row = new Array;
        row.push(' ');

        for (var j = 0; j < aln_repos_chart.length; j++) {
            var site_data = counts[aln_repos_chart[j]];
	    var count = 0;
	    if (site_data) {
		count = site_data['aligned'] || 0;
		count = parseInt(site_data['aligned']);
	    }
            total += count;
        }
	row.push(total);
        chart_data.addRow(row);
    }

    var options = {
        title: 'Alignments',
        legend: { position: 'right' },
        width: '100%',
        height: 250,
        pointSize: 3,
        chartArea:{left:50,top:50,width:'75%'},
        hAxis: {gridlines:{count:0},
                baselineColor:'white'},
        vAxis: {title:'Specimens'}

    };

    $('#cumulative_total_chart').empty();
    var chart = new google.visualization.LineChart(document.getElementById('cumulative_total_chart'));
    chart.draw(chart_data, options);
}
