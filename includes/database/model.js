module.exports = async function (input) {
  const Users = require("./models/users")(input);
  const Threads = require("./models/threads")(input);
  const Currencies = require("./models/currencies")(input);

  await Promise.all([
    Users.sync({ alter: false }),
    Threads.sync({ alter: false }),
    Currencies.sync({ alter: false })
  ]);

  return {
    model: { Users, Threads, Currencies },
    use(modelName) {
      return this.model[modelName];
    }
  };
};
