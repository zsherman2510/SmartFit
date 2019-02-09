const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
// load validation

const validateRegisterInput = require("../../validation/register");
const validateTrainerInput = require("../../validation/trainer");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
const validateLoginInput = require("../../validation/login");

//Load trainer trainer
const Trainer = require("../../models/Trainer");

// @route           GET api/trainer/test
// @description     Tests trainer route
// @access          Public

router.get("/test", (req, res) => res.json({ msg: "Trainer Works" }));

// @route           GET api/users/register
// @description     Register trainer
// @access          Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  Trainer.findOne({ email: req.body.email }).then(trainer => {
    if (trainer) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", //Avatar rating
        d: "mm" // Default
      });
      const newTrainer = new Trainer({
        name: req.body.name,
        handle: req.body.handle,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newTrainer.password, salt, (err, hash) => {
          if (err) throw err;
          newTrainer.password = hash;
          newTrainer
            .save()
            .then(trainer => res.json(trainer))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route           GET api/users/test
// @description     login Trainer / returning jwt token
// @access          Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // find trainer by email
  Trainer.findOne({ email }).then(trainer => {
    //check for trainer
    if (!trainer) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    //Check Password
    bcrypt.compare(password, trainer.password).then(isMatch => {
      if (isMatch) {
        // trainer matched

        // create jwt payload
        const payload = {
          id: trainer.id,
          name: trainer.name,
          avatar: trainer.avatar
        };

        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 7200 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route           GET api/trainer/test
// @description     Get current users trainer
// @access          Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Trainer.findOne(req.trainer.id)
      .populate("trainer", ["name", "avatar"])
      .then(trainer => {
        if (!trainer) {
          errors.notrainer = "There is no trainer for this trainer";
          return res.status(404).json(errors);
        }
        res.json(trainer);
      })
      .catch(err => res.status(404).json(err));
  }
);
// @route           GET api/trainer/all
// @description     Get all profiles
// @access          Public
router.get("/all", (req, res) => {
  const errors = {};
  Trainer.find()
    .populate("trainer", ["name", "avatar"])
    .then(trainers => {
      if (!trainers) {
        errors.noprofile = "there are no trainers";
        return res.status(404).json(errors);
      }
      res.json(trainers);
    })
    .catch(err => res.status(404).json({ trainer: "There are no trainers." }));
});

// @route           GET api/trainer/handle/:handle
// @description     Get trainer by handle
// @access          Public

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Trainer.findOne({ handle: req.params.handle })
    .populate("trainer", ["name", "avatar"])
    .then(trainer => {
      if (!trainer) {
        errors.noprofile = "there is no trainer for this trainer";
        res.status(404).json(errors);
      }
      res.json(trainer);
    })
    .catch(err => res.status(404).json(err));
});

// @route           GET api/trainer/trainer/:user_id
// @description     Get trainer by trainer ID
// @access          Public

router.get("/trainer/:user_id", (req, res) => {
  const errors = {};

  Trainer.findOne(req.params.user_id)
    .populate("trainer", ["name", "avatar"])
    .then(trainer => {
      if (!trainer) {
        errors.noprofile = "there is no trainer for this trainer";
        res.status(404).json(errors);
      }
      res.json(trainer);
    })
    .catch(err =>
      res.status(404).json({ trainer: "There is no trainer for this trainer." })
    );
});

// @route           POST api/trainer
// @description     Create or edit trainer trainer
// @access          Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateTrainerInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Get fields
    const trainerFields = {};
    trainerFields.trainer = req.trainer.id;
    if (req.body.handle) trainerFields.handle = req.body.handle;
    if (req.body.company) trainerFields.company = req.body.company;
    if (req.body.website) trainerFields.website = req.body.website;
    if (req.body.location) trainerFields.location = req.body.location;
    if (req.body.status) trainerFields.status = req.body.status;
    // Skills - split into array
    if (typeof req.body.trainingStyle !== "undefined") {
      trainerFields.trainingStyle = req.body.trainingStyle.split(",");
    }
    if (req.body.bio) trainerFields.bio = req.body.bio;
    if (req.body.trainingStyle)
      trainerFields.trainingStyle = req.body.trainingStyle;
    if (req.body.rates) trainerFields.rates = req.body.rates;

    //Socials

    trainerFields.social = {};
    if (req.body.instagram) trainerFields.social.instagram = req.body.instagram;
    if (req.body.youtube) trainerFields.social.youtube = req.body.youtube;
    if (req.body.twitter) trainerFields.social.twitter = req.body.twitter;
    if (req.body.linkedIn) trainerFields.social.linkedIn = req.body.linkedIn;

    Trainer.findOne(req.trainer.id).then(trainer => {
      if (trainer) {
        //Update
        Trainer.findOneAndUpdate(
          { trainer: req.trainer.id },
          { $set: trainerFields },
          { new: true }
        ).then(trainer => res.json(trainer));
      } else {
        //Create

        // Check if handle exists
        Trainer.findOne({ handle: trainerFields.handle }).then(trainer => {
          if (trainer) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //Save trainer
          new Trainer(trainerFields).save().then(trainer => res.json(trainer));
        });
      }
    });
  }
);

// @route           GET api/trainer/experience
// @description     Add experience to trainer
// @access          Private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Trainer.findOne(req.trainer.id).then(trainer => {
      if (trainer) {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          trainingStyle: req.body.trainingStyle,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //Add to experience array
        trainer.experience.unshift(newExp);

        trainer.save().then(trainer => res.json(trainer));
      } else {
        res.json({ trainer: "you must create a trainer first." });
      }
    });
  }
);
// @route           GET api/trainer/education
// @description     Add education to trainer
// @access          Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Trainer.findOne(req.trainer.id).then(trainer => {
      if (trainer) {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldOfStudy: req.body.fieldOfStudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //Add to education array
        trainer.education.unshift(newEdu);

        trainer.save().then(trainer => res.json(trainer));
      } else {
        res.json({ trainer: "you must create a trainer first." });
      }
    });
  }
);
// @route           DEL api/trainer/experience/:exp_id
// @description     delete experience from trainer
// @access          Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Trainer.findOne(req.trainer.id).then(trainer => {
      // Get remove index
      const removeIndex = trainer.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //Splice out of array
      trainer.experience.splice(removeIndex, 1);

      //Save
      trainer
        .save()
        .then(trainer => res.json(trainer))
        .catch(err => res.status(404).json(err));

      //
    });
  }
);
// @route           DEL api/trainer/education:edu_id
// @description     delete education from trainer
// @access          Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Trainer.findOne(req.trainer.id).then(trainer => {
      // Get remove index
      const removeIndex = trainer.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //Splice out of array
      trainer.education.splice(removeIndex, 1);

      //Save
      trainer
        .save()
        .then(trainer => res.json(trainer))
        .catch(err => res.status(404).json(err));

      //
    });
  }
);

// @route           DEL api/trainer
// @description     delete trainer and trainer
// @access          Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Trainer.findOneAndRemove({ _id: res.trainer.id }).then(() =>
      res.json({ success: true })
    );
  }
);

module.exports = router;
