//Se instancia la libreria express (libreria de peticiones POST GET DELETE UPDATE, etc)
const express = require('express');
const app = express();
//Se instancia la libreria mongoose para conectar a la base de datos en MongoDB
const mongoose = require('mongoose');

//Instancia libreria path para poder ejecutar un html externo
const path = require('path');

//Otras importaciones necesarias
const bodyParser = require('body-parser')
require('./config/config')

//El require de abajo llama a un archivo index.js donde se encuentran todas las rutas a usarse (usuario y login)
app.use(require('./routes/index'));

//Configuracion del body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//habilitar la carpeta public
//console.log(path.resolve(__dirname , '../public'));
app.use(express.static(path.resolve(__dirname , '../public')));


//Conexion a la base de datos

  mongoose.connect(process.env.URLDB,
  {useNewUrlParser:true, useCreateIndex:true},
  (err, res)=>{
      if (err) throw err;

      console.log('Base de datos online..');
  });


//Indica en que puerto escucha el servicio web creado con express

app.listen(process.env.PORT,()=>{
    console.log('Escuchando 3000.....');
})

