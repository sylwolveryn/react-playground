const ncp = require('ncp').ncp;

ncp.limit = 16;

ncp('./blog/build', './src/build', function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('done!');
});
