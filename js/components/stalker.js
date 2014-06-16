define([
    './component',
    '../extensions/throttle'
], function(Toolkit) {

Toolkit.Stalker = Toolkit.Component.extend({
    name: 'Stalker',
    version: '1.4.0',

    /** Container to monitor scroll events on. */
    container: $(window),

    /** Targets to active when a marker is reached. */
    targets: [],

    /** Markers to compare against. */
    markers: [],

    /** Top value for all markers. */
    offsets: [],

    /**
     * Initialize the stalker.
     *
     * @param {jQuery} element
     * @param {Object} [options]
     */
    constructor: function(element, options) {
        this.element = element = $(element).addClass(Toolkit.vendor + 'stalker');
        this.options = options = this.setOptions(options);

        if (!options.target || !options.marker) {
            throw new Error('A marker and target is required');
        }

        if (element.css('overflow') === 'auto') {
            this.container = element;
        }

        // Initialize events
        this.events = {
            'scroll container': $.throttle(this.onScroll.bind(this), options.throttle),
            'ready document': 'onScroll'
        };

        this.initialize();

        // Gather markets and targets
        this.refresh();
    },

    /**
     * Remove classes before destroying.
     */
    destructor: function() {
        var targets = this.targets,
            markers = this.markers,
            vendor = Toolkit.vendor;

        targets.removeClass(vendor + 'stalker-target');
        markers.removeClass(vendor + 'stalker-marker');

        if (this.options.applyToParent) {
            targets.parent().removeClass('is-active');
            markers.parent().removeClass('is-marked');
        } else {
            targets.removeClass('is-active');
            markers.removeClass('is-marked');
        }
    },

    /**
     * Activate a target when a marker is entered.
     *
     * @param {Element} marker
     */
    activate: function(marker) {
        this._stalk(marker, 'activate');
    },

    /**
     * Deactivate a target when a marker is exited.
     *
     * @param {Element} marker
     */
    deactivate: function(marker) {
        this._stalk(marker, 'deactivate');
    },

    /**
     * Gather the targets and markers used for stalking.
     */
    refresh: function() {
        var isWindow = this.container.is(window),
            eTop = this.element.offset().top,
            offset,
            offsets = [],
            vendor = Toolkit.vendor;

        if (this.element.css('overflow') === 'auto' && !this.element.is('body')) {
            this.element[0].scrollTop = 0; // Set scroll to top so offsets are correct
        }

        this.targets = $(this.options.target).addClass(vendor + 'stalker-target');

        this.markers = $(this.options.marker).addClass(vendor + 'stalker-marker').each(function(index, marker) {
            offset = $(marker).offset();

            if (!isWindow) {
                offset.top -= eTop;
            }

            offsets.push(offset);
        });

        this.offsets = offsets;
    },

    /**
     * Either active or deactivate a target based on the marker.
     *
     * @private
     * @param {Element} marker
     * @param {String} type
     */
    _stalk: function(marker, type) {
        marker = $(marker);

        // Stop all the unnecessary processing
        if (type === 'activate' && marker.hasClass('is-stalked')) {
            return;
        }

        var options = this.options,
            targetBy = options.targetBy,
            markBy = options.markBy,
            method = (type === 'activate') ? 'addClass' : 'removeClass',
            target = this.targets.filter(function() {
                return $(this).attr(targetBy).replace('#', '') === marker.attr(markBy);
            });

        marker[method]('is-stalked');

        if (options.applyToParent) {
            target.parent()[method]('is-active');
        } else {
            target[method]('is-active');
        }

        this.fireEvent(type, [marker, target]);
    },

    /**
     * While the element is being scrolled, notify the targets when a marker is reached.
     *
     * @private
     */
    onScroll: function() {
        var scroll = this.container.scrollTop(),
            offsets = this.offsets,
            onlyWithin = this.options.onlyWithin,
            threshold = this.options.threshold;

        this.markers.each(function(index, marker) {
            marker = $(marker);

            var offset = offsets[index],
                top = offset.top - threshold,
                bot = offset.top + marker.height() + threshold;

            // Scroll is within the marker
            if (
                (onlyWithin && scroll >= top && scroll <= bot) ||
                (!onlyWithin && scroll >= top)
            ) {
                this.activate(marker);

            // Scroll went outside the marker
            } else {
                this.deactivate(marker);
            }
        }.bind(this));

        this.fireEvent('scroll');
    }

}, {
    target: '',
    targetBy: 'href',
    marker: '',
    markBy: 'id',
    threshold: 50,
    throttle: 50,
    onlyWithin: true,
    applyToParent: true
});

Toolkit.create('stalker', function(options) {
    return new Toolkit.Stalker(this, options);
});

return Toolkit;
});