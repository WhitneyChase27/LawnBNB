const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
// /admin/add-lawn => GET
router.get('/add-lawn', isAuth, adminController.getAddLawn);

// /admin/products => GET
// /admin/lawns => GET
router.get('/lawns', isAuth, adminController.getLawns);

// /admin/add-lawn => POST
router.post(
  '/add-lawn',
  [
    body('town')
      .isString()
      .isLength({ min: 2 })
      .trim(),
      body('state')
      .isString()
      .isLength({ min: 2 })
      .trim(),
      body('lawnsize').isFloat(),
      body('events')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('groupsize').isFloat(),
    body('eventhrs').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddLawn
);

router.get('/edit-lawn/:lawnId', isAuth, adminController.getEditLawn);

router.post(
  '/edit-lawn',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditLawn
);

router.delete('/lawn/:lawnId', isAuth, adminController.deleteLawn);

module.exports = router;
