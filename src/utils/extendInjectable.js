var normalizeInjectable = require('./normalizeInjectable')

module.exports = function extendInjectable (base, extender) {
  base = normalizeInjectable(base)
  extender = normalizeInjectable(extender)

  var baseFunction = base[ base.length - 1 ]
  var extenderFunction = extender[ extender.length - 1 ]

  return [].concat(
    base.slice(0, -1),
    extender.slice(0, -1),
    function () {
      var self = this
      self = baseFunction.apply(this, Array.prototype.slice.call(arguments, 0, base.length - 1)) || self
      self = extenderFunction.apply(self, Array.prototype.slice.call(arguments, base.length)) || self
      return self
    }
  )
}
