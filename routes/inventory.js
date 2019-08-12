const express = require('express');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const csv = require('fast-csv');
const router = express.Router();
const yaml = require('yaml');
const User = require('../models/user');

router.post('/v1/upload-csv', upload.single('file'), function (req, res) {
  var mapping = "";
  var inventoryArray = [];

  // find the user's configuration
  User.findById(req.body.id)
    .then((result) => {
      mapping = yaml.parse(result.mapping);

    })
    .catch((err) => {
      console.log('No such user');
    });

  // parse the csv  
  csv.parseFile(req.file.path, {headers: true})
    .on("data", function (data) {
      var newObject = {};

      for (key in mapping) {
        newObject[key] = data[mapping[key]];
      }

      inventoryArray.push(newObject);
    })
    .on("end", function () {
      fs.unlinkSync(req.file.path);
        
      User.findByIdAndUpdate(req.body.id, {inventory: inventoryArray}, function (err, data) {
        console.log(err, data);
      });
    })
});

module.exports = router;
