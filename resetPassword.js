import bcrypt from 'bcrypt';

const nuevaPass = 'glamurosa'; // tu nueva contraseña
const run = async () => {
  const hash = await bcrypt.hash(nuevaPass, 12);
  console.log('Hash generado:', hash);
};

run();
  