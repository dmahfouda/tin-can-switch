const router    = require('express').Router();
const validator = require('express-validator');
const Box       = require('../models/box');
const logger    = require('../util/logger');
const fs        = require('fs');
const crypto    = require('crypto');

const baseDir = '/tmp';

router.post('/box/:name', validator.checkSchema({
    name: {
        errorMessage: 'box name must be alphanumeric',
        in: ['params'],
        isAlphanumeric: true,
    }
}), (req, res) => {
    if (!(errors = validator.validationResult(req)).isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    } else {
        Box.create({
            name: req.params.name,
            messageHash: "",
        }).then((box) => {
            res.json({
                name: box.name
            });
        }).catch((err) => {
            res.status(409).json({
                message: `box '${req.params.name}' already exists`,
            });
        });
    }
});

router.get('/box/:name', (req, res) => {
    Box.findOne({ name: req.params.name }, (err, box) => {
        if (err) { 
            throw err; 
        }
        if (!box) {
             res.status(404).json({
                message: `box '${req.params.name}' does not exist`,
            });
        } else {
            res.status(200).json({
                name: box.name,
                messageHash: box.messageHash,
            });
        }
    });
})

router.post('/box/:name/message', (req, res, next) => {
    Box.findOne({ name: req.params.name }, (err, box) => {
        if (err) { throw err; }
        if (!box) {
            res.status(404).json({
                message: `box '${req.params.name}' does not exist`,
            });
        } else {
	        if (box.messageHash) {
	            res.status(409).json({
	                message: `box '${box.name}' is full`
	            });
	        } else {
                const hasher = crypto.createHash('sha256');
                req.pipe(hasher);
	            req.pipe(fs.createWriteStream(`${baseDir}/${box.name}.pcm`));
	            req.on('end', () => {
                    const messageHash = hasher.digest('hex');
	                Box.updateOne({ name: box.name }, { messageHash: messageHash }).then((n) => {
	                    res.status(200).json({ name: box.name, messageHash: messageHash });
	                }).catch((err) => {
                        console.log(err);
	                    res.status(500).json({ 
	                        message: `error writing message to box '${box.name}'`
	                    });
	                });
	            });
	        }
        }
    });
})

router.get('/box/:name/message', (req, res) => {
    Box.findOne({
        name: req.params.name
    }).then((box) => {
        if (!box) {
            res.status(404).json({
                message: `box '${req.params.name}' does not exist`
            });
        } else {
	        if (!box.messageHash) {
	            res.status(404).json({
	                message: `box '${box.name}' is empty`
	            });
	        } else {
	            res.sendFile(`${baseDir}/${box.name}.pcm`, {}, (err) => {
	                if (err) {
	                    res.status(500).json({
	                        message: `error reading message in box '${box.name}'`
	                    })
	                } else {
	                    Box.updateOne({ name: box.name }, { messageHash: "" }).catch((err) => {
	                        logger.error(err);
	                    });
	                    fs.unlink(`${baseDir}/${box.name}.pcm`, (err) => {
	                        if (err) { logger.error(err); }
	                    });
	                }
	            });
	        }
        }
    });
})

module.exports = router
