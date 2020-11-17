const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/userProfile => GET
router.get('/userProfile', isAuth, adminController.getUserProfile);

// /admin/add-product => POST
router.post(
  '/add-product',
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
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
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
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
