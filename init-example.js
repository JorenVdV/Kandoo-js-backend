/**
 * Created by Steven Gentens on 2/21/2017.
 */
const userRepo = require('./repositories/user-repository');
const themeService = require('./services/theme-service');
const sessionService = require('./services/session-service');
const userService = require('./services/user-service');
// const User = require("./models/user");

let initialUser = {};//new User();
initialUser.firstname = "Puddingtje";
initialUser.lastname = "Puddingske";
initialUser.emailAddress = "test@pudding.com";
initialUser.organisation = "Pudding Corp.";
initialUser.plainTextPassword = "test";

userRepo.readUserByEmail(initialUser.emailAddress)
    .then((user) => console.log('user with emailAddress ' + initialUser.emailAddress + ' already exists.'))
    .catch((err) => {
        console.log('user doesn\'t exist yet: ' + err.message);
        userService.addUser(initialUser.firstname, initialUser.lastname, initialUser.emailAddress, initialUser.organisation, initialUser.plainTextPassword)
            .then((user) => {
                    console.log('user created');
                    themeService.addTheme('Example', 'default theme as an example', ['example'], false, user, [])
                        .then((theme) => {
                                console.log('theme created');
                                sessionService.addSession('Example session', 'default session as an example', 'opportunity', 1, 5,
                                    [], false, false, [user], theme._id, user, null, null, null)
                                    .then((session) => console.log('session created'))
                                    .catch((err) => console.log('Unexpected error whilst creating session: ' + err))
                            }
                        )
                        .catch((err) => console.log('Unexpected error whilst creating theme: ' + err))
                }
            )
            .catch((err) => console.log('Unexpected error whilst creating user: ' + err))

        }
    );

// userRepo.readUserByEmail(initialUser.emailAddress, function (user, err) {
//     if (!user) {
//         userRepo.createUser(initialUser, function (user, err) {
//             if (err) {
//                 console.error(err);
//             } else {
//                 themeService.addTheme('Example', 'default theme as an example', ['example'], false, user, [], function (theme, err) {
//                     if (err) {
//                         console.error(err);
//                     } else {
//                         sessionService.addSession('Example session', 'default session as an example', 'opportunity', 1, 5,
//                             [], false, false, [user], theme._id, user, null, null, null, function (session, err) {
//                                 if (err) {
//                                     console.log(err);
//                                 }
//                             })
//                     }
//                 });
//             }
//
//         });
//     }
// });