define(['common'], function(common) {

/**
The collaboration labs.
@class Collaboration
@since 1.0.0
@constructor
**/
var Collaboration = function(app) {
    common.View.call(this, app);

    this.jsonState = undefined;  // The sharejs document(state) of json editor
};

Collaboration.prototype = new common.View();

/**
Intialize the contacts.
@method intialize
**/
Collaboration.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Contacts.initialize()');
    this.initializeSharejs();
};

/**
Launch the contacts.
@method show
**/
Collaboration.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Contacts.show()');
};

Collaboration.prototype.initializeSharejs = function() {
    var self = this;
    var sharejsPort = '80';
    var sharejsChannel = location.protocol + '//' + location.host+':'+ sharejsPort + '/channel';

    // code editor
    // var codeEditor = ace.edit('code_editor');
    // sharejs.open('code', 'text', sharejsChannel, function(err, doc) {
    //     if (err) console.log(err);
    //     doc.attach_ace(codeEditor);
    // });

    // plan text editor
    sharejs.open('plan1', 'text', sharejsChannel, function(err, doc) {
        if (err) console.log(err);
        doc.attach_textarea($('#text_input1')[0]);
    });

    sharejs.open('json1', 'json', sharejsChannel, function(err, jsonDoc) {
        if (err) console.log(err);
        self.jsonState = jsonDoc;
        jsonDoc.on('change', function(op) {
            debugger;
            console.log('json: changing--' + JSON.stringify(op));
            self.updateJSONState(op);
        });
        if (jsonDoc.created) {
            console.log('json: document is created at the first time!');
            var initObj = {authors: [{
                author: 'Jeff Ye',
                email: 'Jeff.Ye@autodesk.com',
                xform:[0,0,0],
                skills: {
                    'programming': ['C', 'C++', 'Javascript'],
                    'mathematics': ['algorithm', 'boolean']
                }},
                {
                    author: 'Peter',
                    email: 'peter@autodesk.com',
                    skills:{}
                }
            ]};
            jsonDoc.submitOp([{p:[], od:null, oi:initObj}]);
        } else {
            console.log('json: document is already created!');
            self.updateJSONState();
        }
    });

    $('#btn_text1').click(function() {
        $('#text_editor1').toggle();
    });

    $('#btn_json2').click(function() {
        $('#json_editor2').toggle();
    });

    $('#json_update').click(function() {
        if (self.jsonState) {
            var obj = JSON.parse($('#json_input2').val());
            var op = {p:['authors', 0, 'xform'], od:[0,0,0], oi:[1,1,1]};
            self.jsonState.submitOp([op]);
        }
    });

    //$('#json_editor2').show();
    $('#text_editor1').show();

};

Collaboration.prototype.updateJSONState = function(op) {
    if (op) {
        var str = $('#json_input2').val();
        str = str || '{}';
        var oldObj = JSON.parse(str);
        var parent = oldObj;
        var curObj;
        var curPath = op[0].p.length > 0 ? op[0].p[0] : undefined;;
        for (var i = 1, len = op[0].p.length; parent && i < len; i++) {
            parent = parent[curPath];
            curPath = op[0].p[i];
        }
        if (curPath) {
            if (op[0].od === parent[curPath]) {
                delete parent[curPath];
            }
            if (op[0].oi) {
                parent[curPath] = op[0].oi;
            }
        } else {
            oldObj = op[0].oi;
        }
        $('#json_input2').val(JSON.stringify(oldObj));

    } else {
        // first run and the doc is already created.
        var ss = this.jsonState.snapshot;
        $('#json_input2').val(JSON.stringify(ss));
    }
};

Collaboration.prototype.addToLog = function(msg) {
    var txt = $('#log_input').val();
    txt += msg + '\n';
    $('#log_input').val(txt);
};

return {
    create: function(app) {
        return new Collaboration(app);
    }
};

});