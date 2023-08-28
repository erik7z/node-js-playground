// --- Directions
// Given an integer, return an integer that is the reverse
// ordering of numbers.
// --- Examples
//   reverseInt(15) === 51
//   reverseInt(981) === 189
//   reverseInt(500) === 5
//   reverseInt(-15) === -51
//   reverseInt(-90) === -9

function reverseInt(n) {
    // const nstring = n.toString();
    // const isMinus = nstring[0] === '-';
    // const rev = nstring.split("").filter(e => (e !== "0" && e !== "-")).reverse().join("")
    //
    // return Number(rev) * (isMinus ? -1 : 1)

    const reversed = n.toString().split('').reverse().join('');
    return parseInt(reversed) * Math.sign(n)
}

module.exports = reverseInt;
