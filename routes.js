const router = require('express').Router()
const passport = require('passport')

const controllers = require('./controllers')

router.post(
  '/auth/google',
  passport.authenticate('googleToken', { session: false }),
  controllers.login
)

router.get(
  '/autologin',
  passport.authenticate('jwt', { session: false }),
  controllers.login
)

router.post(
  '/entry',
  passport.authenticate('jwt', { session: false }),
  controllers.addRequest
)

router.patch(
  '/entry',
  passport.authenticate('jwt', { session: false }),
  controllers.updateEntry
)

router.get(
  '/entries',
  passport.authenticate('jwt', { session: false }),
  controllers.entries
)

router.delete(
  '/entries/:userId/:entryId',
  passport.authenticate('jwt', { session: false }),
  controllers.deleteEntry
)

router.patch(
  '/makemanager',
  passport.authenticate('jwt', { session: false }),
  controllers.makeManager
)

module.exports = router
