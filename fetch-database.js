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
 

function tampilData() {
     let arraySensor = []
     
     for (let x = 1; x < 7; x++){
          pool.getConnection((err, connection) => {
               if (err) throw err
               connection.query(
                    `
                    SELECT * FROM tangkap_sensor_industry ORDER BY id DESC LIMIT 5
                    `
               , (err, result) => {
                    
                    const data = []
                    if (err) throw err
                    for(let i in result) {
                         data.push(result[i]['sensor' + x])
                    }

                    // console.log(data)
                    arraySensor[x-1] = data[0]

                    if (x == 6) {
                         console.log(arraySensor)
                         return loadModel(arraySensor[0], arraySensor[1], arraySensor[2], arraySensor[3], arraySensor[4], arraySensor[5], arraySensor[6])
                         
                    }


      
               })
               
               connection.release()
               if (err) throw err;
               
          })
     }
     setTimeout(tampilData,  1000)   
}

tampilData()