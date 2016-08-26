/*global jQuery, window, document*/
/*jslint nomen:true,plusplus:true*/

/**
 * @preserve
 *
 * jquery-wcagmenu widget
 * Copyright 2015 DACHCOM.DIGITAL AG
 *
 * @author Volker Andres
 * @see https://github.com/dachcom-digital/jquery-wcagmenu
 * @license MIT
 * @version 0.2.1
 */
(function ($) {
    'use strict';

    $.widget('dcd.wcagmenu', {
        options: {
            classOpen: 'open',
            classFocus: 'focus',
            controls: {},
            openDelay: 300,
            closeDelay: 300,
            childMenuSelector: 'div:first',
            useMenuAim: true,
            useMouseDistanceThreshold: false,
            mouseDistanceThreshold: 10
        },

        _keys: {
            tab: 9,
            enter: 13,
            esc: 27,
            space: 32,
            left: 37,
            up: 38,
            right: 39,
            down: 40
        },

        _currentFocus: $(),
        _closeTimeout: undefined,
        _openTimeout: undefined,
        _openDelay: 300,
        _closeDelay: 300,
        _mousePoints: {},
        _track: {},
        _closing: false,

        _create: function () {
            this._on({
                'keydown': '_keyevent',
                'focus': '_focus',
                'blur': '_blur',
                'mouseover': '_mouseover',
                'mousemove': '_mousemove',
                'mouseleave': '_mouseleave',
                'mouseenter': '_mouseenter',
                'mousedown [class*=" level-"]': '_mousedown',
                'mousedown [class^="level-"]': '_mousedown'
            });

            this._openDelay = this.options.openDelay;
            this._closeDelay = this.options.closeDelay;

            if (this._isTouchDevice()) {
                this._openDelay = 0;
            }

            this.element.find('a').attr('tabindex', -1);
        },

        _isTouchDevice: function () {
            return window.ontouchstart !== undefined || window.navigator.MaxTouchPoints || window.navigator.msMaxTouchPoints || window.navigator.userAgent.toLowerCase().match(/windows phone os 7/i);
        },

        _mouseenter: function (event) {
            var self = this;

            if (self._closeTimeout !== undefined) {
                window.clearTimeout(self._closeTimeout);
            }

            if (self._openTimeout !== undefined) {
                window.clearTimeout(self._openTimeout);
            }
        },

        _mouseleave: function () {
            var self = this;

            if (self._closeTimeout !== undefined) {
                window.clearTimeout(self._closeTimeout);
            }

            if (self._openTimeout !== undefined) {
                window.clearTimeout(self._openTimeout);
            }

            self._closeTimeout = window.setTimeout(function () {
                self.element.find('.' + self.options.classFocus).removeClass(self.options.classFocus);
                self._closeMenu();
            }, self._closeDelay);
        },

        _mouseover: function (event) {
            var $target = $(event.target).closest('[class*=" level-"], [class^="level-"]');

            if (!$target.length) {
                return;
            }

            if (this._getLevel($target) > this._getCurrentLevel()) {
                window.clearTimeout(this._openTimeout);
                this._activateItem($target);
            }
        },

        _mousemove: function (event) {
            var $target = $(event.target).closest('[class*=" level-"], [class^="level-"]');

            if (!$target.length) {
                return;
            }

            this._openItem(event);
        },

        _mousedown: function () {
            var self = this;
            this._closing = true

            window.setTimeout(function () {
                self._closing = false
            }, 10);
        },

        _openItem: function (event) {
            var self = this,
                $current = self._currentFocus,
                $child = $current.find(this.options.childMenuSelector),
                $target = $(event.target).closest('[class*=" level-"], [class^="level-"]'),
                delay = this._openDelay;

            if (!$current.length) {
                delay = 0;
            } else {
                window.clearTimeout(this._openTimeout);
            }

            if (delay > 0 && !$current.find('[class*=level-]').length) {
                delay = 0;
            }

            if (delay > 0 && $current.length && $child.length) {

                if (this._resetDelayForMouse(event, $target, $child, $current)) {
                    delay = 0;
                }

                if (delay > 0 && this.options.useMouseDistanceThreshold) {
                    var dist = this._calcMouseDistance(event);

                    if (dist !== false && dist < this.options.mouseDistanceThreshold) {
                        delay = 0;

                        delete this._track.x;
                        delete this._track.y;
                    }
                }

                self._mousePoints.x = event.pageX;
                self._mousePoints.y = event.pageY;
            }

            if (delay === 0) {
                this._activateItem($target);
            } else {
                this._openTimeout = window.setTimeout(function () {
                    self._activateItem($target);
                    self._mousePoints = {};
                }, delay);
            }
        },

        _calcMouseDistance: function (event) {

            if (typeof this._track.x === 'undefined') {
                this._track.x = event.pageX;
                this._track.y = event.pageY;

                return false;
            }

            var dX = Math.abs(event.pageX - this._track.x),
                dY = Math.abs(event.pageY - this._track.y),
                distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));

            this._track.x = event.pageX;
            this._track.y = event.pageY;

            return distance;

        },

        _activateItem: function ($target) {
            this._closeItems($target);

            this._currentFocus = this._addFocus($target);
            if (this._currentFocus.find('[class*=level-]').length) {
                this._currentFocus.addClass(this.options.classOpen);
            }

            if (this._currentFocus.closest('[class*=" level-"], [class^="level-"]')) {
                this._currentFocus.parents('[class*=" level-"], [class^="level-"]').addClass(this.options.classFocus + ' ' + this.options.classOpen);
            }

            this._trigger('open', {}, [this._currentFocus]);
        },

        _closeItems: function ($target) {
            var $closeElements, $openElements, self = this,
                commonParent = $($target).parents().has(this._currentFocus).first().closest('[class*=" level-"], [class^="level-"]');

            $closeElements = this._currentFocus.parentsUntil(commonParent, '[class*=level-]').andSelf();
            $openElements = $target.parentsUntil(commonParent, '[class*=level-]').andSelf();

            $closeElements.not($openElements).each(function () {
                var $this = $(this);
                self._removeFocus($this);
                if ($this.hasClass(self.options.classOpen)) {
                    $this.removeClass(self.options.classOpen);
                    self._trigger('close', {}, [$this]);
                }
            });
        },

        _addFocus: function ($elements) {
            $elements.addClass(this.options.classFocus);
            this._trigger('focus', {}, [$elements]);
            return $elements;
        },

        _removeFocus: function ($elements) {
            return $elements.removeClass(this.options.classFocus);
        },

        _resetDelayForMouse: function (event, $target, $child, $current) {
            if ($current.data('menuaim') === false) {
                return true;
            }

            if (!this.options.useMenuAim) {
                return false;
            }

            var level = this._getCurrentLevel(), action, ax, ay, bx, by, cx, cy, check1, check2, check3;

            if (this.options.controls[level] === undefined) {
                return false;
            }

            if (this.options.controls[level].down === 'open') {
                action = 'down';
            }

            if (this.options.controls[level].right === 'open') {
                action = 'right';
            }

            if (this.options.controls[level].left === 'open') {
                action = 'left';
            }

            if (this.options.controls[level].up === 'open') {
                action = 'up';
            }

            if ($target.data('down') === 'open') {
                action = 'down';
            }

            if ($target.data('right') === 'open') {
                action = 'right';
            }

            if ($target.data('left') === 'open') {
                action = 'left';
            }

            if ($target.data('up') === 'open') {
                action = 'up';
            }

            switch (action) {
                case 'down':
                    ax = $current.offset().left + $current.width() / 2;
                    ay = $current.offset().top + $current.height();
                    bx = $child.offset().left;
                    by = $child.offset().top;
                    cx = $child.offset().left + $child.width();
                    cy = $child.offset().top;
                    break;

                case 'right':
                    ax = $current.offset().left + $current.width();
                    ay = $current.offset().top + $current.height() / 2;
                    bx = $child.offset().left;
                    by = $child.offset().top;
                    cx = $child.offset().left;
                    cy = $child.offset().top + $child.height();
                    break;

                case 'left':
                    ax = $current.offset().left;
                    ay = $current.offset().top + $current.height() / 2;
                    bx = $child.offset().left + $child.width();
                    by = $child.offset().top;
                    cx = $child.offset().left + $child.width();
                    cy = $child.offset().top + $child.height();
                    break;

                case 'up':
                    ax = $current.offset().left + $current.width() / 2;
                    ay = $current.offset().top;
                    bx = $child.offset().left;
                    by = $child.offset().top + $child.height();
                    cx = $child.offset().left + $child.width();
                    cy = $child.offset().top + $child.height();
                    break;
            }

            check1 = this._checkLineIntersection(this._mousePoints.x, this._mousePoints.y, event.pageX, event.pageY, ax, ay, bx, by);
            check2 = this._checkLineIntersection(this._mousePoints.x, this._mousePoints.y, event.pageX, event.pageY, ax, ay, cx, cy);
            check3 = this._checkLineIntersection(this._mousePoints.x, this._mousePoints.y, event.pageX, event.pageY, bx, by, cx, cy);

            if (check1.onLine2 === false && check2.onLine2 === false && check3.onLine2 === false) {
                return true;
            }

            return false;
        },

        _checkLineIntersection: function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
            // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
            var denominator, a, b, numerator1, numerator2, result = {
                x: null,
                y: null,
                onLine1: false,
                onLine2: false
            };
            denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
            if (denominator === 0) {
                return result;
            }
            a = line1StartY - line2StartY;
            b = line1StartX - line2StartX;
            numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
            numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
            a = numerator1 / denominator;
            b = numerator2 / denominator;

            // if we cast these lines infinitely in both directions, they intersect here:
            result.x = line1StartX + (a * (line1EndX - line1StartX));
            result.y = line1StartY + (a * (line1EndY - line1StartY));

            // if line1 is a segment and line2 is infinite, they intersect if:
            if (a > 0 && a < 1) {
                result.onLine1 = true;
            }
            // if line2 is a segment and line1 is infinite, they intersect if:
            if (b > 0 && b < 1) {
                result.onLine2 = true;
            }
            // if line1 and line2 are segments, they intersect if both of the above are true
            return result;
        },

        _focus: function (event) {
            var $target = $(event.target);
            if ($target.is(this.element)) {
                this._focusMenu();
            }
        },

        _blur: function (event) {
            var $target = $(event.target);
            if ($target.is(this.element)) {
                this._closeMenu();
            }
        },

        _keyevent: function (event) {
            switch (event.keyCode) {
                case this._keys.tab:
                    return this._closeMenu();
                case this._keys.esc:
                    this._closeMenu();
                    return this._focusMenu();
                case this._keys.down:
                    return this._key('down');
                case this._keys.up:
                    return this._key('up');
                case this._keys.left:
                    return this._key('left');
                case this._keys.right:
                    return this._key('right');
                case this._keys.space:
                    return this._open('space');
                case this._keys.enter:
                    return this._action();
            }
        },

        _getLevel: function ($element) {
            var classes = $element.attr('class') || '',
                matches = classes.match(/level-(\d+)/i);

            if (matches === null) {
                return 0;
            }

            return window.parseInt(matches[1], 10);
        },

        _getCurrentLevel: function () {
            return this._getLevel(this._currentFocus);
        },

        _getSiblings: function () {
            var level = this._getCurrentLevel();

            if (level === 1) {
                return this.element.find('.level-' + level);
            }
            return this._currentFocus.closest('.level-' + (level - 1)).find('.level-' + level);
        },

        _open: function (eventName) {
            var child, level = this._getCurrentLevel(), parent = this._currentFocus;

            // open current element, focus first level-x+1 element
            child = this._currentFocus.find('.level-' + (level + 1) + ':first');
            if (child.length) {
                this._currentFocus.addClass(this.options.classOpen);
                this._currentFocus = this._addFocus(child);
                this._trigger('open', {}, [parent]);
                return false;
            }

            if (eventName === 'space') {
                return this._action();
            }

            return false;
        },

        _close: function () {
            var parent, level = this._getCurrentLevel();

            // close parent element
            parent = this._currentFocus.closest('.level-' + (level - 1));
            if (parent.length) {
                this._currentFocus = parent.removeClass(this.options.classOpen);
                parent.find('.' + this.options.classFocus + ', .' + this.options.classOpen).removeClass(this.options.classFocus + ' ' + this.options.classOpen);
                this._trigger('close', {}, [parent]);
            }

            return false;
        },

        _action: function () {
            window.location.href = this._currentFocus.find('a').attr('href');
            return false;
        },

        _key: function (direction) {
            var level = this._getCurrentLevel(), action;

            action = this._currentFocus.data(direction) || this.options.controls[level][direction];
            action = action || 'none';

            return this['_' + action]();
        },

        _none: function () {
            return false;
        },

        _left: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            if (index !== 0) {
                this._removeFocus(this._currentFocus);
                this._currentFocus = this._addFocus(siblings.eq(index - 1));
            }
            return false;
        },

        _leftLoop: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            this._removeFocus(this._currentFocus);
            if (index === 0) {
                // first reached, focus last
                this._currentFocus = this._addFocus(siblings.eq(siblings.length - 1));
            } else {
                // focus prev
                this._currentFocus = this._addFocus(siblings.eq(index - 1));
            }
            return false;
        },

        _leftClose: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            this._removeFocus(this._currentFocus);
            if (index === 0) {
                // first reached, close parent
                this._close();
            } else {
                // focus prev
                this._currentFocus = this._addFocus(siblings.eq(index - 1));
            }
            return false;
        },

        _right: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            if (index !== siblings.length - 1) {
                this._removeFocus(this._currentFocus);
                this._currentFocus = this._addFocus(siblings.eq(index + 1));
            }

            return false;
        },

        _rightLoop: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            this._removeFocus(this._currentFocus);
            if (index === siblings.length - 1) {
                // end reached, focus first
                this._currentFocus = this._addFocus(siblings.eq(0));
            } else {
                // focus next
                this._currentFocus = this._addFocus(siblings.eq(index + 1));
            }
            return false;
        },

        _rightClose: function () {
            var siblings, index;

            siblings = this._getSiblings();
            index = siblings.index(this._currentFocus);

            this._removeFocus(this._currentFocus);
            if (index === siblings.length - 1) {
                // end reached, close parent
                this._close();
            } else {
                // focus next
                this._currentFocus = this._addFocus(siblings.eq(index + 1));
            }
            return false;
        },

        _up: function () {
            return this._left();
        },

        _upLoop: function () {
            return this._leftLoop();
        },

        _upClose: function () {
            return this._leftClose();
        },

        _down: function () {
            return this._right();
        },

        _downLoop: function () {
            return this._rightLoop();
        },

        _downClose: function () {
            return this._rightClose();
        },

        _focusMenu: function () {
            this._removeFocus(this.element.find('.' + this.options.classFocus));
            if (this._currentFocus.length) {
                this._currentFocus = this._addFocus(this._currentFocus.closest('.level-1'));
            } else {
                this._currentFocus = this._addFocus(this.element.find('.level-1:first'));
            }
        },

        _closeMenu: function () {
            var self = this, $this;

            if (this._closing !== true) {
                $.each(self.element.find('.' + self.options.classOpen), function () {
                    $this = $(this);
                    $this.removeClass(self.options.classOpen);
                    self._trigger('close', {}, [$this]);
                });

                this._removeFocus(this.element.find('.' + this.options.classFocus));
                this._trigger('closemenu', {}, [this.element]);
            }
        },

        _destroy: function () {
            this._closeMenu();
            this.element.find('[tabindex]').removeAttr('tabindex');
        }
    });
}(jQuery));
