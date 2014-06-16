define([
    './tooltip'
], function(Toolkit) {

Toolkit.Popover = Toolkit.Tooltip.extend({
    name: 'Popover',
    version: '1.5.0',

    /**
     * Initialize the popover.
     *
     * @param {jQuery} nodes
     * @param {Object} [options]
     */
    constructor: function(nodes, options) {
        options = options || {};
        options.mode = 'click'; // Click only

        Toolkit.Tooltip.prototype.constructor.call(this, nodes, options);
    }

}, {
    getContent: 'data-popover',
    template: '<div class="popover">' +
        '<div class="popover-inner">' +
            '<div class="popover-head"></div>' +
            '<div class="popover-body"></div>' +
        '</div>' +
        '<div class="popover-arrow"></div>' +
    '</div>'
});

Toolkit.create('popover', function(options) {
    return new Toolkit.Popover(this, options);
}, true);

return Toolkit;
});