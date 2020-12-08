const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator/check');

const Lawn = require('../models/lawn');
const Reservation = require('../models/reservation');

exports.getAddLawn = (req, res, next) => {
  res.render('admin/edit-lawn', {
    pageTitle: 'Add Lawn',
    path: '/admin/add-lawn',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddLawn = (req, res, next) => {
  const town = req.body.town;
  const state = req.body.state;
  const lawnsize = req.body.lawnsize;
  const events = req.body.events;
  const price = req.body.price;
  const groupsize = req.body.groupsize;
  const eventhrs = req.body.eventhrs;
  const description = req.body.description;
  const image = req.file;
  if (!image) {
    return res.status(422).render('admin/edit-lawn', {
      pageTitle: 'Add Lawn',
      path: '/admin/add-lawn',
      editing: false,
      hasError: true,
      lawn: {
        town: town,
        state: state,
        lawnsize: lawnsize,
        events: events,
        price: price,
        groupsize: groupsize,
        eventhrs: eventhrs,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-lawn', {
      pageTitle: 'Add Lawn',
      path: '/admin/add-lawn',
      editing: false,
      hasError: true,
      lawn: {
        town: town,
        state: state,
        lawnsize: lawnsize,
        events: events,
        price: price,
        groupsize: groupsize,
        eventhrs: eventhrs,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const lawn = new Lawn({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    town: town,
    state: state,
    lawnsize: lawnsize,
    events: events,
    price: price,
    groupsize: groupsize,
    eventhrs: eventhrs,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  lawn
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Lawn');
      res.redirect('/admin/lawns');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditLawn = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const lawId = req.params.lawnId;
  Lawn.findById(lawId)
    .then(lawn => {
      if (!lawn) {
        return res.redirect('/');
      }
      res.render('admin/edit-lawn', {
        pageTitle: 'Edit Lawn',
        path: '/admin/edit-lawn',
        editing: editMode,
        lawn: lawn,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditLawn = (req, res, next) => {
  const lawId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  console.log(req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-lawn', {
      pageTitle: 'Edit Lawn',
      path: '/admin/edit-lawn',
      editing: true,
      hasError: true,
      lawn: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: lawId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Lawn.findById(lawId)
    .then(lawn => {
      if (lawn.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      lawn.title = updatedTitle;
      lawn.price = updatedPrice;
      lawn.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(lawn.imageUrl);
        lawn.imageUrl = image.path;
      }
      return lawn.save().then(result => {
        console.log('UPDATED LAWN!');
        res.redirect('/admin/lawn');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLawns = (req, res, next) => {
  Lawn.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(lawns => {
      console.log(lawns);
      res.render('admin/lawn', {
        laws: lawns,
        pageTitle: 'Admin Lawns',
        path: '/admin/lawn'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getUserProfile = (req, res, next) => {
  Lawn.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(lawns => {
      console.log(lawns);
      Reservation.find({ 'user.userId': req.user._id })
    .then(reservations => {
      res.render('admin/userProfile', {
        prods: lawns,
        pageTitle: 'User Profile',
        path: '/userProfile',
        reservations: reservations,
        user: req.user
      });
    });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProfilePicture = (req, res, next) => {
  const newPicture = req.body.picture;
  req.user.picture = newPicture;
  req.user.save().then(user =>{
    res.redirect('/admin/userProfile')
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProfileAddress = (req, res, next) => {
  const newAddress = req.body.address;
  req.user.address = newAddress;
  req.user.save().then(user =>{
    res.redirect('/admin/userProfile')
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postEditProfilePassword = (req, res, next) => {
  const newPassword = req.body.password;
  bcrypt
    .hash(newPassword, 12)
    .then(hashedPassword => {
      req.user.password = hashedPassword;
      return req.user.save()
    })
    .then(user =>{
      res.redirect('/admin/userProfile')
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.deleteProduct = (req, res, next) => {
//   const prodId = req.params.productId;
//   Product.findById(prodId)
//     .then(product => {
//       if (!product) {
//         return next(new Error('Product not found.'));
exports.deleteLawn = (req, res, next) => {
  const lawId = req.params.lawnId;
  Lawn.findById(lawId)
    .then(lawn => {
      if (!lawn) {
        return next(new Error('Lawn not found.'));
      }
      fileHelper.deleteFile(lawn.imageUrl);
      return Lawn.deleteOne({ _id: lawId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED LAWN');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting lawn failed.' });
    });
};
