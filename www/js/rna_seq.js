
$(document).ready(function () {
    report_data_url = "gnos_metadata/latest/reports/donors_RNA_Seq_alignment_summary/"; 
    $.getJSON(report_data_url + "donor.json",
    function (json) {
        var t_donors_with_RNA_Seq_alignment = 0;
        var t_both_tophat_and_star_aligned_in_tumor = 0;
        var t_tophat_aligned_star_not_in_tumor = 0;
        var t_star_aligned_tophat_not_in_tumor = 0;
        var t_donors_with_both_normal_and_tumor_alignment = 0;
        var ctypes = ['donors_with_RNA_Seq_alignment', 'both_tophat_and_star_aligned_in_tumor', 'tophat_aligned_star_not_in_tumor','star_aligned_tophat_not_in_tumor', 'donors_with_both_normal_and_tumor_alignment'
                     ];
        var total = [0, 0, 0, 0, 0];
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
                   : "<a target='abc' href='" + report_data_url + json[i]['project'] + "." + ctypes[j] + ".donors.txt'>" + json[i][ctypes[j]] + "</a>";
                tr.append("<td>" + cell_value + "</td>");
                total[j] += json[i][ctypes[j]];
            }
            $("table[name='x9']").append(tr);
        }


        tfoot = $('<tfoot/>');
        tfoot.append('<tr><td colspan="50">*Report processed: ' + json[0]['timestamp'] + '</td></tr>');
        $("table[name='x9']").append(tfoot);
    });
});

