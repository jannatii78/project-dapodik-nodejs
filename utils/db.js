const mongoose = require('mongoose');
mongoose.connect(' mongodb://127.0.0.1:27017/dapodik',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// // menambah 1 data
// const siswa1 = new Siswa({
//     nama: 'Nuril Jannatii',
//     jk: 'P',
//     nisn: '12329252',
//     nik: '320290677880008',
//     nokk: '320905632970001',
//     tingkat: 'X',
//     rombel: 'PPLG 1',
//     tgl_masuk: '2023-07-14',
//     terdaftar: 'Siswa Baru',
//     ttl: 'Cirebon',
// });

// // simpan ke collection
// siswa1.save().then((siswa) => console.log(siswa));
