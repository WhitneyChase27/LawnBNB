const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_Flc1Upp19T0q8ZgmKGDVJUI400j9emUSTr');

const PDFDocument = require('pdfkit');

const Lawn = require('../models/lawn');
const Reservation = require('../models/reservation');

const ITEMS_PER_PAGE = 2;

exports.getLawns = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Lawn.find()
    .countDocuments()
    .then(numLawns => {
      totalItems = numLawns;
      return Lawn.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(lawns => {
      res.render('shop/lawn-list', {
        laws: lawns,
        pageTitle: 'Lawns',
        path: '/lawn',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLawn = (req, res, next) => {
  const lawId = req.params.lawnId;
  Lawn.findById(lawId)
    .then(lawn => {
      res.render('shop/lawn-detail', {
        lawn: lawn,
        pageTitle: lawn.title,
        path: '/lawns'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Lawn.find()
    .countDocuments()
    .then(numLawns => {
      totalItems = numLawns;
      return Lawn.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(lawns => {
      res.render('shop/index', {
        laws: lawns,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.lawnId')
    .execPopulate()
    .then(user => {
      const lawns = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        lawns: lawns
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const lawId = req.body.lawnId;
  Lawn.findById(lawId)
    .then(lawn => {
      return req.user.addToCart(lawn);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteLawn = (req, res, next) => {
  const lawId = req.body.lawnId;
  req.user
    .removeFromCart(lawId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let lawns;
  let total = 0;
  req.user
    .populate('cart.items.lawnId')
    .execPopulate()
    .then(user => {
      lawns = user.cart.items;
      total = 0;
      lawns.forEach(l => {
        total += l.quantity * l.lawnId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lawns.map(l => {
          return {
            name: l.lawnId.title,
            description: l.lawnId.description,
            amount: l.lawnId.price * 100,
            currency: 'usd',
            quantity: l.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        lawns: lawns,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.lawnId')
    .execPopulate()
    .then(user => {
      const lawns = user.cart.items.map(i => {
        return { quantity: i.quantity, lawn: { ...i.lawnId._doc } };
      });
      const reservation = new Reservation({
        user: {
          email: req.user.email,
          userId: req.user
        },
        lawns: lawns
      });
      return reservation.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/reservations');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postReservation = (req, res, next) => {
  req.user
    .populate('cart.items.lawnId')
    .execPopulate()
    .then(user => {
      const lawns = user.cart.items.map(i => {
        return { quantity: i.quantity, lawn: { ...i.lawnId._doc } };
      });
      const reservation = new Reservation({
        user: {
          email: req.user.email,
          userId: req.user
        },
        lawns: lawns
      });
      return reservation.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/reservations');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReservations = (req, res, next) => {
  Reservation.find({ 'user.userId': req.user._id })
    .then(reservations => {
      res.render('shop/reservations', {
        path: '/reservations',
        pageTitle: 'Your Reservations',
        reservations: reservations
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const reservationId = req.params.reservationId;
  Reservation.findById(reservationId)
    .then(reservation=> {
      if (!reservation) {
        return next(new Error('No reservation found.'));
      }
      if (reservation.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + reservationId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      reservation.lawns.forEach(law => {
        totalPrice += law.quantity * law.lawn.price;
        pdfDoc
          .fontSize(14)
          .text(
            law.lawn.title +
              ' - ' +
              law.quantity +
              ' x ' +
              '$' +
              law.lawn.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
