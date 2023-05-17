const express = require('express');
const mongoose = require('mongoose');

const { body, validationResult } = require('express-validator');
//const app = express();

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

const bcrypt = require('bcrypt');

router.post('/',[
  body('name')
  .notEmpty().withMessage('El nombre es obligatorio')
  .trim(),
  body('email')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    const users = await User.find();
    return res.render('index', { users, errors: errorMessages });
  }

  const { name, password, email } = req.body;

  try {
    // Generar el hash de Bcrypt para la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear un nuevo usuario con la contraseña encriptada
    const newUser = new User({ name, email, password: hashedPassword });

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
  const { name, password, email } = req.body;
  
  try {
    // Generar el hash de Bcrypt para la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar el usuario en la base de datos
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
      password: hashedPassword
    });

    res.redirect('/users');
  } catch (error) {
    // Manejar errores
    res.status(500).send('Error al actualizar el usuario');
  }
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
