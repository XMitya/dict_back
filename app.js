const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors')
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const testRouter = require('./routes/v1/test');
const adminRouter = require('./routes/v1/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Disable CORS
app.use(cors({origin: true}))
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1', testRouter);
app.use('/v1/admin', adminRouter);

// Swagger
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Dictionary service",
      version: "0.1.0",
      description:
          "Simple API for dictionary with statistics",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    }
  },
  apis: ["./routes/v1/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs", 
    function(req, res, next){
            specs.host = req.get('host');
                req.swaggerDoc = specs;
                    next();
    },
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
