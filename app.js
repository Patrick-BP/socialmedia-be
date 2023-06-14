const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoute = require('./Routes/authRoutes')
const userRoute = require('./Routes/usersRoutes')
const postRoute = require('./Routes/postsRoutes')
const multer = require('multer')
const path = require('path');

const MONGODB = process.env.MONGODB;
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));
app.use('/images', express.static(path.join(__dirname, "public/images")));
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/images");
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname);
    }
});

const upload = multer({storage});
app.post('/api/upload', upload.single('file'), (req, res)=>{
    try{
        return res.status(200).json("File uploaded successfully.")
    }catch(err){
        console.log(err);
    }
})

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

mongoose.connect(MONGODB)
.then(()=>{
    app.listen(PORT , ()=>console.log(`server running on port ${PORT}`))})
.catch(error=>console.log(error.message))    