const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const { transport, makeANiceEmail } = require('../mail')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check to see if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: { ...args },
      },
      info,
    )

    return item
  },

  updateItem(parent, args, ctx, info) {
    // TODO: check to see if they are logged in
    // get a copy of updates
    const updates = { ...args }
    // remove id
    delete updates.id
    // update data
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info,
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = ctx.db.query.item({ where }, `{ id, title }`)
    // TODO: Check to see if user owns it
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info,
    )

    // create token so the user doesn't have to sign up
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // send jwt as cookie in response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    // user exists?
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) throw new Error(`User not found. ${email}`)

    // check password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid Password.')

    // generate token, add to cookie, and return the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return user
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, args, ctx, info) {
    // Check user
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) throw new Error(`User not found. ${args.email}`)

    // Set Reset
    const randomBytesPromise = promisify(randomBytes)
    const resetToken = (await randomBytesPromise(20)).toString('hex')
    const expiry = Date.now() + 3600000
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry: expiry },
    })

    // Notify User
    const mailRes = await transport.sendMail({
      from: 'support@sickfits.com',
      to: user.email,
      subject: 'Password Reset',
      html: makeANiceEmail(
        `Your Password Reset Token is here! 
        \n\n 
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
          Click Here to Reset
        </a>`,
      ),
    })
    return { message: 'Request submitted.' }
  },

  async resetPassword(parent, args, ctx, info) {
    // check pass
    if (args.password !== args.confirmPassword) throw new Error("Password's don't match.")
    // check token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 36000000,
      },
    })
    if (!user) throw new Error(`Token is invalid/expired.`)

    // hash new password
    const password = await bcrypt.hash(args.password, 10)

    // save password and remove reset fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // Generate token and add to cookie
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })

    return updatedUser
  },
}

module.exports = Mutations
