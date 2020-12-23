const ObjectId = require('mongodb').ObjectID

const User = require('./models')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const { jsonSecret } = require('./keys')

// Auth
signToken = (user) => {
  return jwt.sign(
    {
      iss: 'smallcalendar',
      sub: user._id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1), //plus one day
    },
    jsonSecret
  )
}

exports.login = async (req, res, next) => {
  try {
    const token = signToken(req.user)

    //Getting user and progress (with media) from DB
    const user = await User.findById(req.user._id)

    res.status(200).json({
      message: 'Login Successful',
      token: token,
      user: user,
    })
  } catch (error) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.makeManager = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      {
        role: 'manager',
      }
    )

    res.status(200).json({
      message: 'Promotion completed',
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.addRequest = async (req, res, next) => {
  try {
    const { requestType, startDate, endDate } = req.body

    if (requestType === 'holiday') {
      let workDayCount = 0
      for (
        var m = moment(startDate);
        m.diff(endDate, 'days') <= 0;
        m.add(1, 'days')
      ) {
        if (m.day() !== 0 && m.day() !== 6) {
          workDayCount++
        }
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          requests: {
            requestType,
            startDate,
            endDate,
          },
        },
      },
      { new: true }
    )

    res.status(200).json({
      message: 'Request sent',
      newRequest: updatedUser.requests[updatedUser.requests.length - 1],
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.entries = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.role === 'manager') {
      const allTeam = await User.find({})
      const entryList = []
      allTeam.map((member) => {
        if (member._id.toString() === user._id.toString()) return
        entryList.push({
          name: member.firstName,
          _id: member._id,
          entries: member.requests,
        })
      })

      return res
        .status(200)
        .json({ teamEntries: entryList, ownEntries: user.requests })
    }

    res.status(200).json({
      ownEntries: user.requests,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deleteEntry = async (req, res, next) => {
  try {
    if (req.params.userId !== req.user._id.toString()) {
      const requester = await User.findById(req.user._id)

      if (requester.role !== 'manager') {
        const error = new Error("You don't have the permission to do that")
        error.statusCode = 401
        throw error
      }
    }
    await User.updateOne(
      { _id: req.params.userId },
      {
        $pull: {
          requests: {
            _id: req.params.entryId,
          },
        },
      }
    )

    res.status(200).json({
      message: 'Entry was successfully deleted',
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.updateEntry = async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      {
        _id: ObjectId(req.user._id),
        'requests._id': ObjectId(req.body._id),
      },
      {
        $set: {
          'requests.$.startDate': req.body.startDate,
          'requests.$.endDate': req.body.endDate,
          'requests.$.requestType': req.body.requestType,
        },
      }
    )

    res.status(200).json({
      message: 'Entry updated',
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
