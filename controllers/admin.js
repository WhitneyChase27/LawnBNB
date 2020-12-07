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
      res.redirect('/admin/lawn');
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

exports.getLawnManagement = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
 
  // !function() {

  //   var today = moment();
  
  //   function Calendar(selector, events) {
  //     this.el = document.querySelector(selector);
  //     this.events = events;
  //     this.current = moment().date(1);
  //     this.draw();
  //     var current = document.querySelector('.today');
  //     if(current) {
  //       var self = this;
  //       window.setTimeout(function() {
  //         self.openDay(current);
  //       }, 500);
  //     }
  //   }
  
  //   Calendar.prototype.draw = function() {
  //     //Create Header
  //     this.drawHeader();
  
  //     //Draw Month
  //     this.drawMonth();
  
  //     this.drawLegend();
  //   }
  
  //   Calendar.prototype.drawHeader = function() {
  //     var self = this;
  //     if(!this.header) {
  //       //Create the header elements
  //       this.header = createElement('div', 'header');
  //       this.header.className = 'header';
  
  //       this.title = createElement('h1');
  
  //       var right = createElement('div', 'right');
  //       right.addEventListener('click', function() { self.nextMonth(); });
  
  //       var left = createElement('div', 'left');
  //       left.addEventListener('click', function() { self.prevMonth(); });
  
  //       //Append the Elements
  //       this.header.appendChild(this.title); 
  //       this.header.appendChild(right);
  //       this.header.appendChild(left);
  //       this.el.appendChild(this.header);
  //     }
  
  //     this.title.innerHTML = this.current.format('MMMM YYYY');
  //   }
  
  //   Calendar.prototype.drawMonth = function() {
  //     var self = this;
      
  //     this.events.forEach(function(ev) {
  //      ev.date = self.current.clone().date(Math.random() * (29 - 1) + 1);
  //     });
      
      
  //     if(this.month) {
  //       this.oldMonth = this.month;
  //       this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
  //       this.oldMonth.addEventListener('webkitAnimationEnd', function() {
  //         self.oldMonth.parentNode.removeChild(self.oldMonth);
  //         self.month = createElement('div', 'month');
  //         self.backFill();
  //         self.currentMonth();
  //         self.fowardFill();
  //         self.el.appendChild(self.month);
  //         window.setTimeout(function() {
  //           self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
  //         }, 16);
  //       });
  //     } else {
  //         this.month = createElement('div', 'month');
  //         this.el.appendChild(this.month);
  //         this.backFill();
  //         this.currentMonth();
  //         this.fowardFill();
  //         this.month.className = 'month new';
  //     }
  //   }
  
  //   Calendar.prototype.backFill = function() {
  //     var clone = this.current.clone();
  //     var dayOfWeek = clone.day();
  
  //     if(!dayOfWeek) { return; }
  
  //     clone.subtract('days', dayOfWeek+1);
  
  //     for(var i = dayOfWeek; i > 0 ; i--) {
  //       this.drawDay(clone.add('days', 1));
  //     }
  //   }
  
  //   Calendar.prototype.fowardFill = function() {
  //     var clone = this.current.clone().add('months', 1).subtract('days', 1);
  //     var dayOfWeek = clone.day();
  
  //     if(dayOfWeek === 6) { return; }
  
  //     for(var i = dayOfWeek; i < 6 ; i++) {
  //       this.drawDay(clone.add('days', 1));
  //     }
  //   }
  
  //   Calendar.prototype.currentMonth = function() {
  //     var clone = this.current.clone();
  
  //     while(clone.month() === this.current.month()) {
  //       this.drawDay(clone);
  //       clone.add('days', 1);
  //     }
  //   }
  
  //   Calendar.prototype.getWeek = function(day) {
  //     if(!this.week || day.day() === 0) {
  //       this.week = createElement('div', 'week');
  //       this.month.appendChild(this.week);
  //     }
  //   }
  
  //   Calendar.prototype.drawDay = function(day) {
  //     var self = this;
  //     this.getWeek(day);
  
  //     //Outer Day
  //     var outer = createElement('div', this.getDayClass(day));
  //     outer.addEventListener('click', function() {
  //       self.openDay(this);
  //     });
  
  //     //Day Name
  //     var name = createElement('div', 'day-name', day.format('ddd'));
  
  //     //Day Number
  //     var number = createElement('div', 'day-number', day.format('DD'));
  
  
  //     //Events
  //     var events = createElement('div', 'day-events');
  //     this.drawEvents(day, events);
  
  //     outer.appendChild(name);
  //     outer.appendChild(number);
  //     outer.appendChild(events);
  //     this.week.appendChild(outer);
  //   }
  
  //   Calendar.prototype.drawEvents = function(day, element) {
  //     if(day.month() === this.current.month()) {
  //       var todaysEvents = this.events.reduce(function(memo, ev) {
  //         if(ev.date.isSame(day, 'day')) {
  //           memo.push(ev);
  //         }
  //         return memo;
  //       }, []);
  
  //       todaysEvents.forEach(function(ev) {
  //         var evSpan = createElement('span', ev.color);
  //         element.appendChild(evSpan);
  //       });
  //     }
  //   }
  
  //   Calendar.prototype.getDayClass = function(day) {
  //     classes = ['day'];
  //     if(day.month() !== this.current.month()) {
  //       classes.push('other');
  //     } else if (today.isSame(day, 'day')) {
  //       classes.push('today');
  //     }
  //     return classes.join(' ');
  //   }
  
  //   Calendar.prototype.openDay = function(el) {
  //     var details, arrow;
  //     var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
  //     var day = this.current.clone().date(dayNumber);
  
  //     var currentOpened = document.querySelector('.details');
  
  //     //Check to see if there is an open detais box on the current row
  //     if(currentOpened && currentOpened.parentNode === el.parentNode) {
  //       details = currentOpened;
  //       arrow = document.querySelector('.arrow');
  //     } else {
  //       //Close the open events on differnt week row
  //       //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
  //       if(currentOpened) {
  //         currentOpened.addEventListener('webkitAnimationEnd', function() {
  //           currentOpened.parentNode.removeChild(currentOpened);
  //         });
  //         currentOpened.addEventListener('oanimationend', function() {
  //           currentOpened.parentNode.removeChild(currentOpened);
  //         });
  //         currentOpened.addEventListener('msAnimationEnd', function() {
  //           currentOpened.parentNode.removeChild(currentOpened);
  //         });
  //         currentOpened.addEventListener('animationend', function() {
  //           currentOpened.parentNode.removeChild(currentOpened);
  //         });
  //         currentOpened.className = 'details out';
  //       }
  
  //       //Create the Details Container
  //       details = createElement('div', 'details in');
  
  //       //Create the arrow
  //       var arrow = createElement('div', 'arrow');
  
  //       //Create the event wrapper
  
  //       details.appendChild(arrow);
  //       el.parentNode.appendChild(details);
  //     }
  
  //     var todaysEvents = this.events.reduce(function(memo, ev) {
  //       if(ev.date.isSame(day, 'day')) {
  //         memo.push(ev);
  //       }
  //       return memo;
  //     }, []);
  
  //     this.renderEvents(todaysEvents, details);
  
  //     arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  //   }
  
  //   Calendar.prototype.renderEvents = function(events, ele) {
  //     //Remove any events in the current details element
  //     var currentWrapper = ele.querySelector('.events');
  //     var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));
  
  //     events.forEach(function(ev) {
  //       var div = createElement('div', 'event');
  //       var square = createElement('div', 'event-category ' + ev.color);
  //       var span = createElement('span', '', ev.eventName);
  
  //       div.appendChild(square);
  //       div.appendChild(span);
  //       wrapper.appendChild(div);
  //     });
  
  //     if(!events.length) {
  //       var div = createElement('div', 'event empty');
  //       var span = createElement('span', '', 'No Events');
  
  //       div.appendChild(span);
  //       wrapper.appendChild(div);
  //     }
  
  //     if(currentWrapper) {
  //       currentWrapper.className = 'events out';
  //       currentWrapper.addEventListener('webkitAnimationEnd', function() {
  //         currentWrapper.parentNode.removeChild(currentWrapper);
  //         ele.appendChild(wrapper);
  //       });
  //       currentWrapper.addEventListener('oanimationend', function() {
  //         currentWrapper.parentNode.removeChild(currentWrapper);
  //         ele.appendChild(wrapper);
  //       });
  //       currentWrapper.addEventListener('msAnimationEnd', function() {
  //         currentWrapper.parentNode.removeChild(currentWrapper);
  //         ele.appendChild(wrapper);
  //       });
  //       currentWrapper.addEventListener('animationend', function() {
  //         currentWrapper.parentNode.removeChild(currentWrapper);
  //         ele.appendChild(wrapper);
  //       });
  //     } else {
  //       ele.appendChild(wrapper);
  //     }
  //   }
  
  //   Calendar.prototype.drawLegend = function() {
  //     var legend = createElement('div', 'legend');
  //     var calendars = this.events.map(function(e) {
  //       return e.calendar + '|' + e.color;
  //     }).reduce(function(memo, e) {
  //       if(memo.indexOf(e) === -1) {
  //         memo.push(e);
  //       }
  //       return memo;
  //     }, []).forEach(function(e) {
  //       var parts = e.split('|');
  //       var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
  //       legend.appendChild(entry);
  //     });
  //     this.el.appendChild(legend);
  //   }
  
  //   Calendar.prototype.nextMonth = function() {
  //     this.current.add('months', 1);
  //     this.next = true;
  //     this.draw();
  //   }
  
  //   Calendar.prototype.prevMonth = function() {
  //     this.current.subtract('months', 1);
  //     this.next = false;
  //     this.draw();
  //   }
  
  //   window.Calendar = Calendar;
  
  //   function createElement(tagName, className, innerText) {
  //     var ele = document.createElement(tagName);
  //     if(className) {
  //       ele.className = className;
  //     }
  //     if(innerText) {
  //       ele.innderText = ele.textContent = innerText;
  //     }
  //     return ele;
  //   }
  // }();
  
  // !function() {
  //   var data = [
  //     { eventName: 'Lunch Meeting w/ Mark', calendar: 'Work', color: 'orange' },
  //     { eventName: 'Interview - Jr. Web Developer', calendar: 'Work', color: 'orange' },
  //     { eventName: 'Demo New App to the Board', calendar: 'Work', color: 'orange' },
  //     { eventName: 'Dinner w/ Marketing', calendar: 'Work', color: 'orange' },
  
  //     { eventName: 'Game vs Portalnd', calendar: 'Sports', color: 'blue' },
  //     { eventName: 'Game vs Houston', calendar: 'Sports', color: 'blue' },
  //     { eventName: 'Game vs Denver', calendar: 'Sports', color: 'blue' },
  //     { eventName: 'Game vs San Degio', calendar: 'Sports', color: 'blue' },
  
  //     { eventName: 'School Play', calendar: 'Kids', color: 'yellow' },
  //     { eventName: 'Parent/Teacher Conference', calendar: 'Kids', color: 'yellow' },
  //     { eventName: 'Pick up from Soccer Practice', calendar: 'Kids', color: 'yellow' },
  //     { eventName: 'Ice Cream Night', calendar: 'Kids', color: 'yellow' },
  
  //     { eventName: 'Free Tamale Night', calendar: 'Other', color: 'green' },
  //     { eventName: 'Bowling Team', calendar: 'Other', color: 'green' },
  //     { eventName: 'Teach Kids to Code', calendar: 'Other', color: 'green' },
  //     { eventName: 'Startup Weekend', calendar: 'Other', color: 'green' }
  //   ];
  
    
  
  //   function addDate(ev) {
      
  //   }
  
  //   var calendar = new Calendar('#calendar', data);
  
  // }();
  
  const lawId = req.params.lawnId;                  
  Lawn.findById(lawId)
    .then(lawn => {
      if (!lawn) {
        return res.redirect('/');
      }
      res.render('admin/lawn-management', {
        pageTitle: 'Lawn Management',
        path: '/admin/lawn-management',
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
