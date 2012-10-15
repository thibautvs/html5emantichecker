/*
 * Html5emantichecker
 * version 0.5
 * author: Thibaut Van Spaandonck (Urge2code)
 * http://www.urge2code.com
 * http://github.com/Urge2code/Html5emantichecker
 * Licensed under the MIT license.
*/
(function(window, undefined) {
    window.Html5emantichecker = {
        initialize: function(errorsContainer, infosContainer) {
            if (errorsContainer === undefined || infosContainer === undefined) {
                throw new Error("Initialization failed: all containers must be defined.");
            }
            this._errorsContainer = errorsContainer;
            this._infosContainer = infosContainer;
        },
        check: function(htmlString) {
            this._reset();
            if (htmlString === undefined || htmlString === "") {
                return;
            };
            var cleanHtmlString = this._getCleanHtmlString(htmlString);
            this._src = $("<div>").html(cleanHtmlString);
            this._checkMainStructure();
            this._checkIdentifiersAndClasses();
            this._checkTablelessDesign();
            this._checkInputTypes();
            this._done();
        },
        _checkMainStructure: function() {
            var essentialTags = ["header", "footer", "nav"],
                secondaryTags = ["section", "article", "aside"],
                that = this;
            $.each(essentialTags, function(index, value) {
                if (!that._containsTagNotion(value)) {
                    that._shouldBeUsingTagError(value);
                }
            });
            $.each(secondaryTags, function(index, value) {
                if (!that._containsTagNotion(value)) {
                    that._shouldConsiderUsingTagInfo(value);
                }
            });
            this._src.find("p").each(function() {
                if ($(this).html() === "") {
                    that._useCssMarginsError();
                }
            });
            // TODO detect at least 2 br tags that follow
        },
        _checkIdentifiersAndClasses: function() {
            var tagNames = [
                "header", "footer", "menu", "section", "article", "nav", "aside", "details", "summary",
                "figure", "figcaption", "hgroup", "mark", "meter", "progress", "ruby", "time"
            ];
            
            for (var i=0 ; i<tagNames.length ; i++) {
                var currentName = tagNames[i],
                    relatedTag = currentName === "menu" ? "nav" : currentName,
                    eltHavingIdExists = this._containsElementHavingId(currentName),
                    eltsHavingClassExist = this._containsElementsHavingClass(currentName);
                
                if (eltHavingIdExists) {
                    this._replaceElementHavingIdByTagError(currentName, relatedTag);
                }
                if (eltsHavingClassExist) {
                    this._replaceElementHavingClassByTagError(currentName, relatedTag);
                }
            }
        },
        _checkInputTypes: function() {
            var hasInputText = this._src.find("input[type='text']").length > 0;
            if (hasInputText) {
                this._considerUsingNewInputTypesInfo();
            }
        },
        _checkTablelessDesign: function() {
            var hasTables = this._src.find("table").length > 0;
            if (hasTables) {
                this._implementTablelessDesignInfo();
            }
        },
        _containsElementHavingId: function(id) {
            return this._src.find("#" + id).get(0) !== undefined;
        },
        _containsElementsHavingClass: function(className) {
            return this._src.find("." + className).length > 0;
        },
        _containsTagNotion: function(tagName) {
            return this._src.find(tagName).length > 0
                || this._containsElementHavingId(tagName)
                || this._containsElementsHavingClass(tagName);
        },
        _getCleanHtmlString: function(htmlString) {
            // Get <body> content then strip &nbsp; occurences, <img> and <script> tags
            var bodyRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im,
                scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                imgRegex = /<img\b[^>]*?>/gi,
                nbspRegex = /&nbsp;/gi,
                bodyMatches = bodyRegex.exec(htmlString);
            if (bodyMatches !== null && bodyMatches.length > 1) {
                htmlString = bodyMatches[1];
            }
            htmlString = htmlString.replace(scriptRegex, "")
                                   .replace(imgRegex, "")
                                   .replace(nbspRegex, "");
            return htmlString;
        },
        _shouldBeUsingTagError: function(tagName) {
            this._addError("It is strongly recommended that your page contains a &lt;" + tagName + "&gt; element");
        },
        _shouldConsiderUsingTagInfo: function(tagName) {
            this._addInfo("You should consider using &lt;" + tagName + "&gt; elements");
        },
        _useCssMarginsError: function() {
            this._addError("Don't use empty &lt;p&gt; elements to structure your page, use CSS margins instead");
        },
        _replaceElementHavingIdByTagError: function(id, tagName) {
            this._addError("Replace element having id \"" + id + "\" by a &lt;" + tagName + "&gt; element");
        },
        _replaceElementHavingClassByTagError: function(className, tagName) {
            this._addError("Replace element having class \"" + className + "\" by a &lt;" + tagName + "&gt; element");  
        },
        _considerUsingNewInputTypesInfo: function() {
            var inputTypes = ["color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "search", "tel", "time", "url", "week"];
            this._addInfo("Consider replacing &lt;input type='text'&gt; element(s) with new input types (" + inputTypes.join(", ") + ") when applicable");
        },
        _implementTablelessDesignInfo: function() {
            this._addInfo("Presence of &lt;table&gt; element(s) has been detected; be sure to use them only for tabular data and not for layout purposes");
        },
        _done: function() {
            if (this._errorCount === 0 && this._infoCount === 0) {
                this._addInfo("Semantic validation succeeded! Congratulations!");
            }
        },
        _addError: function(errorMessage) {
            var item = this._createListItem(errorMessage);
            if (this._errorsList === undefined) {
                this._errorsList = $("<ul>");
                this._errorsContainer.append(this._errorsList);
            }
            this._errorsList.append(item);
            this._errorCount++;
        },
        _addInfo: function(infoMessage) {
            var item = this._createListItem(infoMessage);
            if (this._infosList === undefined) {
                this._infosList = $("<ul>");
                this._infosContainer.append(this._infosList);
            }
            this._infosList.append(item);
            this._infoCount++;
        },
        _createListItem: function(message) {
            return $("<li>").html(message);
        },
        _reset: function() {
            this._empty(this._errorsList);
            this._empty(this._infosList);
            this._empty(this._src);
            this._errorCount = 0;
            this._infoCount = 0;
        },
        _empty: function(element) {
            if (element !== undefined) {
                element.empty();
            }
        },
        _errorsContainer: undefined,
        _infosContainer:undefined,
        _errorsList: undefined,
        _infosList: undefined,
        _src: undefined,
        _errorCount: 0,
        _infoCount: 0
    };
})(window);