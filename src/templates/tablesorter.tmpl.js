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
 * The template for the table sorter
 */
function default_1() {
    "use strict";
    return "\n        <div class=\"lineup-component\">\n            <div class=\"nav\">\n                <ul>\n                    <li class=\"clear-selection\" title=\"Clear Selection\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-check fa-stack-1x\"></i>\n                                <i class=\"fa fa-ban fa-stack-2x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-column\" title=\"Add Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-columns fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-stacked-column\" title=\"Add Stacked Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-bars fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                </ul>\n                <hr/>       \n            </div>\n            <div style=\"position:relative\">\n                <div class=\"grid\"></div>\n                <div class='load-spinner'><div>\n            </div>\n        </div>\n    ".trim().replace(/\n/g, "");
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
