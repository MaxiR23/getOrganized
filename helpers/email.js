import nodemailer from 'nodemailer'

export const registrationMail = async (datos) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //TODO: Mover a variables de entorno
    /* informacion del email */
    const info = await transport.sendMail({
        from: '"Tasks - Administrador de Proyectos" <cuentas@task.com>',
        to: email, 
        subject: 'Task - Confirma tu cuenta',
        text: 'Confirma tu cuenta, por favor',
        html: `
        <p> Hola, ${name} comprueba tu cuenta en Task para poder continuar. </p> 
        <p> Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace: 
        <a href='${process.env.FRONTEND_URL}/confirm-account/${token}'> Confirmar cuenta </a> </p> 
        <p> Si no creaste esta cuenta, puedes ignorar el mensaje. </p>
        `
    })
}

export const forgotPasswordEmail = async (datos) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    /* informacion del email */
    const info = await transport.sendMail({
        from: '"Tasks - Administrador de Proyectos" <cuentas@task.com>',
        to: email, 
        subject: 'Task - Restablecé tu contraseña',
        text: 'Restablecé tu contraseña',
        html: `
        <p> Hola, ${name} has solicitado restablecer tu contraseña </p> 
        <p> Sigue el siguiente enlace para generar una nueva contraseña: 
        <a href='${process.env.FRONTEND_URL}/forgot-password/${token}'> Restablecer contraseña </a> </p> 
        <p> Si no solicitaste ningun cambio de contraseña, puedes ignorar el mensaje. </p>
        `
    })
}