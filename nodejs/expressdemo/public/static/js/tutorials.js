define(['common'], function(common) {

/**
The tutorials stuffs.
@class Tutorials
@since 1.0.0
@constructor
**/
var Tutorials = function(app) {
    common.View.call(this, app);
    this.articleName = undefined;
};

Tutorials.prototype = new common.View();

/**
Intialize the tutorial.
@method intialize
**/
Tutorials.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Tutorials.initialize()');
    var search = window.location.search;
    if (search.length > 0 && search[0] === '?') {
        var queries = search.slice(1).split('&');
        for (var i = 0, len = queries.length; i < len; i++) {
            var pair = queries[i].split('=');
            if (pair.length === 2) {
                if (pair[0] === 'article') {
                    this.articleName = pair[1];
                }
            }
        }
    }
};

/**
Launch the tutorials.
@method show
**/
Tutorials.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Tutorials.show()');
    var self = this;
    // get markdown-style contents from server...
    var url = '/tutorials/contents';
    $.ajax({
        url: url,
        type: 'GET',
        async: true,
        dataType: 'json',
        success: function(data, st, jqHXR) {
            if (data && data.names instanceof Array) {
                for (var i = 0, len = data.names.length; i < len; i++) {
                    self.showContent(data.names[i]);
                }
            }
        },
        error: function(req, st, err) {
            console.error('Failed to get /tutorials/contents');
        }
    });
};

Tutorials.prototype.showContent = function(name) {
    var self = this;

    var htmlLink = '<br><div><a id="btn_'+name+'" href="javascript:;" class="navbar-link">'+name+'</a></div>';

    var htmlContainer = '<div id="div_'+name+'" style="display:none; border:solid 1px; margin:8px;padding:5px"></div>';

    var htmlPreview = '<div id="div_preview_'+name+'">'+
        '<div style="text-align:right">[<a id="edit_'+name+'" href="javascript:;" class="navbar-link">edit</a>]</div>'+
        '<div id="content_'+name+'" ></div></div>';

    var htmlForm = '<form id="form_'+name+'" method="post" action="/tutorials/contents/'+name+'">'+
        '<textarea id="text_'+name+'" name="content" rows=10 style="width:100%;resize:none;outline:0"></textarea>'+
        '<input type="hidden" id="input_username" name="username"/>'+
        '<div id="save_'+name+'">'+
        '<a id="form_submit_'+name+'" class="navbar-link" href="javascript:;"> save </a> | '+
        '<a id="form_cancel_'+name+'" class="navbar-link" href="javascript:;">cancel</a></div></form>';

    var appendChild = function(parent, html, id, data, asHtml) {
        var p = $(parent);
        p.empty();
        p.append($(html));
        if (asHtml) {
            $(id).html(data);
        } else {
            $(id).text(data);
        }
    };

    var originData;

    var hookupActions = function() {
        $('#edit_'+name).click(function() {
            self.getContentByName(name, 'md', function(data) {
                appendChild('#div_'+name, htmlForm, '#text_'+name, data, false);
                hookupActions();
            });
        });

        $('#form_submit_'+name).click(function() {
            var username = prompt('What\'s your name:');
            if (!username || username === '') return;
            $('#input_username').val(username);
            //$('#form_'+name).submit(); // this would cause redirect
            $.ajax({
                url:'/tutorials/contents/'+name,
                type:'POST',
                async: true,
                data: $('#form_'+name).serialize(),
                success: function(data, st, jqHXR) {
                    self.getContentByName(name, 'html', function(data) {
                        appendToContents(data);
                    });
                },
                error: function(req, st, err) {
                    console.error('Failed to post /tutorials/contents/id');
                    alert('Failed to save: ' + err);
                    //appendChild('#div_'+name, htmlPreview, '#content_'+name, originData, true);
                    //hookupActions();
                }
            });
        });

        $('#form_cancel_'+name).click(function() {
            appendChild('#div_'+name, htmlPreview, '#content_'+name, originData, true);
            hookupActions();
        });
    };

    var appendToContents = function(data) {
        originData = data;
        appendChild('#div_'+name, htmlPreview, '#content_'+name, data, true);
        hookupActions();
    };

    var toggle = function() {
        $('#div_'+name).toggle('slow');
        if ($('#div_'+name).is(':empty')) {
            self.getContentByName(name, 'html', function(data) {
                appendToContents(data);
            });
        }
    };

    $('#contents').append($(htmlLink));
    $('#contents').append($(htmlContainer));

    $('#btn_'+name).click(function() {
        toggle();
    });
    debugger;
    if (name === this.articleName) {
        toggle();
    }
};

Tutorials.prototype.getContentByName = function(name, contentType, onSuccess) {
    $.ajax({
        url: '/tutorials/contents/'+name,
        type: 'GET',
        async: true,
        dataType: 'text',
        data: {type: contentType},
        success: function(data, st, jqHXR) {
            onSuccess(data);
        },
        error: function(req, st, err) {
            console.error('Failed to get /tutorials/contents/id');
        }
    });
};


return {
    create: function(app) {
        return new Tutorials(app);
    }
};

});