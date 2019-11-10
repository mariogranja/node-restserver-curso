const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

//Se usa la variable app (express) para realizar peticiones tales como POST GET DELETE UPDATE
app.post('/login', (req, res) => {

    let body = req.body;
    //Funcion que permite encontrar si el usuario que se envio por peticion POST se encuentra en el modelo de la base de datos
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        //Si encuentra el error retorna el error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Si el usuario no se encuentra se retorna un json con el error encontrado
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o password incorrectos'
                }
            });
        }


        //Funcion en bcrypt que sirve para comparar el password que se envia por peticion (body.password) con el password que se encuentra en 
        //la base de datos (usuarioDB.password)
        //En el if compara si no son iguales
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (password) incorrectos'
                }
            });
        }


        //Utilizacion de la libreria jsonwebtoken
        let token = jwt.sign({
            usuario: usuarioDB,
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //Respuesta de la peticion si todo es correcto
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });




    })

});


//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}



app.post('/google',async (req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
         .catch(e=>{
                return res.status(403).json({
                    ok:false,
                    err:e
                });
          });


    Usuario.findOne({email: googleUser.email}, (err, usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(usuarioDB){
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err:{
                        message: 'Debe utilizar su autenticacion normal debido a que el correo ya esta registrado'
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{
            //Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB)=>{
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
    
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });

        }
    })


  //  res.json({
   //     usuario: googleUser
  //  })
});

//Importante colocar el module para poder usar este archivo en el archivo principal server.js

module.exports = app;