const mysql = require('mysql');
const config = require('./config');
const pool = mysql.createPool(config);
// const arima = require('arima')

const tf = require('@tensorflow/tfjs');
const tfnode = require('@tensorflow/tfjs-node');
const dfd = require("danfojs-node");

async function loadModel(sensor1, sensor2, sensor3, sensor4, sensor5, sensor6) {
     const handler = tfnode.io.fileSystem('klasifikasi/model.json');
     const model = await tf.loadLayersModel(handler);
 
     data = { 'sensor1': [sensor1], 'sensor2': [sensor2], 'sensor3': [sensor3], 'sensor4': [sensor4], 'sensor5': [sensor5], 'sensor6': [sensor6] };
     console.log(data)
 
 
     let df = new dfd.DataFrame(data)
     let tf_tensor = df.tensor
     if (model.predict(tf_tensor).dataSync()[0] == 1) {
         const klasifikasi = 'Udara Bersih';
         const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
         const values = [klasifikasi];
         pool.query(insert, values, (err, results) => {
             if (err) throw err;
         });
     } else {
         const klasifikasi = 'Udara Kotor';
         const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
         const values = [klasifikasi];
         pool.query(insert, values, (err, results) => {
             if (err) throw err;
         });
     }
 }
 

function ambilData() {
          pool.getConnection((err, connection) => {
               if (err) throw err
               connection.query(
                    `
                    SELECT * FROM tangkap_sensor_industry ORDER BY id DESC LIMIT 1
                    `
               , (err, result) => {

                    if (err) throw err
                    console.log("masuk ambilData")
                    ambilNilai(result)
               })
               
               connection.release()
          })
}

function ambilNilai(result) {
     let arraySensor = []
     console.log('hehe')
     for (let x = 1; x< 7; x++){
          const data = []
          for(let i in result) {
               data.push(result[i]['sensor' + x])
          } 

          arraySensor[x-1] = data[0]

          if (x == 6) {
               console.log(arraySensor)
               console.log(arraySensor.length)
               return loadModel(arraySensor[0], arraySensor[1], arraySensor[2], arraySensor[3], arraySensor[4], arraySensor[5], arraySensor[6])
          
          }
     }
}




function getId() {
     pool.getConnection(function(err, connection) {
          if (err) throw err; // not connected!
         
          // Use the connection
          connection.query('SELECT * FROM tangkap_sensor_industry ORDER BY id DESC LIMIT 1', function (error, results, fields) {
               let data = 0

               data = results[0]['id']
          //   console.log(tangkap)
            connection.release();
         
            // Handle error after the release.
            if (error) throw error;
            return test2(data)
          });
     });
}

setInterval(function() {
     getId()
},  1000)


let id_prev = 0
function test2(x) {
     let id_now = x
     if (id_now > id_prev) {
          console.log('data baruaada')
          ambilData()
     }
     id_prev = id_now
}