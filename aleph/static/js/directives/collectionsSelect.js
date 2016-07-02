aleph.directive('collectionsSelect', ['$http', '$q', 'Metadata', 'Collection',
    function($http, $q, Metadata, Collection) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      'setCollection': '&setCollection',
      'collection': '=',
      'category': '='
    },
    templateUrl: 'templates/collections_select.html',
    link: function (scope, element, attrs, model) {
      scope.roleName = null;
      scope.collections = [];
      scope.collection = {};
      scope.createCollection = false;

      Metadata.get().then(function(metadata) {
        scope.roleName = metadata.session.role.name;
      });

      Collection.getWriteable().then(function(collections) {
        scope.collections = collections;
        if (!collections.length) {
          scope.setCreateCollection(true);
        } else {
          scope.collection = collections[0];
          scope.update();
        }
      });

      scope.setCreateCollection = function(flag) {
        scope.createCollection = flag;
        if (flag) {
          scope.collection = {
            label: scope.roleName + '\'s Collection'
          };
        } else {
          scope.collection = scope.collections[0];
        }
        scope.update();
      };

      scope.update = function() {
        if (scope.createCollection && scope.collection.label.length < 3) {
          scope.setCollection({'callback': null});
        } else {
          scope.setCollection({'callback': function() {
            var dfd = $q.defer();
            if (scope.createCollection) {
              scope.collection.category = scope.category;
              $http.post('/api/1/collections', scope.collection).then(function(res) {
                scope.collections.push(res.data);
                scope.createCollection = false;
                scope.collection = res.data;
                Collection.flush().then(function() {
                  dfd.resolve(res.data);  
                });
              }, function(err) {
                dfd.reject();
              });
            } else {
              dfd.resolve(scope.collection);
            }
            return dfd.promise;
          }});
        }
      };
    }
  };
}]);