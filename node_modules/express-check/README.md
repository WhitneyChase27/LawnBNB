# check [![Build Status](https://travis-ci.org/CatTail/express-check.png)](https://travis-ci.org/CatTail/express-check)

Expressjs data validation middleware.

## API

```js
var bodyParser = require('body-parser')
  , check = require('express-check')
  , rule = check.rule
  ;

var app = express();

// always use bodyParser before check middleware
app.use(bodyParser());
app.get(
  '/login',
  check('body',
    rule('username').notEmpty(),
    rule('password').isLength(6, 18)
  )
);
```

### check(dataSource, rule[, rule])

`dataSource` could be either `body`, `query` or `params`.

Following a list of `rule` created by `check.rule()`

### check.rule(field)

`field` is the field name that being validate.

## License

MIT
