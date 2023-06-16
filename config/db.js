import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, 
            )

            const url = `HOST:${connection.connection.host}:\nPORT:${connection.connection.port}`

            console.log('MongoDB conectado en: '+url);
    } catch (error) {
        console.warn('error: ' + error.message);
        process.exit(1);  //Forzamos que el proceso termine.
    }
}

export default connectDB;