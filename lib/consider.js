module.exports = {
  considerSubject: considerSubject,
  considerPermissions: considerPermissions
}

var Permission;

Permission = (function() {
  function Permission(perm) {
    var p, parts;
    parts = perm.split(':');
    this.parts = (function() {
      var k, len, results;
      results = [];
      for (k = 0, len = parts.length; k < len; k++) {
        p = parts[k];
        results.push(p.split(','));
      }
      return results;
    })();
  }

  Permission.prototype.implies = function(p) {
    var i, j, k, l, len, localPart, part, parts, partsSize, ref, ref1, ref2;
    p = new Permission(p);
    parts = this.parts;
    partsSize = parts.length - 1;
    i = 0;
    ref = p.parts;
    for (k = 0, len = ref.length; k < len; k++) {
      part = ref[k];
      if (partsSize < i) {
        return true;
      }
      localPart = parts[i];
      if ((!localPart.includes('*')) && (!part.every(function(p) {
        return localPart.includes(p);
      }))) {
        return false;
      }
      i++;
      void 0;
    }
    for (j = l = ref1 = i, ref2 = parts.length; l < ref2; j = l += 1) {
      localPart = parts[j];
      if (!localPart.includes('*')) {
        return false;
      }
      void 0;
    }
    return true;
  };

  return Permission;

})();


function considerSubject(subject) {
  var permissions = [];
  if (subject && subject.permissions) permissions = subject.permissions;
  return considerPermissions(permissions);
}

function considerPermissions(/* permission ... or [permission, ....] */) {
  var claim = compileClaim.apply(null, arguments);
  Object.defineProperty(claim, "isPermitted", { value: isPermitted });
  return claim;
}

function coalescePermissions(/* permission ... or [permission, ...] */) {
  var permissions = [], i;
  for (i=0; i < arguments.length; i++) {
    if (arguments[i] != null && arguments[i] != undefined){
      permissions = permissions.concat(arguments[i]);
    }
  }
  return permissions;
}

function isPermitted(/* permission ... or [permission, ...] */) {
  var permissions = coalescePermissions.apply(null, arguments);
  if (permissions.length === 0) return false;
  var self = this;
  return permissions.every(function(c) {
    var k, len, p;
    for (k = 0, len = self.length; k < len; k++) {
      p = self[k];
      if (p.implies(c)) {
        return true;
      }
    }
    return false;
  });
}

function compileClaim(/* permission ... or [permission, ....] */) {
  var permissions = coalescePermissions.apply(null, arguments);
  if (permissions.length == 0) return new RegExp("$false^");

  var statements = [];
  for (var i=0; i<permissions.length; i++){
    statements.push(new Permission(permissions[i]));
  }
  return statements;
}
