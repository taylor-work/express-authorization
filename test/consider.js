var assert = require('assert');
var authorization = require('../');

var permissions = [ "identity:view", "session:*", "system:list,view,edit", "version:v2??" ];
var user = { permissions: permissions };

describe('considerSubject/isPermitted', function() {
  it ('Denies with no subject.', function() {
    assert.equal(authorization.considerSubject().isPermitted(), false);
    assert.equal(authorization.considerSubject().isPermitted('noun:verb'), false);
  });

  it ('Denies when called and no permissions are declared permitted.', function() {
    assert.equal(authorization.considerSubject(user).isPermitted(), false);
  });

  it ('Denies when a subject does not match.', function() {
    assert.equal(authorization.considerSubject(user).isPermitted('perforce:destroy'), false);
  });

  it ('Permits when a subject exactly matches.', function() {
    assert.equal(authorization.considerSubject(user).isPermitted('identity:view'), true);
  });
});

describe('considerPermissions/isPermitted', function() {
  it ('Denies with no permissions.', function() {
    assert.equal(authorization.considerPermissions().isPermitted(), false);
    assert.equal(authorization.considerPermissions().isPermitted('noun:verb'), false);
  });

  it ('Denies when called and no permissions are declared permitted.', function() {
    assert.equal(authorization.considerPermissions('noun:verb').isPermitted(), false);
  });

  it ('Denies when permissions do not match.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('perforce:destroy'), false);
  });

  it ('Permits when a permission exactly matches.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('identity:view'), true);
  });

  it ('Permits when a permission matches an item in a list query.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('system:view'), true);
  });

  it ('Permits when a permission matches a wildcard query.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('session:random'), true);
  });

  it ('Permits when a permission matches an optional character query.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('version:v200'), true);
  });

  it ('Permits when all permissions match.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted('system:view', 'session:random'), true);
    assert.equal(authorization.considerPermissions(permissions).isPermitted('system:view', ['session:random']), true);
    assert.equal(authorization.considerPermissions(permissions).isPermitted(['system:view', 'session:random']), true);
  });

  it ('Denies when any permission fails to match.', function() {
    assert.equal(authorization.considerPermissions(permissions).isPermitted(['system:shutdown', 'session:random']), false);
  });

  it ('Works with fine grained permissions extending to a noun:verb:subject structure and beyond.', function() {
    assert.equal(authorization.considerPermissions('l1:l2:*').isPermitted('l1:l2:l3'), true);
    assert.equal(authorization.considerPermissions('l1:l2:*').isPermitted('l1:l2'), false);
    assert.equal(authorization.considerPermissions('l1:l2:*:*:*').isPermitted('l1:l2:l3:l4:l5'), true);
  });
});
