var validator = require('validator')
  ;

var check = exports = module.exports = function(source) {
  var rules = Array.prototype.slice.call(arguments, 1);
  return function(req, res, next) {
    var valid = rules.every(function(rule) { return rule.run(req[source]); });
    if (valid) { return next(); }
    res.json(400, 'Invalid input');
  };
};

function Rule(key) {
  this._key = key;
  this._routines = [];
}

// merge validator into Rule
for (var name in validator) {
  if (validator.hasOwnProperty(name) && typeof validator[name] === 'function') {
    Rule.prototype[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      this._routines.push({name: name, args: args});
      return this;
    };
  }
}

Rule.prototype.notEmpty = function() {
  this._routines.push({name: 'isLength', args: [1]});
  return this;
};

Rule.prototype.run = function(data) {
  var value = data[this._key];
  this._routines.forEach(function(routine) {
    var args = routine.args.slice();
    args.unshift(value);
    value = validator[routine.name].apply(null, args);
  });
  return value;
};

check.Rule = Rule;

check.rule = function(key) {
  return new Rule(key);
};
