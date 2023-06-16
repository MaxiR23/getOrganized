import User from "../models/User.js"
import generateId from "../helpers/generateId.js";
import generateJWT from "../helpers/generateJWT.js";
import { registrationMail, forgotPasswordEmail } from "../helpers/email.js";

const createUser = async (req, res) => {
    //Evitar registros duplicados
    const { email } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message })
    }

    try {
        const user = new User(req.body)
        user.token = generateId();
        const userSaved = await user.save();

        //Envio el mail de confirmacion de cuenta.
        registrationMail({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({ msg: 'Usuario creado correctamente, Revisa tu e-mail para confirmar tu cuenta' })
    } catch (error) {
        console.warn(error)
    }
}

const auth = async (req, res) => {
    const { email, password } = req.body;
    /* comprobar si el usuario existe */
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({ msg: error.message })
    }
    /* comprobar que el usuario este confirmado */
    if (!user.isVerified) {
        const error = new Error('Tu cuenta no ha sido confirmada.');
        return res.status(403).json({ msg: error.message })
    }
    /* comprobar su password */
    if (await user.checkpassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id),
        }); /* para que nos devuelva una respuesta mas corta */
    } else {
        const error = new Error('La contraseña es incorrecta.');
        return res.status(403).json({ msg: error.message })
    }
}

const confirmUser = async (req, res) => {
    const { token } = req.params;
    const userConfirm = await User.findOne({ token })

    if (!userConfirm) {
        const error = new Error('Token no valido.');
        return res.status(403).json({ msg: error.message })
    }

    try {
        userConfirm.isVerified = true
        userConfirm.token = '';
        await userConfirm.save();
        res.json({ msg: 'Usuario confirmado correctamente.' })
    } catch (error) {
        console.warn(error)
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('El usuario no existe.');
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = generateId();
        await user.save();

        //Envio mail con las instrucciones a seguir
        forgotPasswordEmail({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({ msg: 'Hemos enviado un mail con las instrucciones' });
    } catch (error) {
        console.warn(error)
    }
}

const checkToken = async (req, res) => {
    const { token } = req.params;
    const validToken = await User.findOne({ token })

    if (validToken) {
        res.json({ msg: 'Token válido y el usuario existe' })
    } else {
        const error = new Error('Token no válido.');
        return res.status(404).json({ msg: error.message });
    }
}

const newPassword = async (res, req) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ token })

    if (user) {
        user.password = password;
        user.token = '';

        try {
            await user.save();
            res.json({ msg: 'Contraseña modificada correctamente' })
        } catch (error) {
            console.warn(error)
        }
    } else {
        const error = new Error('Token no válido.');
        return res.status(404).json({ msg: error.message });
    }
}

const profile = (req, res) => {
    const { user } = req
    res.json(user);
}

export {
    auth,
    confirmUser,
    checkToken,
    createUser,
    forgotPassword,
    newPassword,
    profile
}