/*
 * Copyright (C) 2016 Microsoft
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
"use strict";
/**
 * A mixin that adds support for event emitting
 */
var EventEmitter = (function () {
    function EventEmitter() {
        this.listeners = {};
    }
    /**
     * Adds an event listener for the given event
     */
    EventEmitter.prototype.on = function (name, handler) {
        var _this = this;
        var listeners = this.listeners[name] = this.listeners[name] || [];
        listeners.push(handler);
        return {
            destroy: function () {
                _this.off(name, handler);
            }
        };
    };
    /**
     * Removes an event listener for the given event
     */
    EventEmitter.prototype.off = function (name, handler) {
        var listeners = this.listeners[name];
        if (listeners) {
            var idx = listeners.indexOf(handler);
            if (idx >= 0) {
                listeners.splice(idx, 1);
            }
        }
    };
    /**
     * Raises the given event
     */
    /*protected*/ EventEmitter.prototype.raiseEvent = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var listeners = this.listeners[name];
        if (listeners) {
            listeners.forEach(function (l) {
                l.apply(_this, args);
            });
        }
    };
    return EventEmitter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventEmitter;
