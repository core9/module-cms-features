angular.module( 'core9Dashboard.feature.config', [
  'core9Dashboard.config'
])

.controller("FeaturesConfigurationCtrl", function($scope, ConfigFactory, $http) {
    $scope.repos = ConfigFactory.query({configtype: 'featuresrepo_ext'});
    $scope.save = function (repo) {
        repo.$update();
    };
    $scope.addRepo = function(path, user, password) {
        if(path !== undefined) {
            var newRepo = new ConfigFactory();
            newRepo.path = path;
            newRepo.user = user;
            newRepo.password = password;
            newRepo.$save({configtype: 'featuresrepo_ext'}, function(data) {
                $scope.repos.push(data);
            });
        }
    };
    $scope.deleteRepo = function(repo) {
        repo.$remove(function() {
            $scope.repos = ConfigFactory.query({configtype: 'featuresrepo_ext'});
        });
    };
    $scope.downloadRepo = function(repo) {
        $http.post("/admin/featurerepository/" + repo._id + "?pull")
        .success(function(data) {
            alert("Success");
        })
        .error(function(data) {
            $scope.$emit("$error", data);
        });
    };
    $scope.uploadRepo = function(repo) {
        $http.post("/admin/featurerepository/" + repo._id + "?push")
        .success(function(data) {
            alert("Success");
        })
        .error(function(data) {
            $scope.$emit("$error", data);
        });
    };
})
;