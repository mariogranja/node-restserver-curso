const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

//Se usa la variable app (express) para realizar peticiones tales como POST GET DELETE UPDATE
app.post('/login', (req,res)=>{

    let body = req.body;
//Funcion que permite encontrar si el usuario que se envio por peticion POST se encuentra en el modelo de la base de datos
    Usuario.findOne({email:body.email},(err, usuarioDB)=>{
//Si encuentra el error retorna el error
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
//Si el usuario no se encuentra se retorna un json con el error encontrado
        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: '(Usuario) o password incorrectos'
                }
            });
        }


//Funcion en bcrypt que sirve para comparar el password que se envia por peticion (body.password) con el password que se encuentra en 
//la base de datos (usuarioDB.password)
//En el if compara si no son iguales
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'Usuario o (password) incorrectos'
                }
            });
        }


//Utilizacion de la libreria jsonwebtoken
        let token = jwt.sign({
            usuario:usuarioDB,
        },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

//Respuesta de la peticion si todo es correcto
        res.json({
            ok:true,
            usuario:usuarioDB,
            token
        });




    })

});


//Importante colocar el module para poder usar este archivo en el archivo principal server.js

module.exports = app;