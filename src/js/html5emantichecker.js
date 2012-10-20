/*
 * Html5emantichecker
 * version 0.6
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
            this._isInitialized = true;
        },
        
        check: function(htmlString) {
            if (!this._isInitialized) {
                throw new Error("initialize method must be called first.");
            }
            
            this._reset();
            if (htmlString === undefined || htmlString === "") {
                return;
            };
            var cleanHtmlString = this._getCleanHtmlString(htmlString);
            this._src = $("<div>").html(cleanHtmlString);
            this._checkMainStructure();
            this._checkIdentifiersAndClasses();
            this._checkInputTypes();
            this._checkTablelessDesign();
            this._checkDeprecatedTags();
            this._checkDeprecatedAttributes();
            this._done();
        },
        
        _checkMainStructure: function() {
            var essentialTags = ["header", "footer", "nav"],
                secondaryTags = ["section", "article", "aside"],
                that = this;
            
            $.each(essentialTags, function(index, value) {
                if (!that._containsTagNotion(value)) {
                    that._logShouldBeUsingTag(value);
                }
            });
            $.each(secondaryTags, function(index, value) {
                if (!that._containsTagNotion(value)) {
                    that._logShouldConsiderUsingTag(value);
                }
            });
            this._src.find("p").each(function() {
                if ($(this).html() === "") {
                    that._logUseCssMargins();
                    return(false);
                }
            });
        },
        
        _checkIdentifiersAndClasses: function() {
            var tagNames = [
                "header", "footer", "menu", "section", "article", "nav",
                "aside", "details", "summary", "figure", "figcaption", 
                "hgroup", "mark", "meter", "progress", "ruby", "time"
            ];
            
            for (var i=0 ; i<tagNames.length ; i++) {
                var currentName = tagNames[i],
                    relatedTag = currentName === "menu" ? "nav" : currentName,
                    eltHavingIdExists = this._containsElementHavingId(currentName),
                    eltsHavingClassExist = this._containsElementsHavingClass(currentName);
                
                if (eltHavingIdExists) {
                    this._logReplaceElementHavingIdByTag(currentName, relatedTag);
                }
                if (eltsHavingClassExist) {
                    this._logReplaceElementHavingClassByTag(currentName, relatedTag);
                }
            }
        },
        
        _checkInputTypes: function() {
            var hasInputText = this._containsElement("input[type='text']");
            if (hasInputText) {
                this._logConsiderUsingNewInputTypes();
            }
        },
        
        _checkTablelessDesign: function() {
            var hasTables = this._containsElement("table");
            if (hasTables) {
                this._logImplementTablelessDesign();
            }
        },
        
        _checkDeprecatedTags: function() {
            var deprecatedTags = [
                "acronym", "applet", "b", "basefont", "big", "blackface",
                "blockquote", "center", "dir", "embed", "font", "frame",
                "frameset", "i", "iframe", "isindex", "layer", "menu",
                "noembed", "noframes", "s", "shadow", "strike", "tt", "u"],
                that = this;
            
            $.each(deprecatedTags, function(index, value) {
                if (that._containsElement(value)) {
                    if (value === "b") {
                        that._logReplaceByTag("b", "strong");
                    } else if (value === "i") {
                        that._logReplaceByTag("i", "em");
                    } else if (value === "u" || value === "center") {
                        that._logUseCssInsteadOfTag(value);
                    } else {
                        that._logDeprecatedTag(value);
                    }
                }
            });
        },
        
        _checkDeprecatedAttributes: function() {
            var deprecatedAttributes = ["style"], //TODO check more attributes
                that = this;
            
            $.each(deprecatedAttributes, function(index, value) {
                if (that._containsElement("[" + value + "]")) {
                    if (value === "style") {
                        that._logDontUseInlineStyles();
                    }
                }
            });
        },
        
        _containsElementHavingId: function(id) {
            return this._src.find("#" + id).get(0) !== undefined;
        },
        
        _containsElementsHavingClass: function(className) {
            return this._containsElement("." + className);
        },
        
        _containsElement: function(tagName) {
            return this._src.find(tagName).length > 0;     
        },
        
        _containsTagNotion: function(tagName) {
            return this._containsElement(tagName)
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
        
        _done: function() {
            if (this._errorCount === 0 && this._infoCount === 0) {
                this._addInfo("Semantic validation succeeded! Congratulations!");
            }
        },
        
        _logShouldBeUsingTag: function(tagName) {
            this._addError("It is strongly recommended that your page contains a &lt;" + tagName + "&gt; element");
        },
        
        _logShouldConsiderUsingTag: function(tagName) {
            this._addInfo("You should consider using &lt;" + tagName + "&gt; elements");
        },
        
        _logUseCssMargins: function() {
            this._addError("Don't use empty &lt;p&gt; elements to structure your page, use CSS margins instead");
        },
        
        _logReplaceElementHavingIdByTag: function(id, tagName) {
            this._addError("Replace element having id \"" + id + "\" by a &lt;" + tagName + "&gt; element");
        },
        
        _logReplaceElementHavingClassByTag: function(className, tagName) {
            this._addError("Replace element having class \"" + className + "\" by a &lt;" + tagName + "&gt; element");  
        },
        
        _logConsiderUsingNewInputTypes: function() {
            var inputTypes = ["color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "search", "tel", "time", "url", "week"];
            this._addInfo("Consider replacing &lt;input type='text'&gt; element(s) with new input types (" + inputTypes.join(", ") + ") when applicable");
        },
        
        _logImplementTablelessDesign: function() {
            this._addInfo("Presence of &lt;table&gt; element(s) has been detected; be sure to use them only for tabular data and not for layout purposes");
        },
        
        _logReplaceByTag: function(deprecatedTag, recommendedTag) {
            this._addError("Use &lt;" + recommendedTag + "&gt; instead of &lt;" + deprecatedTag + "&gt;");
        },
        
        _logDeprecatedTag: function(tagName) {
            this._addError("Don't use the deprecated &lt;" + tagName + "&gt; tag");  
        },
        
        _logUseCssInsteadOfTag: function(tagName) {
            this._addError("Don't use &lt;" + tagName + "&gt; and use CSS for this purpose")  
        },
        
        _logDontUseInlineStyles: function() {
            this._addError("Don't use inline styles and use CSS for this purpose")
        },
        
        _isInitialized: false,
        _errorsContainer: undefined,
        _infosContainer: undefined,
        _errorsList: undefined,
        _infosList: undefined,
        _src: undefined,
        _errorCount: 0,
        _infoCount: 0
    };
})(window);