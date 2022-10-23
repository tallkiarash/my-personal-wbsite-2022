const bcrypt = require("bcrypt");

const salt=10;
const hash = bcrypt.hashSync("Admin", salt);

const status = bcrypt.compareSync("Admin", "$2b$10$JlZNsWZUx9YSsu4dfatiAuRVPn1dpYo0F168qQyp0Qj1tPdums7na");

console.log(status);
console.log(hash);