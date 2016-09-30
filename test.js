
var jsondiffpatch = require('jsondiffpatch').create({});

var country = {
  name: "Argentina",
  capital: "Buenos Aires",
  unasur: true
};

var country2 = {
  name: "Argentinaaaaa",
  capital: "Buenos Aires",
  unasur: false
};

var delta = jsondiffpatch.diff(country, country2);

jsondiffpatch.patch(country, delta);
console.log(country)
