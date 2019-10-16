
const express = require('express');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role}=require('../middlewares/autenticacion')
const bcrypt = require('bcrypt');
const _ = require('underscore')
const app = express();

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

//Se usa la variable app (express) para realizar peticiones tales como POST GET DELETE UPDATE

app.get('/usuario', verificaToken  ,(req, res) => {
    




    let desde = req.query.desde || 0;
    desde = Number(desde);


    let limite = req.query.limite || 5;
    limite = Number(limite);



    Usuario.find({estado:true},'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec((err,usuarios)=>{
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                
                Usuario.count({estado:true},(err, conteo)=>{
                    res.json({
                        ok:true,
                        usuarios,
                        lenght: conteo
                    });
                })        
            })

})
  



app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {

      let body = req.body;
    

      let usuario = new Usuario({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync(body.password,10),
          role: body.role
      });

      usuario.save( (err,usuarioDB) =>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password=null;
        res.json({
            ok:true,
            usuario: usuarioDB
        });




      });

  
    
  
     
  })
  
  
    app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
  
      let id = req.params.id;
      let body = _.pick(req.body,['role','nombre','email','img','estado']);

      Usuario.findByIdAndUpdate(id,body,{new:true, runValidators:true},(err, usuarioBD)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        });

      })


      
    })
  
    app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
      
        let id = req.params.id;

        // Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        //     if(err){
        //         return res.status(400).json({
        //             ok: false,
        //             err
        //         });
        //     }
        //     if (!usuarioBorrado){
        //         return res.status(400).json({
        //             ok: false,
        //             err: {
        //                 message: 'Registro no encontrado'
        //             }
        //         });
        //     }
        //     res.json({
        //         ok: true,
        //         usuario: usuarioBorrado
        //     })
        // })

        let body = {
            estado:false
        }
      Usuario.findByIdAndUpdate(id,body,{new:true, runValidators:true},(err, usuarioBD)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        });

      })




    })
  

//Importante colocar el module para poder usar este archivo en el archivo principal server.js

    module.exports = app;