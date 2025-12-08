require('dotenv').config();
const mongoose = require('mongoose');

console.log('Intentando conectar a MongoDB Atlas...');
console.log('URI (censurada):', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@') : 'NO DEFINIDA');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
    
    const TestSchema = new mongoose.Schema({
      nombre: String,
      fecha: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    return Test.create({ nombre: 'Prueba de conexión' });
  })
  .then((doc) => {
    console.log('✅ Documento de prueba creado:', doc);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Conexión cerrada correctamente');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });