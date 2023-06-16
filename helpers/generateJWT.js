import jwt from 'jsonwebtoken'

/* genero un objeto con ese id */
const jwtGenerate = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

export default jwtGenerate;