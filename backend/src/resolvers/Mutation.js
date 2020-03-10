const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check to see if they are logged in

    const item = await ctx.db.mutation.createItem({
      data: { ...args }
    }, info)

    return item
  },

  updateItem(parent, args, ctx, info) {
    // TODO: check to see if they are logged in
    // get a copy of updates
    const updates = { ...args }
    // remove id
    delete updates.id
    // update data
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = ctx.db.query.item({where}, `{ id, title }`)
    // TODO: Check to see if user owns it
    return ctx.db.mutation.deleteItem({ where }, info)
  }
};

module.exports = Mutations;
