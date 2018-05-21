/**
 * @param {Object} opts
 * @param {string} [opts.templateUrl='/views/partials/pageHeader.html']
 * @returns {function(): {templateUrl}}
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.templateUrl = opts.templateUrl || '/views/partials/pageHeader.html'
  return /*@ngInject*/function () {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: opts.templateUrl,
      scope: {
        title: '@',
        subtitle: '@?'
      },
      bindToController: true,
      controller: /*@ngInject*/function () { },
      controllerAs: '$ctrl'
    }
  }
}
