/**
 * Created by steve on 2/9/2017.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const userService = require('../../services/user-service');
const User = require('../../models/user');

describe('User service tests', function () {
    before('Open connection to test database', function (done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.mongoURI[process.env.NODE_ENV], function (err) {
                if (err) {
                    console.log('Error connecting to the database. ' + err);
                } else {
                    console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
                }
                done();
            });
        } else {
            console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
            done();
        }
    });

    it('Creating a single user', function (done) {
        userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);

            assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
            assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
            assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
            assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
            assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');

            userService.removeUser(user._id, function (successful, err) {
                assert.isNotOk(err);
                assert.isTrue(successful, 'user should have succesfully been deleted');
                done();
            })
        });
    });

    describe('Creating two users - different email', function () {
        let createUser_user1;
        let createUser_user2;

        it('user1', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                createUser_user1 = user;
                done();
            });

        });

        it('user2', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp2@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                createUser_user2 = user;
                done();
            });
        });

        after('Remove users', function (done) {
            userService.removeUser(createUser_user1._id, function (succes, err) {
                assert.isNotOk(err);
                assert.isTrue(succes, 'user1 should have succesfully been deleted');

                userService.removeUser(createUser_user2._id, function (succes, err) {
                    assert.isNotOk(err);
                    assert.isTrue(succes, 'user2 should have succesfully been deleted');
                    done();
                });
            })
        })
    });

    describe('Creating two users - same email', function () {
        let createUser_user1;
        let createUser_user2;

        it('user1', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                createUser_user1 = user;
                done();
            });

        });

        it('user2', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isOk(err);
                assert.isNotOk(user);

                assert.strictEqual(err.message, 'Error: Email address is already in use', 'user should not have been created');
                done();
            });
        });

        after('Remove user', function (done) {
            userService.removeUser(createUser_user1._id, function (succes, err) {
                assert.isNotOk(err);
                assert.isTrue(succes, 'user1 should have succesfully been deleted');
                done();
            })
        })
    });

    describe('Find a user', function () {
        let findUser_user;
        before('Create a user to find', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                findUser_user = user;
                done();
            });
        });

        it('by email - existing email', function (done) {
            userService.findUserByEmail(findUser_user.emailAddress, function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);

                assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
                assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
                assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
                assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
                assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');

                done();
            });
        });

        it('by email - non existing email', function (done) {
            userService.findUserByEmail('blablaEmail@nonexistant.com', function (user, err) {
                assert.isOk(err);
                assert.isNotOk(user);

                assert.strictEqual(err.message, "Unable to find user with email: " + 'blablaEmail@nonexistant.com', "Should not be able to find this user");
                done();
            });
        });

        it('by id - existing id', function (done) {
            userService.findUserById(findUser_user._id, function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);

                assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
                assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
                assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
                assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
                assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');

                done();
            });
        });

        it('by id - non existing id', function (done) {
            userService.findUserById('00aa0aa000a000000a0000aa', function (user, err) {
                assert.isOk(err);
                assert.isNotOk(user);

                assert.strictEqual(err.message, "Unable to find user with id: " + '00aa0aa000a000000a0000aa', "Should not be able to find this user");
                done();
            });
        });

        after('Remove the created user', function (done) {
            userService.removeUser(findUser_user._id, function (succes, err) {
                assert.isNotOk(err);
                assert.isTrue(succes, 'user should have succesfully been deleted');
                done();
            })
        });

    });

    describe('Remove a user', function () {
        let removeUser_user;
        before('Create a user to remove', function (done) {
            userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                removeUser_user = user;
                done();
            });
        });

        it('existing id', function (done) {
            userService.removeUser(removeUser_user._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success, 'user should have successfully been deleted');
                done();
            });
        });

        it('non existing id', function (done) {
            userService.removeUser('00aa0aa000a000000a0000aa', function (success, err) {
                assert.isOk(err);
                assert.isFalse(success);
                assert.strictEqual(err.message, 'Id does not exist');
                done();
            });
        });

    });

    // describe('Promise functions user-service', function () {
    //     let removeUser_user;
    //     before('Create a user to remove', function (done) {
    //         userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
    //             assert.isNotOk(err);
    //             assert.isOk(user);
    //             removeUser_user = user;
    //             done();
    //         });
    //     });
    //
    //     it('find user by email', function (done) {
    //         userService.promise_findUserByEmail(removeUser_user.emailAddress)
    //             .then((user) => {
    //                 assert.isOk(user);
    //
    //                 assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
    //                 assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
    //                 assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
    //                 assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
    //                 assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
    //
    //                 done();
    //             });
    //     });
    //
    //     it('find user by email - non existent', function (done) {
    //         userService.promise_findUserByEmail('blablaEmail@nonexistant.com')
    //             .then((user) => {
    //                 assert.isOk(user);
    //
    //                 assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
    //                 assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
    //                 assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
    //                 assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
    //                 assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
    //
    //             })
    //             .catch((err) => {
    //                 assert.isOk(err);
    //                 assert.strictEqual(err.message, "Unable to find user with email: " + 'blablaEmail@nonexistant.com');
    //                 done();
    //             });
    //     });
    //
    //     it('find user by id', function (done) {
    //         userService.promise_findUserById(removeUser_user._id)
    //             .then((user) => {
    //                 assert.isOk(user);
    //
    //                 assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
    //                 assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
    //                 assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
    //                 assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
    //                 assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
    //
    //                 done();
    //             });
    //     });
    //
    //     it('remove user', function (done) {
    //         userService.promise_findUserByEmailAndDelete(removeUser_user.emailAddress)
    //             .then((succes) => {
    //                 assert.isTrue(succes);
    //                 done();
    //             });
    //     });
    //
    //     it('remove user - non existent id', function (done) {
    //         userService.promise_findUserByEmailAndDelete(removeUser_user.emailAddress)
    //             .then((succes) => {
    //                 assert.isTrue(succes);
    //             })
    //             .catch((err) => {
    //                 assert.isOk(err);
    //                 assert.strictEqual(err.message, 'Id does not exist');
    //                 done();
    //             });
    //     });
    //
    //     after('Remove the created user', function (done) {
    //         userService.removeUser(removeUser_user._id, function (succes, err) {
    //             assert.isNotNull(succes);
    //             done();
    //         })
    //     });
    // });

    after('Closing connection to test database', function (done) {
        mongoose.disconnect();
        done();
    });
});