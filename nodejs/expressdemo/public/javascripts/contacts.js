define(['common'], function(common) {

/**
The contacts.
@class Contacts
@since 1.0.0
@constructor
**/
var Contacts = function(app) {
    common.View.call(this, app);
};

Contacts.prototype = new common.View();

/**
Intialize the contacts.
@method intialize
**/
Contacts.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Contacts.initialize()');
};

/**
Launch the contacts.
@method show
**/
Contacts.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Contacts.show()');
};

return {
    create: function(app) {
        return new Contacts(app);
    }
};

});