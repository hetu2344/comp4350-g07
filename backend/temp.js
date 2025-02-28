const bcrypt = require('bcryptjs');
const saltRounds = 10;
const myPlaintextPassword = 'password123';
const someOtherPlaintextPassword = 'not_bacon';


async function hashpass() {
const password_hash = await bcrypt.hash(myPlaintextPassword, saltRounds);

console.log(password_hash);
}

hashpass();

