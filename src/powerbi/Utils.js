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
 * Creates a calculator that calculates an appropriate date string format to represent the data
 */
function dateTimeFormatCalculator() {
    "use strict";
    var prevDate;
    var hasDates = false;
    var showYear = false;
    var showMonth = false;
    var showDay = false;
    var showHours = false;
    var showMinutes = false;
    var showSeconds = false;
    var showMilliseconds = false;
    return {
        /**
         * Adds the given date instance to the calculation
         * @param date The date to add
         */
        addToCalculation: function (date) {
            if (prevDate && date) {
                hasDates = true;
                var fullYear = date.getFullYear();
                if (fullYear && fullYear !== prevDate.getFullYear()) {
                    showYear = true;
                }
                if (date.getMilliseconds()) {
                    showMilliseconds = true;
                }
                if (date.getSeconds()) {
                    showSeconds = true;
                }
                if (date.getMinutes()) {
                    showMinutes = true;
                }
                if (date.getHours()) {
                    showHours = true;
                }
                if (date.getDate() - 1) {
                    showDay = true;
                }
                if (date.getMonth()) {
                    showMonth = true;
                }
            }
            prevDate = date;
        },
        getFormat: function () {
            // const DEFAULT_DATE_FORMAT = "yyyy-MM-dd hh:mm:ss.fff tt";
            var showAll = !hasDates;
            var showAnyTime = showHours || showMinutes || showSeconds || showMilliseconds || showAll;
            var showAnyDate = showDay || showMonth || showYear || showAll;
            var format = "";
            if (showAnyDate || showAll || (showAnyTime && showAnyDate)) {
                format += "yyyy";
            }
            if (showDay || showMonth || showAll || (showAnyTime && showAnyDate)) {
                format += "-MM";
            }
            if (showDay || showAll || (showAnyTime && showAnyDate)) {
                format += "-dd";
            }
            if (showAnyTime) {
                format += (showAnyDate ? " " : "") + "hh";
            }
            if (showMinutes || showSeconds || showMilliseconds || showAll) {
                format += ":mm";
            }
            if (showSeconds || showMilliseconds || showAll) {
                format += ":ss";
            }
            if (showMilliseconds || showAll) {
                format += ".fff";
            }
            if (showAnyTime || showAll) {
                format += " tt";
            }
            if (!format) {
                format = "yyyy";
            }
            return format;
        },
    };
}
exports.dateTimeFormatCalculator = dateTimeFormatCalculator;
