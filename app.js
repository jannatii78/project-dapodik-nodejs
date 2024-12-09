const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Siswa = require('./model/siswa');
const User = require('./model/users');

const app = express();
const port = 3000;

// set up method override
app.use(methodOverride('_method'));

// set up EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 3600000 }, 
    secret: 'secret',
    resave: false, 
    saveUninitialized: false, 
  })
);
app.use(flash());

// Middleware untuk melindungi halaman yang memerlukan login
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next(); // lanjut ke halaman berikutnya
  } else {
    req.flash('msg', 'Silakan login terlebih dahulu');
    res.redirect('/login'); // user belum login, ke halaman login
  }
};

// Middleware untuk melindungi halaman login jika pengguna sudah login
const isAlreadyLoggedIn = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/');  // sudah login lngsung ke home
  } else {
    next();  // blum login, lngsung ke halaman login
  }
};

// Halaman login
app.get('/login', isAlreadyLoggedIn, (req, res) => {
  res.render('login', {
    layout: 'layouts/main-layout',
    title: 'Login',
    msg: req.flash('msg'),
  });
});

// Proses login
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && user.password === req.body.password) {
    req.session.user = user;
    res.redirect('/'); // login berhasil
  } else {
    req.flash('msg', 'Username atau password salah!');
    res.redirect('/login'); // login gagal
  }
});

// Halaman home yang membutuhkan login
app.get('/', isAuthenticated, (req, res) => {
  const user = req.session.user; 
  res.render('index', {
    layout: 'layouts/main-layout',
    title: 'Selamat datang',
    user: user, 
  });
});

// halaman about
app.get('/about', (req, res, next) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'Halaman About',
  });
});

// halaman data siswa
app.get('/siswa', isAuthenticated, async (req, res) => {
  const siswas = await Siswa.find();
  res.render('siswa', {
    title: 'Data | Siswa',
    layout: 'layouts/main-layout',
    siswas,
    msg: req.flash('msg'),
  });
});

// halaman form tambah data siswa
app.get('/siswa/add', isAuthenticated, (req, res) => {
  res.render('add-siswa', {
    title: 'Tambah Data Siswa',
    layout: 'layouts/main-layout',
    msg: req.flash('msg'),
  });
});

// Proses tambah data siswa
app.post(
  '/siswa',
  [
    // validasi nisn
    body('nisn').custom(async (value) => {
      const duplikat = await Siswa.findOne({ nisn: value });
      if (duplikat) {
        throw new Error('NISN sudah terdaftar!');
      }
      return true;
    }),
    // validasi nik
    body('nik').custom(async (value) => {
      const duplikat = await Siswa.findOne({ nik: value });
      if (duplikat) {
        throw new Error('NIK sudah terdaftar!');
      }
      return true;
    }),
    // validasi tanggal masuk
    body('tgl_masuk').custom((value) => {
      const batasTanggal = new Date('2024-12-06');
      const inputTanggal = new Date(value);
      if (inputTanggal > batasTanggal) {
        throw new Error('Melewati batas tgl pendaftaran!');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('add-siswa', {
        title: 'Form Tambah Data Siswa',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      await Siswa.insertMany(req.body);
      req.flash('msg', 'Siswa Berhasil Didaftarkan!');
      res.redirect('/siswa');
    }
  }
);

// hapus data siswa
app.delete('/siswa', (req, res) => {
  Siswa.deleteOne({ nisn: req.body.nisn }).then((result) => {
    req.flash('msg', 'Data siswa berhasil dihapus!');
    res.redirect('/siswa');
  });
});

// halaman form edit
app.get('/siswa/edit/:nisn', isAuthenticated, async (req, res) => {
  const siswa = await Siswa.findOne({ nisn: req.params.nisn });
  res.render('edit-siswa', {
    title: 'Form Ubah Data Siswa',
    layout: 'layouts/main-layout',
    siswa,
  });
});

// proses edit data siswa
app.put('/siswa', async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('edit-siswa', {
      title: 'Form Ubah Data Siswa',
      layout: 'layouts/main-layout',
      errors: errors.array(),
      siswa: req.body,
    });
  } else {
    await Siswa.updateOne(
      { nisn: req.body.nisn }, 
      {
        $set: {
          tingkat: req.body.tingkat,
          rombel: req.body.rombel,
          tgl_masuk: req.body.tgl_masuk,
          terdaftar: req.body.terdaftar,
        },
      }
    ).then((result) => {
      req.flash('msg', 'Data siswa berhasil diubah!');
      res.redirect('/siswa');
    });
  }
});

// Button logout yang hanya akan menghapus session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/login'); // balik ke login
  });
});

app.listen(port, () => {
  console.log(`Mongo Dapodik Website | listening at http://localhost:${port}`);
});
