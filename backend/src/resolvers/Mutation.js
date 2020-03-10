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
  }
};

module.exports = Mutations;
