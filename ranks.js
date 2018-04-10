var msrankings = {};
var loginSys = {};

msrankings.ranks = {};

msrankings.getRanking = function(num) {
    return $.ajax({
        url: 'http://www.whateverorigin.org/get?url=' + encodeURIComponent('http://maplestory.nexon.net/rankings/world-ranking/kradia?pageIndex=' + num) + '&callback=?',
        dataType: 'json'
    }).done(function(data){
        return data.contents;
    }).fail(function() {
        setTimeout(function() {
            console.log("Failed" + num);
            msrankings.getRanking(num);
        }, 1000);
    });
}

msrankings.processRanking = function(num) {
    return msrankings.getRanking(num).then(function(d) {
        var contents = $(d.contents);
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
}

msrankings.getAllRankings = function() {
    var rankPromises = [];

    for (var i = 1; i < 50; i = i + 5) {
        rankPromises.push(msrankings.processRanking(i));
    }
    $.when.apply($, rankPromises).done(function() {
        msrankings.showRankings();
    }).fail(function() {
        msrankings.getAllRankings();
    });
}

msrankings.showRankings = function() {
    $.each(msrankings.ranks, function(i, v) {
        $('#ranks').append('<div class="ranks-box"><div class="ranks-rank">' + i + '</div>' + 
            '<div class="ranks-user">' + v.user + '</div>' + 
            '<div class="ranks-level">' + v.level + '</div>' + 
            '<div class="ranks-exp">' + v.exp + '</div></div>');
    });
}

$(function() {
    $('body').on('click', '#getranks', function() {
        $(this).hide();
        msrankings.getAllRankings();
    });
})