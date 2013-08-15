var express = require('express');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  var buffer = fs.readFileSync('index.html',function(error,data){
      if (error) throw error;
      console.log(data);
      });
  response.send(buffer.toString("utf-8"));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
