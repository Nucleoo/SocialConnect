const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const { check, validationResult, body } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route = GET api/profile/me
// @desc = Get current user profile
// @access = Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'No Profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = POST api/profile
// @desc = Create/update user profile
// @access = Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, status, skills, bio, githubusername,
        youtube, twitter, instagram, linkedin, facebook } = req.body;

    //Build Profile object
    const profileField = {};
    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (status) profileField.status = status;
    if (bio) profileField.bio = bio;
    if (githubusername) profileField.githubusername = githubusername;
    if (skills) {
        profileField.skills = skills.split(',').map(skills => skills.trim());
    }

    // Build profileField->Social object
    profileField.social = {};
    if (youtube) profileField.social.youtube = youtube;
    if (twitter) profileField.social.twitter = twitter;
    if (instagram) profileField.social.instagram = instagram;
    if (facebook) profileField.social.facebook = facebook;
    if (linkedin) profileField.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //update the profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: profileField },
                { new: true });

            return res.json(profile);
        }
        // Create a profile
        profile = new Profile(profileField);
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = GET api/profile
// @desc = Get all profiles
// @access = Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = GET api/profile/user/:user_id
// @desc = Get profiles by user_id
// @access = Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'Profile Not Found' });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile Not Found' });
        }
        res.status(500).send('Server error');
    }
});

// @route = DELETE api/profile
// @desc = Delete the current user
// @access = Private
router.delete('/', auth, async (req, res) => {
    try {

        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = PUT api/profile/experience
// @desc = Update experience 
// @access = Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, from, to, location, current, description } = req.body;
    const newExp = { title, company, location, to, from, current, description };
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = DELETE api/profile/experience/:exp_id
// @desc = Delete experience 
// @access = Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove Id
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = PUT api/profile/education
// @desc = Update education 
// @access = Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = { school, degree, fieldofstudy, from, to, current, description };
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = DELETE api/profile/education/:edu_id
// @desc = Delete education 
// @access = Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove Id
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route = GET api/profile/github/:username 
// @desc = Get github repo 
// @access = Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(400).json({ msg: 'No github profile found' });
            }
            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;