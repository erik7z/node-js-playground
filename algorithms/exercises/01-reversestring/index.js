// --- Directions
// Given a string, return a new string with the reversed
// order of characters
// --- Examples
//   reverse('apple') === 'leppa'
//   reverse('hello') === 'olleh'
//   reverse('Greetings!') === '!sgniteerG'

function reverse(str) {
    // solution 1
    // return str.split("").reverse().join("")

    let revstring = "";


    // solution 2
    // for(let c of str) {
    //     revstring = c + revstring
    // }
    // return revstring

    // solution 3
    for (let i = str.length - 1; i >= 0; i--) {
        revstring = revstring + str[i]
    }

    return revstring

}

module.exports = reverse;
