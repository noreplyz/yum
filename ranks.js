var msrankings = {};
var loginSys = {};

msrankings.ranks = {};

msrankings.levels = {'220': 84838062013,
'221': 88231584493,
'222': 91760847872,
'223': 95431281786,
'224': 99248533057,
'225': 103218474379,
'226': 107347213354,
'227': 111641101888,
'228': 116106745963,
'229': 120751015801,
'230': 246332072234,
'231': 251258713678,
'232': 256283887951,
'233': 261409565710,
'234': 266637757024,
'235': 271970512164,
'236': 277409922407,
'237': 282958120855,
'238': 288617283272,
'239': 294389628937,
'240': 594667050452,
'241': 600613720956,
'242': 606619858165,
'243': 612686056746,
'244': 618812917313,
'245': 625001046486,
'246': 631251056950,
'247': 637563567519,
'248': 643939203194,
'249': 650378595225,
'250': 1313764762354,
'251': 1326902409977,
'252': 1340171434076,
'253': 1353573148416,
'254': 1367108879900,
'255': 1380779968699,
'256': 1394587768385,
'257': 1408533646068,
'258': 1422618982528,
'259': 1436845172353,
'260': 2902427248153,
'261': 2931451520634,
'262': 2960766035840,
'263': 2990373696198,
'264': 3020277433159,
'265': 3050480207490,
'266': 3080985009564,
'267': 3111794859659,
'268': 3142912808255,
'269': 3174341936337,
'270': 6412170711400,
'271': 6476292418514,
'272': 6541055342699,
'273': 6606465896125,
'274': 6672530555086,
'275': 1};

msrankings.getRanking = function(num) {
    return $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/http://maplestory.nexon.net/rankings/world-ranking/kradia?pageIndex=' + num,
        crossDomain: true
    }).done(function(data){
        return data;
    }).fail(function() {
        setTimeout(function() {
            console.log("Failed" + num);
            msrankings.getRanking(num);
        }, 5000);
    });
};

msrankings.processRanking = function(num) {
    return msrankings.getRanking(num).then(function(d) {
        var contents = $(d);
        contents = $($(contents.find('.ranking-container')).find('tr'));
        $.each(contents, function(i,v) { 
            if (i == 0) {
                return;
            }
            var rank = $($(v).find('td:nth-child(1)')).text().replace(/\s+/g, '');
            var user = $($(v).find('td:nth-child(3)')).text();
            var stats = $($(v).find('td:nth-child(6)')).text();
            stats = stats.replace(/\s+/g, ' ');
            stats = stats.split(' ');
            var exp = String(stats[2]);
            exp = exp.substring(1, exp.length - 1);
            stats[2] = exp;
            msrankings.ranks[rank] = {
                user: user,
                level: parseInt(stats[1]),
                exp: parseInt(stats[2])
            };
        });
    });
};

msrankings.getAllRankings = function() {
    var rankPromises = [];
    $('#ranks').append('Loading');

    for (var i = 1; i < 50; i = i + 5) {
        rankPromises.push(msrankings.processRanking(i));
    }
    $.when.apply($, rankPromises).done(function() {
        msrankings.showRankings();
    }).fail(function() {
        msrankings.getAllRankings();
    });
};

msrankings.showRankings = function() {
    $('#ranks').empty();
    $('#ranks').append('<table id="ranks-table" class="mdl-data-table mdl-js-data-table">' +
    '<thead>' +
        '<tr>' +
            '<th>Rank</th>' +
            '<th class="mdl-data-table__cell--non-numeric">User</th>' +
            '<th>Level</th>' +
            '<th>EXP</th>' +
            '<th>%</th>' +
        '</tr>' +
    '</thead>' +
    '<tbody>' +
    '</tbody>' +
    '</table>');
    $.each(msrankings.ranks, function(i, v) {
        var percent = parseInt(v.exp) / msrankings.levels[v.level] * 100;
        $('#ranks-table tbody').append('<tr>' +
            '<td class="unselect">' + i + '</td>' +
            '<td class="unselect mdl-data-table__cell--non-numeric">' + v.user + '</td>' +
            '<td class="unselect">' + v.level + '</td>' +
            '<td>' + v.exp + '</td>' +
            '<td class="unselect">' + percent.toFixed(2) + '%</td>' +
            '</tr>');
    });
};

$(function() {
    $('body').on('click', '#getranks', function() {
        $(this).hide();
        msrankings.getAllRankings();
    });
})