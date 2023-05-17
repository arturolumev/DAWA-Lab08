const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

const password = 'contraseña_del_usuario';
const saltRounds = 10; // Número de rondas de encriptación

router.post('/', async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.redirect('/users');
});

//
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { name, password } = req.body;

  try {
    // Generar el hash de Bcrypt para la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear un nuevo usuario con la contraseña encriptada
    const newUser = new User({ name, password: hashedPassword });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    res.redirect('/users');
  } catch (error) {
    // Manejar errores
    res.status(500).send('Error al agregar el usuario');
  }
});

//

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
