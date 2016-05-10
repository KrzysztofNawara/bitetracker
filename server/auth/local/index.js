/* setup middleware for handling local authentication */
'use strict';

import express from 'express';
import passport from 'passport';
import {signToken} from '../auth.service';

var router = express.Router();

router.post('/', function(req, res, next) {
  /*
  if authentication fails, user === false and info might contain additional info supplied by strategy
  if exception occurs, err will be set and info might contain additional information supplied by strategy
  session is not established by passport in this case!
   */
  passport.authenticate('local', function(err, user, info) {
    if(err) {
      /* exception occured */
      const errorMsg = info || 'Something went wrong, please try again.';
      return res.status(500).json({message: errorMsg});
    } else if(user) {
      /* auth successful, 200 */
      var token = signToken(user._id, user.role);

      /* 19.01.2038 03:14:07 GMT - seems to be maximum, cross-browser compatibile expiration time
      * http://stackoverflow.com/a/34586818/3182262 */
      res.cookie('access_token', token, {httpOnly: true, expires: new Date(2038, 1, 19, 3, 14, 7)/*@ToDo: secure: true*/});
      res.status(200).json({redirectUrl: '/app.html', userId: user._id});
    } else {
      /* auth failure, 403 */
      return res.status(403).json({message: 'Incorrect credentials'});
    }
  })(req, res, next)
});

export default router;
