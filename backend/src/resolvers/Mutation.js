const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check to see if they are logged in
    if (!ctx.request.userId) throw new Error('You must be logged in to do that!')

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // relationship between item and user
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
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
    const item = await ctx.db.query.item({ where }, `{ id, title, user { id } }`)

    // Check permissions to see if the user owns it or has correct perm
    const ownsItem = item.user.id === ctx.request.userId
    const hasPerm = ctx.request.user.permissions.some((perm) =>
      ['ADMIN', 'ITEMDELETE'].includes(perm),
    )

    if (ownsItem || hasPerm) return ctx.db.mutation.deleteItem({ where }, info)
    throw new Error('Invalid Permissions.')
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
  async updatePermissions(parent, args, ctx, info) {
    // check log in
    if (!ctx.request.userId) throw new Error('You must be logged in.')
    // query user
    const curUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info,
    )
    // check permissions
    hasPermission(curUser, ['ADMIN', 'PERMISSIONUPDATE'])
    // update permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info,
    )
  },

  async addToCart(parent, args, ctx, info) {
    // Check sign in
    const userId = ctx.request.userId
    if (!userId) throw new Error('You must be signed in.')
    // Get users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    })
    // Increment quantity if item exists in cart
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info,
      )
    }
    // otherwise create item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info,
    )
  },

  async removeFromCart(parent, args, ctx, info) {
    // Find Cart
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      ` { id, user { id }}`,
    )
    // item found
    if (!cartItem) throw new Error('Item not found.')
    // Make sure they own the cart item
    if (cartItem.user.id !== ctx.request.userId) throw new Error('Item cannot be deleted.')
    // Delete cart item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
      info,
    })
  },
}

module.exports = Mutations
