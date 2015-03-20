//This is a modified build of Zepto that's used in the vanilla version of ItemSlide.js


//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.

    //hmmmmm
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  /*$.grep = function(elements, callback){
    return filter.call(elements, callback)
  }*/

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    /*is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },*/

    /*not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },*/
    /*has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },*/


    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },

    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },


    /*parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },*/

    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    /*contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },*/
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },/*
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },*/
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },

    /*data: function(name, value){ //Upgraded (go down)
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },*/
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (!$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    }/*,
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }*/
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  /*$.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }


  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }*/


  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }


  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  /*$.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }*/

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  /*$.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }*/

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function(){ //Hmmmmmmmm
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})()
//Optional Plugins - jQuery Mousewheel (~2.5KB)

//about:flags

/*
This is the main code
*/


var isExplorer = false || !!document.documentMode; // At least IE6

$(function(){ //document ready
    "use strict";





    $.fn.itemslide = function (options) {

            var initialLeft = 0;



            //Animation variables
            var currentPos = 0;

            var slidesGlobalID = 0; //rAf id



            //Panning Variables
            var direction = 0; //Panning Direction
            var isBoundary = false; //Is current slide the first or last one
            var distanceFromStart = 0;

            var vertical_pan = false; //True if current panning
            var horizontal_pan = false;


            var slides = this; //Saves the object given to the plugin in a variable



            var defaults = { //Options
                duration: 350,
                swipe_sensitivity: 150,
                disable_slide: false,
                disable_clicktoslide: false,
                disable_scroll: false,
                start: 0,
                one_item: false, //Set true for full screen navigation or navigation with one item every time
                pan_threshold: 0.3, //Precentage of slide width
                disable_autowidth: false,
                parent_width: false,
                swipe_out: false //Enable the swipe out feature - enables swiping items out of the carousel

            };

            var settings = $.extend({}, defaults, options);


            if(settings.parent_width)
            {
                slides.children().width(slides.parent().cwidth());//resize the slides
            }



            this.data("vars", //Variables that can be accessed publicly
                {
                    currentIndex: 0,
                    disable_autowidth: settings.disable_autowidth,
                    parent_width: settings.parent_width,
                    velocity: 0,
                    slideHeight: slides.children().height(),

                });







            //var slideWidth = slides.children().width();


            slides.end_animation = true;

            if(settings.swipe_out) //Check if enabled slideout feature
                slideout(slides,settings); //Apply slideout


            initialLeft = parseInt(slides.css("left").replace("px", ""));


            slides.css({ //Setting some css to avoid problems on touch devices
                'touch-action': 'pan-y',
                '-webkit-user-select': 'none',
                '-webkit-touch-callout': 'none',
                '-webkit-user-drag': 'none',
                '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
            });



            if (!settings.disable_autowidth)
                slides.css("width", slides.children('li').length * slides.children().cwidth() + 10); //SET WIDTH
            //To add vertical scrolling just set width to slides.children('li').width()

            //console.log("WIDTH: " + slides.css("width"));


            //Init


            slides.translate3d(0);



            gotoSlideByIndex(settings.start);


            //slides.children(":gt(2)" ).css("opacity",0); - Select all elements ~except~ the first 3




            /*Swiping and panning events FROM HERE*/
            var isDown = false;


            //Saved locations
            var startPointX = 0;
            var startPointY = 0;

            var prevent = false;

            var swipeStartTime = 0;

            var touch;


            //Swipe out related variables
            slides.savedSlideIndex = 0;



            slides.on('mousedown touchstart', 'li', function (e) {

                //if (!settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when the panning started


                    if (e.type == 'touchstart') //Check for touch event or mousemove
                    {
                        touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]) ); //jQuery for some reason "clones" the event.
                    }
                    else
                        touch = e;

                    //If hasn't ended swipe out escape
                    if(!slides.end_animation)
                        return;

                    //Reset
                    swipeStartTime = Date.now();

                    isDown = 1;

                    prevent = 0; //to know when to start prevent default

                    startPointX = touch.pageX;
                    startPointY = touch.pageY;

                    vertical_pan = false;
                    horizontal_pan = false;

                    slides.savedSlide = $(this);

                    slides.savedSlideIndex = slides.savedSlide.index();

                    //Swipe out reset
                    verticalSlideFirstTimeCount = 0;

                    //Reset until here
                    //Check this---

                    //currentPos = slides.currentLandPos;

                    //Turn on mousemove event when mousedown

                    $(window).on('mousemove touchmove', mousemove); //When mousedown start the handler for mousemove event




                    /*Clear Selections*/
                    if (window.getSelection) { //CLEAR SELECTIONS SO IT WONT AFFECT SLIDING
                        if (window.getSelection().empty) { // Chrome
                            window.getSelection().empty();
                        } else if (window.getSelection().removeAllRanges) { // Firefox
                            window.getSelection().removeAllRanges();
                        }
                    } else if (document.selection) { // IE?
                        document.selection.empty();
                    }
                    /*Clear Selections Until Here*/



                //}
            });

            //MouseMove related variables
            var firstTime = true;
            var savedStartPt = 0;


            //Some swipe out mouse move related vars
            var verticalSlideFirstTimeCount = 0; //This is used for the vertical pan if to happen once (to wrap it for later translate 3d it)



            function mousemove(e) //Called by mousemove event (inside the mousedown event)
                {


                    //Check type of event
                    if (e.type == 'touchmove') //Check for touch event or mousemove
                    {
                        touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]) );

                        if (Math.abs(touch.pageX - startPointX) > 10) //If touch event than check if to start preventing default behavior
                            prevent = 1;

                        if (prevent)
                            e.preventDefault();

                    } else //Regular mousemove
                    {
                        touch = e;
                        e.preventDefault();
                    }











                    //Set direction of panning
                    if ((-(touch.pageX - startPointX)) > 0) { //Set direction
                        direction = 1; //PAN LEFT
                    } else {
                        direction = -1;
                    }




                    //If out boundaries than set some variables to save previous location before out boundaries
                    if (isOutBoundaries()) {

                        if (firstTime) {
                            savedStartPt = touch.pageX;

                            firstTime = 0;

                        }

                    } else {

                        if (!firstTime) { //Reset Values
                            slides.currentLandPos = slides.translate3d().x;
                            startPointX = touch.pageX;
                        }

                        firstTime = 1;

                    }

                    //check if to wrap
                    if (verticalSlideFirstTimeCount == 1) //This will happen once every mousemove when vertical panning
                    {

                        if (isExplorer)//Some annoying explorer bug fix
                        {
                            //$(".itemslide_slideoutwrap").children().css("height",slides.data("vars").slideHeight);
                            slides.children().css("height",slides.data("vars").slideHeight);
                        }


                        slides.savedSlide.wrapAll("<div class='itemslide_slideoutwrap' />");//wrapAll

                        //slides.data("vars")("vars").slideHeight



                        verticalSlideFirstTimeCount = -1;
                    }



                    //Reposition according to current deltaX
                    if (Math.abs(touch.pageX - startPointX) > 6) //Check to see if TAP or PAN by checking using the tap threshold (if surpassed than cancelAnimationFrame and start panning)
                    {
                        if (!vertical_pan && slides.end_animation) //So it will stay one direction
                            horizontal_pan = true;

                        cancelAnimationFrame(slidesGlobalID); //STOP animation of sliding because if not then it will not reposition according to panning if animation hasn't ended



                    }
                    //Is vertical panning or horizontal panning
                    if (Math.abs(touch.pageY - startPointY) > 6) //Is vertical panning
                    {
                        if (!horizontal_pan && slides.end_animation) {
                            vertical_pan = true;
                        }
                    }





                    //Reposition according to horizontal navigation or vertical navigation
                    if (horizontal_pan) {

                        if (settings.disable_slide) { //Check if user disabled slide - if didn't than go to position according to distance from when horizontal panning started
                            return;
                        }

                        vertical_pan = false;

                        slides.translate3d(

                            ((firstTime == 0) ? (savedStartPt - startPointX + (touch.pageX - savedStartPt) / 4) : (touch.pageX - startPointX)) //Check if out of boundaries - if true than add springy panning effect

                            + slides.currentLandPos);

                        //Triggers pan and changePos when swiping carousel
                        slides.trigger('changePos');
                        slides.trigger('pan');


                    } else if (vertical_pan && settings.swipe_out) {//Swipe out
                        e.preventDefault();

                        $(".itemslide_slideoutwrap").translate3d(0, touch.pageY - startPointY); //Using wrapper to transform brief explanation at the top.
                        //Hmm opacity
                        //slides.savedSlide.css("opacity", ((100 - Math.abs(touch.pageY - startPointY)) / 100));

                        if (verticalSlideFirstTimeCount != -1) //Happen once...
                            verticalSlideFirstTimeCount = 1;
                        //console.log("vert");
                    }









                } //End of mousemove function




            $(window).on('mouseup touchend', /*Pan End*/

                function (e) {



                        //e.preventDefault();


                        if (isDown) {

                            if (e.type == 'touchend') //Check for touch event or mousemove
                                touch = (($.fn.jquery == null) ? e.changedTouches[0] : (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]) );
                            else
                                touch = e;

                            isDown = false;

                            $(window).off('mousemove touchmove'); //Stop listening for the mousemove event


                            //Check if vertical panning (swipe out) or horizontal panning (carousel swipe)
                            if (vertical_pan && settings.swipe_out) //Vertical PANNING
                            {

                                //HAPPENS WHEN SWIPEOUT

                                //swipeOutLandPos = -400; //CHANGE!!


                                slides.swipeOut();


                            } //Veritcal Pan

                            else if (slides.end_animation && !settings.disable_slide) { //if finished animation of sliding and swiping is not disabled



                                //Calculate deltaTime for calculation of velocity
                                var deltaTime = (Date.now() - swipeStartTime);
                                slides.data("vars").velocity = -(touch.pageX - startPointX) / deltaTime;

                                if (slides.data("vars").velocity > 0) { //Set direction
                                    direction = 1; //PAN LEFT
                                } else {
                                    direction = -1;
                                }


                                distanceFromStart = (touch.pageX - startPointX) * direction * -1; //Yaaa SOOO






                                //TAP is when deltaX is less or equal to 12px


                                if ((touch.pageX - startPointX) * direction < 6 * (-1)) //Check distance to see if the event is a tap
                                {

                                    gotoSlideByIndex(getLandingSlideIndex(slides.data("vars").velocity * settings.swipe_sensitivity - slides.translate3d().x));
                                    return;
                                    //NOT HERE - remove before commit
                                }
                            } //Regular horizontal pan until here




                            //TAP - click to slide
                            if (slides.savedSlide.index() != slides.data("vars").currentIndex && !((touch.pageX - startPointX) * direction < 6 * (-1)) && !settings.disable_clicktoslide) //TODO: SOLVE MINOR ISSUE HERE
                            { //If this occurs then its a tap
                                e.preventDefault(); //FIXED
                                gotoSlideByIndex(slides.savedSlide.index());
                            }
                            //TAP until here

                        }

                }
            );

            /*UNTIL HERE - swiping and panning events*/







            //IF YOU WANT TO ADD MOUSEWHEEL CAPABILITY - USE: https://github.com/jquery/jquery-mousewheel
            try {
                slides.mousewheel(function (event) {

                    if (!settings.disable_scroll) {
                        slides.data("vars").velocity = 0;
                        var mouseLandingIndex = slides.data("vars").currentIndex - event.deltaY;

                        if (mouseLandingIndex >= slides.children('li').length || mouseLandingIndex < 0) //If exceeds boundaries dont goto slide
                            return;

                        gotoSlideByIndex(mouseLandingIndex);

                        event.preventDefault();
                    }
                });
            } catch (e) {}
            //UNTILL HERE MOUSEWHEEL


            slides.on('gotoSlide', function (e, i) //triggered when object method is called
                {
                    gotoSlideByIndex(i);
                });




            function changeActiveSlideTo(i) {






                //Zepto problem fixed added ||0
                slides.children(':nth-child(' + ((slides.data("vars").currentIndex + 1)||0) + ')').attr('class', ''); //WORKS!!


                //console.log(slides.data("vars")("vars").currentIndex + 1);
                //            slides.children(':nth-child(' + (i + 1) + ')').attr("style", ""); //clean
                slides.children(':nth-child(' + ((i + 1)||0) + ')').attr('class', 'itemslide-active'); //Change destination index to active

                //console.log((i+1));

                if (i != settings.currentIndex) //Check if landingIndex is different from currentIndex
                {
                    slides.data("vars").currentIndex = i; //Set current index to landing index
                    slides.trigger('changeActiveIndex');
                }


                // ci = i WAS HERE


            }

            function getLandingSlideIndex(x) { //Get slide that will be selected when silding occured - by position

                for (var i = 0; i < slides.children('li').length; i++) {
                    //hmm widths with zepto allternating
                    //console.log(slides.children(':nth-child('+(i+1)+')').width());

                    if (slides.children().cwidth() * i + slides.children().cwidth() / 2 -

                        slides.children().cwidth() * settings.pan_threshold * direction - getPositionByIndex(0) > x) {


                        if (!settings.one_item)
                            return i;

                        else //If one item navigation than no momentum therefore different landing slide(one forward or one backwards)
                        {
                            if (i != slides.data("vars").currentIndex)
                                return slides.data("vars").currentIndex + 1 * direction; //Return 0 or more
                            else
                                return slides.data("vars").currentIndex;
                        }


                    }

                }
                //return 1;
                return settings.one_item ? slides.data("vars").currentIndex + 1 : slides.children('li').length - 1; //If one item enabled than just go one slide forward and not until the end.

            }



            function getPositionByIndex(i) {
                //console.log(-(i * slides.children().cwidth() - ((slides.parent().width() - initialLeft - slides.children().cwidth()) / 2)));
                //Another fix for zepto - select active one or else it will select first one

                return -(i * slides.children().cwidth() - ((slides.parent().cwidth() - initialLeft - slides.children().cwidth()) / 2));
            }


            function isOutBoundaries() { //Return if user is panning out of boundaries
                return (((Math.floor(slides.translate3d().x) > (getPositionByIndex(0)) && direction == -1) || (Math.ceil(slides.translate3d().x) < (getPositionByIndex(slides.children('li').length - 1)) && direction == 1)));
            }

            function gotoSlideByIndex(i) {



                if (i >= slides.children('li').length - 1 || i <= 0) //If exceeds boundaries dont goto slide
                {
                    isBoundary = true;
                    i = Math.min(Math.max(i, 0), slides.children('li').length - 1); //Put in between boundaries
                } else {
                    isBoundary = false;
                }


                changeActiveSlideTo(i);



                //SET DURATION

                total_duration = Math.max(settings.duration

                    - ((1920 / $(window).width()) * Math.abs(slides.data("vars").velocity) *
                        9 * (settings.duration / 230) //Velocity Cut

                    )

                    - (isOutBoundaries() ? (distanceFromStart / 15) : 0) // Boundaries Spring cut
                    * (settings.duration / 230) //Relative to chosen duration

                    , 50
                ); //Minimum duration is 10

                //SET DURATION UNTILL HERE

                total_back = (isBoundary ? ((Math.abs(slides.data("vars").velocity) * 250) / $(window).width()) : 0);




                currentPos = slides.translate3d().x;//PROBLEMMMMMMM ZEPTO


                slides.currentLandPos = getPositionByIndex(i);
                //console.log(slides.currentLandPos);








                //Reset


                cancelAnimationFrame(slidesGlobalID);
                startTime = Date.now();
                slidesGlobalID = requestAnimationFrame(animationRepeat);



            }


            //ANIMATION

            var total_back = 0;
            var total_duration = settings.duration;
            var startTime = Date.now(); //For the animation

            function animationRepeat() { //Repeats using requestAnimationFrame //For the sliding


                //alert($.easing['swing'](3, 4, 2, 2, 1));


                var currentTime = Date.now() - startTime;

                slides.trigger('changePos');







                slides.translate3d(currentPos - easeOutBack(currentTime, 0, currentPos - slides.currentLandPos, total_duration, total_back));
                //console.log(slides.translate3d());



                //to understand easings refer to: http://upshots.org/actionscript/jsas-understanding-easing



                if (currentTime >= total_duration) { //Check if easing time has reached total duration
                    //Animation Ended
                    slides.translate3d(slides.currentLandPos);

                    return; //out of recursion
                }



                slidesGlobalID = requestAnimationFrame(animationRepeat);


            }




            slides.gotoWithoutAnimation = function (i)//Goto position without sliding animation
            {
                slides.data("vars").currentIndex = i;
                slides.currentLandPos = getPositionByIndex(i);
                slides.translate3d(getPositionByIndex(i));
            }






        } //END OF INIT


    //SET
    $.fn.gotoSlide = function (i) {
        this.trigger('gotoSlide', i);
    }

    $.fn.next = function () { //Next slide


        this.gotoSlide(this.data("vars").currentIndex + 1);


    }

    $.fn.previous = function () { //Next slide

        this.gotoSlide(this.data("vars").currentIndex - 1);
    }


    $.fn.reload = function () { //Get index of active slide

        //Update some sizes
        if(this.data("vars").parent_width)
        {
            this.children().width(this.parent().cwidth());//resize the slides
        }

        if (!this.data("vars").disable_autowidth)
        {
            this.css("width", this.children('li').length * this.children().cwidth() + 10); //SET WIDTH

        }



        this.data("vars").slideHeight = this.children().height();

        /*if (isExplorer) {//Fix annoying bug in ie
            this.children().css("height","");
        }*/

        this.data("vars").velocity = 0; //Set panning veloicity to zero
        this.gotoSlide(this.data("vars").currentIndex);


    }


    $.fn.addSlide = function (data) {
        this.append("<li>" + data + "</li>");
        this.reload();
    }

    $.fn.removeSlide = function (index) {
        this.children(':nth-child(' + ((index + 1)||0) + ')').remove();
        //this.reload();
    }


    //GET
    $.fn.getActiveIndex = function () { //Get index of active slide
        return this.data("vars").currentIndex;
    }

    $.fn.getCurrentPos = function () { //Get current position of carousel

        return this.translate3d().x;
    }



    //Translates the x or y of an object or returns the x translate value
    $.fn.translate3d = function (x, y) {
        if (x != null) { //Set value

            this.css('transform', 'translate3d(' + x + 'px' + ',' + (y || 0) + 'px, 0px)');


        } else { //Get value
            var matrix = matrixToArray(this.css("transform"));

            ///  console.log($.fn.jquery); This is how to detect if using jQuery


            //Check if jQuery
            if($.fn.jquery != null) { //This happens if has jQuery
                return { //Return object with x and y
                    x: (isExplorer ? parseFloat(matrix[12]) : parseFloat(matrix[4])),
                    y: (isExplorer ? parseFloat(matrix[13]) : parseFloat(matrix[5]))
                };
            }


            else { //This happens if has --Zepto--
                var vals = this.css('transform').replace("translate3d","").replace("(","").replace(")","").replace(" ","").replace("px","").split(",");//Consider regex instead of tons of replaces

                return { //Return object with x and y
                    x: parseFloat(vals[0]),
                    y: parseFloat(vals[1])//YESSS Fixed
                };
            }


        }
    }


    $.fn.cwidth = function (){ //This is for getting width via css
        return parseInt(this.css("width").replace("px",""));
    }











});


//General Functions
function matrixToArray(matrix) {
    return matrix.substr(7, matrix.length - 8).split(', ');
}


function easeOutBack(t, b, c, d, s) {
    //s - controls how forward will it go beyond goal
    if (s == undefined) s = 1.70158;

    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}
/*
This code is for the swipe out feature.
Can be enabled by setting the swipe_out option to true.
*/

/*
    Wrappers for slide out explantion:
    To apply multiple transforms on one element - you wrap the element with a tag to apply the transform on the tag.
*/

//http://css-tricks.com/useful-nth-child-recipies/

function slideout(slides, settings) {




        //Swipe out section
        var swipeOutLandPos = -400; //Some variables for the swipe out animation
        var swipeOutStartTime = Date.now();
        var currentSwipeOutPos = 0;
        var currentPos2 = 0;
        var swipeOutGlobalID = 0;

        var durationSave = 0;

        var savedOpacity = 0;
        var prev;
        var finish_swiping = false;



        var swipeDirection; // check direction of sliding - 1 (true) is up 0 is down

        slides.end_animation = true;



        var goback = false;
        //Activate swipe out animation




        //slides.swipeOut = function(){
        slides.swipeOut = function () {



            currentSwipeOutPos = $(".itemslide_slideoutwrap").translate3d().y;

            swipeDirection = (currentSwipeOutPos < 0);

            //Check direction of swiping and change land position according
            if (!swipeDirection)
                swipeOutLandPos = 400;
            else
                swipeOutLandPos = -400;


            //Check if to count as slide out or go back
            if (Math.abs(0 - currentSwipeOutPos) < 50) {
                goback = true;
                swipeOutLandPos = 0;
            } else {
                goback = false;

                //Trigger swipeout event
                slides.trigger({
                    type: "swipeout",
                    slide: slides.savedSlideIndex
                });
            }


            //Some resets


            removeWrapper = 0;

            durationSave = settings.duration;

            prev = slides.savedSlide;





            swipeOutStartTime = Date.now();

            savedOpacity = slides.savedSlide.css("opacity");


            //Replaced gt and lt with a pure css alternative
            if (slides.savedSlideIndex < slides.data("vars").currentIndex) //Check if before or after
            {

                before = true;
                slides.children(":nth-child(-n+" + (slides.savedSlideIndex+1) + ")").wrapAll("<div class='itemslide_move' />");
            } else {
                before = false;
                slides.children(":nth-child(n+" + (slides.savedSlideIndex+2) + ")").wrapAll("<div class='itemslide_move' />");/*Hmm looks like it works good on (x+2)*/
            }






            ///BACK
            enableOpacity = true;

            slides.end_animation = false; //Set to disable more swipe out until finished (see swipeOutAnimation end if)


            swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
        }

        var enableOpacity = true;
        var currentTime = 0;



        var removeWrapper = 0;

        //RAF Right here



        var before = false;








        function swipeOutAnimation() //Animate the swipe out animation
            { //And then continue
                currentTime = Date.now() - swipeOutStartTime;




                if (enableOpacity) {
                    //savedSlide
                    // * ((swipeDirection) ? 1 : -1)
                    $(".itemslide_slideoutwrap").translate3d(0, currentSwipeOutPos - easeOutBack(currentTime, 0, currentSwipeOutPos - swipeOutLandPos, 250, 0)); //DURATION VELOCITY
                    slides.savedSlide.css("opacity", savedOpacity - easeOutBack(currentTime, 0, savedOpacity - 0, 250, 0) * (goback ? -1 : 1)); //Can try to remove opacity when animating width

                } else {
                    //Animate slides after current swiped out slide




                    if (goback) //Go back to regular (escape)
                    {





                        $(".itemslide_slideoutwrap").children().unwrap(); //
                        $(".itemslide_move").children().unwrap(); //Remove wrapper


                        if(isExplorer)//Some more propeirtery explorer problems yippe :)
                        {
                            //$(".itemslide_slideoutwrap").children().css("height","");
                            slides.children().css("height","");
                        }


                        slides.end_animation = true;
                        currentTime = 0;

                        return;
                    }


                    $(".itemslide_move").translate3d(0 - easeOutBack(currentTime - 250, 0, 0 + slides.savedSlide.width(), 125, 0) * (before ? (-1) : 1)); //Before - multiply by -1 to turn to positive if before = true




                }


                if (removeWrapper == 1) //Happen once every time
                {



                    //console.log("AD");




                    $(".itemslide_slideoutwrap").children().unwrap(); //TODO:CHANGE


                    //The slide changes to active

                    if (slides.savedSlideIndex == slides.data("vars").currentIndex) //Cool it works
                        $(".itemslide_move").children(':nth-child(' + (1) + ')').attr('class', 'itemslide-active'); //Change destination index to active

                    //Looks like the fix works
                    if (slides.savedSlideIndex == (slides.children().length - 1) && !before && slides.savedSlideIndex == slides.data("vars").currentIndex) //Is in last slide
                    {
                        //console.log("len "+(slides.children().length-1)+"ssi "+(slides.savedSlideIndex));
                        settings.duration = 200;
                        slides.gotoSlide(slides.children().length - 2); //Goto last slide (we still didn't remove slide)
                        //console.log(slides.data("vars").currentIndex);
                    }

                    if (slides.savedSlideIndex == 0 && slides.data("vars").currentIndex != 0) {

                        currentTime = 500; //To escape this will finish animation

                    }



                    removeWrapper = -1;
                }

                //Change current index
                if (currentTime >= 250) {
                    //slides.data("vars").currentIndex = slides.data("vars").currentIndex-1;
                    enableOpacity = false;

                    if (removeWrapper != -1) //Happen once...
                        removeWrapper = 1;


                    if (currentTime >= 375) {







                        $(".itemslide_move").children().unwrap(); //Remove wrapper

                        slides.removeSlide(prev.index()); //CAN DOO A WIDTH TRICK ;)
                        //slides.reload();
                        if (slides.savedSlideIndex == 0 && slides.data("vars").currentIndex != 0 || before) {
                            //change index instant change of active index
                            //Create function in this file to instant reposition.
                            //Or just t3d and getPositionByIndex
                            slides.gotoWithoutAnimation(slides.data("vars").currentIndex - 1);

                            //Goto-slide to slide without animation

                        }


                        settings.duration = durationSave;
                        currentTime = 0;
                        slides.end_animation = true; //enables future swipe outs

                        return;
                    }


                }




                swipeOutGlobalID = requestAnimationFrame(swipeOutAnimation);
            } //End of raf









    } //End of slide out init
