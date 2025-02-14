const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const CoinGecko = require('coingecko-api');
const fetch = require("node-fetch");
var TronWeb = require('tronweb');

const app = express();
const port = process.env.PORT || 3003;
const token = process.env.APP_MT;
const uri = process.env.APP_URI || "mongodb+srv://userwozx:wozx1234567890@ewozx.neief.mongodb.net/registro";
const TRONGRID_API = process.env.APP_API || "https://api.shasta.trongrid.io";
const proxy = process.env.APP_PROXY || "https://proxy-wozx.herokuapp.com/";
const prykey = process.env.APP_PRYKEY;

console.log(TRONGRID_API);

const CoinGeckoClient = new CoinGecko();

TronWeb = new TronWeb(
  TRONGRID_API,
  TRONGRID_API,
  TRONGRID_API,
  prykey
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const options = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, options).then(
  () => { console.log("Conectado Exitodamente!");},
  err => { console.log(err); }
);

var user = mongoose.model('usuarios', {
        direccion: String,
        registered: Boolean,
        sponsor: String,
        ethereum: String,
        eth: Boolean,
        rango: Number,
        recompensa: Boolean,
        niveles: [[String]],
        balanceTrx: Number,
        withdrawnTrx: Number,
        investedWozx: Number,
        withdrawnWozx: Number,
        historial: [{
            tiempo: Number,
            valor: Number,
            moneda: String,
            accion: String,
            link: String

        }]

    });

var aplicacion = mongoose.model('aplicacions', {
          nombre: String,
          wozxSaldo: Number,
          wozxSaldoAsignado: Number,
          wozxSaldoRecibido: Number,
          wozxSaldoRetirado: Number,
          tronSaldo: Number,
          tronSaldoAsignado: Number,
          tronSaldoRecibido: Number,
          tronSaldoRetirado: Number,
          permitirRegistros: Boolean,
          permitirRetiros: Boolean,
          depositoMinimo: Number,
          precioWozx: Number,
          precioTron: Number

      });

var usuariobuscado = 'TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF';

app.get('/', async(req,res) => {

    mongoose.connect(uri, options).then(
      () => { res.send("Conectado a mongoDB Exitodamente!");},
      err => { res.send(err); }
    );


});

app.get('/precio/usd/trx', async(req,res) => {

  var apiUrl = 'https://data.gateapi.io/api2/1/marketlist';
  const response = await fetch(apiUrl)
  .catch(error =>{console.error(error)})
  const json = await response.json();

  var upd = json.data.find(element => element.pair == "trx_usdt");

  console.log(upd.rate);

  res.status(200).send({
    "data":{
      "tron":{
        "usd":parseFloat(upd.rate)
      }
    }
  })

});

app.get('/precio/usd/wozx', async(req,res) => {

  var apiUrl = 'https://data.gateapi.io/api2/1/marketlist';
  const response = await fetch(apiUrl)
  .catch(error =>{console.error(error)})
  const json = await response.json();

  var upd = json.data.find(element => element.pair == "wozx_usdt");

  console.log(upd.rate);

  res.status(200).send({
    "data":{
      "wozx":{
        "usd":parseFloat(upd.rate)
      }
    }
  })

  //res.status(200).send(data)

});


app.get('/consultar/todos', async(req,res) => {

    usuario = await user.find({}, function (err, docs) {});

    console.log(usuario);

    res.send(usuario);

});

app.get('/consultar/ejemplo', async(req,res) => {

    usuario = await user.find({ direccion: usuariobuscado }, function (err, docs) {});
    usuario = usuario[0];
    //console.log(usuario);

    res.send(usuario);

});

app.get('/consultar/transaccion/:id', async(req,res) => {

    let id = req.params.id;

    await TronWeb.trx.getTransaction(id)
    .then(value=>{
    //  console.log(value.ret[0].contractRet);

      if (value.ret[0].contractRet === 'SUCCESS') {

        res.send({result: true});
      }else {
        res.send({result: false});
      }
    })
    .catch(value=>{
      console.log(value);
      res.send({result: false});
    })




});

app.get('/registrar/aplicacion', async(req,res) => {

    let nombre = "ewozx";

    let respuesta = {};
    respuesta.status = "200";

    var miApp = await aplicacion.find({ nombre: nombre }, function (err, docs) {});

    if ( miApp != "" ) {
        respuesta.status = "303";
        respuesta.txt = "Aplicacion ya registrada";
        respuesta.usuario = miApp[0];

        res.send(respuesta);

    }else{

         var apps = new aplicacion({
           nombre: nombre,
           wozxSaldo: 0,
           wozxSaldoAsignado: 0,
           wozxSaldoRecibido: 0,
           wozxSaldoRetirado: 0,
           tronSaldo: 0,
           tronSaldoAsignado: 0,
           tronSaldoRecibido: 0,
           tronSaldoRetirado: 0,
           permitirRegistros: true,
           permitirRetiros: true,
           depositoMinimo: 0,
           precioWozx: 0,
           precioTron: 0
        });

        apps.save().then(() => {
            respuesta.status = "200";
            respuesta.txt = "Aplicacion creada exitodamente";
            respuesta.usuario = apps;

            res.send(respuesta);
        });

    }



});

app.get('/consultar/aplicacion', async(req,res) => {

    let nombre = "ewozx";
    let respuesta = {};
    usuario = await aplicacion.find({ nombre: nombre }, function (err, docs) {});

    //console.log(usuario);

    if ( usuario == "" ) {

        respuesta = {
          nombre: nombre,
          wozxSaldo: 0,
          wozxSaldoAsignado: 0,
          wozxSaldoRecibido: 0,
          wozxSaldoRetirado: 0,
          tronSaldo: 0,
          tronSaldoAsignado: 0,
          tronSaldoRecibido: 0,
          tronSaldoRetirado: 0,
          permitirRegistros: true,
          permitirRetiros: true,
          depositoMinimo: 0,
          precioWozx: 0,
          precioTron: 0
       }

        respuesta.status = "200";
        respuesta.txt = "Esta aplicacion no está registrada";
        res.status(200).send(respuesta);

    }else{
        respuesta = usuario[0];
        res.status(200).send(respuesta);
    }

});

app.get('/consultar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let respuesta = {};
    usuario = await user.find({ direccion: cuenta }, function (err, docs) {});

    //console.log(usuario);

    if ( usuario == "" ) {

        respuesta = {
           direccion: 'N/A',
           registered: false,
           sponsor: 'N/A',
           ethereum: 'N/A',
           eth: false,
           rango: 0,
           recompensa: false,
           niveles: [[],[],[],[],[],[],[],[],[],[]],
           balanceTrx: 0,
           withdrawnTrx: 0,
           investedWozx: 0,
           withdrawnWozx: 0,
           historial: [{
               tiempo: Date.now(),
               valor: 0,
               moneda: 'N/A',
               accion: 'N/A',
               link: "#"

           }]
       }

        respuesta.status = "200";
        respuesta.txt = "Esta cuenta no está registrada";
        res.status(200).send(respuesta);

    }else{
        respuesta = usuario[0];
        res.status(200).send(respuesta);
    }

});

app.post('/registrar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let sponsor = req.body.sponsor;
    let id = req.body.id;
    let token2 = req.body.token;
    let respuesta = {};
    respuesta.status = "200";

    usuario = await user.find({ direccion: cuenta }, function (err, docs) {});

    if (await TronWeb.isAddress(cuenta) && token == token2) {

        if ( usuario != "" ) {
            respuesta = usuario[0];
            respuesta.status = "303";
            respuesta.txt = "Cuenta ya registrada";

            res.send(respuesta);

        }else{

             var users = new user({
                direccion: cuenta,
                registered: true,
                sponsor: sponsor,
                ethereum: '',
                eth: false,
                rango: 0,
                recompensa: false,
                niveles: [[],[],[],[],[],[],[],[],[],[]],
                balanceTrx: 0,
                withdrawnTrx: 0,
                investedWozx: 0,
                withdrawnWozx: 0,
                historial: [{
                    tiempo: Date.now(),
                    valor: 50,
                    moneda: 'TRX',
                    accion: 'Cost register in plataform',
                    link: id

                }]
            });

            users.save().then(() => {
                respuesta.status = "200";
                respuesta.txt = "Usuario creado exitodamente";
                respuesta.usuario = users;

                res.send(respuesta);
            });

        }
    }else{
        respuesta.txt = "Ingrese una direccion de TRX";
        res.send(respuesta);
    }


});

app.post('/actualizar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let token2 = req.body.token;
    let datos = req.body

    if ( token == token2 ) {
      usuario = await user.updateOne({ direccion: cuenta }, datos);
      res.send(usuario);

    }else{
      res.send("No autorizado");

    }

});


app.post('/referidos/', async(req,res) => {

    let token2 = req.body.token;
    let datos = req.body.datos;

    //datos = JSON.parse(datos);//use whit postman
    console.log(datos);

    if ( token == token2 ) {

    var usuario = await user.find({ direccion: datos.direccion }, function (err, docs) {});
    usuario = usuario[0];
    delete usuario._id;
    //console.log(usuario);
    //console.log(usuario.direccion);

    var sponsor = await user.find({ direccion: usuario.sponsor }, function (err, docs) {});
    sponsor = sponsor[0];
    delete sponsor._id;
    console.log(sponsor);
    //console.log(sponsor.direccion);

    var done = 0;
    var trx = 0;

    console.log(datos.recompensa.length);

    if ( TronWeb.isAddress(usuario.sponsor) && sponsor.registered) {

      for (var i = 0; i < datos.recompensa.length; i++) {

        if (sponsor.registered && sponsor.recompensa ) {

          //console.log(sponsor.direccion);

          sponsor.balanceTrx += datos.monto*datos.recompensa[i];

          const found = undefined;

          var aumentar = await sponsor.niveles[i].find(element => element == usuario.direccion);

          //console.log(found);
          //console.log(aumentar);

          if ( aumentar == found ) {
            done++;
            sponsor.niveles[i].push(usuario.direccion);
          }

          //console.log(sponsor.niveles[i]);

          var rango = datos.usd*datos.monto*datos.recompensa[i];
          rango = rango.toFixed(2);
          rango = parseFloat(rango);

          var valor = datos.monto*datos.recompensa[i];
          trx += valor;

          var contractApp = await TronWeb.contract().at(datos.contractAddress);
          var id2 = await contractApp.depositoTronUsuario(sponsor.direccion, parseInt(valor*1000000)).send();

          sponsor.rango += rango;
          sponsor.historial.push({
              tiempo: Date.now(),
              valor: valor,
              moneda: 'TRX',
              accion: 'Redward Referer -> $ '+rango+' USD',
              link: id2

          })

          var updateUsuario = await user.updateOne({ direccion: sponsor.direccion }, sponsor);

        }

        if ( sponsor.direccion === sponsor.sponsor || sponsor == "" ) {
          break;
        }
        //console.log(sponsor.sponsor);

        sponsor = await user.find({ direccion: sponsor.sponsor }, function (err, docs) {});
        sponsor = sponsor[0];
        delete sponsor._id;
        //console.log(sponsor);

      }
    }


      //res.send({"New-Upline": done, "usuario": usuario});
      res.send({"New-Upline": done, "trx-distributed": trx});

    }else{
      res.send("No autorizado");

    }

});




app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))
