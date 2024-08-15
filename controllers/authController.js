const User = require('../models/User');
const AccessToken = require('../models/AccessToken');
const Presence = require('../models/Presence');
const jwt = require("jsonwebtoken");
const BaseResponse = require('../models/BaseResponse');
const Errors = require('../models/Errors');
const Friends = require('../models/Friends');
let options = { returnDocument: 'after' };
const Joi = require('joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const secretKey = "mySecrectKey";

async function getAccessToken(user) {
        if (user == null) return false;

        let userid = "";

        if (typeof user === 'object') {
                userid = user.id;
        } else if (typeof user == 'number') {
                userid = user;
        }

        var accessToken = jwt.sign({ id: user.id }, secretKey);

        var checkAccess = await AccessToken.findOne({
                userID: userid
        });

        if (checkAccess != null) {
                accessToken = checkAccess.accessToken;
        } else {
                const access = new AccessToken({
                        accessToken: accessToken,
                        userID: userid
                });
                await access.save();
                checkAccess = access;
        }

        return checkAccess;
}

function customResponse(res, message, status = 0, code = 200, data = null) {
        return BaseResponse.customResponse(res, message, status, code, data);
}

exports.logout = async (req, res) => {
        try {
                const user = await User.findById(req.body.userID);

                if (!user) return customResponse(res, "User not Found", 0, 404);
                
                await AccessToken.deleteOne({
                        userID: user.id
                });

                var presence = await Presence.findOneAndUpdate({ userID: user.id }, {
                        $set: {
                                presence: false,
                                presenceTimeStamp: Date.now()
                        }
                }, options);

                const userRooms = usersRooms.get(req.body.userID);

                if (userRooms) {
                        _io.to(userRooms).emit("userLoggedOut", {
                                "presence": presence
                        });
                }
                return 

        } catch (err) {
                return customResponse(res, "Logout failed", 0, 500);
        }
}

exports.loginByToken = async (req, res) => {
        try {
                const authorization = req.headers.authorization;
                const str = authorization.split(" ")[1];
                const checkAccessToken = await AccessToken.findOne({ accessToken: str });
                if (checkAccessToken != null) {
                        const user = await User.findByIdAndUpdate(checkAccessToken.userID, {
                                $set: {
                                        deviceToken: req.body.deviceToken
                                },
                        }, options);
                        const updatePresence = await Presence.findOneAndUpdate({ userID: user.id }, {
                                $set: {
                                        presence: true,
                                        presenceTimeStamp: Date.now()
                                }
                        }, options);
                        // const userPresence = await Presence.findById(updatePresence);
                        if (user != null) {
                                const friend = await Friends.findOne({ userID: user.id });
                                if (!friend) {
                                        const newFriend = new Friends({
                                                userID: user.id,
                                                nameChat: user.name,
                                        });
                                        await newFriend.save();
                                }
                                return res.status(200).json(
                                        new BaseResponse(
                                                1,
                                                Date.now(),
                                                [
                                                        { accessToken: checkAccessToken, user: user, userPresence: updatePresence }
                                                ],
                                                new Errors(
                                                        200,
                                                        "",
                                                )
                                        ));
                        }
                        else {
                                return res.status(401).json(
                                        new BaseResponse(
                                                -1,
                                                Date.now(),
                                                [],
                                                new Errors(
                                                        401,
                                                        "You are not authenticated",
                                                )
                                        ));
                        }
                }
                else {
                        res.status(404).json(
                                new BaseResponse(
                                        -1,
                                        Date.now(),
                                        [],
                                        new Errors(
                                                401,
                                                "Token is invalid",
                                        )
                                ));
                }

        } catch (err) {
                return res.status(500).json(
                        new BaseResponse(
                                -1,
                                Date.now(),
                                [],
                                new Errors(
                                        500,
                                        err.toString(),
                                )
                        ));
        }
}

exports.register = async (req, res) => {
        try {            
                const checkEmail = await User.findOne({ email: req.body.email });
                if (checkEmail) {
                        return res.status(403).json(new BaseResponse(
                                [],
                                "Email is already in use",
                                403
                        ));
                }

                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(req.body.password, salt);

                const newUser = new User({
                        email: req.body.email,
                        name: req.body.name,
                        password: hash,
                        isDarkMode: false,
                        urlImage: req.urlImage
                });
                const user = await newUser.save();
                const newPresence = new Presence({
                        userID: user.id,
                        presence: false,
                        presenceTimeStamp: Date.now()
                });
                await newPresence.save();

                const {accessToken} = await getAccessToken(newUser);

                let {email, name, isDarkMode, urlImage} = newUser;
                return res.status(200).json(new BaseResponse({ 
                        email,
                        name,
                        isDarkMode,
                        urlImage,
                        accessToken
                },
                        "Register Successfully!",
                        200
                ));
        } catch (error) {
                console.log(error.toString());
                return res.status(500).json(new BaseResponse(
                        -1,
                        Date.now(),
                        []
                        ,
                        new Errors(
                                500,
                                error.toString(),
                        )

                ));
        }
}

exports.login = async (req, res) => {
        try {
                let schema = Joi.object({
                        email: Joi.string()
                            .email()
                            .required(),
                            password : Joi.string().required()
                });

                const {error, validate} = schema.validate({ email: req.body.email ?? "", password: req.body.password ?? "" });                

                if (error) return customResponse(res, error.message, 0, 400);                

                const user = await User.findOne({ email: req.body.email });

                if (!user) return customResponse(res, "User not found", 0, 404);  

                let checkPassword = bcrypt.compareSync(req.body.password, user.password);

                if (!checkPassword) return customResponse(res, "User or password is not right . Please try again", 0, 401);

                var {accessToken} = getAccessToken(user);

                const updatePresence = await Presence.findOneAndUpdate({ userID: user.id }, {
                        $set: {
                                presence: true,
                        }
                }, options);

                const { email, name, isDarkMode, urlImage } = user;
                const { presenceTimeStamp } = updatePresence;

                return customResponse(res, "Login successfully", 1, 200, {
                        accessToken: accessToken,
                        email,
                        name,
                        isDarkMode,
                        urlImage,
                        presenceTimeStamp,
                });

        } catch (err) {
                return customResponse(res, err.toString(), 0, 500);
        }
}


exports.loginByGoogle = async (req, res) => {
        console.log(req.body.deviceToken);
        try {
                var user = await User.findOneAndUpdate({ email: req.body.email },
                        {
                                $set: {
                                        deviceToken: req.body.deviceToken
                                }
                        }, options
                );
                if (!user) {
                        const newUser = await new User({
                                email: req.body.email,
                                name: req.body.name,
                                isDarkMode: false,
                                urlImage: req.body.urlImage
                        }).save();
                        user = await User.findById(newUser.id);
                }
                const friend = await Friends.findOne({ userID: user.id });
                if (!friend) {
                        const newFriend = new Friends({
                                userID: user.id,
                                nameChat: user.name,
                        });
                        await newFriend.save();
                }
                var accessToken = jwt.sign({ id: user.id }, "mySecrectKey");

                var checkAccess = await AccessToken.findOne({
                        userID: user.id
                })
                if (checkAccess != null) {
                        accessToken = checkAccess.accessToken;
                }
                else {
                        const access = new AccessToken({
                                accessToken: accessToken,
                                userID: user.id
                        }
                        );
                        await access.save();
                        checkAccess = access;
                }
                var userPresence = await Presence.findOne({ userID: user.id });
                if (!userPresence) {
                        userPresence = await new Presence({
                                userID: user.id,
                                presence: true,
                                presenceTimeStamp: Date.now()
                        }).save();
                }
                else {
                        userPresence = await Presence.findOneAndUpdate({ userID: user.id }, {
                                $set: {
                                        presence: true,
                                        presenceTimeStamp: Date.now()
                                }
                        }, options);
                }
                return res.status(200).json(
                        new BaseResponse(
                                1,
                                Date.now(),
                                [
                                        { accessToken: checkAccess, user: user, userPresence: userPresence }
                                ],
                                new Errors(
                                        200,
                                        "",
                                )
                        ));

        } catch (err) {
                return res.status(500).json(new BaseResponse(
                        -1,
                        Date.now(),
                        [],
                        new Errors(
                                500,
                                err.toString(),
                        )
                ));
        }
}

exports.getPresence = async (req, res) => {
        try {
                const presence = await Presence.findOne({ userID: req.body.userID });
                if (!presence) {
                        return res.status(403).json(new BaseResponse(
                                -1,
                                Date.now(),
                                [],
                                new Errors(
                                        403,
                                        "Not found user!",
                                )
                        ));
                }
                return res.status(200).json(new BaseResponse(
                        1,
                        Date.now(),
                        [
                                presence
                        ],
                        new Errors(
                                200,
                                "Successfully!",
                        )
                ));
        } catch (error) {
                console.log(error.toString());
                return res.status(500).json(new BaseResponse(
                        -1,
                        Date.now(),
                        []
                        ,
                        new Errors(
                                500,
                                error.toString(),
                        )

                ));
        }
}