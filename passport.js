const passport = require('passport')

const GoogleTokenStrategy = require('passport-google-token').Strategy
const jwtStrategy = require('passport-jwt').Strategy

const { ExtractJwt } = require('passport-jwt')
const keys = require('./keys')
const User = require('./models')

//JWT Strategy
passport.use(
  new jwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
      secretOrKey: keys.jsonSecret,
    },
    async (payload, done) => {
      try {
        //Find the user from token
        const user = await User.findById(payload.sub)
        if (!user) {
          return done(null, false)
        }
        done(null, user)
      } catch (err) {
        done(err, false)
      }
    }
  )
)

//Google Strategy
passport.use(
  'googleToken',
  new GoogleTokenStrategy(
    {
      //options for the google strategy
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id })
        if (existingUser) {
          done(null, existingUser)
        } else {
          const user = await new User({
            googleId: profile.id,
            email: profile._json.email,
            firstName: profile._json.given_name
          }).save()
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)
