/**
 * @param {Object} opts
 * @param {string} opts.name
 * @returns {function(*): {restrict: string, controller: controller, require: string, link: link}}
 */
module.exports = function ListTableDirectiveFactory (opts) {
  if (!opts) throw new Error('opts is required')
  if (!opts.name) throw new Error('opts.name is required')
  return /* @ngInject */function ($parse) {
    return {
      restrict: 'A',
      controller: /* @ngInject */function () { },
      require: opts.name,
      link: function ($scope, $elem, $attrs, tableController) {
        var $getter = $parse($attrs[ opts.name ])
        var $setter = $getter.assign
        tableController.order = $getter($scope)
        if (!tableController.order) {
          $setter($scope, tableController.order = {})
        }
      }
    }
  }
}
