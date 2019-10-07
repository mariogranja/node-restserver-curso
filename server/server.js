const express = require('express');
const app = express();
const mongoose = require('mongoose');

const bodyParser = require('body-parser')
require('./config/config')
app.use( require('./routes/usuario') );

app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


  mongoose.connect(process.env.URLDB,
  {useNewUrlParser:true, useCreateIndex:true},
  (err, res)=>{
      if (err) throw err;

      console.log('Base de datos online..');
  });


app.listen(process.env.PORT,()=>{
    console.log('Escuchando 3000.....');
})

