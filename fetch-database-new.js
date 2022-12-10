const mysql = require('mysql');
const config = require('./config');
const pool = mysql.createPool(config);
const tf = require('@tensorflow/tfjs');
const tfnode = require('@tensorflow/tfjs-node');
const dfd = require("danfojs-node");

async function loadModel(sensor1_adc, sensor2_adc, sensor3_adc, sensor4_adc, sensor5_adc, sensor6_adc) {
     const handler = tfnode.io.fileSystem('klasifikasi/model.json');
     const model = await tf.loadLayersModel(handler);
     
     data = { 'sensor1_adc': [sensor1_adc], 'sensor2_adc': [sensor2_adc], 'sensor3_adc': [sensor3_adc], 'sensor4_adc': [sensor4_adc], 'sensor5_adc': [sensor5_adc], 'sensor6_adc': [sensor6_adc] };
     console.log(data)
     let df = new dfd.DataFrame(data)
     let tf_tensor = df.tensor

     // console.log(model.predict(1,1,1,1,1,1))
     // console.log(model.predict(tf_tensor).dataSync()[0])
     // console.log(model.predict(tf_tensor).dataSync()[1])
     // console.log(model.predict(tf_tensor).dataSync()[2])
     // console.log(model.predict(tf_tensor).dataSync()[3])

     /*

         0 => Gas
         1 => Alkohol
         2 => Asap
         3 => bersih
     */

     if (model.predict(tf_tensor).dataSync()[0] >= 0.5) {
         const klasifikasi = 'Gas';
         console.log(klasifikasi)
     //     const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
     //     const values = [klasifikasi];
     //     pool.query(insert, values, (err, results) => {
     //         if (err) throw err;
     //         console.log(`Prediksi: ${klasifikasi}`)
     //     }
     //     );
     } 

     if (model.predict(tf_tensor).dataSync()[1] >= 0.5) {
         const klasifikasi = 'Alkohol';
         console.log(klasifikasi)
     //     const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
     //     const values = [klasifikasi];
     //     pool.query(insert, values, (err, results) => {
     //         if (err) throw err;
     //         console.log(`Prediksi: ${klasifikasi}`)
     //     });
     }

     if (model.predict(tf_tensor).dataSync()[2] >= 0.5) {
          const klasifikasi = 'Asap';
          console.log(klasifikasi)
      //     const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
      //     const values = [klasifikasi];
      //     pool.query(insert, values, (err, results) => {
      //         if (err) throw err;
      //         console.log(`Prediksi: ${klasifikasi}`)
      //     });
      }

      if (model.predict(tf_tensor).dataSync()[3] >= 0.5) {
          const klasifikasi = 'Udara Bersih';
          console.log(klasifikasi)
      //     const insert = 'INSERT INTO klasifikasi (hasil) VALUES (?)';
      //     const values = [klasifikasi];
      //     pool.query(insert, values, (err, results) => {
      //         if (err) throw err;
      //         console.log(`Prediksi: ${klasifikasi}`)
      //     });
      }
 }
 
function ambilData() {
          pool.getConnection((err, connection) => {
               if (err) throw err
               connection.query(
                    `SELECT * FROM alat_1_alkohol_adc ORDER BY id DESC LIMIT 1`
               , (err, result) => {
                    if (err) throw err
                    ambilNilai(result)
               })              
               connection.release()
          })
}

function ambilNilai(result) {
     let arraySensor = []
     for (let x = 1; x< 7; x++){
          const data = []
          for(let i in result) {
               data.push(result[i]['sensor' + x + '_adc'])
          } 

          arraySensor[x-1] = data[0]

          if (x == 6) {
               // return loadModel(978, 505, 2730, 3507, 2032, 10839)
               return loadModel(arraySensor[0], arraySensor[1], arraySensor[2], arraySensor[3], arraySensor[4], arraySensor[5], arraySensor[6])

          }
     }
}




function getId() {
     pool.getConnection(function(err, connection) {
          if (err) throw err; // not connected!
         
          // Use the connection
          connection.query('SELECT * FROM alat_1_alkohol_adc ORDER BY id DESC LIMIT 1', function (error, results, fields) {
               let data = 0

               data = results[0]['id']
            connection.release();
         
            // Handle error after the release.
            if (error) throw error;
            return test2(data)
          });
     });
}

setInterval(function() {
     getId()
},  1000) // per 1 detik


let id_prev = 0
function test2(x) {
     let id_now = x
     if (id_now > id_prev) {
          console.log(`id data baru : ${id_now}`)
          ambilData()
     }
     id_prev = id_now
}