
var templateRootConst = '<%= project %>TemplateRoot';

angular.module('<%= project %>', [<%= getModules() %>])
.constant(templateRootConst, '<%= templateRoot %>');

//We use var notation instead of function notation here so it will be minified
var templateUrlFactory = function(path) {
  return [templateRootConst, function(templateRoot) {
    return templateRoot + '/' + path;
  }];
};

