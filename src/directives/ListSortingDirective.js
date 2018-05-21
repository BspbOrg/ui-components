var noop = require('angular').noop
var isFunction = require('angular').isFunction

/**
 *
 * @param {Object} opts
 * @param {string} opts.name
 * @param {string} opts.tableName
 * @returns {function(*=): {restrict: string, require: string, link: link}}
 */
module.exports = function ListSortingDirectiveFactory (opts) {
  if (!opts) throw new Error('opts is required')
  if (!opts.name) throw new Error('opts.name is required')
  if (!opts.tableName) throw new Error('opts.tableName is required')

  return /*@ngInject*/function ($timeout) {
    return {
      restrict: 'A',
      require: '^' + opts.tableName,
      link: function ($scope, $elem, $attrs, tableCtrl) {
        var key = $attrs[ opts.name ]

        $elem.on('click', function (event) {
          if (isFunction(event.preventDefault)) { event.preventDefault() }
          if (isFunction(event.stopPropagation)) { event.stopPropagation() }

          if (tableCtrl.order.elem) { tableCtrl.order.elem.removeClass('sorted asc desc') }

          tableCtrl.order.reverse = tableCtrl.order.key === key && !tableCtrl.order.reverse
          tableCtrl.order.key = key
          tableCtrl.order.elem = $elem

          $elem.addClass('sorted').addClass(tableCtrl.order.reverse ? 'desc' : 'asc')

          $timeout(noop)
        })
      }
    }
  }
}
