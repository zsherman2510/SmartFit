const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const validateClientInput = require('../../validation/client');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

const Client = require('../../models/Client');

// @route           GET api/client/test
// @description     Tests client route
// @access          Public

router.get('/test', (req, res) => res.json({ msg: 'Client Works' }));

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  Client.findOne({ email: req.body.email }).then(client => {
    if (client) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //Size
        r: 'pg', //Avatar rating
        d: 'mm' // Default
      });

      const newClient = new Client({
        name: req.body.name,
        email: req.body.email,
        handle: req.body.handle,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newClient.password, salt, (err, hash) => {
          if (err) throw err;
          newClient.password = hash;
          newClient
            .save()
            .then(client => res.json(client))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route           GET api/users/test
// @description     login Client / returning jwt token
// @access          Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // find client by email
  Client.findOne({ email }).then(client => {
    //check for client
    if (!client) {
      errors.email = 'client not found';
      return res.status(404).json(errors);
    }

    //Check Password
    bcrypt.compare(password, client.password).then(isMatch => {
      if (isMatch) {
        // client matched

        // create jwt payload
        const payload = {
          id: client.id,
          name: client.name,
          avatar: client.avatar
        };

        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 7200 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        return res.status(400).json(errors);
      }
    });
  });
});

// @route           GET api/client/
// @description     Get current clients
// @access          Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};
    Client.findOne(req.client.id)
      .populate('client', ['name', 'avatar'])
      .then(client => {
        if (!client) {
          errors.noclient = 'There is no client for this client';
          return res.status(404).json(errors);
        }
        res.json(client);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route           GET api/client/all
// @description     Get all clients
// @access          Public
router.get('/all', (req, res) => {
  const errors = {};
  Client.find()
    .populate('client', ['name', 'avatar'])
    .then(clients => {
      if (!clients) {
        errors.noclient = 'there are no clients';
        return res.status(404).json(errors);
      }
      res.json(clients);
    })
    .catch(err => res.status(404).json({ client: 'There are no profiles.' }));
});

// @route           GET api/client/handle/:handle
// @description     Get client by handle
// @access          Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Client.findOne({ handle: req.params.handle })
    .populate('client', ['name', 'avatar'])
    .then(client => {
      if (!client) {
        errors.noclient = 'there is no client for this client';
        res.status(404).json(errors);
      }
      res.json(client);
    })
    .catch(err => res.status(404).json(err));
});

// @route           GET api/client/client/:user_id
// @description     Get client by client ID
// @access          Public

router.get('/client/:client_id', (req, res) => {
  const errors = {};

  Client.findOne(req.params.client_id)
    .populate('client', ['name', 'avatar'])
    .then(client => {
      if (!client) {
        errors.noclient = 'there is no client for this client';
        res.status(404).json(errors);
      }
      res.json(client);
    })
    .catch(err =>
      res.status(404).json({ client: 'There is no client for this client.' })
    );
});

// @route           POST api/client
// @description     Create or edit client client
// @access          Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateClientInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Get fields
    const clientFields = {};
    clientFields.client = req.client.id;
    if (req.body.handle) clientFields.handle = req.body.handle;

    if (req.body.location) clientFields.location = req.body.location;

    // Skills - split into array
    if (typeof req.body.goals !== 'undefined') {
      clientFields.goals = req.body.goals.split(',');
    }

    //Socials

    clientFields.social = {};
    if (req.body.instagram) clientFields.social.instagram = req.body.instagram;
    if (req.body.youtube) clientFields.social.youtube = req.body.youtube;
    if (req.body.twitter) clientFields.social.twitter = req.body.twitter;
    if (req.body.linkedIn) clientFields.social.linkedIn = req.body.linkedIn;

    Client.findOne(req.client.id).then(client => {
      if (client) {
        //Update
        Client.findOneAndUpdate(
          { client: req.client.id },
          { $set: clientFields },
          { new: true }
        ).then(client => res.json(client));
      } else {
        //Create

        // Check if handle exists
        Client.findOne({ handle: clientFields.handle }).then(client => {
          if (client) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          //Save client
          new Client(clientFields).save().then(client => res.json(client));
        });
      }
    });
  }
);
// @route           DEL api/trainer
// @description     delete client and trainer
// @access          Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Client.findOneAndRemove(req.client.id).then(() => {
      res.json({ success: true });
    });
  }
);

module.exports = router;
