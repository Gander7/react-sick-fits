const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

const Query = {
  items: forwardTo('db'),
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items()
  //   return items
  // }
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) return null
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    )
  },
  async users(parent, args, ctx, info) {
    // check for log in
    if (!ctx.request.userId) throw new Error('You must be logged in.')
    // check permissions, throws error if no match
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    // get users
    return ctx.db.query.users({}, info)
  },
}

module.exports = Query
