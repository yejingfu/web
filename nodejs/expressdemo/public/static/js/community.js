define(['common'], function(common) {

/**
The Community stuffs.
@class Community
@since 1.0.0
@constructor
**/
var Community = function(app) {
    common.View.call(this, app);
};

Community.prototype = new common.View();

/**
Intialize the community.
@method intialize
**/
Community.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Community.initialize()');
};

/**
Launch the community.
@method show
**/
Community.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Community.show()');
    var self = this;
    self.getContents(undefined, 'json', function(data) {
        console.log(JSON.stringify(data));
        $('#contents').append($('<p>articles from yejingfu\'s <a href="https://github.com/yejingfu">github</a>:</p><hr>'));
        for (var i = 0, len = data.length; i < len; i++) {
            self.showContent(data[i]);
        }
    });
};

Community.prototype.showContent = function(name) {
    var self = this;
    var htmlContainer = '<div id="container_'+name+'" style="border:none; margin:8px;padding:5px"></div>';
    var htmlHeader = '<div id="header_'+name+'"><a id="btn_'+name+'" href="javascript:;" class="navbar-link">'+name+'</a></div>';
    var htmlContent = '<div id="content_'+name+'" style="border:solid 1px; display:none; padding:10px"></div>';
    $('#contents').append($(htmlContainer));
    $('#container_'+name).append($(htmlHeader));
    $('#container_'+name).append($(htmlContent));
    $('#btn_'+name).click(function() {
        $('#content_'+name).toggle('slow');
        if ($('#content_'+name).is(':empty')) {
            self.getContents(name, 'text', function(data) {
                $('#content_'+name).html(data);
            });
        }
    });
};

Community.prototype.getContents = function(name, dt, cb) {
    var path = '/community/contents';
    if (name) path = path + '/' + name;
    $.ajax({
        url: path,
        type: 'GET',
        async: true,
        dataType: dt,
        success: function(data, st, jqHXR) {
            cb(data);
        },
        error: function(req, st, err) {
            console.error('failed to get ' + path);
        }
    });
};

return {
    create: function(app) {
        return new Community(app);
    }
};

});