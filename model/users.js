const mongoose = require('mongoose');
mongoose.connect(' mongodb://127.0.0.1:27017/dapodik',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Membuat Schema Login
const User = mongoose.model('User', {
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

module.exports = User;

// // Menambah 1 data
// const admin = new User({
//     username: 'admin',
//     password: 'admin123',
// });

// // Simpan ke collection
// admin.save().then((admin) => console.log(admin));