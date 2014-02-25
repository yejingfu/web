$(document).ready(function(){
    var sharejsChannel = 'http://10.148.218.224:3001/channel';
    var codeEditor = ace.edit('code_editor');
    //$('#text_editor').hide();
    sharejs.open('hello', 'text', sharejsChannel, function(err, doc) {
        if (err) console.log(err);
        //doc.attach_textarea($('#txt_editor')[0]);
        doc.attach_ace(codeEditor);
    });

    sharejs.open('world', 'text', sharejsChannel, function(err, doc) {
        if (err) console.log(err);
        doc.attach_textarea($('#txt_editor')[0]);
        //doc.attach_ace(codeEditor);
    });
})