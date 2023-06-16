import express from "express";
const router = express.Router();

import {
    auth,
    createUser,
    confirmUser,
    forgotPassword,
    checkToken,
    newPassword,
    profile
} from '../controllers/userController.js'

import checkOut from "../middlewares/chechAuth.js";

//Autentificacion, registro y confirmacion de usuarios
router.post('/', createUser) //Crea un nuevo usuario
router.post('/login', auth) //Crea un nuevo usuario
router.get('/confirm-account/:token', confirmUser)
router.post('/forgot-password', forgotPassword)
router.route('/forgot-password/:token').get(checkToken).post(newPassword)
/* comprobamos que el jwt sea valido, que el usuario sea correcto, etc */
router.get('/profile', checkOut, profile)

export default router;